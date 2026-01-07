import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUser } from '../utils/userStorage';
import { validateSignupForm, checkPasswordStrength } from '../utils/validation';
import { checkSignupRateLimit, recordSignupAttempt } from '../utils/authRateLimiter';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'weak', score: 0, feedback: [] });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check password strength on password change
  useEffect(() => {
    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ strength: 'weak', score: 0, feedback: [] });
    }
  }, [formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: null
      }));
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'very-strong':
        return 'bg-primary';
      case 'strong':
        return 'bg-primary/80';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-accent';
      default:
        return 'bg-white/10';
    }
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case 'very-strong':
        return 'Very Strong';
      case 'strong':
        return 'Strong';
      case 'medium':
        return 'Medium';
      case 'weak':
        return 'Weak';
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Check terms agreement
    if (!agreedToTerms) {
      setErrors({
        general: 'Please agree to the Terms of Service and Privacy Policy'
      });
      setLoading(false);
      return;
    }

    // Validate form
    const validation = validateSignupForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Check rate limit
    const rateLimit = checkSignupRateLimit();
    if (!rateLimit.allowed) {
      setErrors({
        general: rateLimit.message || 'Too many signup attempts. Please try again later.'
      });
      setLoading(false);
      return;
    }

    try {
      // Record signup attempt
      recordSignupAttempt();

      // Create user
      const user = createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      // Show success message and redirect
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please sign in.',
          email: formData.email
        }
      });
    } catch (err) {
      setErrors({
        general: err.message || 'Signup failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-dark/20 blur-[100px] mix-blend-screen"></div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-secondary-grey">Get started with Vocco Talk</p>
        </div>

        {/* Signup Form */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-accent flex-shrink-0">error</span>
              <p className="text-sm text-accent font-medium flex-1">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-accent focus:ring-accent/50'
                    : 'border-white/10 focus:border-primary focus:ring-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                required
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-accent">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-accent focus:ring-accent/50'
                    : 'border-white/10 focus:border-primary focus:ring-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-accent">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all pr-12 ${
                    errors.password
                      ? 'border-accent focus:ring-accent/50'
                      : 'border-white/10 focus:border-primary focus:ring-primary/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-grey hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-secondary-grey">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'very-strong' || passwordStrength.strength === 'strong'
                        ? 'text-primary'
                        : passwordStrength.strength === 'medium'
                        ? 'text-yellow-500'
                        : 'text-accent'
                    }`}>
                      {getStrengthLabel(passwordStrength.strength)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-secondary-grey space-y-1 mt-2">
                      {passwordStrength.feedback.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-xs">close</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-xs text-accent">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`w-full px-4 py-3 bg-surface-dark border rounded-xl text-white placeholder-secondary-grey focus:outline-none focus:ring-2 transition-all pr-12 ${
                    errors.confirmPassword
                      ? 'border-accent focus:ring-accent/50'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-primary/50 focus:ring-primary/50'
                      : 'border-white/10 focus:border-primary focus:ring-primary/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-grey hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="mt-1 text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-accent">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 mt-0.5 rounded border-white/20 bg-surface-dark text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  required
                />
                <span className="text-sm text-secondary-grey group-hover:text-white transition-colors">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary-glow transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary-glow transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary-glow text-white font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-secondary-grey">OR</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social Signup (Placeholder) */}
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
            <button
              type="button"
              disabled
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign up with GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-grey">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-glow font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-xs text-secondary-grey text-center">
            <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
            Demo mode: Data is stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}



