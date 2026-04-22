
import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">App Settings</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Gemini API Key</label>
              <p className="text-xs text-slate-500 mb-4">
                To use this app outside of AI Studio, you need to provide your own Gemini API key. 
                Get one for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AI Studio</a>.
              </p>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${isSaved ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
              >
                {isSaved ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-check"></i> Saved & Reloading...
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
                  className="w-full py-3 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-all border border-red-100"
                >
                  <i className="fa-solid fa-trash-can mr-2"></i>
                  Clear API Key
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
              Your key is stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
