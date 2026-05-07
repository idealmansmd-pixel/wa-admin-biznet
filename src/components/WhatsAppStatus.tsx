import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Smartphone,
  Activity,
  History,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

const socket = io();

export default function WhatsAppStatus() {
  const [status, setStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED');
  const [qr, setQr] = useState<string | null>(null);
  const [lastMessages, setLastMessages] = useState<any[]>([]);

  useEffect(() => {
    // Initial status fetch
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setQr(data.qr);
      });

    socket.on('whatsapp.update', (data) => {
      setStatus(data.status);
      setQr(data.qr);
    });

    socket.on('whatsapp.message', (data) => {
      setLastMessages(prev => [data, ...prev].slice(0, 10));
    });

    return () => {
      socket.off('whatsapp.update');
      socket.off('whatsapp.message');
    };
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout? This will disconnect the WhatsApp session.")) return;
    
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('DISCONNECTED');
        setQr(null);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${
          status === 'CONNECTED' ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            status === 'CONNECTED' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-400'
          }`}>
            {status === 'CONNECTED' ? <Wifi size={24} /> : <WifiOff size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Service Status</p>
            <h3 className={`text-lg font-bold leading-none ${status === 'CONNECTED' ? 'text-green-700' : 'text-slate-800'}`}>
              {status}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Device Mode</p>
            <h3 className="text-lg font-bold text-slate-800 leading-none">Multi-Device</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Security</p>
            <h3 className="text-lg font-bold text-slate-800 leading-none">End-to-End</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR & Control */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <QrCode size={12} /> WhatsApp Pairing
            </div>
            
            {status === 'CONNECTED' ? (
              <div className="py-10 space-y-4">
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-5/50">
                  <CheckCircle2 size={48} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">WhatsApp is Linked</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  AI is currently monitoring and responding to chats in the background.
                </p>
                <button 
                  className="mt-6 text-xs font-bold text-red-500 hover:underline"
                  onClick={handleLogout}
                >
                  Logout Session
                </button>
              </div>
            ) : qr ? (
              <div className="space-y-6">
                <div className="bg-white p-4 border border-slate-100 rounded-2xl inline-block shadow-inner">
                  <img src={qr} alt="QR Code" className="w-64 h-64" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-700">Scan to Link Device</p>
                  <p className="text-xs text-slate-400 leading-relaxed text-center px-4">
                    Open WhatsApp on your phone, go to Linked Devices, and point your camera at the screen.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-indigo-600" size={32} />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generating QR Code...</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <Activity size={20} />
                <h4 className="font-bold">System Health</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-xs">
                   <span className="opacity-70">Background AI</span>
                   <span className="font-bold">Active</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="opacity-70">Auto-Reconnect</span>
                   <span className="font-bold">Enabled</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="opacity-70">Uptime</span>
                   <span className="font-bold">99.9%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Live Logs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
           <div className="flex items-center justify-between mb-6 px-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                 <History className="text-indigo-600" size={18} /> Background Activity
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Realtime Feed</span>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-2">
              {lastMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                   <AlertCircle size={48} className="mb-4" />
                   <p className="text-sm font-bold">No background activity yet</p>
                </div>
              ) : (
                lastMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3"
                  >
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-600">{msg.from}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-bold">Just Now</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs text-slate-600 italic">"{msg.text}"</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                           <RefreshCw size={10} /> AI Replied:
                        </div>
                        <p className="text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">{msg.reply}</p>
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
