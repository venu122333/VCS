
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const images = [
  {
    url: 'https://picsum.photos/seed/nature-trip/1920/1080',
    alt: 'Nature Exploration'
  },
  {
    url: 'https://picsum.photos/seed/beach-vacation/1920/1080',
    alt: 'Beach Paradise'
  },
  {
    url: 'https://picsum.photos/seed/family-travel/1920/1080',
    alt: 'Family Adventures'
  },
  {
    url: 'https://picsum.photos/seed/mountain-hiking/1920/1080',
    alt: 'Mountain Hiking'
  },
  {
    url: 'https://picsum.photos/seed/city-tour/1920/1080',
    alt: 'Urban Discovery'
  }
];

const HeroSlideshow: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000); // 15 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-slate-900/40"></div>
    </div>
  );
};

export default HeroSlideshow;
