import { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateEmail } from '../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    try {
      // In a real app, this would send a password reset email
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBWMGg0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="size-12 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_15px_-5px_rgba(91,140,90,0.5)] group-hover:shadow-[0_0_20px_-5px_rgba(91,140,90,0.8)] transition-all">
              <span className="material-symbols-outlined" style={{fontSize: '28px'}}>graphic_eq</span>
            </div>
            <span className="font-bold tracking-tight text-white/90 group-hover:text-white transition-colors text-2xl">Vocco Talk</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-secondary-grey">Enter your email and we'll send you a reset link</p>
        </div>

        {/* Form */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-secondary-grey text-sm">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-secondary-grey text-sm mt-2">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
                >
                  Send Another Email
                </button>
                <Link
                  to="/login"
                  className="block w-full h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all flex items-center justify-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-accent flex-shrink-0">error</span>
                  <p className="text-sm text-accent font-medium flex-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-surface-dark border border-white/10 rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-secondary-grey hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-xs text-secondary-grey text-center">
            <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
            Demo mode: Email functionality is simulated
          </p>
        </div>
      </div>
    </div>
  );
}




