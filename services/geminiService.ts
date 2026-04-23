
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TravelPlan, TravelMood, TravelerType } from "../types";

const getApiKey = () => {
  // First check if it's provided in the environment (AI Studio default)
  const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'undefined') return envKey;
  
  // Then check localStorage (for standalone hosting like EdgeOne)
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
  if (localKey) return localKey;
  
  return '';
};

let aiInstance: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

const getAI = () => {
  const key = getApiKey();
  if (!key) {
    throw new Error('Gemini API Key is missing. Please provide it in the Settings.');
  }
  
  if (!aiInstance || lastUsedKey !== key) {
    aiInstance = new GoogleGenAI({ apiKey: key });
    lastUsedKey = key;
  }
  return aiInstance;
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 500 || error.status === 503)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const generateTravelPlan = async (
  destination: string,
  duration: number,
  mood: TravelMood,
  travelerType: TravelerType,
  travelerCount: number,
  activitiesPerDay: number,
  additionalNotes: string,
  budget: number | undefined,
  currencyInfo: string
): Promise<TravelPlan> => {
  const budgetText = budget ? `The total budget for this trip is ${budget} ${currencyInfo}.` : `No specific budget provided, suggest a standard mid-range plan in ${currencyInfo}.`;
  const budgetLogic = budget ? `
  - Check if the provided budget of ${budget} ${currencyInfo} is realistic for a ${duration}-day trip to ${destination} for a total of ${travelerCount} travelers (category: ${travelerType}).
  - Be EXTREMELY flexible and creative: if the budget is low, suggest ultra-budget options like hostels, street food, walking tours, and free public attractions.
  - ONLY set "isBudgetValid" to false if the amount is mathematically impossible (e.g., 10 or 20 ${currencyInfo} for multiple days) where it wouldn't even cover a single basic meal or local bus fare.
  - If "isBudgetValid" is false, provide the "minimumBudget" (the absolute lowest price) required for a survival-level trip (hostels, basic local food).
  - If "isBudgetValid" is false, still provide an "Ultra-Budget" itinerary as a suggestion, but clearly state in the summary that the budget is extremely tight/invalid and suggest the minimum amount.
  - If the budget is valid (even if very low), set "isBudgetValid" to true.
  - Ensure the estimated costs stay within or as close as possible to the ${budget} ${currencyInfo} limit.` : `
  - Since no budget was provided, set "isBudgetValid" to true.
  - Provide a realistic mid-range budget estimation for the trip.`;

  const moodInstructions = mood === TravelMood.CULTURAL ? 
    "- CULTURAL MOOD FOCUS: The user wants a DIVINE and SPIRITUAL experience. Prioritize FAMOUS TEMPLES, sacred sites, religious landmarks, and places of worship (God/Divine focus)." : 
    "";

  const prompt = `Create a ${duration}-day travel plan for ${destination} (${mood} vibe). 
  Total Travelers (individual members): ${travelerCount} (Traveler category: ${travelerType}).
  Budget: ${budgetText}
  
  CRITICAL SPEED & QUALITY INSTRUCTIONS:
  ${moodInstructions}
  - LEAST BUDGET FOCUS: If a budget is provided, your MISSION is to find the absolute best value. Prioritize high-quality but low-cost experiences.
  - PRECISION ENGINEERING: Every minute counts. Organize the itinerary for maximum efficiency and minimum travel time between activities.
  - FOCUS ON SPEED: Keep ALL text extremely brief. Summary: max 2 sentences. Activity descriptions: max 1 sentence.
  - VILLAGES & RURAL AREAS: If ${destination} is a small village or rural town, prioritize local experiences, homestays, walking tours, and nature. Suggest nearby transport hubs if needed.
  - ULTRA-LOW BUDGET: If the budget is tight, focus exclusively on free sights, street food, and hostels.
  - SPECIFICITY: Use real place names. No generic "local cafe".
  - HOTELS: Provide exactly 2 hotels.
  - ACTIVITIES: Provide exactly ${activitiesPerDay} activities per day. Distribute them logically throughout the day (e.g., if ${activitiesPerDay} is 2, do Morning and Afternoon. If it is 5, spread them out).
  
  IMPORTANT BUDGET LOGIC: ${budgetLogic}
  User notes: ${additionalNotes}. 
  
  Return in JSON format with currencyCode (e.g., "USD"). Ensure concise responses for instant delivery.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destination: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          mood: { type: Type.STRING },
          travelerType: { type: Type.STRING },
          travelerCount: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          currencyCode: { type: Type.STRING },
          isBudgetValid: { type: Type.BOOLEAN },
          minimumBudget: { type: Type.NUMBER },
          recommendedHotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                pricePerNight: { type: Type.NUMBER },
                phoneNumber: { type: Type.STRING },
                location: { type: Type.STRING }
              },
              required: ["name", "description", "pricePerNight", "phoneNumber", "location"]
            }
          },
          tourNavigator: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              description: { type: Type.STRING }
              },
            required: ["name", "phoneNumber"]
          },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                theme: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      description: { type: Type.STRING },
                      location: { type: Type.STRING, description: "The specific name and address/area of the place (e.g. 'Bilal Restaurant, City Name')" },
                      phoneNumber: { type: Type.STRING, description: "The phone number of the hotel or restaurant (if applicable)" }
                    },
                    required: ["time", "activity", "description", "location"]
                  }
                }
              },
              required: ["day", "theme", "activities"]
            }
          },
          packingList: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          estimatedBudget: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER }
              },
              required: ["category", "amount"]
            }
          }
        },
        required: ["destination", "duration", "mood", "travelerType", "travelerCount", "summary", "currencyCode", "itinerary", "recommendedHotels", "packingList", "tips", "estimatedBudget"]
      }
    }
  }));

  const plan: TravelPlan = JSON.parse(result.text || '{}');
  return plan;
};

export const createTravelChat = (systemInstruction: string) => {
  return getAI().chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `${systemInstruction} CRITICAL: Answer in max 3 sentences. Speed is priority #1. Be ultra-concise but extremely friendly with emojis.`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
    },
  });
};

export const generateDestinationImage = async (destination: string, mood: string): Promise<string> => {
  // We use Unsplash for hero images to avoid heavy base64 strings that exceed Firestore's 1MB limit.
  // We construct a query-based URL that Unsplash can resolve to a beautiful travel image.
  const query = encodeURIComponent(`${destination} ${mood} landmark travel`);
  return `https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1600&q=80&sig=${query}`; 
  // Note: While this still uses a fallback ID, in a production app one would use the Unsplash Search API.
  // The key is avoiding the 2.5MB base64 data which was crashing the Firestore writes.
};
