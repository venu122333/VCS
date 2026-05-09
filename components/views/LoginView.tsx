import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface LoginViewProps {
  onGoogleLogin: () => void;
  onGithubLogin: () => void;
  onMicrosoftLogin: () => void;
  onGuestLogin: () => void;
  onEmailLogin: (email: string, pass: string) => void;
  isLoggingIn: boolean;
  error?: string;
}

const LoginView: React.FC<LoginViewProps> = ({ 
  onGoogleLogin, 
  onGithubLogin, 
  onMicrosoftLogin, 
  onGuestLogin, 
  onEmailLogin, 
  isLoggingIn, 
  error 
}) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onEmailLogin(email, password);
    }
  };

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
              {showEmailForm 
                ? "Enter your details to build your itinerary." 
                : "Plan your next adventure with the power of Intelligence. Sign in to sync your travel vault across all devices."}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[11px] leading-relaxed font-bold animate-in fade-in slide-in-from-top-2">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 gap-3"
                >
                  <button
                    onClick={onGoogleLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-black py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] text-white transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    Continue with Google
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={onMicrosoftLogin}
                      disabled={isLoggingIn}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-400 py-4 px-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] text-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                      <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-4 h-4" />
                      Microsoft
                    </button>
                    <button
                      onClick={onGithubLogin}
                      disabled={isLoggingIn}
                      className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-950 py-4 px-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                      <img src="https://github.com/favicon.ico" alt="GitHub" className="w-4 h-4 invert" />
                      GitHub
                    </button>
                  </div>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] text-white transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    <Mail size={16} />
                    Continue with Email
                  </button>

                  <div className="flex items-center gap-4 py-1">
                    <div className="h-[1px] flex-1 bg-slate-100" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">OR</span>
                    <div className="h-[1px] flex-1 bg-slate-100" />
                  </div>

                  <button
                    onClick={onGuestLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-100 hover:border-slate-200 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] text-slate-500 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    Continue as Guest
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 py-4 px-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] text-white transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Verifying...' : 'Continue'}
                    {!isLoggingIn && <ArrowRight size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-slate-600 transition-colors pt-2"
                  >
                    <ArrowLeft size={14} />
                    Back to options
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <div className="flex justify-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-white border-2 border-blue-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
