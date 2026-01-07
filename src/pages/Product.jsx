import { Link } from 'react-router-dom'
import AirbnbDemo from '../demos/AirbnbDemo'
import DominosDemo from '../demos/DominosDemo'
import ManhattanDemo from '../demos/ManhattanDemo'
import PakBankDemo from '../demos/PakBankDemo'

const demos = [
  {
    id: 'airbnb',
    title: 'Airbnb Host Assistant',
    description: 'Premium Urdu voice assistant for Airbnb hosts in Pakistan. Handles bookings, inquiries, and guest support.',
    icon: '🏠',
    component: AirbnbDemo,
    category: 'Hospitality',
    color: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 'dominos',
    title: "Domino's Ordering Agent",
    description: 'Bilingual English-Urdu pizza ordering assistant for Domino\'s Pakistan. Warm, professional, and fluent.',
    icon: '🍕',
    component: DominosDemo,
    category: 'Food & Beverage',
    color: 'from-red-500/20 to-orange-500/20'
  },
  {
    id: 'manhattan',
    title: 'Manhattan Motor Hub Sales',
    description: 'High-end luxury car sales agent. Charismatic, persuasive, and uses scarcity tactics to close deals.',
    icon: '🚗',
    component: ManhattanDemo,
    category: 'Sales & Retail',
    color: 'from-yellow-500/20 to-amber-500/20'
  },
  {
    id: 'pakbank',
    title: 'PakBank Customer Support',
    description: 'Energetic Urdu banking assistant. Helps with balance inquiries, card management, and loan information.',
    icon: '🏦',
    component: PakBankDemo,
    category: 'Finance',
    color: 'from-green-500/20 to-emerald-500/20'
  }
]

export default function Product() {
  return (
    <div className="relative pt-32 pb-20 w-full flex flex-col items-center min-h-screen bg-background-dark">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-[1200px] px-6 flex flex-col items-center text-center gap-8 mb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6 hover:bg-primary/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Interactive Voice Demos</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-6 drop-shadow-sm">
          Voice AI <br/>
          <span className="text-white">Demos</span>
        </h1>
        <p className="text-lg text-secondary-grey font-light leading-relaxed max-w-2xl">
          Experience real-world voice agents in action. Try interactive demos showcasing different industries and use cases.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            to="/create-agent" 
            className="group relative overflow-hidden flex items-center gap-2 h-12 px-8 rounded-full bg-primary hover:bg-primary-glow text-white text-sm font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Create Your Own
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </span>
          </Link>
        </div>
      </section>
      
      {/* Voice Agent Demos Section */}
      <section className="w-full max-w-[1200px] px-6 mb-32 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Interactive Demos</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Experience Real-World <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">Voice Agents</span>
          </h2>
          <p className="text-lg text-secondary-grey max-w-2xl mx-auto">
            Try our interactive voice agent demos showcasing real-world use cases across different industries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {demos.map((demo) => {
            const DemoComponent = demo.component;
            return (
              <div
                key={demo.id}
                className="group relative bg-surface-card rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Header */}
                <div className="relative p-6 border-b border-white/5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                        {demo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          {demo.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-secondary-grey">
                            {demo.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-grey leading-relaxed">
                    {demo.description}
                  </p>
                </div>

                {/* Demo Component */}
                <div className="relative p-6 bg-surface-dark/50">
                  <DemoComponent />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      <section className="w-full max-w-[800px] px-6 py-32 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to integrate?</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Join thousands of developers building the next generation of voice-first applications.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/contact" className="group w-full sm:w-auto h-12 px-8 rounded-lg bg-white text-black text-sm font-bold transition-all hover:bg-slate-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-1">
            <span className="flex items-center justify-center gap-2">
              Get API Keys
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">arrow_forward</span>
            </span>
          </Link>
          <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-transparent border border-white/10 hover:border-white/30 text-white text-sm font-bold transition-all hover:bg-white/5 transform hover:-translate-y-1">
            Read Documentation
          </button>
        </div>
      </section>
    </div>
  )
}

