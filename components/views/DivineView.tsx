
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';

const divineImages = [
  'https://images.unsplash.com/photo-1635843104332-901768222384?auto=format&fit=crop&w=1200&q=80', // Lord Shiva Statue/Vibe
  'https://images.unsplash.com/photo-1590013330452-944a631f476a?auto=format&fit=crop&w=1200&q=80', // Allah Calligraphy
  'https://images.unsplash.com/photo-1445262102387-5febb177467f?auto=format&fit=crop&w=1200&q=80'  // Spiritual Light/Icon
];

interface DivineViewProps {
  onStartJourney: () => void;
}

const DivineView: React.FC<DivineViewProps> = ({ onStartJourney }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % divineImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={index}
            src={divineImages[index]}
            alt="Divine Background"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span className="text-xs font-black uppercase tracking-widest">Spiritual & Divine Journey</span>
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]"
          >
            DISCOVER THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 italic">SACRED WITHIN</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed"
          >
            Embark on a soul-stirring voyage to the world's most revered temples, shrines, and places of worship.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <button
            onClick={onStartJourney}
            className="group relative inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-rose-500/20"
          >
            <Wand2 className="w-5 h-5 text-rose-500" />
            Start Divine Planning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Visual Cues */}
        <div className="pt-12 grid grid-cols-3 gap-8">
          {[
            { label: 'Temples', count: '100+' },
            { label: 'Sacred Sites', count: '50+' },
            { label: 'Peace Level', count: 'Infinite' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-white font-black text-2xl tracking-tighter">{stat.count}</div>
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DivineView;
