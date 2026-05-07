import { useState } from 'react';
import { Save, Plus, Trash2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { BusinessInfo } from '../types';

interface SettingsProps {
  config: BusinessInfo;
  onSave: (config: BusinessInfo) => void;
}

export default function Settings({ config, onSave }: SettingsProps) {
  const [localConfig, setLocalConfig] = useState<BusinessInfo>(config);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    onSave(localConfig);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const updatePackage = (index: number, field: string, value: string) => {
    const newPackages = [...localConfig.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setLocalConfig({ ...localConfig, packages: newPackages });
  };

  const addPackage = () => {
    setLocalConfig({
      ...localConfig,
      packages: [...localConfig.packages, { speed: '', price: '', description: '' }]
    });
  };

  const removePackage = (index: number) => {
    const newPackages = localConfig.packages.filter((_, i) => i !== index);
    setLocalConfig({ ...localConfig, packages: newPackages });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Knowledge Base Settings</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AI Training Data</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          {success ? <ShieldCheck /> : <Save size={20} />}
          {success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-slate-800">
            <Globe className="text-indigo-600" size={20} /> General Information
          </h4>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Name</label>
            <input 
              type="text"
              value={localConfig.product}
              onChange={(e) => setLocalConfig({ ...localConfig, product: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all"
            />
          </div>
          
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advantages</label>
             {localConfig.advantages.map((adv, i) => (
                <input 
                  key={i}
                  type="text"
                  value={adv}
                  onChange={(e) => {
                    const newAdv = [...localConfig.advantages];
                    newAdv[i] = e.target.value;
                    setLocalConfig({ ...localConfig, advantages: newAdv });
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm transition-all focus:bg-white"
                />
             ))}
          </div>
        </div>

        {/* Promos */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-slate-800">
            <Zap className="text-indigo-600" size={20} /> Active Promos
          </h4>
          <div className="space-y-3">
             {localConfig.promos.map((promo, i) => (
                <div key={i} className="flex gap-2 group">
                  <input 
                    type="text"
                    value={promo}
                    onChange={(e) => {
                      const newPromos = [...localConfig.promos];
                      newPromos[i] = e.target.value;
                      setLocalConfig({ ...localConfig, promos: newPromos });
                    }}
                    className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm italic transition-all focus:bg-white"
                  />
                  <button 
                    onClick={() => setLocalConfig({ ...localConfig, promos: localConfig.promos.filter((_, idx) => idx !== i) })}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
             ))}
             <button 
              onClick={() => setLocalConfig({ ...localConfig, promos: [...localConfig.promos, ''] })}
              className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
             >
                <Plus size={16} /> Add Promo
             </button>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-800">Price Packages</h4>
          <button 
            onClick={addPackage}
            className="text-[10px] uppercase font-bold text-indigo-600 flex items-center gap-1 hover:underline tracking-widest"
          >
            <Plus size={16} /> Add Package
          </button>
        </div>
        <div className="space-y-4">
          {localConfig.packages.map((pkg, i) => (
            <div key={i} className="flex flex-wrap md:flex-nowrap gap-4 p-4 border border-slate-100 bg-slate-50 rounded-2xl items-end relative group hover:bg-white hover:border-indigo-100 transition-all">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Speed</label>
                <input 
                  type="text"
                  value={pkg.speed}
                  placeholder="e.g. 20 Mbps"
                  onChange={(e) => updatePackage(i, 'speed', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-800"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Price</label>
                <input 
                  type="text"
                  value={pkg.price}
                  placeholder="e.g. Rp 200rb"
                  onChange={(e) => updatePackage(i, 'price', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-100 rounded-lg text-sm font-bold text-slate-800"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Description</label>
                <input 
                  type="text"
                  value={pkg.description}
                  placeholder="Short explanation"
                  onChange={(e) => updatePackage(i, 'description', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-100 rounded-lg text-sm"
                />
              </div>
              <button 
                onClick={() => removePackage(i)}
                className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                title="Remove Package"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coverage */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-slate-800">
            📍 Covered Areas (Samarinda)
          </h4>
          <div className="space-y-3">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
               List areas below to help AI check coverage.
             </p>
             <div className="flex flex-wrap gap-2">
                {localConfig.coveredAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full group">
                    <input 
                      type="text"
                      value={area}
                      onChange={(e) => {
                        const newAreas = [...localConfig.coveredAreas];
                        newAreas[i] = e.target.value;
                        setLocalConfig({ ...localConfig, coveredAreas: newAreas });
                      }}
                      className="bg-transparent border-none outline-none text-xs text-slate-600 w-24"
                    />
                    <button 
                      onClick={() => setLocalConfig({ ...localConfig, coveredAreas: localConfig.coveredAreas.filter((_, idx) => idx !== i) })}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setLocalConfig({ ...localConfig, coveredAreas: [...localConfig.coveredAreas, ''] })}
                  className="px-3 py-1 border border-dashed border-slate-300 rounded-full text-xs text-slate-400 hover:border-indigo-600 hover:text-indigo-600"
                >
                  + Area
                </button>
             </div>
          </div>
        </div>

        {/* Follow-up Scripts */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
          <h4 className="font-bold flex items-center gap-2 text-slate-800">
            💬 Smart Follow-up Scripts
          </h4>
          <div className="space-y-4">
             {localConfig.followUpScripts.map((script, i) => (
                <div key={i} className="space-y-1 group relative">
                  <textarea 
                    value={script}
                    onChange={(e) => {
                      const newScripts = [...localConfig.followUpScripts];
                      newScripts[i] = e.target.value;
                      setLocalConfig({ ...localConfig, followUpScripts: newScripts });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs h-24 focus:ring-1 focus:ring-indigo-100 transition-all outline-none"
                  />
                  <button 
                    onClick={() => setLocalConfig({ ...localConfig, followUpScripts: localConfig.followUpScripts.filter((_, idx) => idx !== i) })}
                    className="absolute top-2 right-2 p-1 bg-white text-red-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
             ))}
             <button 
              onClick={() => setLocalConfig({ ...localConfig, followUpScripts: [...localConfig.followUpScripts, ''] })}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all"
             >
                + New Script
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
