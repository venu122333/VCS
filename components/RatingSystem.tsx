
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitRating, getRatingsForTarget, deleteRating, Rating } from '../services/ratingService';
import { auth } from '../firebase';

interface StarRatingDisplayProps {
  rating: number;
  max?: number;
  size?: number;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, max = 5, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          className={`${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`} 
        />
      ))}
    </div>
  );
};

// Helper to generate a consistent "Architect Score" above 4.0 for any given name
const getInitialRating = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Map hash to 4.2 - 4.9 range for a "premium" feel
  const base = 4.2;
  const variance = Math.abs(hash % 8) / 10;
  return base + variance;
};

export const useAverageRating = (targetId: string) => {
  const initialScore = getInitialRating(targetId);
  const [average, setAverage] = useState(initialScore);
  const [count, setCount] = useState(0);
  const [isUserDriven, setIsUserDriven] = useState(false);

  useEffect(() => {
    const unsubscribe = getRatingsForTarget(targetId, (ratings) => {
      setCount(ratings.length);
      
      // LOGIC: Show initial score until 5 users have rated
      if (ratings.length >= 5) {
        const userAvg = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
        setAverage(userAvg);
        setIsUserDriven(true);
      } else {
        setAverage(initialScore);
        setIsUserDriven(false);
      }
    });
    return () => unsubscribe();
  }, [targetId, initialScore]);

  return { average, count, isUserDriven };
};

export const RatingBadge: React.FC<{ targetId: string }> = ({ targetId }) => {
  const { average, count, isUserDriven } = useAverageRating(targetId);
  return (
    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100 flex-none group relative">
      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
      <span className="text-[10px] font-black text-amber-700">{average.toFixed(1)}</span>
      
      {/* Tooltip explanation */}
      {!isUserDriven && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          NOMAD SCORE ( {count}/5 REVIEWS )
        </div>
      )}
    </div>
  );
};

interface RatingSystemProps {
  targetId: string;
  targetName: string;
}

export const RatingSystem: React.FC<RatingSystemProps> = ({ targetId, targetName }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = getRatingsForTarget(targetId, setRatings);
    return () => unsubscribe();
  }, [targetId]);

  const initialScore = getInitialRating(targetId);
  const isUserDriven = ratings.length >= 5;
  const averageRating = isUserDriven 
    ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length 
    : initialScore;

  const handleSubmit = async () => {
    if (userRating === 0) return;
    setIsSubmitting(true);
    try {
      await submitRating(targetId, targetName, userRating, comment);
      setUserRating(0);
      setComment('');
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userHasRated = ratings.some(r => r.userId === auth.currentUser?.uid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-bold text-slate-900">{averageRating.toFixed(1)}</h4>
            <StarRatingDisplay rating={averageRating} size={20} />
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isUserDriven ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
              {isUserDriven ? 'Traveler Avg' : 'Nomad Score'}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {isUserDriven 
              ? `Based on ${ratings.length} traveler reviews` 
              : `${5 - ratings.length} more user ratings needed for true average`}
          </p>
        </div>

        {!userHasRated && auth.currentUser && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            {showForm ? 'Close' : 'Rate this trip'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white border-2 border-blue-50 rounded-[32px] space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Your Score</span>
                    <span className="text-2xl font-black text-blue-600 font-mono">{userRating.toFixed(1)}</span>
                  </div>
                  
                  <div className="relative h-12 flex items-center group">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={userRating}
                      onChange={(e) => setUserRating(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="flex justify-between px-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div key={val} className="flex flex-col items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${userRating >= val ? 'bg-blue-600' : 'bg-slate-200'}`} />
                        <span className="text-[10px] font-black text-slate-400 font-mono">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-1 py-2">
                    <StarRatingDisplay rating={userRating} size={24} />
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  disabled={userRating === 0 || isSubmitting}
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-bold disabled:bg-slate-300 disabled:shadow-none shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <motion.div 
            key={rating.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{rating.userDisplayName}</h5>
                  <StarRatingDisplay rating={rating.rating} size={12} />
                </div>
              </div>
              
              {auth.currentUser?.uid === rating.userId && (
                <button 
                  onClick={() => deleteRating(rating.id!)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            {rating.comment && (
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                "{rating.comment}"
              </p>
            )}
            
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {rating.createdAt?.toDate ? rating.createdAt.toDate().toLocaleDateString() : 'Just now'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
