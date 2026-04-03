
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getTravelCost } from '../services/geminiService';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authStep, setAuthStep] = useState<'options' | 'email' | 'password'>('options');
  const [selectedProvider, setSelectedProvider] = useState<'email' | 'google' | 'microsoft' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Pin Code Search States
  const [showPinSearch, setShowPinSearch] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isSearchingCost, setIsSearchingCost] = useState(false);
  const [travelCostResult, setTravelCostResult] = useState<{ type: 'flight' | 'car', cost: number, details: string } | null>(null);
  const [searchError, setSearchError] = useState('');

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nomadai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSignIn = () => {
    if (!emailInput) return;
    
    // Simple mock password check
    if (passwordInput !== '123456') {
      setPasswordError('password is wrong');
      return;
    }

    const newUser: UserProfile = {
      email: emailInput,
      name: emailInput.split('@')[0],
    };
    setUser(newUser);
    localStorage.setItem('nomadai_user', JSON.stringify(newUser));
    setShowAuthModal(false);
    setAuthStep('options');
    setEmailInput('');
    setPasswordInput('');
    setPasswordError('');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('nomadai_user');
    setShowProfileMenu(false);
    setShowPinSearch(false);
    setTravelCostResult(null);
  };

  const handlePinSearch = async () => {
    if (!pinInput.trim()) return;
    setIsSearchingCost(true);
    setSearchError('');
    try {
      const result = await getTravelCost(pinInput);
      setTravelCostResult(result);
    } catch (error) {
      console.error('Error fetching travel cost:', error);
      setSearchError('Could not estimate cost. Please try again.');
    } finally {
      setIsSearchingCost(false);
    }
  };

  const getInitials = (email: string) => email.charAt(0).toUpperCase();

  const providerColors: Record<string, string> = {
    'google': 'bg-red-500',
    'microsoft': 'bg-blue-500',
    'email': 'bg-green-500'
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">Nomad<span className="text-blue-600">AI</span> Trip Planner</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white shadow-sm transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1 ml-12 group"
            >
              <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-pulse"></i> New Trip
            </button>
          </div>
          <nav className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
            <a href="#explorer" className="hover:text-blue-600 transition-colors">Explore</a>
            <a href="#planner" className="hover:text-blue-600 transition-colors">Trip Planner</a>
            <a href="#itinerary-view" className="hover:text-blue-600 transition-colors">My Trips</a>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform ${providerColors[selectedProvider || 'email'] || 'bg-purple-600'}`}
                >
                  {getInitials(user.email)}
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-1">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium rounded-xl transition-colors"
                      >
                        <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="bg-slate-900 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md"
              >
                Sign In
              </button>
            )}
          </nav>
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 text-2xl"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-4 font-medium text-slate-600">
            <a href="#explorer" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-blue-600">Explore</a>
            <a href="#planner" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-blue-600">Trip Planner</a>
            <a href="#itinerary-view" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-blue-600">My Trips</a>
            {user ? (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${providerColors[selectedProvider || 'email'] || 'bg-purple-600'}`}>
                    {getInitials(user.email)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="w-full text-left py-2 text-red-600 font-bold">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md mt-4"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pin Code Search Modal */}
      {showPinSearch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Travel Cost Estimator</h2>
                <button onClick={() => { setShowPinSearch(false); setTravelCostResult(null); setPinInput(''); }} className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Enter Village, City or Pin Code</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="e.g. New York, 10001, or Small Village"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-12 focus:ring-2 focus:ring-blue-500 transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handlePinSearch()}
                    />
                    <button 
                      onClick={handlePinSearch}
                      disabled={isSearchingCost || !pinInput.trim()}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-300"
                    >
                      {isSearchingCost ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                    </button>
                  </div>
                </div>

                {searchError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                    {searchError}
                  </div>
                )}

                {travelCostResult && (
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-200">
                        <i className={`fa-solid ${travelCostResult.type === 'flight' ? 'fa-plane' : 'fa-car'}`}></i>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Estimated Cost</p>
                        <p className="text-2xl font-black text-slate-900">{travelCostResult.cost} USD</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {travelCostResult.details}
                    </p>
                    <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                      <i className="fa-solid fa-circle-check"></i> FLIST COST Verified
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => { setShowAuthModal(false); setAuthStep('options'); setPasswordError(''); }}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
                <button onClick={() => { setShowAuthModal(false); setAuthStep('options'); setPasswordError(''); }} className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              {authStep === 'options' && (
                <div className="space-y-4">
                  <button 
                    onClick={() => { setSelectedProvider('email'); setAuthStep('email'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <span className="font-bold text-slate-700">Continue with Email</span>
                  </button>
                  
                  <button 
                    onClick={() => { setShowAuthModal(false); setAuthStep('options'); }}
                    className="w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {authStep === 'email' && (
                <div className="space-y-6">
                  <button onClick={() => setAuthStep('options')} className="text-sm text-blue-600 font-bold flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back to options
                  </button>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      {selectedProvider === 'email' ? 'Enter your email' : `Sign in with ${selectedProvider}`}
                    </label>
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setAuthStep('password')}
                    disabled={!emailInput}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:bg-slate-300"
                  >
                    Next
                  </button>
                </div>
              )}

              {authStep === 'password' && (
                <div className="space-y-6">
                  <button onClick={() => setAuthStep('email')} className="text-sm text-blue-600 font-bold flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back to email
                  </button>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${providerColors[selectedProvider || 'email']}`}>
                      {getInitials(emailInput)}
                    </div>
                    <span className="text-sm font-medium text-slate-600 truncate">{emailInput}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Enter Password</label>
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="•••••••• (try 123456)"
                      className={`w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 transition-all ${passwordError ? 'focus:ring-red-500 ring-2 ring-red-200' : 'focus:ring-blue-500'}`}
                    />
                    {passwordError && <p className="text-red-500 text-xs mt-2 font-bold italic">{passwordError}</p>}
                  </div>
                  <button 
                    onClick={handleSignIn}
                    disabled={!passwordInput}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:bg-slate-300"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
