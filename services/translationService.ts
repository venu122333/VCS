
import { POPULAR_LANGUAGES } from '../constants/languages';
import { getAI } from './geminiService';

export interface UITranslations {
  home: string;
  explore: string;
  build: string;
  profile: string;
  searchPlaceholder: string;
  basedOnMood: string;
  mostPopular: string;
  recentArchives: string;
  rateThisTrip: string;
  planYourVoyage: string;
  travelerFeedback: string;
  nomadScore: string;
  settings: string;
  logout: string;
  saveTrip: string;
  generate: string;
  language: string;
  coach: string;
}

const DEFAULT_TRANSLATIONS: UITranslations = {
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
  language: 'Language',
  coach: 'Coach'
};

export const getLanguageName = (code: string) => {
  return POPULAR_LANGUAGES.find(l => l.code === code)?.name || 'English';
};

export const translateUI = async (targetLangCode: string): Promise<UITranslations> => {
  if (targetLangCode === 'en') return DEFAULT_TRANSLATIONS;

  const targetLangName = getLanguageName(targetLangCode);
  const cacheKey = `ui_trans_${targetLangCode}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Cache corrupted", e);
    }
  }

  const prompt = `Translate the following UI labels into ${targetLangName}. 
  Return ONLY a valid JSON object matching this structure:
  ${JSON.stringify(DEFAULT_TRANSLATIONS)}
  
  Keep the translations cool, modern, and punchy.`;

  try {
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const translated = JSON.parse(result.text || '{}');
    
    // Merge with defaults to ensure no missing keys
    const finalTrans = { ...DEFAULT_TRANSLATIONS, ...translated };
    localStorage.setItem(cacheKey, JSON.stringify(finalTrans));
    return finalTrans;
  } catch (error) {
    console.error("Translation failed", error);
    return DEFAULT_TRANSLATIONS;
  }
};
