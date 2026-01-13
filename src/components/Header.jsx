import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header({ user, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-background-dark/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => setMobileMenuOpen(false)}>
          <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_15px_-5px_rgba(91,140,90,0.5)] group-hover:shadow-[0_0_20px_-5px_rgba(91,140,90,0.8)] transition-all">
            <span className="material-symbols-outlined text-base sm:text-lg">graphic_eq</span>
          </div>
          <span className="font-bold tracking-tight text-white/90 group-hover:text-white transition-colors text-sm sm:text-base">Vocco Talk</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs sm:text-sm border border-primary/30">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs sm:text-sm font-medium text-white hidden lg:block">{user.name}</span>
              </Link>
              <Link to="/dashboard" className="hidden sm:block text-xs sm:text-sm font-medium text-secondary-grey hover:text-white transition-colors">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-xs sm:text-sm font-medium text-secondary-grey hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-primary hover:bg-primary-glow text-white text-xs sm:text-sm font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] flex items-center"
              >
                Sign up
              </Link>
            </>
          )}
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-white">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background-dark/95 backdrop-blur-md">
          <nav className="px-4 py-4 space-y-3">
            <a 
              href="/#features" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <Link 
              to="/product" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link 
              to="/create-agent" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Agent
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/pricing" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/blog" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="block text-sm font-medium text-secondary-grey hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {!user && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-primary hover:bg-primary-glow text-white text-sm font-bold transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
