export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  famousFor: string;
  category: 'Popular' | 'Hidden Gem' | 'Village' | 'Metropolis';
}

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'The city of light, romance, and iconic landmarks.',
    famousFor: 'Eiffel Tower',
    category: 'Popular'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'A neon-lit metropolis blending ancient tradition with future tech.',
    famousFor: 'Shibuya Crossing',
    category: 'Popular'
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    description: 'Tropical paradise known for beaches, jungles, and spiritual energy.',
    famousFor: 'Tegalalang Rice Terrace',
    category: 'Popular'
  },
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80',
    description: 'Stunning white-washed villages overlooking the deep blue Aegean.',
    famousFor: 'Oia Blue Domes',
    category: 'Popular'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'The Eternal City, walking through layers of ancient history.',
    famousFor: 'Colosseum',
    category: 'Popular'
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    description: 'The cultural heart of Japan, home to thousands of temples.',
    famousFor: 'Fushimi Inari-taisha',
    category: 'Popular'
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    description: 'Global capital blending royalty, history, and modern life.',
    famousFor: 'Big Ben',
    category: 'Popular'
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    description: 'Dramatic cliffs and colorful towns along the Mediterranean.',
    famousFor: 'Positano',
    category: 'Popular'
  },
  {
    id: 'giethoorn',
    name: 'Giethoorn',
    country: 'Netherlands',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    description: 'A fairytale village with canals instead of roads.',
    famousFor: 'Canal Village',
    category: 'Village'
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
    description: 'A cosmopolitan city with stunning architecture and vibrant street life.',
    famousFor: 'Sagrada Família',
    category: 'Popular'
  }
];

export const shuffleDestinations = (count: number = 6) => {
  return [...POPULAR_DESTINATIONS].sort(() => Math.random() - 0.5).slice(0, count);
};
