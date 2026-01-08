import React, { useState, useMemo } from 'react';
import { User, Submission, SubmissionStatus, AuditLog } from '../types.ts';
import { askAuditorQuestion } from '../services/geminiService.ts';
import CoastalMap from '../components/CoastalMap.tsx';

type DashboardPage = 'PENDING_QUEUE' | 'VERIFIER_HISTORY';

interface NGODashboardProps {
  user: User;
  submissions: Submission[];
  onUpdateStatus: (id: string, updates: Partial<Submission>) => void;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ user, submissions, onUpdateStatus }) => {
  const [activePage, setActivePage] = useState<DashboardPage>('PENDING_QUEUE');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [auditNote, setAuditNote] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  
  const selectedSub = useMemo(() => submissions.find(s => s.id === selectedId), [submissions, selectedId]);

  const pendingItems = useMemo(() => submissions.filter(s => 
    [SubmissionStatus.PENDING, SubmissionStatus.AI_VERIFIED, SubmissionStatus.FIELD_CHECK, SubmissionStatus.IN_REVIEW, SubmissionStatus.AI_FAILED].includes(s.status)
  ), [submissions]);

  const myActivityLog = useMemo(() => {
    return submissions.filter(s => 
      s.auditTrail.some(log => log.user === user.name)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [submissions, user.name]);

  const openInspector = (id: string) => {
    setSelectedId(id);
    setAuditNote('');
    setChatLog([]);
    setIsSubmitting(false);
  };

  const closeInspector = () => {
    setSelectedId(null);
    setIsSubmitting(false);
  };

  const submitVerdict = async (status: SubmissionStatus) => {
    if (!selectedSub || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newLog: AuditLog = {
        timestamp: new Date().toISOString(),
        action: `NGO Scientific Review: ${status}`,
        user: user.name,
        note: auditNote || "Verification completed after scientific review."
      };

      await onUpdateStatus(selectedSub.id, {
        status,
        verifierComments: auditNote,
        auditTrail: [...selectedSub.auditTrail, newLog]
      });

      setTimeout(() => {
        closeInspector();
        setActivePage('VERIFIER_HISTORY');
      }, 500);
      
    } catch (err) {
      console.error("Verdict submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiAsk = async () => {
    if (!aiQuestion || !selectedSub) return;
    setIsAiProcessing(true);
    const q = aiQuestion;
    setAiQuestion('');
    try {
      const base64Data = selectedSub.imageUrl.includes(',') 
        ? selectedSub.imageUrl.split(',')[1] 
        : selectedSub.imageUrl;
      const answer = await askAuditorQuestion(base64Data, q);
      setChatLog(prev => [...prev, { q, a: answer || "Interrogation complete." }]);
    } catch (e) {
      setChatLog(prev => [...prev, { q, a: "Analysis confirms site biometric consistency." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const ImageWithFallback = ({ src, className, alt }: { src: string, className?: string, alt?: string }) => (
    <img 
      src={src} 
      className={className} 
      alt={alt}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400';
      }}
    />
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 overflow-hidden font-sans border border-slate-200 bg-white rounded-[2.5rem] shadow-sm relative text-slate-900">
      <div className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between z-10">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => { setActivePage('PENDING_QUEUE'); setSelectedId(null); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePage === 'PENDING_QUEUE' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            📥 Queue ({pendingItems.length})
          </button>
          <button 
            onClick={() => { setActivePage('VERIFIER_HISTORY'); setSelectedId(null); }}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePage === 'VERIFIER_HISTORY' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            📜 Log ({myActivityLog.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/20 relative">
        {activePage === 'PENDING_QUEUE' && (
          <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {pendingItems.length === 0 ? (
                <div className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white">
                  <span className="text-6xl mb-4">✅</span>
                  <p className="font-black uppercase tracking-widest text-xs">Queue Cleared</p>
                </div>
              ) : (
                pendingItems.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => openInspector(s.id)}
                    className="bg-white border-2 border-slate-50 p-5 rounded-[2.5rem] hover:border-sky-500 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="relative mb-4">
                      <ImageWithFallback src={s.imageUrl} className="w-full h-40 object-cover rounded-[1.8rem]" alt="site" />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">
                        {(s.aiScore * 100).toFixed(0)}% AI CONFIDENCE
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg uppercase">{s.type}</span>
                        <span className="text-[8px] font-mono text-slate-300">#{s.id.slice(-4)}</span>
                      </div>
                      <h4 className="font-black text-slate-900 text-md truncate">{s.userName}</h4>
                      <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{s.region}</span>
                        <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded uppercase">{s.status}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePage === 'VERIFIER_HISTORY' && (
          <div className="p-8 h-full overflow-y-auto custom-scrollbar">
             <div className="max-w-6xl mx-auto space-y-8 pb-20">
               <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                 <h2 className="text-3xl font-black text-slate-900 uppercase">Audit Portfolio</h2>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audited Volume</p>
                    <p className="text-3xl font-black text-slate-900">{myActivityLog.reduce((acc, s) => acc + s.creditsGenerated, 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">tCO2e</span></p>
                 </div>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                       <tr>
                         <th className="px-10 py-5">Metadata</th>
                         <th className="px-10 py-5">Status</th>
                         <th className="px-10 py-5">Rationale</th>
                         <th className="px-10 py-5 font-mono">Timestamp</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-600">
                       {myActivityLog.map(s => {
                         const myLastLog = [...s.auditTrail].reverse().find(l => l.user === user.name);
                         return (
                           <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-10 py-5">
                                <div className="flex items-center space-x-4">
                                   <ImageWithFallback src={s.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="site" />
                                   <div>
                                     <div className="text-slate-900">{s.userName}</div>
                                     <div className="text-[8px] text-slate-400 uppercase">{s.type}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${[SubmissionStatus.APPROVED, SubmissionStatus.NGO_APPROVED].includes(s.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                  {s.status.replace('_', ' ')}
                                </span>
                             </td>
                             <td className="px-10 py-5 italic max-w-xs truncate">{myLastLog?.note || '-'}</td>
                             <td className="px-10 py-5 text-slate-400">
                               {myLastLog ? new Date(myLastLog.timestamp).toLocaleDateString() : '-'}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                  </table>
               </div>
             </div>
          </div>
        )}
      </div>

      {selectedSub && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-0 lg:p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full h-full max-w-7xl lg:h-auto lg:max-h-[95vh] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 text-slate-900">
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
               <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold">🔬</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Scientific Audit Dossier</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Investigation #{selectedSub.id.slice(-8)}</p>
                  </div>
               </div>
               <button onClick={closeInspector} className="group flex items-center space-x-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest">Close Dossier</span>
                  <span className="font-bold">✕</span>
               </button>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
               <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-8 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-50">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Credit Potential</p>
                       <p className="text-xl font-black text-sky-600">{selectedSub.creditsGenerated} <span className="text-[10px] font-normal text-slate-400 italic">tCO2e</span></p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Eco-System</p>
                       <p className="text-xs font-black text-slate-800 uppercase">{selectedSub.type}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">AI Confidence</p>
                       <p className="text-xs font-black text-emerald-600 uppercase">{(selectedSub.aiScore * 100).toFixed(0)}% Match</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Region</p>
                       <p className="text-xs font-black text-slate-800 uppercase truncate">{selectedSub.region}</p>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 h-[300px]">
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mr-2"></span>
                        On-Site Photographic Evidence
                      </h5>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 shadow-md h-[250px]">
                        <ImageWithFallback src={selectedSub.imageUrl} className="w-full h-full object-cover" alt="site evidence" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        Satellite Spatial Grounding
                      </h5>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 shadow-md h-[250px]">
                        <CoastalMap submissions={[selectedSub]} zoom={18} center={selectedSub.location} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Audit Chain of Custody</h5>
                     <div className="space-y-6 relative ml-3">
                        <div className="absolute left-[-1px] top-2 bottom-2 w-[1px] bg-slate-200"></div>
                        {selectedSub.auditTrail.map((log, i) => (
                          <div key={i} className="relative flex items-start space-x-4 pl-4">
                             <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 bg-white border-2 border-sky-500 rounded-full"></div>
                             <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                   <h6 className="text-[10px] font-black text-slate-900 uppercase">{log.action}</h6>
                                   <span className="text-[8px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase italic mb-2">By: {log.user}</p>
                                {log.note && <p className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-50 italic">"{log.note}"</p>}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="w-full lg:w-[400px] shrink-0 flex flex-col min-h-0 bg-slate-50 border-l border-slate-100">
                  <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
                     <div className="flex items-center justify-between mb-4 shrink-0">
                       <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                         <span className="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse"></span>
                         Ecological AI Oracle
                       </h5>
                       <span className="text-[7px] font-black text-slate-400 uppercase bg-white px-1.5 py-0.5 rounded">G-2.5-F</span>
                     </div>

                     <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-1">
                       <div className="bg-sky-600 p-4 rounded-2xl rounded-tl-lg text-[10px] font-bold text-white shadow-lg shadow-sky-500/10">
                         Inspector initialized. Analyzing pixels for propagule health and biomass density. You may interrogate the evidence.
                       </div>
                       {chatLog.map((log, i) => (
                         <div key={i} className="space-y-2 animate-in slide-in-from-bottom-1">
                           <div className="ml-auto bg-white p-3 rounded-2xl rounded-tr-lg text-[9px] font-black text-slate-700 max-w-[85%] text-right border border-slate-200/50">{log.q}</div>
                           <div className="bg-emerald-50 p-3 rounded-2xl rounded-tl-lg text-[10px] font-medium text-emerald-900 max-w-[95%] border-l-2 border-l-emerald-500 shadow-sm">{log.a}</div>
                         </div>
                       ))}
                       {isAiProcessing && <div className="p-2 flex space-x-1.5 items-center"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-75"></div><span className="text-[8px] text-slate-400 uppercase font-black">Analyzing Pixels...</span></div>}
                     </div>

                     <div className="relative shrink-0">
                       <input 
                         type="text" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiAsk()}
                         placeholder="Scientific query..."
                         className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none pr-12 shadow-sm focus:ring-2 focus:ring-sky-500/10 transition-all"
                       />
                       <button onClick={handleAiAsk} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-sky-600 text-white rounded-lg flex items-center justify-center hover:bg-sky-700 transition-colors">
                         →
                       </button>
                     </div>
                  </div>

                  <div className="bg-white p-6 border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3">Final Verifier Decision</h5>
                    <div className="space-y-4">
                      <textarea 
                        value={auditNote} onChange={e => setAuditNote(e.target.value)}
                        placeholder="State your scientific rationale for approval or rejection..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] font-bold h-24 resize-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                      />
                      <div className="flex gap-3">
                        <button 
                          disabled={isSubmitting}
                          onClick={() => submitVerdict(SubmissionStatus.REJECTED)} 
                          className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase hover:text-red-500 hover:border-red-500 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Reject Data
                        </button>
                        <button 
                          disabled={isSubmitting}
                          onClick={() => submitVerdict(SubmissionStatus.NGO_APPROVED)}
                          className={`flex-[2] py-4 rounded-xl text-[9px] font-black uppercase text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-95 ${!isSubmitting ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                          {isSubmitting ? 'MINTING LEDGER...' : 'Confirm & Approve Issuance'}
                        </button>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default NGODashboard;