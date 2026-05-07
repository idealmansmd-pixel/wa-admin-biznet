import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, BusinessInfo, Lead } from '../types';
import { getChatResponse, extractLeadFromChat } from '../services/geminiService';

interface ChatSimulatorProps {
  businessInfo: BusinessInfo;
  onLeadCaptured: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
}

export default function ChatSimulator({ businessInfo, onLeadCaptured }: ChatSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Halo kak! 👋 Ada yang bisa saya bantu seputar pasang WiFi di rumah?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, analysis, leadInfo } = await getChatResponse([...messages, userMessage], businessInfo);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now(),
        analysis
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (leadInfo && (leadInfo.name || leadInfo.address || leadInfo.whatsapp)) {
        onLeadCaptured(leadInfo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Halo kak! 👋 Ada yang bisa saya bantu seputar pasang WiFi di rumah?',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-180px)]">
      {/* Simulation Window */}
      <div className="flex-1 flex flex-col bg-[#E5DDD5] border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-white p-4 flex items-center justify-between border-b shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-slate-600" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-none">WiFiPro Auto-Responder</p>
              <p className="text-[10px] text-green-600 font-medium mt-1">CS Online • Ready to Close</p>
            </div>
          </div>
          <button 
            onClick={resetChat}
            className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg transition-colors"
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-auto p-6 space-y-4"
          style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundBlendMode: 'overlay', backgroundColor: '#E5DDD5' }}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[80%] p-4 text-sm ${
                  msg.role === 'assistant' 
                    ? 'chat-bubble-in text-slate-800' 
                    : 'chat-bubble-out text-slate-800'
                }`}
              >
                {msg.content}
                {msg.analysis && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[8px] bg-slate-50 px-1 rounded text-slate-400 font-bold">INTENT: {msg.analysis.intent}</span>
                    <span className={`text-[8px] px-1 rounded font-bold ${msg.analysis.closingProbability > 70 ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>CLOSING: {msg.analysis.closingProbability}%</span>
                    <span className="text-[8px] bg-slate-50 px-1 rounded text-slate-400 font-bold">AGGR: {msg.analysis.aggressiveness}%</span>
                  </div>
                )}
                <div className={`text-[10px] mt-1 ${msg.role === 'assistant' ? 'text-slate-400' : 'text-slate-500 text-right'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.role === 'user' && ' • Read'}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-in p-4 flex items-center gap-2 text-sm text-slate-500">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                CS sedang mengetik...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F0F2F5] border-t flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { label: '📋 Kirim Form Booking', text: 'Saya mau daftar pasang wifi sekarang' },
              { label: '💰 Info Promo Hemat', text: 'Lagi ada promo apa ya kak?' },
              { label: '📍 Minta Shareloc', text: 'Ini share lokasi rumah saya' },
            ].map((btn, idx) => (
              <button 
                key={idx}
                onClick={() => setInput(btn.text)}
                className="bg-white border border-slate-200 text-indigo-600 text-[10px] px-3 py-1 rounded-full whitespace-nowrap hover:bg-indigo-50 transition-colors cursor-pointer font-medium"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="text-xl opacity-60 hover:opacity-100 transition-opacity">😊</button>
            <button className="text-xl opacity-60 hover:opacity-100 transition-opacity">📎</button>
            <div className="flex-1 bg-white rounded-full px-4 py-2.5 border border-slate-200 flex items-center shadow-sm">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tulis pesan balasan profesional..."
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 transform hover:scale-105"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail Pane */}
      <div className="w-72 hidden lg:flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Customer Detail</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Hot Lead • Priority</p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-500 uppercase tracking-tight">Status Closing</span>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Follow Up</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-3/4 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-slate-400 text-center italic">Tinggal step booking pemasangan!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Paket Pilihan</label>
              <select className="w-full mt-1 border border-indigo-200 bg-indigo-50 rounded-lg p-2 text-xs font-medium outline-none">
                {businessInfo.packages.map((pkg, i) => (
                  <option key={i}>{pkg.speed} - {pkg.price}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase">Catatan Sales</label>
              <textarea 
                className="w-full mt-1 border border-slate-200 rounded-lg p-3 text-xs h-32 outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Catat info penting di sini..."
                defaultValue="User tertarik promo 3+1. Area lokasi kemungkinan sudah tercover. Fokus push ke booking survey besok pagi agar closing cepat."
              />
            </div>
          </div>

          <button className="w-full bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-600 transition-colors">
            CLOSE DEAL NOW
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-t">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>Target Sales Bulan Ini</span>
            <span>82%</span>
          </div>
          <div className="h-1 w-full bg-slate-200 rounded-full mt-1">
            <div className="h-full bg-green-400 w-[82%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
