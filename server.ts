import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay
} from "@whiskeysockets/baileys";
import { GoogleGenAI } from "@google/genai";
import pino from "pino";
import QRCode from "qrcode";
import { DEFAULT_BUSINESS_INFO } from "./src/constants";
import { BusinessInfo, Message } from "./src/types";

// Business State (Simulating DB with simple JSON for now as per instructions)
let currentConfig: BusinessInfo = DEFAULT_BUSINESS_INFO;
let sessionStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING' = 'DISCONNECTED';
let lastQr: string | null = null;
let sockInstance: any = null;

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server);
  const PORT = 3000;

  app.use(express.json());

  // --- AI Logic (Background) ---
  const aiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!aiKey) {
    console.error("CRITICAL: GOOGLE_GENAI_API_KEY is not defined in environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey: aiKey || "" });

  async function getAIReply(messages: Message[]): Promise<any> {
    const { personality, prompts, rules, coveredAreas, product, packages, advantages, promos } = currentConfig;
    
    const systemPrompt = prompts.find(p => p.type === 'system')?.content || "";
    const salesPrompt = prompts.find(p => p.type === 'sales')?.content || "";
    
    const instruction = `
    ${systemPrompt}
    GAYA BAHASA: ${personality.tone}, Sapaan: ${personality.greeting}
    ATURAN: ${rules.map(r => r.condition + " -> " + r.action).join('\n')}
    INFO: ${product}, ${packages.map(p => p.speed).join(', ')}, Area: ${coveredAreas.join(', ')}
    SALES: ${salesPrompt}
    TUGAS: Balas dalam JSON { "reply": "string", "analysis": { ... }, "leadInfo": { ... } }
    `;

    try {
      if (!aiKey) {
        throw new Error("AI Key is missing in environment");
      }

      const history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const lastMessage = { role: 'user', parts: [{ text: messages[messages.length - 1].content }] };

      const result = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [...history, lastMessage],
        config: {
          systemInstruction: instruction,
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const data = JSON.parse(result.text || '{}');
      return data;
    } catch (e) {
      console.error("AI Error:", e);
      return { reply: "Maaf kak, ada kendala teknis. Boleh chat ulang? 🙏" };
    }
  }

  // --- WhatsApp Gateway ---
  const sessionDir = path.join(process.cwd(), "sessions");
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    sockInstance = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' })
    });

    sockInstance.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        lastQr = await QRCode.toDataURL(qr);
        sessionStatus = 'DISCONNECTED';
        io.emit('whatsapp.update', { status: sessionStatus, qr: lastQr });
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        sessionStatus = 'DISCONNECTED';
        lastQr = null;
        io.emit('whatsapp.update', { status: sessionStatus, qr: null });
        if (shouldReconnect) connectToWhatsApp();
      } else if (connection === 'open') {
        sessionStatus = 'CONNECTED';
        lastQr = null;
        io.emit('whatsapp.update', { status: sessionStatus, qr: null });
        console.log('WhatsApp Connected!');
      }
    });

    sockInstance.ev.on('creds.update', saveCreds);

    sockInstance.ev.on('messages.upsert', async ({ messages, type }: any) => {
      if (type === 'notify') {
        for (const msg of messages) {
          if (!msg.key.fromMe && msg.message) {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (!text) continue;

            const from = msg.key.remoteJid!;
            console.log(`Message from ${from}: ${text}`);

            // Simulate typing
            await sockInstance.presenceSubscribe(from);
            await delay(1000);
            await sockInstance.sendPresenceUpdate('composing', from);
            await delay(2000);

            // Get AI Reply
            const aiResponse = await getAIReply([{ id: '1', role: 'user', content: text, timestamp: Date.now() }]);
            
            await sockInstance.sendPresenceUpdate('paused', from);
            
            // --- Human Chat Bubble Response System ---
            const fullReply = aiResponse.reply;
            const personality = currentConfig.personality;

            if (personality.splitMessages) {
              // Split by sentences or newline
              const bubbles = fullReply.split(/(?<=[.!?])\s+|\n+/).filter((s: string) => s.trim().length > 0);
              
              for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i].trim();
                
                // Calculate simulated typing delay based on message length and mode
                let baseDelay = bubble.length * 50; // base 50ms per char
                if (personality.typingDelayMode === 'fast') baseDelay *= 0.5;
                if (personality.typingDelayMode === 'slow') baseDelay *= 1.5;
                
                // Add natural variance
                const randomDelay = baseDelay + (Math.random() * 1000);
                
                await sockInstance.sendPresenceUpdate('composing', from);
                await delay(randomDelay);
                await sockInstance.sendPresenceUpdate('paused', from);
                
                await sockInstance.sendMessage(from, { text: bubble });
                
                // Extra pause between bubbles
                if (personality.naturalPause && i < bubbles.length - 1) {
                  await delay(1000 + Math.random() * 2000);
                }
              }
            } else {
              await sockInstance.sendMessage(from, { text: fullReply });
            }
            
            io.emit('whatsapp.message', { from, text, reply: fullReply, analysis: aiResponse.analysis });
          }
        }
      }
    });
  }

  connectToWhatsApp();

  // --- API Routes ---
  app.get("/api/health", (req, res) => res.json({ status: "alive", timestamp: new Date().toISOString() }));
  app.post("/api/logout", async (req, res) => {
    try {
      if (sockInstance) {
        await sockInstance.logout();
        sockInstance.end();
      }
      
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        fs.mkdirSync(sessionDir);
      }
      sessionStatus = 'DISCONNECTED';
      lastQr = null;
      io.emit('whatsapp.update', { status: sessionStatus, qr: null });
      
      // Force reconnect to generate new QR
      setTimeout(() => connectToWhatsApp(), 2000);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  app.get("/api/config", (req, res) => res.json(currentConfig));
  app.post("/api/config", (req, res) => {
    currentConfig = req.body;
    res.json({ success: true });
  });
  app.get("/api/status", (req, res) => res.json({ status: sessionStatus, qr: lastQr }));

  // --- Vite / Static Assets ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Check if we are in a serverless environment
if (process.env.VERCEL) {
  // Export app for Vercel
  // Note: Background WA connection will struggle in serverless
  startServer();
} else {
  startServer();
}

export default startServer;
