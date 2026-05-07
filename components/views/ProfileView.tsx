import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Settings, Bell, Shield, Wand2, Camera, Trash2, Globe, Search, X, Check } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { TravelPlan } from '../../types';
import ImageCropper from '../ImageCropper';
import { POPULAR_LANGUAGES } from '../../constants/languages';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfileViewProps {
  user: FirebaseUser | null;
  userProfile?: { photoURL?: string } | null;
  onLogout: () => void;
  savedPlans: TravelPlan[];
  onOpenSettings: () => void;
  onViewPlan: (plan: TravelPlan) => void;
  onDeletePlan: (id: string) => void;
  onUpdateAvatar: (url: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, userProfile, onLogout, savedPlans, onOpenSettings, onViewPlan, onDeletePlan, onUpdateAvatar }) => {
  const { language: selectedLang, setLanguage, t } = useLanguage();
  const isCustomAvatar = userProfile?.photoURL?.startsWith('data:');
  const avatarUrl = (isCustomAvatar ? userProfile?.photoURL : user?.photoURL) || userProfile?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const filteredLanguages = useMemo(() => {
    return POPULAR_LANGUAGES.filter(l => 
      l.name.toLowerCase().includes(langSearch.toLowerCase()) || 
      l.native.toLowerCase().includes(langSearch.toLowerCase())
    );
  }, [langSearch]);

  const currentLangName = POPULAR_LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';

  const handleSelectLang = (code: string) => {
    setLanguage(code);
    setShowLanguagePicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onUpdateAvatar(croppedImage);
    setSelectedImage(null);
  };

  const initials = user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="pb-24 pt-6 px-4 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <AnimatePresence>
        {selectedImage && (
          <ImageCropper
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6"
            >
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-rose-50 rounded-full text-rose-500">
                  <LogOut className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Are you sure you want to log out?</h3>
                  <p className="text-sm text-slate-500 mt-2">You will need to sign back in to access your saved trips.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-colors"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Picker Modal */}
      <AnimatePresence>
        {showLanguagePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic lg:text-2xl">{t.language}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">100+ Languages Available</p>
                </div>
                <button 
                  onClick={() => setShowLanguagePicker(false)}
                  className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search for a language..."
                    className="w-full bg-slate-50 border-none rounded-[20px] py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  {langSearch && (
                    <button 
                      onClick={() => setLangSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto px-6 pb-8 space-y-2 no-scrollbar">
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLang(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                      selectedLang === lang.code 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className={`font-bold transition-colors ${selectedLang === lang.code ? 'text-blue-700' : 'text-slate-900'}`}>
                        {lang.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{lang.native}</span>
                    </div>
                    {selectedLang === lang.code && (
                      <div className="bg-blue-600 text-white p-1 rounded-full">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
                {filteredLanguages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400 font-medium italic">No languages match your search.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <section className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-500">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-blue-600">{initials}</span>
              )}
            </div>
            <label 
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="flex-grow space-y-2">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{user?.displayName || 'Traveler'}</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{savedPlans.length} Trips Saved</span>
              <button 
                onClick={() => setShowLanguagePicker(true)}
                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <Globe className="w-3 h-3" /> {currentLangName}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onOpenSettings}
              className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:scale-110 transition-all"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-110 transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Menu Options */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Bell, title: 'Notifications', sub: 'Arrival alerts, flight updates', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Shield, title: 'Privacy & Safety', sub: 'Manage your data and security', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Globe, title: t.language, sub: currentLangName, color: 'text-rose-600', bg: 'bg-rose-50', action: () => setShowLanguagePicker(true) },
          { icon: Wand2, title: '24/7 Travel Coach', sub: 'AI assistance anytime', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4 group hover:shadow-lg hover:-translate-y-1 transition-all text-left"
          >
            <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">{item.title}</h3>
              <p className="text-sm text-slate-400 font-medium">{item.sub}</p>
            </div>
          </button>
        ))}
      </section>

      {/* Recent Trips */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{t.recentArchives}</h2>
          <div className="flex-grow h-px bg-slate-100" />
        </div>
        
        <div className="space-y-4">
          {savedPlans.length > 0 ? (
            savedPlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white p-4 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group"
              >
                <div onClick={() => onViewPlan(plan)} className="flex items-center gap-4 flex-grow">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm">
                    <img src={plan.heroImage || `https://picsum.photos/seed/${plan.destination}/200`} alt={plan.destination} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{plan.destination}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{plan.duration} Days • {plan.mood}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.id && confirm('Delete this trip?')) onDeletePlan(plan.id);
                  }}
                  className="p-4 text-slate-200 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-[40px] font-bold italic uppercase tracking-widest text-sm">
              Vault empty. Begin your voyage.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileView;

