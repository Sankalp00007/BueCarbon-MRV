import React, { useState, useMemo } from 'react';
import { User, Submission, SubmissionStatus } from '../types.ts';
import { verifyRestorationImage, askAuditorQuestion } from '../services/geminiService.ts';
import { ICONS } from '../constants.tsx';

interface FishermanDashboardProps {
  user: User;
  submissions: Submission[];
  onAddSubmission: (sub: Submission) => void;
}

const FishermanDashboard: React.FC<FishermanDashboardProps> = ({ user, submissions, onAddSubmission }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'MANGROVE' | 'SEAGRASS'>('MANGROVE');
  const [focusedSubmissionId, setFocusedSubmissionId] = useState<string | null>(null);
  const [inspectedSub, setInspectedSub] = useState<Submission | null>(null);
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([]);

  const focusedSub = useMemo(() => 
    submissions.find(s => s.id === focusedSubmissionId) || submissions[0] || null, 
    [submissions, focusedSubmissionId]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Biometric Pattern Analysis...');

    const mockLocation = {
      lat: -8.4095 + (Math.random() - 0.5) * 0.05,
      lng: 115.1889 + (Math.random() - 0.5) * 0.05
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Content = event.target?.result?.toString() || '';
      const base64Data = base64Content.split(',')[1];
      
      if (!base64Data) {
        setIsUploading(false);
        return;
      }

      try {
        const aiResult = await verifyRestorationImage(base64Data, selectedType, mockLocation.lat, mockLocation.lng);
        
        const newSubmission: Submission = {
          id: `sub-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
          location: mockLocation,
          region: Math.random() > 0.5 ? 'North Coast Basin' : 'Eastern Mangrove Delta',
          imageUrl: base64Content,
          type: selectedType,
          status: aiResult.confidence > 0.7 ? SubmissionStatus.AI_VERIFIED : SubmissionStatus.PENDING,
          aiScore: aiResult.confidence,
          aiReasoning: aiResult.reasoning,
          detectedFeatures: aiResult.detectedFeatures || [],
          environmentalContext: aiResult.environmentalContext || "Coastal",
          googleMapsUrl: aiResult.googleMapsUrl,
          creditsGenerated: selectedType === 'MANGROVE' ? 1.5 : 0.8,
          blockchainHash: Math.random().toString(36).substring(2, 15),
          auditTrail: [{
            timestamp: new Date().toISOString(),
            action: 'Submission Created',
            user: user.name,
            note: `Field data uploaded via mobile terminal.`
          }]
        };

        onAddSubmission(newSubmission);
        setFocusedSubmissionId(newSubmission.id);
      } catch (err) {
        console.error("Upload process error:", err);
      } finally {
        setIsUploading(false);
        setUploadStatus('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiAsk = async () => {
    if (!aiQuestion || !inspectedSub) return;
    setIsAiProcessing(true);
    const q = aiQuestion;
    setAiQuestion('');
    try {
      const base64Data = inspectedSub.imageUrl.includes(',') 
        ? inspectedSub.imageUrl.split(',')[1] 
        : inspectedSub.imageUrl;
        
      const answer = await askAuditorQuestion(base64Data, q);
      setChatLog(prev => [...prev, { q, a: answer || "Analysis complete." }]);
    } catch (e) {
      setChatLog(prev => [...prev, { q, a: "The AI Oracle is currently processing high volumes of ecological data. Please try again." }]);
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
    <div className="space-y-12 max-w-7xl mx-auto py-10 px-6 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Live Field Monitoring</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">Member <span className="text-sky-600">Portal</span></h1>
          <p className="text-slate-500 font-light text-xl leading-relaxed max-w-2xl">
            Community-driven ecosystem verification tools. Capture site evidence to mint high-integrity Blue Carbon credits.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl items-center shadow-inner border border-slate-200">
             <button 
              onClick={() => setSelectedType('MANGROVE')}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${selectedType === 'MANGROVE' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
             >Mangrove</button>
             <button 
              onClick={() => setSelectedType('SEAGRASS')}
              className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${selectedType === 'SEAGRASS' ? 'bg-white text-sky-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
             >Seagrass</button>
          </div>
          <label className={`relative flex items-center px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all hover:bg-sky-600 hover:-translate-y-1 shadow-2xl shadow-slate-900/10 active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? (
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing Evidence...</span>
              </div>
            ) : 'Upload Site Data'}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </header>

      {uploadStatus && (
        <div className="bg-sky-900 text-white p-8 rounded-[2rem] flex items-center justify-between animate-pulse shadow-2xl border border-sky-800">
           <div className="flex items-center space-x-6">
             <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">🧬</div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-1">AI Verification Engine</p>
               <h4 className="text-xl font-bold tracking-tight">{uploadStatus}</h4>
             </div>
           </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 group">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col premium-shadow transition-all hover:shadow-2xl">
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center text-[11px] uppercase tracking-[0.2em]">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-3 animate-pulse"></span>
                Site Geolocation Layer
              </h3>
              {focusedSub && (
                <div className="text-[10px] font-mono text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100">
                  REF: {focusedSub.location?.lat?.toFixed(6)}, {focusedSub.location?.lng?.toFixed(6)}
                </div>
              )}
            </div>
            <div className="flex-1 relative bg-slate-50">
              {submissions.length > 0 && focusedSub ? (
                <iframe 
                  key={focusedSub.id}
                  title="Project Map Overview"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  style={{ border: 0, minHeight: '400px' }}
                  src={`https://www.google.com/maps/embed/v1/view?key=${process.env.GOOGLE_MAPS_API_KEY}&center=${focusedSub.location.lat},${focusedSub.location.lng}&zoom=16&maptype=satellite`}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl">🛰️</div>
                  <p className="font-bold text-center px-12 text-sm uppercase tracking-widest opacity-40">No coordinates established. Establish a node by uploading site data.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[3rem] shadow-2xl shadow-emerald-600/20 text-white transition-all hover:-translate-y-1 hover:rotate-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12">
               <ICONS.Mangrove />
            </div>
            <div className="relative z-10 space-y-10">
              <div>
                <div className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Aggregate Impact</div>
                <div className="text-6xl font-extrabold tracking-tighter mb-2">{(submissions.filter(s => s.status === SubmissionStatus.APPROVED).reduce((acc, s) => acc + s.creditsGenerated, 0)).toFixed(1)}</div>
                <div className="text-emerald-200 text-sm font-bold uppercase tracking-widest opacity-80">Tonnes CO2e</div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🌱</div>
                <p className="text-[10px] text-emerald-100 font-black uppercase tracking-[0.2em] leading-relaxed">Top Tier <br/>Ecosystem Guardian</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 premium-shadow">
             <div className="flex justify-between items-center pb-6 border-b border-slate-50">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Active Nodes</div>
                <div className="text-3xl font-black text-slate-900">{submissions.length}</div>
             </div>
             <div className="flex justify-between items-center">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Rewards Earned</div>
                <div className="text-3xl font-black text-emerald-600">${(submissions.filter(s => s.status === SubmissionStatus.APPROVED).length * 45).toFixed(2)}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden premium-shadow">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-black text-xl text-slate-900 uppercase tracking-tight">Node History Log</h2>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">Sync Count: {submissions.length}</div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Biometric Data</th>
                <th className="px-10 py-6">Verification Stage</th>
                <th className="px-10 py-6">AI Confidence</th>
                <th className="px-10 py-6 text-right">Protocol Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center text-slate-400 font-light text-lg">No telemetry data available. Initialize first node sync.</td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr 
                    key={s.id} 
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${focusedSubmissionId === s.id ? 'bg-sky-50/50' : ''}`}
                    onClick={() => setFocusedSubmissionId(s.id)}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <ImageWithFallback src={s.imageUrl} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-lg group-hover:scale-110 transition-transform duration-500" alt="Site" />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center text-[8px] ${s.type === 'MANGROVE' ? 'bg-emerald-500' : 'bg-sky-500'}`}></div>
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-xs uppercase tracking-widest">{s.type} Collection</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1 opacity-60">Hash: {s.blockchainHash?.slice(0, 10)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border-2 ${
                        s.status === SubmissionStatus.APPROVED ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/10' :
                        s.status === SubmissionStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full" style={{ width: `${s.aiScore * 100}%` }}></div>
                        </div>
                        <span className="text-[11px] font-black text-slate-700">{(s.aiScore * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedSub(s);
                          setChatLog([]);
                        }}
                        className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-sky-600 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10 transition-all active:scale-95"
                       >
                         Scientific Inspect
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCIENTIFIC INSPECTION OVERLAY */}
      {inspectedSub && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-0 lg:p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full h-full max-w-7xl lg:h-auto lg:max-h-[95vh] lg:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
               <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold text-xl">🔬</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Ecosystem Dossier</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Biometric Evidence #{inspectedSub.id.slice(-8)}</p>
                  </div>
               </div>
               <button onClick={() => setInspectedSub(null)} className="group flex items-center space-x-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest">Close Dossier</span>
                  <span className="font-bold">✕</span>
               </button>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
               <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-8 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-50">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Impact Potential</p>
                       <p className="text-xl font-black text-sky-600">{inspectedSub.creditsGenerated} <span className="text-[10px] font-normal text-slate-400 italic">tCO2e</span></p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Eco-System</p>
                       <p className="text-xs font-black text-slate-800 uppercase">{inspectedSub.type}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">AI Confidence</p>
                       <p className="text-xs font-black text-emerald-600 uppercase">{(inspectedSub.aiScore * 100).toFixed(0)}% Match</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Region</p>
                       <p className="text-xs font-black text-slate-800 uppercase truncate">{inspectedSub.region}</p>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mr-2"></span>
                        On-Site Field Capture
                      </h5>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 shadow-md">
                        <ImageWithFallback src={inspectedSub.imageUrl} className="w-full h-full object-cover" alt="site evidence" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                        Registry Spatial Map
                      </h5>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-50 shadow-md">
                        <iframe 
                          title="Satellite Grounding"
                          width="100%" height="100%" frameBorder="0" 
                          src={`https://www.google.com/maps/embed/v1/view?key=${process.env.GOOGLE_MAPS_API_KEY}&center=${inspectedSub.location.lat},${inspectedSub.location.lng}&zoom=19&maptype=satellite`}
                        ></iframe>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">AI Diagnostic Reasoning</h5>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic">"{inspectedSub.aiReasoning}"</p>
                      <div className="flex flex-wrap gap-2 mt-6">
                        {inspectedSub.detectedFeatures.map((f, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">{f}</span>
                        ))}
                      </div>
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
                       <span className="text-[7px] font-black text-slate-400 uppercase bg-white px-1.5 py-0.5 rounded">G-3-F</span>
                     </div>

                     <div className="flex-1 min-h-0 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-1">
                       <div className="bg-sky-600 p-4 rounded-2xl rounded-tl-lg text-[10px] font-bold text-white shadow-lg shadow-sky-500/10">
                         Welcome. I have analyzed your field data. Ask me about the species health, sediment carbon indicators, or pixel verification results.
                       </div>
                       {chatLog.map((log, i) => (
                         <div key={i} className="space-y-2 animate-in slide-in-from-bottom-1">
                           <div className="ml-auto bg-white p-3 rounded-2xl rounded-tr-lg text-[9px] font-black text-slate-700 max-w-[85%] text-right border border-slate-200/50">{log.q}</div>
                           <div className="bg-emerald-50 p-3 rounded-2xl rounded-tl-lg text-[10px] font-medium text-emerald-900 max-w-[95%] border-l-2 border-l-emerald-500 shadow-sm">{log.a}</div>
                         </div>
                       ))}
                       {isAiProcessing && <div className="p-2 flex space-x-1.5 items-center"><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-75"></div><span className="text-[8px] text-slate-400 uppercase font-black">Scanning Pixels...</span></div>}
                     </div>

                     <div className="relative shrink-0 mt-auto">
                       <input 
                         type="text" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiAsk()}
                         placeholder="Ask the auditor..."
                         className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold outline-none pr-12 shadow-sm focus:ring-2 focus:ring-sky-500/10 transition-all"
                       />
                       <button onClick={handleAiAsk} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-sky-600 text-white rounded-lg flex items-center justify-center hover:bg-sky-700 transition-colors">
                         →
                       </button>
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

export default FishermanDashboard;