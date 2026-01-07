/**
 * Fallback UI components for error states and loading states
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getUserAPIKey } from '../utils/userStorage';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={`${sizeClasses[size]} border-4 border-primary/20 border-t-primary rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-secondary-grey">{text}</p>}
    </div>
  );
}

export function EmptyState({ 
  icon = 'inbox', 
  title = 'No items found', 
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-surface-card rounded-full flex items-center justify-center mb-4 border border-white/5">
        <span className="material-symbols-outlined text-4xl text-secondary-grey">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-secondary-grey mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorMessage({ 
  title = 'An error occurred', 
  message, 
  onRetry,
  onDismiss 
}) {
  return (
    <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <span className="material-symbols-outlined text-accent text-2xl">error</span>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
          {message && <p className="text-sm text-secondary-grey mb-4">{message}</p>}
          <div className="flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-sm font-medium transition-all"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm font-medium transition-all"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-accent/90 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <span className="material-symbols-outlined">wifi_off</span>
      <span className="text-sm font-medium">You're offline. Some features may not work.</span>
    </div>
  );
}

export function ApiKeyWarning() {
  const user = getCurrentUser();
  const userApiKey = user && getUserAPIKey(user.id);
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Don't show warning if either user has API key OR environment variable is set
  const hasApiKey = userApiKey || envApiKey;

  if (hasApiKey) return null;

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">info</span>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">API Key Required</h4>
          <p className="text-xs text-secondary-grey mb-3">
            {user 
              ? 'Set your Google Gemini API key in Profile settings to use voice agents, or ensure VITE_GEMINI_API_KEY is set in .env.local'
              : 'Set VITE_GEMINI_API_KEY in .env.local file or sign in and add your API key in Profile settings to use voice agents.'}
          </p>
          {user ? (
            <Link
              to="/profile"
              className="text-xs text-primary hover:text-primary-glow font-medium transition-colors"
            >
              Set API Key →
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/profile"
                className="text-xs text-primary hover:text-primary-glow font-medium transition-colors"
              >
                Sign In →
              </Link>
              <span className="text-xs text-secondary-grey">or</span>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary-glow font-medium transition-colors"
              >
                Get API Key →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

