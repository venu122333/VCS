import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowRight, Compass, Sparkles, Heart, Zap, Coffee } from 'lucide-react';
import { TravelMood } from '../../types';
import { shuffleDestinations } from '../../constants/destinations';

interface HomeViewProps {
  onViewDetails: (destination: string) => void;
  onSetMood: (mood: TravelMood) => void;
  onExplore: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onViewDetails, onSetMood, onExplore }) => {
  const shuffledDestinations = useMemo(() => shuffleDestinations(12), []);

  const moodCards = [
    { mood: TravelMood.ADVENTUROUS, label: 'Excited', sub: 'Adventure Awaits', icon: Zap, color: 'bg-blue-600', iconColor: 'text-blue-100', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&h=500&q=80' },
    { mood: TravelMood.CULTURAL, label: 'Divine', sub: 'Temples & Sacred Sites', icon: () => <span className="text-lg leading-none">🙏</span>, color: 'bg-rose-500', iconColor: 'text-rose-100', image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&h=500&q=80' },
    { mood: TravelMood.RELAXED, label: 'Relaxed', sub: 'Weekend Relaxation', icon: Coffee, color: 'bg-orange-500', iconColor: 'text-orange-100', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&h=500&q=80' },
    { mood: TravelMood.FOODIE, label: 'Hungry', sub: 'Local Gastronomy', icon: Coffee, color: 'bg-emerald-500', iconColor: 'text-emerald-100', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&h=500&q=80' },
    { mood: TravelMood.ROMANTIC, label: 'Loving', sub: 'Romantic Escape', icon: Heart, color: 'bg-pink-500', iconColor: 'text-pink-100', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&h=500&q=80' },
  ];

  return (
    <div className="pb-24 pt-6 px-4 max-w-7xl mx-auto space-y-10 overflow-x-hidden">
      {/* Mood Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Based on your mood</h2>
          <button 
            onClick={onExplore}
            className="text-sm font-bold text-blue-600 flex items-center gap-1 group"
          >
            See all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar scroll-smooth">
          {moodCards.map((card, i) => (
            <motion.div
              key={card.mood}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSetMood(card.mood)}
              className="relative flex-none w-[200px] aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer group shadow-lg shadow-slate-100"
            >
              <div 
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{ 
                  background: `url(${card.image}) center/cover`,
                }} 
              />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`} />
              
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/60 mb-1 block">
                  {card.label}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {card.sub}
                </h3>
              </div>
              
              <div className={`absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-xl scale-75 origin-top-left ${card.color}`}>
                <card.icon className={card.iconColor} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Popular Destinations</h2>
          <button onClick={onExplore} className="text-sm font-bold text-blue-600">See all</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {shuffledDestinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewDetails(dest.name)}
              className="group cursor-pointer space-y-3"
            >
              <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-md">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {dest.name}, {dest.country}
                </h4>
                <p className="text-xs text-slate-400 font-medium">Famous for {dest.famousFor}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Exploration Card */}
      <section 
        className="relative h-[200px] rounded-[32px] overflow-hidden border border-slate-100 shadow-xl cursor-not-allowed group"
      >
        <div className="absolute inset-0 bg-slate-900">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" 
            alt="Mountains" 
            className="w-full h-full object-cover opacity-60 brightness-75 transition-transform duration-[10s] ease-linear group-hover:scale-125"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-8 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Virtual Village Walk</h2>
          <p className="text-slate-200 text-sm max-w-xs font-medium">Explore hidden villages in 3D before you even step foot there.</p>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
