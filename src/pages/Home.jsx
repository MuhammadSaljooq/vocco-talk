import { Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '../components/FallbackUI'

// Lazy load heavy component
const VoccoTalkAgent = lazy(() => import('../components/VoccoTalkAgent'))

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>
      
      <main className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-16 sm:mb-24 md:mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-24">
            <div className="flex-1 text-center lg:text-left z-20 w-full">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-6 sm:mb-8 hover:bg-primary/10 transition-colors cursor-default">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-primary"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-widest">v2.0 Now Available</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-4 sm:mb-6 drop-shadow-sm px-2 sm:px-0">
                Voice AI <br className="hidden sm:block"/>
                <span className="text-white">Infrastructure</span>
              </h1>
              <p className="text-base sm:text-lg text-secondary-grey font-light leading-relaxed max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 md:mb-10 px-2 sm:px-0">
                Build ultra-low latency voice agents that sound human. Seamlessly integrated, infinitely scalable, and engineered for the modern stack.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0">
                <Link to="/create-agent" className="h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2">
                  Start Building
                  <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward</span>
                </Link>
                <button className="h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm group">
                  Read Docs
                  <span className="material-symbols-outlined text-base sm:text-lg text-secondary-grey group-hover:text-white transition-colors">code</span>
                </button>
              </div>
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 px-2 sm:px-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-secondary-grey mb-3 sm:mb-4 font-bold">Trusted by engineering teams at</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="font-bold text-sm sm:text-base lg:text-lg text-white flex items-center gap-1.5 sm:gap-2 group"><div className="size-2.5 sm:size-3 bg-white group-hover:bg-primary transition-colors rounded-full"></div>Acme</div>
                  <div className="font-bold text-sm sm:text-base lg:text-lg text-white flex items-center gap-1.5 sm:gap-2 group"><div className="size-2.5 sm:size-3 bg-white group-hover:bg-accent transition-colors rounded-sm rotate-45"></div>Globex</div>
                  <div className="font-bold text-sm sm:text-base lg:text-lg text-white flex items-center gap-1.5 sm:gap-2 group"><div className="size-2.5 sm:size-3 bg-white group-hover:bg-secondary-grey transition-colors rounded-sm"></div>Soylent</div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative perspective-1000">
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full animate-pulse-slow"></div>
              <div className="relative group">
                <div className="absolute -inset-[1px] bg-gradient-to-br from-primary/50 via-white/10 to-accent/50 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
                <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><LoadingSpinner size="md" text="Loading agent..." /></div>}>
                  <VoccoTalkAgent compact={true} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2 sm:px-0">Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">Scale</span></h2>
            <p className="text-secondary-grey max-w-2xl mx-auto text-base sm:text-lg font-light px-2 sm:px-0">
              Our infrastructure handles the heavy lifting so you can focus on building great conversational experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="group relative md:col-span-2 overflow-hidden rounded-3xl bg-[#0A0C0E] border border-white/5 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_-10px_rgba(91,140,90,0.15)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-500"></div>
              <div className="p-6 sm:p-8 md:p-10 relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 text-primary mb-6 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(91,140,90,0.2)]">
                    <span className="material-symbols-outlined">bolt</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Global Low Latency</h3>
                  <p className="text-sm sm:text-base text-secondary-grey leading-relaxed max-w-md">Our edge network processes voice data closer to the user, ensuring sub-500ms response times worldwide.</p>
                </div>
                <div className="mt-8 h-32 w-full bg-surface-card rounded-xl border border-white/5 relative overflow-hidden flex items-end px-6 pb-0 gap-1.5 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5"></div>
                  <div className="flex-1 bg-white/5 h-[30%] rounded-t-sm backdrop-blur-sm"></div>
                  <div className="flex-1 bg-white/10 h-[50%] rounded-t-sm backdrop-blur-sm"></div>
                  <div className="flex-1 bg-primary/40 h-[25%] rounded-t-sm animate-pulse backdrop-blur-sm"></div>
                  <div className="flex-1 bg-gradient-to-t from-primary to-primary-glow h-[80%] rounded-t-sm shadow-[0_0_15px_rgba(91,140,90,0.4)]"></div>
                  <div className="flex-1 bg-primary/30 h-[40%] rounded-t-sm backdrop-blur-sm"></div>
                  <div className="flex-1 bg-white/5 h-[20%] rounded-t-sm backdrop-blur-sm"></div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-[#0A0C0E] border border-white/5 transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_-10px_rgba(227,101,91,0.15)]">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-accent/10 transition-colors duration-500"></div>
              <div className="p-6 sm:p-8 md:p-10 relative z-10">
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 text-accent mb-6 group-hover:bg-accent/10 group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined">graphic_eq</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Natural Prosody</h3>
                <p className="text-sm text-secondary-grey leading-relaxed">Models that understand emotion, pacing, and tone for human-like interaction.</p>
                <div className="mt-8 flex items-center gap-3 p-4 bg-surface-card rounded-xl border border-white/5 group-hover:border-accent/20 transition-colors">
                  <button className="size-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                  </button>
                  <div className="flex-1 flex items-center justify-between opacity-60 px-2 h-8">
                    <span className="w-1 h-3 bg-accent rounded-full animate-pulse"></span>
                    <span className="w-1 h-5 bg-accent rounded-full animate-pulse delay-75"></span>
                    <span className="w-1 h-8 bg-accent rounded-full animate-pulse delay-100"></span>
                    <span className="w-1 h-4 bg-accent rounded-full animate-pulse delay-150"></span>
                    <span className="w-1 h-6 bg-accent rounded-full animate-pulse delay-200"></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-[#0A0C0E] border border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]">
              <div className="p-6 sm:p-8 md:p-10 relative z-10">
                <div className="inline-flex items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 text-white mb-6 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Real-time Analytics</h3>
                <p className="text-sm text-secondary-grey leading-relaxed mb-4 sm:mb-6">Live dashboards for call volume, sentiment analysis, and resolution rates.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-card p-3 rounded-lg border border-white/5 group-hover:border-primary/20 transition-colors">
                    <div className="text-[10px] text-secondary-grey uppercase tracking-wider mb-1">Success</div>
                    <div className="text-xl font-bold text-primary">99.9%</div>
                  </div>
                  <div className="bg-surface-card p-3 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="text-[10px] text-secondary-grey uppercase tracking-wider mb-1">Calls</div>
                    <div className="text-xl font-bold text-white">12.4k</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-[#0A0C0E] border border-white/5 transition-all duration-500 hover:border-white/20">
              <div className="flex flex-col md:flex-row h-full">
                <div className="p-10 flex-1">
                  <div className="inline-flex items-center justify-center size-12 rounded-xl bg-white/5 border border-white/10 text-white mb-6 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined">extension</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">One-Click Integration</h3>
                  <p className="text-sm sm:text-base text-secondary-grey leading-relaxed mb-4 sm:mb-6">Connect to your existing stack with a few lines of code. Webhook support for all major CRMs.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-secondary-grey font-mono hover:bg-white/10 cursor-default transition-colors">HubSpot</span>
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-secondary-grey font-mono hover:bg-white/10 cursor-default transition-colors">Salesforce</span>
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-secondary-grey font-mono hover:bg-white/10 cursor-default transition-colors">Segment</span>
                  </div>
                </div>
                <div className="flex-1 bg-surface-card/50 border-l border-white/5 p-8 font-mono text-xs text-slate-400 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C0E] to-transparent opacity-50"></div>
                  <div className="relative z-10 space-y-2">
                    <div className="flex gap-1.5 mb-4">
                      <div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="size-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="size-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="pl-2 border-l-2 border-primary/20">
                      <span className="text-accent">import</span> {' '}
                      <span className="text-white">{'{'} VoiceAgent {'}'}</span> {' '}
                      <span className="text-accent">from</span> {' '}
                      <span className="text-primary">'@voice/sdk'</span>;
                    </div>
                    <div className="pl-2 border-l-2 border-transparent">
                      <span className="text-secondary-grey">// Initialize</span>
                    </div>
                    <div className="pl-2 border-l-2 border-transparent">
                      <span className="text-accent">const</span> agent = <span className="text-accent">new</span> VoiceAgent({'{'}
                    </div>
                    <div className="pl-6 border-l-2 border-transparent">
                      apiKey: <span className="text-primary">'pk_live_...'</span>,
                    </div>
                    <div className="pl-6 border-l-2 border-transparent">
                      mode: <span className="text-primary">'conversational'</span>
                    </div>
                    <div className="pl-2 border-l-2 border-transparent">
                      {'}'});
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="border-y border-white/5 bg-[#050607]/50 backdrop-blur-sm py-16 sm:py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWJagYE20nX6UNHnibfKAPODf8-jMrlFzX2vwgNJCBp18eJy9fS8qgs2C9ul2rfo8Q0vMUUtOCL73sBpOnFsW3THtgY6A8y-L8hBgIzgW97JgCgUbO5TVTTheYqAj0vceiQKewvqtCayV3zWqLHQUw-cy--2PH1w_STHdBcmOAl_gbLGdOrS2U5z__Me9LxeEM64AUiEujS-PHEgV7bjuqZ2Ba8bmLqKOFwjsOhqyE0kdzlAUsPA8wnmVvKjeXOAeo1Gb8VmP18A')] opacity-[0.05] bg-cover bg-center mix-blend-screen"></div>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 sm:mb-12 md:mb-16 gap-6 sm:gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Total Observability</h2>
                <p className="text-sm sm:text-base md:text-lg text-secondary-grey max-w-lg">Monitor every interaction in real-time. Gain insights into user sentiment, latency, and agent performance.</p>
              </div>
              <button className="text-sm sm:text-base text-white hover:text-primary transition-colors font-medium flex items-center gap-2 group">
                Explore Dashboard <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 h-auto md:h-[500px]">
              <div className="col-span-1 md:col-span-2 row-span-2 rounded-3xl border border-white/10 bg-surface-card relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAWJagYE20nX6UNHnibfKAPODf8-jMrlFzX2vwgNJCBp18eJy9fS8qgs2C9ul2rfo8Q0vMUUtOCL73sBpOnFsW3THtgY6A8y-L8hBgIzgW97JgCgUbO5TVTTheYqAj0vceiQKewvqtCayV3zWqLHQUw-cy--2PH1w_STHdBcmOAl_gbLGdOrS2U5z__Me9LxeEM64AUiEujS-PHEgV7bjuqZ2Ba8bmLqKOFwjsOhqyE0kdzlAUsPA8wnmVvKjeXOAeo1Gb8VmP18A')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/60 to-transparent"></div>
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-green-500">Live Network</span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-3xl font-bold text-white">42ms</div>
                      <div className="text-xs text-secondary-grey uppercase tracking-wider">Avg. Global Latency</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">99.99%</div>
                      <div className="text-xs text-secondary-grey uppercase tracking-wider">Uptime</div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(91,140,90,0.5)]"></div>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-1 rounded-3xl border border-white/10 bg-surface-dark p-6 sm:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-white/5 transition-colors min-h-[150px] sm:min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform duration-300">support_agent</span>
                <div className="text-4xl font-bold text-white mb-1">850+</div>
                <div className="text-xs text-secondary-grey uppercase tracking-widest font-bold">Active Agents</div>
              </div>
              <div className="col-span-1 md:col-span-1 rounded-3xl border border-white/10 bg-surface-dark p-6 sm:p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:bg-white/5 transition-colors min-h-[150px] sm:min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-accent mb-4 group-hover:scale-110 transition-transform duration-300">forum</span>
                <div className="text-4xl font-bold text-white mb-1">2.4M</div>
                <div className="text-xs text-secondary-grey uppercase tracking-widest font-bold">Messages</div>
              </div>
              <div className="col-span-1 md:col-span-2 rounded-3xl border border-white/10 bg-surface-dark relative overflow-hidden flex flex-col justify-center px-8 shadow-xl">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgv874oOdgHo18G3TS3BW3FJEPSmkF55cOEKhxNKYDhUjmXhU1yG7Sc1JvfZjbcmJUxUapIfFZXZGAH1wU6j0KYLUZDlvJ1xyagkaEYLozJUvwYhvQrmIJqE5f9R1E2lNMS76mvrFXeq7h1AU1R8hu_2gLJVST2DCLxwTtT1MOlRDqG36Nj-G9_gFC5HTB_fDljVkIZyo0UP55FfZCYDyjEMTtoyIipSD1P8DmKomFFAUcTGaXRUM6R0yrrCgyq98dj5bohgh2Tg')] bg-cover opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-secondary-grey">Sentiment Analysis</span>
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">+0.8 Positive</span>
                  </div>
                  <div className="flex items-end gap-1 h-20 w-full">
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[30%] group-hover:bg-primary/20 transition-colors duration-300"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[50%] group-hover:bg-primary/30 transition-colors duration-300 delay-75"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[40%] group-hover:bg-primary/25 transition-colors duration-300 delay-100"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[70%] group-hover:bg-primary/50 transition-colors duration-300 delay-150"></div>
                    <div className="flex-1 bg-gradient-to-t from-primary to-primary-glow rounded-t-sm h-[90%] shadow-[0_0_20px_-5px_rgba(91,140,90,0.5)]"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[60%] group-hover:bg-primary/40 transition-colors duration-300 delay-200"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[45%] group-hover:bg-primary/30 transition-colors duration-300 delay-300"></div>
                    <div className="flex-1 bg-white/5 rounded-t-sm h-[30%] group-hover:bg-primary/20 transition-colors duration-300 delay-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 sm:py-24 md:py-32 relative text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">Ready to deploy?</h2>
            <p className="text-base sm:text-lg md:text-xl text-secondary-grey mb-8 sm:mb-10 md:mb-12 font-light px-2 sm:px-0">Join thousands of developers building the next generation of voice interfaces.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
              <Link to="/create-agent" className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:scale-105 transition-transform shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] flex items-center justify-center">
                Get Started Free
              </Link>
              <Link to="/contact" className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-full bg-transparent border border-white/10 hover:border-white text-white font-bold text-sm sm:text-base transition-colors flex items-center justify-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

