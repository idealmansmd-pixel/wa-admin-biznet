import { GoogleGenAI } from "@google/genai";
import { BusinessInfo, Message, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(
  messages: Message[],
  businessInfo: BusinessInfo
): Promise<{ text: string, analysis?: AIAnalysis, leadInfo?: any }> {
  const { personality, prompts, rules, coveredAreas, product, packages, advantages, promos } = businessInfo;
  
  const systemPrompt = prompts.find(p => p.type === 'system')?.content || "";
  const salesPrompt = prompts.find(p => p.type === 'sales')?.content || "";
  const complaintPrompt = prompts.find(p => p.type === 'complaint')?.content || "";

  const baseBusinessInfo = `
  Produk: ${product}
  Paket: ${packages.map(p => `${p.speed}: ${p.price}`).join(', ')}
  Keunggulan: ${advantages.join(', ')}
  Promo: ${promos.join(', ')}
  Area Tercover: ${coveredAreas.join(', ')}
  `;

  const instruction = `
${systemPrompt}

GAYA BAHASA & KEPRIBADIAN:
- Tone: ${personality.tone === 'aggressive' ? 'Sangat persuasif dan fokus closing cepat' : personality.tone === 'strict' ? 'Sangat sopan dan formal' : 'Santai, ramah, native vibes, seperti admin manusia Samarinda'}
- Panjang Jawaban: ${personality.length}
- Gunakan Emoji: ${personality.useEmojis ? 'Ya' : 'Tidak'}
- Sapaan: ${personality.greeting}
- Cara Closing: ${personality.closingStyle}
- KATA TERLARANG (JANGAN GUNAKAN): ${personality.forbiddenWords.join(', ')}

ATURAN BISNIS (RULES):
${rules.map(r => `IF ${r.condition} THEN ${r.action}`).join('\n')}

INFORMASI BISNIS:
${baseBusinessInfo}

SALES STRATEGY:
${salesPrompt}

COMPLAINT HANDLING:
${complaintPrompt}

MANUASIAWI (HUMANIZE):
- Gunakan bahasa yang mengalir, bukan template kaku.
- Berikan empati jika customer komplain atau ragu.
- Sebutkan nama area di Samarinda jika relevan untuk menunjukkan kedekatan.

TUGAS:
Generate balasan chat DAN analisa dalam JSON format:
{
  "reply": "string",
  "analysis": {
    "closingProbability": 0-100,
    "friendliness": 0-100,
    "aggressiveness": 0-100,
    "intent": "string"
  },
  "leadInfo": { "name": "string?", "address": "string?", "whatsapp": "string?", "location": "string?" }
}
`;

  const history = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const lastMessage = history.pop() || { role: 'user', parts: [{ text: 'Halo' }] };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [...history, lastMessage],
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{}');
    return { 
      text: data.reply || "Maaf kak, sinyal sedang kurang stabil. Bisa diulang pertanyaannya? 🙏", 
      analysis: data.analysis,
      leadInfo: data.leadInfo
    };
  } catch (e) {
    console.error("AI Error:", e);
    // Attempt non-json fallback if it was a parsing error
    return { 
      text: "Waduh kak, maaf banget sepertinya ada gangguan koneksi sebentar. Boleh bantu chat ulang? 🙏",
      analysis: { closingProbability: 0, friendliness: 50, aggressiveness: 0, intent: "error" }
    };
  }
}

async function analyzeConversation(messages: Message[], lastReply: string): Promise<AIAnalysis> {
  const context = messages.map(m => `${m.role}: ${m.content}`).join('\n') + `\nassistant: ${lastReply}`;
  
  try {
    const analysisResponse = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Analisa chat ini dan berikan scoring dalam JSON format: { "closingProbability": 0-100, "friendliness": 0-100, "aggressiveness": 0-100, "intent": "string" }.
      Chat:
      ${context}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(analysisResponse.text || '{}');
  } catch (e) {
    return { closingProbability: 0, friendliness: 0, aggressiveness: 0, intent: "unknown" };
  }
}

export async function extractLeadFromChat(messages: Message[]): Promise<any | null> {
  const chatContext = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Extract customer lead information from this chat if available. Return JSON format with keys: name, address, whatsapp, location. If any field is missing, use null.
      Chat:
      ${chatContext}`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a data extractor. Only return JSON. Do not include markdown formatting like \`\`\`json. If no lead info found, return null values."
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (data && (data.name || data.address || data.whatsapp || data.location)) {
      return data;
    }
    return null;
  } catch (e) {
    console.error("Extraction Error:", e);
    return null;
  }
}
