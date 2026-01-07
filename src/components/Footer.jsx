import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020304] py-12 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-surface-card border border-white/10 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
          </div>
          <span className="text-sm font-medium text-secondary-grey">© 2024 Vocco Talk Inc.</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-secondary-grey hover:text-white text-sm transition-colors">Twitter</a>
          <a href="#" className="text-secondary-grey hover:text-white text-sm transition-colors">GitHub</a>
          <a href="#" className="text-secondary-grey hover:text-white text-sm transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  )
}
