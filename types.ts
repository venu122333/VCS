
export enum TravelMood {
  RELAXED = 'Relaxed',
  ADVENTUROUS = 'Adventurous',
  CULTURAL = 'Cultural',
  FOODIE = 'Foodie',
  ROMANTIC = 'Romantic',
  BUDGET = 'Budget-Friendly',
  ENJOY = 'Enjoy'
}

export enum TravelerType {
  SINGLE = 'Single',
  COUPLE = 'Couple',
  FAMILY = 'Family',
  FRIENDS = 'Friends'
}

export interface DayActivity {
  time: string;
  activity: string;
  description: string;
  location?: string;
  phoneNumber?: string;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: DayActivity[];
}

export interface HotelRecommendation {
  name: string;
  description: string;
  pricePerNight: number;
  phoneNumber: string;
  location: string;
}

export interface TourNavigator {
  name: string;
  phoneNumber: string;
  description?: string;
}

export interface TravelPlan {
  id?: string;
  destination: string;
  duration: number;
  mood: TravelMood;
  travelerType: TravelerType;
  travelerCount: number;
  summary: string;
  currencyCode: string;
  itinerary: ItineraryDay[];
  recommendedHotels: HotelRecommendation[];
  tourNavigator?: TourNavigator;
  packingList: string[];
  tips: string[];
  estimatedBudget: {
    category: string;
    amount: number;
  }[];
  isBudgetValid: boolean;
  minimumBudget?: number;
  heroImage?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}
