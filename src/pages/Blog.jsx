import { Link } from 'react-router-dom'

export default function Blog() {
  const posts = [
    { title: "How we reduced latency by 50ms", category: "Engineering", date: "Oct 12, 2023", readTime: "6 min read", icon: "speed" },
    { title: "Designing voice interfaces for accessibility", category: "Design", date: "Oct 08, 2023", readTime: "5 min read", icon: "accessibility_new" },
    { title: "The ethics of AI voice replication", category: "Ethics", date: "Sep 28, 2023", readTime: "8 min read", icon: "balance" },
    { title: "Scaling our infrastructure for millions", category: "Infrastructure", date: "Sep 15, 2023", readTime: "10 min read", icon: "dns" },
    { title: "Meet the new expressive voice models", category: "Product", date: "Sep 10, 2023", readTime: "3 min read", icon: "record_voice_over" },
    { title: "Q3 Product Update: New Dashboard", category: "Changelog", date: "Sep 01, 2023", readTime: "2 min read", icon: "dashboard" },
  ]

  return (
    <div className="bg-[#050505] min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(227,101,91,0.15),rgba(91,140,90,0.1)_40%,rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed top-0 right-0 w-1/2 h-[50vh] bg-[radial-gradient(circle_at_80%_20%,rgba(91,140,90,0.2),transparent_50%)] pointer-events-none z-0 opacity-50 animate-pulse-slow"></div>
      
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 pt-32 pb-20 flex flex-col gap-24">
        <section className="flex flex-col gap-10 md:flex-row md:items-end justify-between relative mt-8">
          <div className="flex flex-col gap-6 max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#5B8C5A]/30 bg-[#5B8C5A]/5 w-fit backdrop-blur-md shadow-[0_0_15px_rgba(91,140,90,0.1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B8C5A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B8C5A]"></span>
              </span>
              <span className="text-xs font-bold text-[#5B8C5A] tracking-widest uppercase">New Update v2.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter pb-2 text-white leading-[0.9]">
              Insights <span className="text-[#596157]/40 font-thin italic">&amp;</span><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E3655B] via-[#E3655B] to-[#52414C] animate-pulse-slow">Updates</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-xl pl-1">
              The Voice of AI – Engineering deep dives, product announcements, and thoughts on the future of generative audio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end self-start md:self-end mb-2 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5">
            <button className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-sm font-bold shadow-lg transition-all border border-white/10">All Posts</button>
            <button className="px-6 py-2.5 rounded-lg bg-transparent text-gray-400 text-sm font-semibold hover:text-white hover:bg-white/5 transition-all">Engineering</button>
            <button className="px-6 py-2.5 rounded-lg bg-transparent text-gray-400 text-sm font-semibold hover:text-white hover:bg-white/5 transition-all">Product</button>
            <button className="px-6 py-2.5 rounded-lg bg-transparent text-gray-400 text-sm font-semibold hover:text-white hover:bg-white/5 transition-all">Research</button>
          </div>
        </section>
        
        <section className="mb-8 group/featured">
          <Link to="#" className="block relative overflow-hidden rounded-[2rem] bg-[#0F0F0F] border border-[#596157]/20 hover:border-[#E3655B]/40 transition-all duration-500 shadow-2xl shadow-black/50">
            <div className="flex flex-col lg:flex-row h-full relative z-10">
              <div className="w-full lg:w-[55%] h-96 lg:h-auto bg-cover bg-center relative overflow-hidden" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDVf8j8tyDAbDjtmWWaMkhT2Mv75dA_SNfM_Lo0Var9f3eR_KYs9Ymz6DsazP_AE5AUWIhXxEqEuZKFpX3RPBQHBBWXq0EuE3u59aj_-nQrkO1A7EyRlKdQMpQZiitNbgA53EyxnGUOtjZYXlYFtikr8iEtR2xgykleB2RjV0ZKLySXdbRzVV_SZ5lWtI84GgtOYgWk28Nlmji-Z24by5iY5cDLd_9NN_1qJD840NGfwwJJ_ItVVu2_STTMZ7eo7xaLHgSbS5u4cQ")'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0F0F0F]/20 lg:to-[#0F0F0F]"></div>
              </div>
              <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center gap-8 relative bg-[#0F0F0F] lg:bg-transparent">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-[#E3655B] uppercase tracking-widest">
                    <span className="bg-[#E3655B]/10 px-3 py-1.5 rounded-md text-[#E3655B] border border-[#E3655B]/20 shadow-[0_0_10px_rgba(227,101,91,0.1)]">Featured Update</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white group-hover/featured:text-[#E3655B] transition-colors duration-300">
                    Introducing Version 2.0: Lower Latency, Higher Empathy
                  </h2>
                  <p className="text-gray-400 text-xl leading-relaxed line-clamp-3 font-light">
                    We've rebuilt our core engine to deliver responses in under 200ms while maintaining natural intonation. This update brings a fundamental shift in how voice agents perceive context.
                  </p>
                </div>
                <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/5 mt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span>Oct 24, 2023</span>
                    </div>
                    <span className="text-[#596157]">•</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>4 min read</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-bold text-white group-hover/featured:gap-4 transition-all">
                    Read Article 
                    <span className="material-symbols-outlined text-[20px] text-[#E3655B]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Link key={idx} to="#" className="group flex flex-col rounded-[1.5rem] border border-[#596157]/20 overflow-hidden relative h-full bg-[#0a0a0a] hover:translate-y-[-8px] hover:scale-[1.02] transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_-5px_rgba(227,101,91,0.15)] hover:border-[#E3655B]/40">
              <div className="w-full aspect-[4/3] overflow-hidden relative z-10" style={{clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'}}>
                <div className="absolute inset-0 bg-[#5B8C5A]/20 z-10 mix-blend-overlay opacity-30 group-hover:opacity-0 transition-opacity duration-500"></div>
                <div className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700 ease-out" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfyUz8gHRmTfO47JcazSQdm-8OT-sWDuVt7SlB1VQGlsNVAgz3G8K1k1xvbzawG5-wh1eCmV7wXOTf-U6Tj6eyRLBla4xHbo-hx_RK9dv09zcSg0muvHMgvitCrAWTa-EllAfz_XljOFoOS1RQEEVUFdEktzYzGRQo5_7yMMjJThedVfFMb9GySdkGE0jtXbKS2aHtZ65IF9wH9_F4zqEPzi3mqp58Hsxx_kc5ZbK9v0FrfFwThwrmVKSNVEWIyKzeUK4Om85uyw")'}}></div>
                <div className="absolute top-5 left-5 z-20">
                  <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold tracking-wide text-white shadow-lg">{post.category}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 p-8 flex-1 -mt-12 relative z-20">
                <div className={`w-12 h-12 rounded-full bg-[#0a0a0a] border border-[#596157]/20 flex items-center justify-center ${post.category === 'Engineering' ? 'text-[#5B8C5A]' : post.category === 'Design' ? 'text-[#E3655B]' : 'text-[#52414C]'} mb-2 shadow-xl`}>
                  <span className="material-symbols-outlined">{post.icon}</span>
                </div>
                <h3 className="text-2xl font-bold leading-tight text-white group-hover:text-[#E3655B] transition-colors">{post.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">Engineering deep dive into our new edge network optimization and packet routing algorithms for real-time processing.</p>
                <div className="mt-auto pt-6 flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span>{post.date}</span>
                  </div>
                  <span className="font-mono text-[#5B8C5A] font-bold">{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
        
        <section className="mt-8 py-20 px-8 lg:px-16 relative overflow-hidden rounded-[2.5rem] border border-[#596157]/20 bg-[#0c0c0c] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col gap-6 text-center lg:text-left max-w-lg">
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-[#E3655B] font-bold text-sm uppercase tracking-wider mb-2">
                <span className="p-2 bg-[#E3655B]/10 rounded-full">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </span>
                Newsletter
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">Join the conversation</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Get the latest insights on Voice AI engineering, product updates, and industry trends directly to your inbox.
              </p>
            </div>
            <div className="w-full max-w-md">
              <form className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E3655B] to-[#52414C] rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <input className="w-full relative bg-black/50 backdrop-blur-sm border border-[#596157]/30 rounded-xl px-5 py-4 pl-12 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-[#E3655B]/50 focus:border-[#E3655B]/50 transition-all outline-none" placeholder="Enter your email address" type="email"/>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">alternate_email</span>
                </div>
                <button className="shrink-0 h-[54px] px-8 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1" type="submit">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-4 text-center lg:text-left pl-1">Join 5,000+ developers and designers.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

