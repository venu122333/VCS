import React from 'react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onGoogleLogin: () => void;
  isLoggingIn: boolean;
  error?: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onGoogleLogin, isLoggingIn, error }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100"
      >
        <div className="p-8 md:p-12">
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">NOMAD<span className="text-blue-600 italic">AI</span></h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Travel Architect</p>
          </div>

          <div className="space-y-6">
            <p className="text-slate-600 text-sm font-medium text-center px-4 leading-relaxed">
              Plan your next adventure with the power of Intelligence. Sign in to sync your travel vault across all devices.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[11px] leading-relaxed font-bold animate-in fade-in slide-in-from-top-2">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <button
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black py-5 px-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] text-white transition-all shadow-xl shadow-slate-200 disabled:opacity-50 group hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-white rounded-full animate-spin" />
              ) : (
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              )}
              {isLoggingIn ? 'Signing in...' : 'Sign In with Google'}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <div className="flex justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div className="w-2 h-2 rounded-full bg-white border-2 border-blue-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
