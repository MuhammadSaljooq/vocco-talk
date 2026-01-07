import { useState } from 'react';
import { authenticateUser, createUser, setCurrentUser } from '../utils/userStorage';

export default function Auth({ onAuthSuccess, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = authenticateUser(formData.email, formData.password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }

      const user = createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      
      setCurrentUser(user);
      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-card rounded-2xl border border-white/10 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-secondary-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-secondary-grey text-sm">
            {mode === 'login' 
              ? 'Sign in to manage your voice agents' 
              : 'Get started with Vocco Talk'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-accent">error</span>
            <p className="text-sm text-accent flex-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all"
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="mt-1 text-xs text-secondary-grey">
                Must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setFormData({ email: '', password: '', name: '' });
            }}
            className="text-sm text-secondary-grey hover:text-white transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <span className="text-primary font-medium">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </button>
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-xs text-secondary-grey text-center">
            <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
            Demo mode: Data is stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

