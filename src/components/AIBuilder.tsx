import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Gavel, 
  UserRound, 
  History, 
  Save, 
  RotateCcw, 
  ChevronRight,
  ShieldAlert,
  Zap,
  MessageCircle,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessInfo, AIPrompt, AIRule, AIPersonality } from '../types';

interface AIBuilderProps {
  config: BusinessInfo;
  onSave: (config: BusinessInfo) => void;
}

export default function AIBuilder({ config, onSave }: AIBuilderProps) {
  const [localConfig, setLocalConfig] = useState<BusinessInfo>(config);
  const [activeSubTab, setActiveSubTab] = useState<'prompts' | 'rules' | 'personality' | 'history'>('prompts');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const updatePrompt = (id: string, content: string) => {
    const newPrompts = localConfig.prompts.map(p => 
      p.id === id ? { ...p, content, version: p.version + 1, updatedAt: Date.now() } : p
    );
    setLocalConfig({ ...localConfig, prompts: newPrompts });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">AI Reply Builder</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure AI Intelligence & Behavior</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setLocalConfig(config)}
             className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2"
           >
             <RotateCcw size={16} /> Reset
           </button>
           <button 
             onClick={handleSave}
             className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
           >
             {saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
             {saveSuccess ? 'Saved!' : 'Apply AI Config'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Navigation */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          <NavButton 
            active={activeSubTab === 'prompts'} 
            onClick={() => setActiveSubTab('prompts')}
            icon={<Terminal size={18} />}
            label="Prompt Management"
            desc="System instructions"
          />
          <NavButton 
            active={activeSubTab === 'rules'} 
            onClick={() => setActiveSubTab('rules')}
            icon={<Gavel size={18} />}
            label="Behavior Rules"
            desc="IF/THEN logic"
          />
          <NavButton 
            active={activeSubTab === 'personality'} 
            onClick={() => setActiveSubTab('personality')}
            icon={<UserRound size={18} />}
            label="Personality Hub"
            desc="Tones & Modes"
          />
          <NavButton 
            active={activeSubTab === 'history'} 
            onClick={() => setActiveSubTab('history')}
            icon={<History size={18} />}
            label="Version History"
            desc="Prompt archives"
          />
        </div>

        {/* Editor Area */}
        <div className="col-span-12 md:col-span-9">
          <AnimatePresence mode="wait">
            {activeSubTab === 'prompts' && (
              <motion.div 
                key="prompts"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {localConfig.prompts.map((prompt) => (
                  <div key={prompt.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileCode size={16} className="text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                          {prompt.type} Prompt
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100">
                        v{prompt.version}
                      </span>
                    </div>
                    <div className="p-4 bg-[#1E1E2E] m-4 rounded-xl border border-white/5 shadow-inner">
                      <textarea 
                        value={prompt.content}
                        onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                        className="w-full h-40 bg-transparent border-none outline-none text-indigo-300 font-mono text-sm leading-relaxed resize-none no-scrollbar"
                        placeholder="Write dynamic system instructions..."
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSubTab === 'rules' && (
              <motion.div 
                key="rules"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Zap className="text-indigo-600" size={18} /> Smart Interaction Rules
                  </h4>
                  <button 
                    onClick={() => setLocalConfig({ ...localConfig, rules: [...localConfig.rules, { id: Math.random().toString(), condition: '', action: '' }] })}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add Rule
                  </button>
                </div>

                <div className="space-y-4">
                  {localConfig.rules.map((rule, i) => (
                    <div key={rule.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group relative">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">If customer says...</label>
                        <input 
                          type="text"
                          value={rule.condition}
                          onChange={(e) => {
                            const newRules = [...localConfig.rules];
                            newRules[i].condition = e.target.value;
                            setLocalConfig({ ...localConfig, rules: newRules });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                          placeholder="e.g. Asking price"
                        />
                      </div>
                      <ChevronRight className="mt-4 text-slate-300" size={16} />
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">AI must...</label>
                        <input 
                          type="text"
                          value={rule.action}
                          onChange={(e) => {
                            const newRules = [...localConfig.rules];
                            newRules[i].action = e.target.value;
                            setLocalConfig({ ...localConfig, rules: newRules });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                          placeholder="e.g. Show pricing table"
                        />
                      </div>
                      <button 
                        onClick={() => setLocalConfig({ ...localConfig, rules: localConfig.rules.filter((_, idx) => idx !== i) })}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      >
                         <AlertCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'personality' && (
              <motion.div 
                key="personality"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mode Toggles */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       <ShieldAlert className="text-indigo-600" size={18} /> Behavior Modes
                    </h4>
                    <div className="space-y-4">
                      {['natural', 'strict', 'aggressive'].map((tone) => (
                        <button 
                          key={tone}
                          onClick={() => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, tone: tone as any }})}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            localConfig.personality.tone === tone 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-bold text-sm uppercase tracking-tight">{tone} Mode</p>
                            <p className="text-[10px] opacity-70">
                              {tone === 'natural' ? 'Feels like a friendly human admin' : tone === 'strict' ? 'Highly professional and following rules' : 'Focus on conversion and closing deals'}
                            </p>
                          </div>
                          {localConfig.personality.tone === tone && <CheckCircle2 size={20} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       <MessageCircle className="text-indigo-600" size={18} /> General Style
                    </h4>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-xs font-bold text-slate-700">Use Emojis</span>
                          <button 
                            onClick={() => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, useEmojis: !localConfig.personality.useEmojis }})}
                            className={`w-10 h-6 rounded-full transition-all relative ${localConfig.personality.useEmojis ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localConfig.personality.useEmojis ? 'right-1' : 'left-1'}`}></div>
                          </button>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forbidden Words</label>
                          <textarea 
                            value={localConfig.personality.forbiddenWords.join(', ')}
                            onChange={(e) => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, forbiddenWords: e.target.value.split(',').map(s => s.trim()) }})}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs h-20 outline-none"
                            placeholder="Words AI should avoid..."
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial Greeting</label>
                          <input 
                            type="text"
                            value={localConfig.personality.greeting}
                            onChange={(e) => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, greeting: e.target.value }})}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                          />
                       </div>
                    </div>
                  </div>

                  {/* Humanize AI Section */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                       <Sparkles className="text-indigo-600" size={18} /> Humanize AI Engine
                    </h4>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-700 block">Split Messages</span>
                            <span className="text-[9px] text-slate-400">Send replies in multiple bubbles</span>
                          </div>
                          <button 
                            onClick={() => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, splitMessages: !localConfig.personality.splitMessages }})}
                            className={`w-10 h-6 rounded-full transition-all relative ${localConfig.personality.splitMessages ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localConfig.personality.splitMessages ? 'right-1' : 'left-1'}`}></div>
                          </button>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typing Speed Mode</label>
                          <div className="grid grid-cols-3 gap-2">
                             {(['fast', 'normal', 'slow'] as const).map(mode => (
                               <button 
                                 key={mode}
                                 onClick={() => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, typingDelayMode: mode }})}
                                 className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                                   localConfig.personality.typingDelayMode === mode 
                                     ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                     : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                                 }`}
                               >
                                 {mode}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-700 block">Natural Pause</span>
                            <span className="text-[9px] text-slate-400">Random delay between bubbles</span>
                          </div>
                          <button 
                            onClick={() => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, naturalPause: !localConfig.personality.naturalPause }})}
                            className={`w-10 h-6 rounded-full transition-all relative ${localConfig.personality.naturalPause ? 'bg-indigo-600' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localConfig.personality.naturalPause ? 'right-1' : 'left-1'}`}></div>
                          </button>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Sentences / Bubble</label>
                          <div className="flex items-center gap-4">
                             <input 
                               type="range"
                               min="1"
                               max="3"
                               step="1"
                               value={localConfig.personality.maxSentencesPerBubble}
                               onChange={(e) => setLocalConfig({ ...localConfig, personality: { ...localConfig.personality, maxSentencesPerBubble: parseInt(e.target.value) }})}
                               className="flex-1 accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                             />
                             <span className="text-xs font-bold text-indigo-600 w-4">{localConfig.personality.maxSentencesPerBubble}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <History className="text-slate-300" size={32} />
                </div>
                <h4 className="font-bold text-lg">No Version History</h4>
                <p className="text-slate-400 text-sm max-w-sm">When you modify prompts, older versions will appear here for rollback. Currently using v1 for all modules.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, desc }: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string,
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
        active 
          ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600' 
          : 'bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {icon}
        </div>
        <div>
          <p className={`font-bold text-xs ${active ? 'text-indigo-600' : 'text-slate-800'}`}>{label}</p>
          <p className="text-[10px] text-slate-400">{desc}</p>
        </div>
      </div>
      {active && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-600" />
      )}
    </button>
  );
}
