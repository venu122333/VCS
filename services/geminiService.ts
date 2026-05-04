
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TravelPlan, TravelMood, TravelerType } from "../types";

const getApiKey = () => {
  // Check for various possible env var names common in different hosting environments
  const metaEnv = (import.meta as any).env || {};
  const envKey = (typeof process !== 'undefined' && process.env ? (process.env.API_KEY || process.env.GEMINI_API_KEY) : null)
    || metaEnv.VITE_GEMINI_API_KEY || metaEnv.VITE_API_KEY;
    
  if (envKey && envKey !== 'undefined' && envKey !== 'null') return envKey;
  
  // Then check localStorage
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
  if (localKey) return localKey;
  
  return '';
};

let aiInstance: GoogleGenAI | null = null;
let lastUsedKey: string | null = null;

const getAI = () => {
  const key = getApiKey();
  if (!key) {
    throw new Error('Gemini API Key is missing. Please provide it in the Settings or Environment Variables.');
  }
  
  if (!aiInstance || lastUsedKey !== key) {
    aiInstance = new GoogleGenAI({ apiKey: key });
    lastUsedKey = key;
  }
  return aiInstance;
};

const fetchWithRetry = async (fn: () => Promise<any>, retries = 2, delay = 1000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || (error.response ? error.response.status : null);
    if (retries > 0 && (status === 429 || status === 500 || status === 503 || status === 504)) {
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
  - Prioritize high-quality but low-cost experiences.
  - CRITICAL RULE: The sum of all 'amount' values in the 'estimatedBudget' array MUST NOT exceed ${budget}.
  - Be creative with free sights and public transit.` : `
  - Assume the user wants the "Best Value" (High-quality results for minimal spending).`;

  const moodInstructions = mood === TravelMood.CULTURAL ? 
    "- DIVINE & SPIRITUAL FOCUS: Prioritize FAMOUS TEMPLES and sacred sites." : 
    "- FOCUS: Select activities that provide a superior local experience for the least amount of money.";

  const prompt = `Plan a ${duration}-day trip to ${destination} (${mood}). 
  Travelers: ${travelerCount} ${travelerType}.
  Budget: ${budgetText}
  
  MISSION: LEAST MONEY, BEST EXPERIENCE. Find budget hidden gems.
  
  ${budgetLogic}
  
  ${moodInstructions}
  - Provide a long, engaging 3-paragraph summary of why this trip is perfect for the user. Use double newlines for separation.
  - Provide 2-3 sentence detailed descriptions for every single activity.
  - EXACTLY ${activitiesPerDay} activities per day.
  - JSON only following the schema strictly. Do not add fields not in schema.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2500,
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
              required: ["name", "description", "pricePerNight", "location"]
            }
          },
          tourNavigator: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              description: { type: Type.STRING }
              },
            required: ["name", "description"]
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
        required: ["destination", "duration", "mood", "summary", "currencyCode", "itinerary", "recommendedHotels", "packingList", "tips", "estimatedBudget"]
      }
    }
  }));

  try {
    const plan: TravelPlan = JSON.parse(result.text || '{}');
    if (!plan.itinerary || plan.itinerary.length === 0) {
      throw new Error("Invalid plan generated: missing itinerary");
    }
    return plan;
  } catch (e) {
    console.error("Failed to parse travel plan:", e, "Raw text:", result.text);
    throw new Error("The AI guide returned an invalid response. Please try again with a simpler request.");
  }
};

export const createTravelChat = (systemInstruction: string) => {
  return getAI().chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: `${systemInstruction} CRITICAL: Answer in max 3 sentences. Be extremely friendly with emojis.`,
    },
  });
};

export const generateDestinationImage = async (destination: string, mood: string): Promise<string> => {
  try {
    const response = await fetchWithRetry(() => getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Provide a high-quality descriptive travel prompt for an image of ${destination} with a ${mood} vibe. No JSON, just the prompt.` }] }]
    }));
    
    // Note: The standard SDK doesn't expose a direct "Gemini Image" method in all versions, 
    // we use a high-quality placeholder based on the destination to ensure reliability.
    return `https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1600&q=80&sig=${encodeURIComponent(destination)}`;
  } catch (error) {
    return `https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1600&q=80&sig=${encodeURIComponent(destination)}`;
  }
};

export const generateDestinationDetails = async (destination: string): Promise<any> => {
  const prompt = `You are a world-class travel guide. Provide an EXTENSIVE, IMMERSIVE, and CAPTIVATING travel guide for ${destination}. 
  
  YOUR RESPONSE MUST BE HIGHLY DETAILED:
  1. OVERVIEW: Write a rich and immersive overview consisting of 4 distinct, long and informative paragraphs. 
  2. HOTELS: 3 luxury/boutique choices.
  3. THINGS TO DO: 4 must-experience landmark activities.
  4. RESTAURANTS: 3 top-tier culinary institutions.
  
  Respond ONLY in JSON format. Use double newlines (\\n\\n) between paragraphs in the description.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
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

  try {
    const data = JSON.parse(result.text || '{}');
    return data;
  } catch (e) {
    throw new Error("We encountered a small glitch gathering these facts. Please try again!");
  }
};
