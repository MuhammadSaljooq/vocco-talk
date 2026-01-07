import { Link } from 'react-router-dom'

export default function Contact() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F7F7F8] dark:bg-[#1a1418]">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[length:60px_60px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-50" style={{maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'}}></div>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#5B8C5A]/20 blur-[100px] rounded-full mix-blend-screen dark:mix-blend-lighten animate-[blob_10s_infinite]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#E3655B]/15 blur-[120px] rounded-full mix-blend-screen dark:mix-blend-lighten animate-[blob_10s_infinite]" style={{animationDelay: '2s'}}></div>
      </div>
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-12 lg:py-20 px-4 sm:px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col justify-start relative">
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#5B8C5A]/30 to-transparent hidden lg:block"></div>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3655B]/5 border border-[#E3655B]/20 text-[#E3655B] text-xs font-semibold uppercase tracking-wider mb-8 shadow-[0_0_40px_-10px_rgba(227,101,91,0.3)] hover:bg-[#E3655B]/10 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E3655B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E3655B]"></span>
                </span>
                Enterprise Ready
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#52414C] dark:text-white mb-6 leading-[1.1]">
                Let's shape the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B8C5A] to-emerald-300 relative">
                  future of voice
                  <svg className="absolute w-full h-2 bottom-0 left-0 text-[#5B8C5A]/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2"></path>
                  </svg>
                </span>.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-light">
                Integrating advanced voice agents shouldn't be complicated. We help you build conversational interfaces that feel natural, responsive, and human.
              </p>
            </div>
            <div className="grid gap-4">
              <a className="group relative flex items-center p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/10 overflow-hidden transition-all duration-300 hover:translate-x-1" href="mailto:sales@vocotalk.com">
                <div className="absolute inset-0 bg-gradient-to-r from-[#5B8C5A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#596157]/10 text-[#5B8C5A] group-hover:scale-110 group-hover:bg-[#5B8C5A] group-hover:text-white transition-all duration-300 shadow-lg">
                  <span className="material-symbols-outlined">rocket_launch</span>
                </div>
                <div className="ml-5 relative z-10">
                  <h3 className="text-sm font-semibold text-[#52414C] dark:text-white group-hover:text-[#5B8C5A] transition-colors">Sales & Partnerships</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-slate-300 transition-colors">Deploy custom solutions</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-400 group-hover:text-[#5B8C5A] transition-colors relative z-10">arrow_forward</span>
              </a>
              <a className="group relative flex items-center p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-white/10 overflow-hidden transition-all duration-300 hover:translate-x-1" href="mailto:support@vocotalk.com">
                <div className="absolute inset-0 bg-gradient-to-r from-[#E3655B]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#596157]/10 text-[#E3655B] group-hover:scale-110 group-hover:bg-[#E3655B] group-hover:text-white transition-all duration-300 shadow-lg">
                  <span className="material-symbols-outlined">code</span>
                </div>
                <div className="ml-5 relative z-10">
                  <h3 className="text-sm font-semibold text-[#52414C] dark:text-white group-hover:text-[#E3655B] transition-colors">Developer Support</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-slate-300 transition-colors">API integration help</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-400 group-hover:text-[#E3655B] transition-colors relative z-10">arrow_forward</span>
              </a>
              <div className="mt-8 flex items-start gap-3 pl-2 opacity-80">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#5B8C5A]/40 blur-lg rounded-full animate-pulse"></div>
                  <span className="material-symbols-outlined text-[#5B8C5A] relative z-10">location_on</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                  Designed in San Francisco, CA<br/>
                  <span className="text-[#5B8C5A] font-medium">Available Globally</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 lg:pl-10">
            <div className="relative bg-[rgba(82,65,76,0.4)] backdrop-blur-[16px] border border-white/8 rounded-3xl p-1 shadow-[0_4px_30px_rgba(0,0,0,0.1)] animate-float">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-white/20 via-[#5B8C5A]/20 to-transparent rounded-3xl blur opacity-30"></div>
              <div className="bg-[#F7F7F8]/80 dark:bg-[#1f161c]/80 rounded-[22px] p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[length:60px_60px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] opacity-20 pointer-events-none"></div>
                <form className="flex flex-col gap-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group relative">
                      <input className="peer w-full bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-[4px] bg-transparent rounded-xl px-4 py-3 pt-6 text-[#52414C] dark:text-white outline-none transition-all placeholder-transparent focus-within:bg-[rgba(255,255,255,0.07)] focus-within:border-[#5B8C5A]/50 focus-within:shadow-[0_0_15px_rgba(91,140,90,0.15)]" id="name" placeholder="Name" required type="text"/>
                      <label className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#5B8C5A] cursor-text" htmlFor="name">Name</label>
                    </div>
                    <div className="group relative">
                      <input className="peer w-full bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-[4px] bg-transparent rounded-xl px-4 py-3 pt-6 text-[#52414C] dark:text-white outline-none transition-all placeholder-transparent focus-within:bg-[rgba(255,255,255,0.07)] focus-within:border-[#5B8C5A]/50 focus-within:shadow-[0_0_15px_rgba(91,140,90,0.15)]" id="email" placeholder="Work Email" required type="email"/>
                      <label className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#5B8C5A] cursor-text" htmlFor="email">Work Email</label>
                    </div>
                  </div>
                  <div className="group relative">
                    <select className="peer w-full bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-[4px] bg-transparent rounded-xl px-4 py-3 pt-6 text-[#52414C] dark:text-white outline-none transition-all appearance-none cursor-pointer focus-within:bg-[rgba(255,255,255,0.07)] focus-within:border-[#5B8C5A]/50" id="inquiry" required>
                      <option disabled selected value="">Select inquiry type</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                    <label className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 transition-all peer-valid:top-2 peer-valid:text-[10px] peer-valid:font-bold peer-valid:text-[#5B8C5A] pointer-events-none" htmlFor="inquiry">Inquiry Type</label>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                      <span className="material-symbols-outlined text-xl">expand_more</span>
                    </div>
                  </div>
                  <div className="group relative">
                    <textarea className="peer w-full bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-[4px] bg-transparent rounded-xl px-4 py-3 pt-6 text-[#52414C] dark:text-white outline-none transition-all placeholder-transparent min-h-[120px] resize-none focus-within:bg-[rgba(255,255,255,0.07)] focus-within:border-[#5B8C5A]/50" id="message" placeholder="Tell us about your project..." required></textarea>
                    <label className="absolute left-4 top-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#5B8C5A] cursor-text" htmlFor="message">Message</label>
                  </div>
                  <div className="flex items-start gap-3 mt-2">
                    <div className="flex h-5 items-center">
                      <input className="h-4 w-4 rounded border-slate-500/50 bg-transparent text-[#5B8C5A] focus:ring-[#5B8C5A] focus:ring-offset-0 transition-colors cursor-pointer" id="privacy" type="checkbox"/>
                    </div>
                    <div className="text-xs leading-5">
                      <label className="font-normal text-slate-500 dark:text-slate-400 cursor-pointer" htmlFor="privacy">
                        I consent to Vocco Talk processing my data in accordance with the <a className="text-[#52414C] dark:text-white hover:text-[#5B8C5A] underline decoration-slate-500/30 underline-offset-4 hover:decoration-[#5B8C5A] transition-all" href="#">Privacy Policy</a>.
                      </label>
                    </div>
                  </div>
                  <button className="mt-4 group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B8C5A] to-emerald-600 py-4 px-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(91,140,90,0.3)] hover:shadow-[0_0_40px_rgba(91,140,90,0.5)] transition-all active:scale-[0.99] overflow-hidden" type="button">
                    <span className="relative z-10 tracking-wide uppercase">Send Message</span>
                    <span className="material-symbols-outlined text-lg relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">send</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

