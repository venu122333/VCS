
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
  
  CONTENT RULES:
  ${moodInstructions}
  - Provide a long, engaging 3-paragraph summary of why this trip is perfect for the user.
  - Provide 3-sentence detailed descriptions for every single activity.
  - EXACTLY ${activitiesPerDay} activities/day. Do not provide more or less than ${activitiesPerDay} activities per day.
  - Be specific about locations and names of places.
  - JSON only. NO YAPPING.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
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

  try {
    const plan: TravelPlan = JSON.parse(result.text || '{}');
    if (!plan.itinerary || plan.itinerary.length === 0) {
      throw new Error("Invalid plan generated: missing itinerary");
    }
    return plan;
  } catch (e) {
    console.error("Failed to parse travel plan:", e, "Raw text:", result.text);
    throw new Error("I had some trouble architecting your perfect plan. Please try again in a moment!");
  }
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
  } catch (error) {
    console.error("AI Image Generation failed:", error);
    return `https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=1600&q=80&sig=${encodeURIComponent(destination)}`;
  }
};

export const generateDestinationDetails = async (destination: string): Promise<any> => {
  const prompt = `You are a world-class travel guide. Provide an EXTENSIVE, IMMERSIVE, and CAPTIVATING travel guide for ${destination}. 
  
  YOUR RESPONSE MUST BE HIGHLY DETAILED:
  1. OVERVIEW: Write a rich and immersive overview consisting of 4 distinct, long and informative paragraphs. 
     - Paragraph 1: Ancient origins, etymology, and historical evolution.
     - Paragraph 2: Architectural marvels and the soul of the people.
     - Paragraph 3: Deep cultural immersion - traditions, festivals, and local philosophy.
     - Paragraph 4: Culinary heritage and why it is a global bucket-list destination today.
  2. HOTELS: 3 luxury/boutique choices with 4-sentence evocative descriptions for each.
  3. THINGS TO DO: 4 must-experience landmark activities with 4-sentence legendary stories/background for each.
  4. RESTAURANTS: 3 top-tier culinary institutions with 4-sentence descriptions of their heritage and signature dishes.
  
  Respond ONLY in JSON format. Use double newlines (\\n\\n) between paragraphs in the description. Be poetic and thorough.`;

  const result = await fetchWithRetry(() => getAI().models.generateContent({
    model: "gemini-1.5-flash",
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
    if (!data.name || !data.hotels) {
      throw new Error("Incomplete destination facts returned");
    }
    return data;
  } catch (e) {
    console.error("Failed to parse destination details:", e, "Raw text:", result.text);
    throw new Error("We encountered a small glitch gathering these facts. Please try again!");
  }
};
