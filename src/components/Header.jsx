import { Link, useNavigate } from 'react-router-dom'

export default function Header({ user, onLoginClick, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="size-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_15px_-5px_rgba(91,140,90,0.5)] group-hover:shadow-[0_0_20px_-5px_rgba(91,140,90,0.8)] transition-all">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>graphic_eq</span>
          </div>
          <span className="font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">Vocco Talk</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Features</a>
          <Link to="/product" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Product</Link>
          <Link to="/create-agent" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Create Agent</Link>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Dashboard</Link>
          )}
          <Link to="/pricing" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Pricing</Link>
          <Link to="/blog" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Blog</Link>
          <Link to="/contact" className="text-sm font-medium text-secondary-grey hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
                 {user ? (
                   <>
                     <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                       <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
                         {user.name?.[0]?.toUpperCase() || 'U'}
                       </div>
                       <span className="text-sm font-medium text-white">{user.name}</span>
                     </Link>
                     <Link to="/dashboard" className="hidden sm:block text-sm font-medium text-secondary-grey hover:text-white transition-colors">Dashboard</Link>
                     <button
                       onClick={handleLogout}
                       className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
                     >
                       Logout
                     </button>
                   </>
                 ) : (
                   <>
                     <Link
                       to="/login"
                       className="hidden sm:block text-sm font-medium text-secondary-grey hover:text-white transition-colors"
                     >
                       Log in
                     </Link>
                     <Link
                       to="/signup"
                       className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-glow text-white text-sm font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] flex items-center"
                     >
                       Sign up
                     </Link>
                   </>
                 )}
        </div>
      </div>
    </header>
  )
}
