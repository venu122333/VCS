
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Key, X, Check, Trash2, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      window.location.reload(); // Reload to apply the new key
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {t.settings}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            {/* API Key */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                <Key size={16} className="text-blue-600" />
                Gemini API Key
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                To use this app outside of AI Studio, you need your own key. 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 ml-1">
                  Get one at AI Studio <ExternalLink size={10} />
                </a>.
              </p>
              <div className="relative group">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-4 pr-4 font-mono text-sm focus:bg-white focus:border-blue-600 focus:ring-0 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg active:scale-[0.98] ${
                  isSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {isSaved ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={20} /> Saved & Reloading...
                  </span>
                ) : (
                  'Save Settings'
                )}
              </button>

              {localStorage.getItem('GEMINI_API_KEY') && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('GEMINI_API_KEY');
                    setApiKey('');
                    window.location.reload();
                  }}
                  className="w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all border-2 border-red-100"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Trash2 size={12} />
                    Clear API Key
                  </span>
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.2em]">
              Data security • Local storage only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
