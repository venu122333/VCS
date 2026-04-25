import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Grid, List, TrendingUp, Filter } from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../../constants/destinations';

interface ExploreViewProps {
  onViewDetails: (destination: string) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onViewDetails }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Village' | 'Popular' | 'Metropolis'>('All');

  const filteredDestinations = useMemo(() => {
    const localMatches = POPULAR_DESTINATIONS.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    // If search is active and no local matches, or just to provide the searched term as an option
    if (searchQuery.trim().length > 2 && activeCategory === 'All') {
      const alreadyExists = localMatches.some(d => d.name.toLowerCase() === searchQuery.toLowerCase());
      if (!alreadyExists) {
        return [
          ...localMatches,
          {
            id: 'custom-search',
            name: searchQuery,
            country: 'Search Result',
            image: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80`, // Generic beautiful travel
            description: `We'll use our AI to architect the perfect trip for ${searchQuery}.`,
            famousFor: 'Your unique exploration',
            category: 'Popular' as any
          }
        ];
      }
    }

    return localMatches;
  }, [searchQuery, activeCategory]);

  return (
    <div className="pb-24 pt-6 px-4 max-w-7xl mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Explore the world</h1>
        
        <div className="flex gap-2 items-center overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          {['All', 'Village', 'Popular', 'Metropolis'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border-2 border-slate-50 text-slate-500 hover:border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search villages, cities or islands..."
          className="w-full bg-white border-2 border-slate-100 py-4 pl-12 pr-12 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-50 text-slate-400">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of results */}
      <AnimatePresence mode="popLayout">
        {filteredDestinations.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDestinations.map((dest) => (
              <motion.div
                key={dest.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewDetails(dest.name)}
                className="group cursor-pointer bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm hover:shadow-xl transition-all p-2"
              >
                <div className="relative aspect-video rounded-[24px] overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  {dest.category === 'Village' && (
                    <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full">
                      VILLAGE
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-3 h-3" />
                      {dest.country}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{dest.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="text-slate-200 w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">No destination found</h3>
              <p className="text-slate-500">Try searching for generic terms or specific villages.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreView;
