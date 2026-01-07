import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // In production, you would log this to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page for a clean state
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
          <div className="max-w-2xl w-full bg-surface-card rounded-2xl p-8 border border-accent/30 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
                <span className="material-symbols-outlined text-accent text-4xl">error</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-secondary-grey">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-surface-dark rounded-xl border border-white/5">
                <details className="text-sm">
                  <summary className="text-accent font-medium cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs text-secondary-grey mb-1">Error Message:</div>
                      <div className="text-white font-mono text-xs bg-black/30 p-2 rounded">
                        {this.state.error.toString()}
                      </div>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <div className="text-xs text-secondary-grey mb-1">Component Stack:</div>
                        <div className="text-white font-mono text-xs bg-black/30 p-2 rounded max-h-40 overflow-y-auto">
                          <pre>{this.state.errorInfo.componentStack}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-medium transition-all"
              >
                Go Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-secondary-grey mb-2">
                If this problem persists, please contact support
              </p>
              <a
                href="/contact"
                className="text-xs text-primary hover:text-primary-glow transition-colors"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

