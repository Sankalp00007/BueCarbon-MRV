import React from 'react';
import { ICONS } from '../constants.tsx';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToMission = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('mission');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-32 pb-32 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="relative h-[800px] flex items-center justify-center overflow-hidden rounded-[3.5rem] shadow-2xl mx-4 sm:mx-0 group">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35] transition-transform duration-[10s] group-hover:scale-110"
          alt="Coastal Mangroves"
        />
        <div className="relative text-center text-white px-6 max-w-5xl z-10">
          <div className="inline-block px-6 py-2 mb-8 rounded-full bg-sky-500/20 backdrop-blur-xl border border-sky-400/30 text-sky-300 text-[11px] font-black uppercase tracking-[0.4em] shadow-lg">
            Institutional dMRV Protocol
          </div>
          <h1 className="text-6xl md:text-9xl font-bold mb-8 leading-tight tracking-tight">
            The Digital <span className="text-sky-400">Blue Carbon</span> Ledger
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-slate-200 font-light leading-relaxed max-w-3xl mx-auto opacity-90">
            A blockchain-powered verification engine connecting high-impact coastal restoration with global capital through Gemini-validated environmental truth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white px-14 py-5 rounded-full text-lg font-black uppercase tracking-widest transition-all shadow-2xl shadow-sky-500/40 active:scale-95 hover:-translate-y-1"
            >
              Enter Marketplace
            </button>
            <button 
              onClick={scrollToMission}
              className="text-white/80 hover:text-white font-bold uppercase tracking-widest text-xs transition-all px-8 py-5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/5"
            >
              Explore Protocol
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="max-w-6xl mx-auto px-4 scroll-mt-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-5xl font-bold text-slate-900 leading-tight">
              Scaling the <span className="text-sky-500">Global Registry</span> for Blue Ecosystems
            </h2>
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              Current carbon markets are broken by manual verification delays and transparency gaps. We solve the "MRV Bottleneck" by digitizing the entire lifecycle of a carbon credit.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-transform hover:scale-105">
                <div className="text-3xl font-black text-slate-900 mb-1">100x</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Speed</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-transform hover:scale-105">
                <div className="text-3xl font-black text-sky-600 mb-1">85%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Funds to Communities</div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 grid gap-8">
            <div className="group p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-6 transition-transform">💎</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">The Premium Multiplier</h3>
              <p className="text-slate-500 leading-relaxed font-light text-sm">
                Blue Carbon credits trade at a 3x premium compared to terrestrial credits due to their higher permanence and significant co-benefits. Our platform provides the institutional-grade data needed to unlock these high-value assets.
              </p>
            </div>
            <div className="group p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-6 transition-transform">🏢</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Strategic Climate Alpha</h3>
              <p className="text-slate-500 leading-relaxed font-light text-sm">
                Investors gain exposure to a high-growth environmental commodity while supporting projects that protect $65B in coastal infrastructure. This is not just conservation; it is critical climate risk management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gemini Integration Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-50 to-sky-50 rounded-[4rem] p-12 md:p-24 border border-sky-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#0EA5E9" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,85.6,-0.9C84,14,77.5,28,68.4,40.1C59.3,52.2,47.5,62.4,34.2,69.5C20.8,76.6,5.9,80.6,-9.3,79.1C-24.5,77.6,-39.9,70.5,-52.8,60.1C-65.7,49.8,-76.2,36.2,-81.2,21C-86.2,5.8,-85.7,-11,-79.8,-26.1C-73.9,-41.2,-62.6,-54.5,-49,-61.6C-35.4,-68.7,-17.7,-69.6,-0.6,-68.6C16.5,-67.6,31.3,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center space-x-3 bg-sky-500/10 px-4 py-2 rounded-full mb-8 border border-sky-500/20">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-8 leading-tight">
                The Power of <br/><span className="text-sky-500 underline decoration-sky-200 underline-offset-8 italic">Ecological AI</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-xl border border-sky-50">🔍</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Sub-Pixel Biometric Analysis</h4>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">Gemini identifies species-specific markers like pneumatophores and prop roots that are invisible to standard computer vision models.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-xl border border-sky-50">📍</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Real-Time Spatial Grounding</h4>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">Leveraging Gemini's Google Maps tool, we cross-reference ground imagery with high-res satellite data to eliminate double-counting.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-xl border border-sky-50">🏛️</div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Automated Audit Synthesis</h4>
                    <p className="text-slate-500 text-sm font-light leading-relaxed">Gemini produces 5-point audit dossiers in milliseconds, reducing the time for scientific verifiers to approve a credit from 6 months to 6 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold text-[10px]">AI</div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Verification Frame</span>
                   </div>
                   <div className="text-[10px] font-mono text-emerald-500 font-bold">MATCH: 98.4%</div>
                </div>
                <img src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=1000" className="w-full h-64 object-cover rounded-2xl mb-8 group-hover:scale-105 transition-transform duration-700" alt="Mangrove AI" />
                <div className="space-y-4">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 w-[92%]"></div>
                  </div>
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 italic text-[11px] text-sky-800 font-medium">
                    "Identified Rhizophora mangle clusters with 15% prop root density. Sediment carbon indicators consistent with intertidal mudflat classification at coordinates [8.409S, 115.188E]."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10x Comparison Section */}
      <section className="bg-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 px-8 py-32 rounded-[5rem] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-bold mb-8">10x More Effective <br/><span className="text-emerald-400">Than Land Forests</span></h2>
              <p className="text-slate-400 font-light text-xl leading-relaxed">
                Blue Carbon biomes are the most efficient sequestration engines on the planet, burying carbon up to 40 times faster than tropical rainforests and holding it for thousands of years.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur px-8 py-6 rounded-[2rem] border border-white/10 hidden lg:block">
              <div className="text-sky-400 text-3xl font-black mb-1">~50%</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ocean's Carbon in 0.2% area</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="group bg-white/5 p-4 rounded-[3.5rem] border border-white/10 transition-all hover:bg-white/10">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8">
                <img src="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Mangroves" />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-3xl font-bold text-emerald-400 mb-4">Mangrove Forests</h3>
                <p className="text-slate-300 text-lg font-light leading-relaxed mb-8">
                  Mangroves trap organic matter in waterlogged soils where it cannot oxidize. Their soil carbon can be 10 meters deep, storing carbon for millennia.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Soil Storage</p>
                    <p className="text-xl font-bold">~1,000 tC/ha</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Coastal Shield</p>
                    <p className="text-xl font-bold">Storm Buffering</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-white/5 p-4 rounded-[3.5rem] border border-white/10 transition-all hover:bg-white/10">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-8">
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Seagrass" />
              </div>
              <div className="px-6 pb-6">
                <h3 className="text-3xl font-bold text-sky-400 mb-4">Seagrass Meadows</h3>
                <p className="text-slate-300 text-lg font-light leading-relaxed mb-8">
                  Seagrasses cover just 0.1% of the seafloor but account for 18% of the ocean’s total carbon burial. They are the ultimate "Carbon Sink" of the subtidal world.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Burial Rate</p>
                    <p className="text-xl font-bold">35x vs Jungle</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Habitat Benefit</p>
                    <p className="text-xl font-bold">Fish Nurseries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-24">
           <div className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Investment Thesis</div>
           <h2 className="text-5xl font-bold text-slate-900 mb-6">Why Invest in the Protocol?</h2>
           <p className="text-slate-500 text-xl font-light max-w-2xl mx-auto">
             The Blue Carbon market is projected to reach $50B by 2030. We are building the infrastructure that makes this growth transparent and secure.
           </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
           {[
             { title: 'Quality Alpha', desc: 'Institutional buyers pay a 300% premium for Blue Carbon due to co-benefits in biodiversity and flood protection.', icon: '📈' },
             { title: 'Immutable Trust', desc: 'Every credit is linked to an on-chain hash of AI-verified field data, eliminating greenwashing risk.', icon: '🛡️' },
             { title: 'Early Mover', desc: 'The most efficient carbon sink biomes are currently the most undervalued assets in the environmental commodity space.', icon: '⚡' }
           ].map((item, i) => (
             <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="text-4xl mb-6">{item.icon}</div>
                <h4 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">{item.title}</h4>
                <p className="text-slate-500 text-sm font-light leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* MRV Pipeline */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold mb-6 text-slate-900">The MRV Pipeline</h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-light text-lg">
            A frictionless, end-to-end verification protocol that ensures every credit is backed by immutable environmental evidence.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
          
          {[
            { step: '01', role: 'Community Member', title: 'Field Capture', desc: 'Members upload geofenced, timestamped site data. Gemini analyzes biometrics for species density.', icon: '📸' },
            { step: '02', role: 'Scientific NGO', title: 'Verification', desc: 'Third-party auditors review Gemini-generated dossiers and cross-reference satellite imagery.', icon: '🕵️' },
            { step: '03', role: 'Registry Admin', title: 'Registry Mint', desc: 'Administrators perform a final compliance check before minting a unique cryptographic asset.', icon: '🏛️' },
            { step: '04', role: 'Corporations', title: 'Market Purchase', desc: 'Buyers purchase and "retire" credits. Smart contracts distribute funds directly.', icon: '💎' }
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center p-8 group">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-3xl shadow-lg mb-8 transition-all group-hover:shadow-sky-500/10 group-hover:-translate-y-2 group-hover:border-sky-500/30">
                {item.icon}
              </div>
              <div className="text-sky-500 font-black text-[10px] uppercase tracking-widest mb-2">Step {item.step} • {item.role}</div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;