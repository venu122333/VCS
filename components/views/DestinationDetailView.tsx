import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Hotel, Compass, Utensils, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { DestinationDetails } from '../../types';
import { generateDestinationDetails, generateDestinationImage } from '../../services/geminiService';

interface DestinationDetailViewProps {
  destinationName: string;
  initialDescription?: string;
  initialImage?: string;
  onBack: () => void;
  onPlanTrip: () => void;
}

const DestinationDetailView: React.FC<DestinationDetailViewProps> = ({ 
  destinationName, 
  initialDescription, 
  initialImage,
  onBack, 
  onPlanTrip 
}) => {
  const [details, setDetails] = useState<DestinationDetails | null>(null);
  const [image, setImage] = useState(initialImage || `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80`);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'things' | 'restaurants'>('overview');

  useEffect(() => {
    let active = true;
    const fetchDetails = async () => {
      setIsLoading(true);
      
      try {
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        
        const data = await Promise.race([
          generateDestinationDetails(destinationName),
          timeoutPromise
        ]);
        
        if (active) {
          setDetails(data);
          setIsLoading(false);
        }
        
        // Fetch AI image asynchronously in background
        const img = await generateDestinationImage(destinationName, 'beautiful travel');
        if (active && img) {
          setImage(img);
        }
      } catch (error) {
        console.error("Error fetching destination details:", error);
        if (active) {
          // Provide basic fallback details upon error so the user isn't stuck
          setDetails({
            name: destinationName,
            description: initialDescription || `${destinationName} is a remarkable destination known for its unique culture, scenic beauty, and vibrant local atmosphere. It offers a blend of historical significance and modern charm that attracts travelers from across the globe.`,
            image: initialImage || `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80`,
            hotels: [{ name: "Recommended Stay", description: "A top-rated choice for convenience and comfort in the heart of the city.", price: "$120/night", rating: "4.8" }],
            thingsToDo: [{ name: "Local Exploration", description: "Discover hidden gems and famous landmarks that define this city's character.", rating: "4.5" }],
            restaurants: [{ name: "Authentic Eatery", description: "A must-visit spot to experience the true flavor of local cuisine.", price: "$$", rating: "4.7" }]
          });
          setIsLoading(false);
        }
      }
    };
    fetchDetails();
    return () => { active = false; };
  }, [destinationName, initialDescription, initialImage]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-500 italic">Exploring {destinationName}...</p>
      </div>
    );
  }

  if (!details) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'things', label: 'Things to do', icon: MapPin },
    { id: 'restaurants', label: 'Restaurants', icon: Utensils },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <img 
          src={image} 
          alt={destinationName} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-black tracking-widest text-[10px] uppercase">
                <Sparkles className="w-3 h-3" /> Nomadic Highlight
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">{destinationName}</h1>
            </div>
            <button 
              onClick={onPlanTrip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
            >
              Plan a Trip to {destinationName}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-2 flex overflow-x-auto flex-nowrap no-scrollbar gap-1 border border-slate-100 touch-pan-x">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-50 space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">About {destinationName}</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">{details.description}</p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="bg-blue-50 px-6 py-4 rounded-3xl border border-blue-100">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Atmosphere</span>
                     <span className="text-blue-900 font-bold">Vibrant & Authentic</span>
                  </div>
                  <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100">
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Price Level</span>
                     <span className="text-emerald-900 font-bold">Mid-Range to Budget</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {details.hotels.map((hotel, idx) => (
                <div key={idx} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 hover:shadow-xl transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                       <Hotel className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                       <span className="text-xs font-black text-amber-700">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{hotel.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{hotel.description}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm font-black text-emerald-600">{hotel.price}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'things' && (
            <motion.div
              key="things"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {details.thingsToDo.map((thing, idx) => (
                <div key={idx} className="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 hover:shadow-xl transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                       <MapPin className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                       <span className="text-xs font-black text-amber-700">{thing.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight line-clamp-1">{thing.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{thing.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'restaurants' && (
            <motion.div
              key="restaurants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {details.restaurants.map((rest, idx) => (
                <div key={idx} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 hover:shadow-xl transition-all space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                       <Utensils className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                       <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                       <span className="text-xs font-black text-amber-700">{rest.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{rest.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{rest.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rest.price}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DestinationDetailView;
