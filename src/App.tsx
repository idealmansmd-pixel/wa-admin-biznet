import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  Wifi, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatSimulator from './components/ChatSimulator';
import LeadsDashboard from './components/LeadsDashboard';
import Settings from './components/Settings';
import AIBuilder from './components/AIBuilder';
import WhatsAppStatus from './components/WhatsAppStatus';
import { Lead, BusinessInfo } from './types';
import { DEFAULT_BUSINESS_INFO } from './constants';

type Tab = 'chat' | 'leads' | 'settings' | 'ai' | 'infra';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Sync with backend on startup
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setBusinessInfo(data));
  }, []);

  const updateBusinessInfo = async (newInfo: BusinessInfo) => {
    setBusinessInfo(newInfo);
    // Sync to backend for background worker
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInfo)
    });
  };

  const addLead = (newLead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      status: 'new'
    };
    setLeads(prev => [lead, ...prev]);
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="h-full bg-indigo-600 flex flex-col z-50 overflow-hidden shadow-xl"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <Wifi className="text-indigo-600 w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-white">WiFiPro Admin</span>
          )}
        </div>

        <nav className="flex-1 mt-4 px-0 space-y-1">
          <SidebarItem 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
            icon={<MessageSquare size={20} />}
            label="Active Chats"
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')}
            icon={<Sparkles size={20} />}
            label="AI Intelligence"
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            active={activeTab === 'infra'} 
            onClick={() => setActiveTab('infra')}
            icon={<Activity size={20} />}
            label="Infrastructure"
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            active={activeTab === 'leads'} 
            onClick={() => setActiveTab('leads')}
            icon={<Users size={20} />}
            label="Leads Tracking"
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon size={20} />}
            label="Business Profile"
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="p-6 bg-indigo-700/50 mt-auto">
          <div className="flex items-center gap-3 text-white opacity-90 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-400 flex-shrink-0"></div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Admin Sales</p>
                <p className="text-[10px] truncate">Online • Ready to Close</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full mt-4 flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              {activeTab === 'chat' ? 'WhatsApp Simulation' : activeTab === 'ai' ? 'Advanced AI Logic' : activeTab === 'leads' ? 'Customer Acquisition' : 'AI Model Configuration'}
            </h2>
            <h1 className="text-lg font-bold text-slate-800 leading-none">
              {activeTab === 'chat' ? 'Testing Environment' : activeTab === 'ai' ? 'AI Rules & Prompts' : activeTab === 'infra' ? 'Background Service' : activeTab === 'leads' ? 'Sales Pipeline' : 'Business Settings'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {activeTab === 'leads' && (
                <div className="px-4 py-1.5 bg-green-50 rounded-full flex items-center gap-2 border border-green-100">
                  <TrendingUp className="text-green-600 w-4 h-4" />
                  <span className="text-green-700 font-bold text-xs tracking-tight">{leads.length} New Leads Captured</span>
                </div>
             )}
             <div className="flex gap-2">
                <button className="text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                  Cek Coverage
                </button>
                <button className="text-white font-bold text-xs bg-indigo-600 px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                  Pemasangan Baru
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ChatSimulator businessInfo={businessInfo} onLeadCaptured={addLead} />
              </motion.div>
            )}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AIBuilder config={businessInfo} onSave={updateBusinessInfo} />
              </motion.div>
            )}
            {activeTab === 'infra' && (
              <motion.div
                key="infra"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <WhatsAppStatus />
              </motion.div>
            )}
            {activeTab === 'leads' && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LeadsDashboard leads={leads} businessInfo={businessInfo} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Settings config={businessInfo} onSave={updateBusinessInfo} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  </div>
);
}

function SidebarItem({ active, onClick, icon, label, isOpen }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  isOpen: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 relative group truncate ${
        active 
          ? 'bg-white/20 border-l-4 border-white text-white' 
          : 'text-indigo-100 hover:bg-indigo-500'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      {isOpen && (
        <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}
      {active && label === "Active Chats" && (
        <span className="ml-auto bg-red-500 text-[10px] px-2 py-0.5 rounded-full text-white font-bold">12</span>
      )}
    </button>
  );
}

