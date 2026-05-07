
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UITranslations, translateUI } from '../services/translationService';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: UITranslations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('nomad_lang') || 'en');
  const [translations, setTranslations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('nomad_lang', lang);
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      const trans = await translateUI(language);
      setTranslations(trans);
      setIsLoading(false);
    };
    fetchTranslations();
  }, [language]);

  // Fallback to avoid crashes while loading first time
  const t = translations || {
    home: 'Home',
    explore: 'Explore',
    build: 'Build',
    profile: 'Profile',
    searchPlaceholder: 'Search destinations...',
    basedOnMood: 'Based on your mood, enjoy',
    mostPopular: 'Most Popular',
    recentArchives: 'Recent Archives',
    rateThisTrip: 'Rate this Architecture',
    planYourVoyage: 'Plan your voyage',
    travelerFeedback: 'Traveler Feedback',
    nomadScore: 'Nomad Score',
    settings: 'Settings',
    logout: 'Logout',
    saveTrip: 'Save Trip',
    generate: 'Generate',
    language: 'Language'
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
