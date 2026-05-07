import { MapPin, Phone, User, Send } from 'lucide-react';
import { Lead, BusinessInfo } from '../types';

interface LeadsDashboardProps {
  leads: Lead[];
  businessInfo: BusinessInfo;
}

export default function LeadsDashboard({ leads, businessInfo }: LeadsDashboardProps) {
  const handleFollowUp = (lead: Lead) => {
    const script = businessInfo.followUpScripts[0] || "Halo kak, bagaimana kabar pemasangan WiFi nya?";
    const text = `Follow-up Sent to ${lead.name || 'Customer'}:\n\n"${script}"`;
    alert(text);
  };

  return (
    <div className="space-y-6">
      {leads.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <User className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Leads Tracking</h3>
          <p className="text-slate-400 max-w-sm text-sm">
            Simulate a conversation in the Active Chats. When a customer provides their info, it will appear here for tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-6 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="col-span-1">Customer</div>
            <div className="col-span-1">WhatsApp</div>
            <div className="col-span-2">Address / Location</div>
            <div className="col-span-1 text-center">Deal Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {leads.map((lead) => (
            <div 
              key={lead.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-6 items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="col-span-1 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate text-slate-800">{lead.name || 'Anonymous'}</p>
                  <p className="text-[10px] text-slate-400">Captured {new Date(lead.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="col-span-1 flex items-center gap-2 text-sm text-slate-600 font-medium">
                <Phone size={14} className="text-slate-300" />
                {lead.whatsapp || '-'}
              </div>

              <div className="col-span-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-300 flex-shrink-0" />
                  <span className="truncate">{lead.address || 'No address provided'}</span>
                </div>
                {lead.location && (
                  <p className="text-[10px] text-slate-400 ml-6 italic">Loc: {lead.location}</p>
                )}
              </div>

              <div className="col-span-1 text-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  lead.status === 'new' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-100 text-green-600'
                }`}>
                  {lead.status === 'new' ? 'Potential' : 'Closed'}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <button 
                  onClick={() => handleFollowUp(lead)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Send Smart Follow-up"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
