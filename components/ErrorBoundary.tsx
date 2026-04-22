
import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl mx-auto mb-6">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-8">
              We encountered an unexpected error. Don't worry, your travel plans are safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600">{error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
