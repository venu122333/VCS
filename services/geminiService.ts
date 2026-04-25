
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

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1500): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || error.error?.code || error.code;
    const isRetryable = retries > 0 && (status === 429 || status === 500 || status === 503 || status === 504);
    
    if (isRetryable) {
      // Use exponential backoff: 1.5s, 3s, 6s...
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
  - Your MISSION is to find the ABSOLUTE BEST VALUE for ${budget} ${currencyInfo}.
  - Prioritize high-quality but low-cost experiences (walking tours, local markets, public parks).
  - If the budget is low, suggest hostels with great reviews or budget guesthouses.
  - CRITICAL RULE: The sum of all 'amount' values in the 'estimatedBudget' array MUST be exactly equal to or less than ${budget}. NEVER exceed this amount.
  - Be EXTREMELY creative: if the budget is tight, focus on street food, free cultural sights, and public transit.` : `
  - Since no budget was provided, assume the user wants the "Best Value" (High-quality results for minimal spending).
  - Provide a realistic yet affordable estimation for the trip.`;

  const moodInstructions = mood === TravelMood.CULTURAL ? 
    "- DIVINE & SPIRITUAL FOCUS: Prioritize FAMOUS TEMPLES, sacred sites, and places of worship. Focus on peace and spiritual richness (God/Divine focus)." : 
    "- BEST VALUE FOCUS: Select activities that provide a superior local experience for the least amount of money.";

  const prompt = `Plan a ${duration}-day trip to ${destination} (${mood}). 
  Travelers: ${travelerCount} ${travelerType}.
  Budget: ${budgetText}
  
  MISSION: LEAST MONEY, BEST EXPERIENCE. Find budget hidden gems.
  
  BUDGET LOGIC:
  ${budgetLogic}
  
  SPEED RULES:
  ${moodInstructions}
  - 1-sentence descriptions ONLY.
  - EXACTLY ${activitiesPerDay} activities/day. Do not provide more or less than ${activitiesPerDay} activities per day.
  - JSON only. NO YAPPING.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      maxOutputTokens: 1536,
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
                      location: { type: Type.STRING },
                      phoneNumber: { type: Type.STRING }
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
    model: 'gemini-3.1-flash-lite-preview',
    config: {
      systemInstruction: `${systemInstruction} CRITICAL: Answer in max 3 sentences. Speed is priority #1. Be ultra-concise but extremely friendly with emojis.`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
    },
  });
};

export const generateDestinationImage = async (destination: string, mood: string): Promise<string> => {
  try {
    const response = await fetchWithRetry(() => getAI().models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Cinematic travel photo of a famous landmark in ${destination}, ${mood} atmosphere, 16:9, high resolution.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    }));

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/jpeg;base64,${base64EncodeString}`;
        }
      }
    }
    
    // Fallback if no image part found
    return `https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1600&q=80&sig=${encodeURIComponent(destination)}`;
  } catch (error: any) {
    // If it's a quota error, we silently fall back to keep the UI clean as requested
    const isQuota = error?.status === 429 || (error?.message && error.message.includes('quota'));
    if (!isQuota) {
      console.error("AI Image Generation failed:", error);
    }
    
    // Return a reliable fallback image
    return `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80&sig=${encodeURIComponent(destination)}`;
  }
};

export const generateDestinationDetails = async (destination: string): Promise<any> => {
  const prompt = `Provide detailed travel info for ${destination}. 
  Include: 
  - 1 paragraph overview.
  - 3 best value hotels (name, short desc, approx price).
  - 4 must-see things to do (name, short desc, rating).
  - 3 best local eateries (name, short desc, price level, rating).
  Respond in JSON only.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          hotels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.STRING },
                rating: { type: Type.STRING }
              },
              required: ["name", "description", "price", "rating"]
            }
          },
          thingsToDo: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                rating: { type: Type.STRING }
              },
              required: ["name", "description", "rating"]
            }
          },
          restaurants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.STRING },
                rating: { type: Type.STRING }
              },
              required: ["name", "description", "price", "rating"]
            }
          }
        },
        required: ["name", "description", "hotels", "thingsToDo", "restaurants"]
      }
    }
  }));

  const data = JSON.parse(result.text || '{}');
  return data;
};
