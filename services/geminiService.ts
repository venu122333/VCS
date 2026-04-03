
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TravelPlan, TravelMood, TravelerType } from "../types";

// Helper to get the best available API key
const getApiKey = () => {
  return localStorage.getItem('NOMAD_AI_KEY') || process.env.API_KEY || '';
};

// Function to get a fresh AI instance with the current key
const getAI = () => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

export const generateTravelPlan = async (
  destination: string,
  duration: number,
  mood: TravelMood,
  travelerType: TravelerType,
  travelerCount: number,
  additionalNotes: string,
  budget: number | undefined,
  currencyInfo: string
): Promise<TravelPlan> => {
  const ai = getAI();
  const budgetText = budget ? `The total budget for this trip is ${budget} ${currencyInfo}.` : `No specific budget provided, suggest a standard mid-range plan in ${currencyInfo}.`;
  const budgetLogic = budget ? `
  - Check if the provided budget of ${budget} ${currencyInfo} is realistic for a ${duration}-day trip to ${destination} for ${travelerCount} ${travelerType}(s).
  - Be EXTREMELY flexible and creative: if the budget is low, suggest ultra-budget options like hostels, street food, walking tours, and free public attractions.
  - ONLY set "isBudgetValid" to false if the amount is mathematically impossible (e.g., 10 or 20 ${currencyInfo} for multiple days) where it wouldn't even cover a single basic meal or local bus fare.
  - If "isBudgetValid" is false, provide the "minimumBudget" (the absolute lowest price) required for a survival-level trip (hostels, basic local food).
  - If "isBudgetValid" is false, still provide an "Ultra-Budget" itinerary as a suggestion, but clearly state in the summary that the budget is extremely tight/invalid and suggest the minimum amount.
  - If the budget is valid (even if very low), set "isBudgetValid" to true.
  - Ensure the estimated costs stay within or as close as possible to the ${budget} ${currencyInfo} limit.` : `
  - Since no budget was provided, set "isBudgetValid" to true.
  - Provide a realistic mid-range budget estimation for the trip.`;

  const prompt = `Create a detailed ${duration}-day travel plan for ${destination} with a ${mood} mood. 
  This trip is for ${travelerCount} ${travelerType}(s).
  ${budgetText}
  IMPORTANT BUDGET LOGIC: ${budgetLogic}
  User notes: ${additionalNotes}. 
  
  CRITICAL INSTRUCTIONS:
  - Tailor the activities and recommendations specifically for ${travelerCount} ${travelerType}(s).
  - If the budget is low, prioritize FREE ATTRACTIONS, public parks, walking tours, and street food markets.
  - Provide a list of the BEST 2-3 HOTELS that fit within the specified budget. For each hotel, provide:
    * NAME (e.g., "The Grand Plaza Hotel")
    * DESCRIPTION (Briefly why it's a good fit for the budget and traveler type)
    * PRICE PER NIGHT (in ${currencyInfo})
    * PHONE NUMBER (e.g., "+1-555-0123")
    * LOCATION (Specific address or area)
  - Provide information about the BEST TOUR NAVIGATOR (Tour Guide) for ${destination} that fits within the specified budget. 
    * If a professional tour navigator or local guide service exists, provide their NAME, PHONE NUMBER, and a brief DESCRIPTION explaining why they are the best choice for this budget and traveler type.
    * If no specific navigator information is available for this town/city, set the "tourNavigator" field to null.
  - For every activity, provide a "location" field which contains the specific name and city of the place (e.g., "Bilal Restaurant, ${destination}").
  - For HOTELS and RESTAURANTS, provide a "phoneNumber" field with a realistic phone number.
  - Do NOT use generic terms like "a local restaurant" or "a nearby hotel". Always give a real or highly realistic name.
  - BE CONCISE: For trips longer than 7 days, keep activity descriptions brief to ensure fast generation.
  
  Provide a professional and engaging summary, a day-by-day itinerary with specific activities, a packing list, local travel tips, and an estimated budget breakdown by category. 
  Return the response in JSON format with currencyCode (e.g., "USD").`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      responseMimeType: "application/json",
      maxOutputTokens: 4000,
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
                      phoneNumber: { type: Type.STRING, description: "The phone number of the hotel or restaurant (if applicable)" },
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
  });

  return JSON.parse(response.text || '{}');
};

export const createTravelChat = (systemInstruction: string) => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const generateDestinationImage = async (destination: string, mood: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A breathtaking, high-quality professional travel photography shot of ${destination} reflecting a ${mood} vibe, cinematic lighting, 8k resolution.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return `https://picsum.photos/seed/${destination}/1200/600`;
};

export const getTravelCost = async (location: string): Promise<{ type: 'flight' | 'car', cost: number, details: string }> => {
  const ai = getAI();
  const prompt = `Estimate the travel cost from ${location} to the nearest major international airport. 
  If ${location} has an airport, provide the average flight cost to a popular international destination. 
  If ${location} does not have an airport, provide the car/taxi cost to the nearest airport and then the flight cost.
  Return the response in JSON format with the following fields:
  - type: either "flight" or "car" (use "car" if a taxi to airport is needed first)
  - cost: a single numerical value representing the total estimated cost in USD
  - details: a brief explanation of the cost (e.g., "Taxi to X airport + flight to Y")`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["flight", "car"] },
          cost: { type: Type.NUMBER },
          details: { type: Type.STRING }
        },
        required: ["type", "cost", "details"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
