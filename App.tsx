
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatCoach from './components/ChatCoach';
import ItineraryDisplay from './ItineraryDisplay';
import HeroSlideshow from './components/HeroSlideshow';
import { TravelPlan, TravelMood, TravelerType } from './types';
import { generateTravelPlan, generateDestinationImage } from './services/geminiService';

const App: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number | ''>(3);
  const [budget, setBudget] = useState<number | ''>('');
  const [currencyInfo, setCurrencyInfo] = useState('');
  const [mood, setMood] = useState<TravelMood>(TravelMood.ADVENTUROUS);
  const [travelerType, setTravelerType] = useState<TravelerType>(TravelerType.COUPLE);
  const [travelerCount, setTravelerCount] = useState<number | ''>(2);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [heroImage, setHeroImage] = useState('');
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Consulting local experts...');

  const loadingMessages = [
    'Consulting local experts...',
    'Finding the best hidden gems...',
    'Optimizing your travel route...',
    'Checking hotel availability...',
    'Calculating the best budget options...',
    'Curating your personalized itinerary...',
    'Almost there! Finalizing details...',
    'Packing your virtual bags...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for API key
    if (!process.env.API_KEY) {
      setError('Gemini API key is missing. If you are hosting this yourself, please set the GEMINI_API_KEY environment variable in your .env file or build settings.');
      return;
    }

    if (!destination) {
      setError('Please enter a destination');
      return;
    }
    if (duration === '') {
      setError('Please enter trip duration');
      return;
    }
    if (budget === '') {
      setError('Please enter your trip budget');
      return;
    }
    if (travelerCount === '') {
      setError('Please enter number of travelers');
      return;
    }
    if (!currencyInfo) {
      setError('Please enter your country or currency (e.g. USD, INR)');
      return;
    }

    setIsGenerating(true);
    setError('');
    // Set a placeholder image immediately so something is visible in 1-2 seconds
    setHeroImage(`https://picsum.photos/seed/${destination}-${mood}/1200/600`);
    
    try {
      // Start both generations in parallel to save time
      const planPromise = generateTravelPlan(destination, duration as number, mood, travelerType, travelerCount as number, notes, budget as number, currencyInfo);
      const imagePromise = generateDestinationImage(destination, mood);

      const newPlan = await planPromise;

      if (newPlan.isBudgetValid === false) {
        const minBudgetMsg = newPlan.minimumBudget 
          ? ` Even for a survival-level trip (hostels, street food), you'll need at least ${newPlan.minimumBudget} ${newPlan.currencyCode} for ${duration} days.`
          : '';
        setError(`The budget you entered is unfortunately not possible for this trip.${minBudgetMsg} Please enter a slightly higher amount to continue.`);
        setPlan(null);
        setIsGenerating(false);
        return;
      }

      setPlan(newPlan);
      
      // Scroll to result
      setTimeout(() => {
        document.getElementById('itinerary-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Handle the image result when it's ready (it started in parallel)
      imagePromise.then(imageUrl => {
        setHeroImage(imageUrl);
      }).catch(err => {
        console.error("Image generation failed:", err);
        setHeroImage(`https://picsum.photos/seed/${destination}/1200/600`);
      });

    } catch (err: any) {
      console.error(err);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Form Section */}
        <section id="planner" className="relative min-h-[85vh] flex items-center pt-20 pb-12 overflow-hidden bg-blue-950">
          <HeroSlideshow />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-5xl md:text-7xl text-white mb-6">
                Your next story <br />
                <span className="text-blue-500 italic">starts here.</span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
                NomadAI transforms your mood into the perfect itinerary. Tell us where you want to go (or let us surprise you), and we'll craft the journey of a lifetime.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 flex-1">
                  <div className="text-blue-400 text-3xl shrink-0">
                    <i className="fa-solid fa-shield-heart"></i>
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-sm md:text-base">Tailored Experience</p>
                    <p className="text-[10px] md:text-xs text-slate-400">100% Personal to you</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 flex-1">
                  <div className="text-green-400 text-3xl shrink-0">
                    <i className="fa-solid fa-earth-americas"></i>
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-sm md:text-base">Sustainable Choices</p>
                    <p className="text-[10px] md:text-xs text-slate-400">Green routing options</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl animate-in fade-in slide-in-from-right duration-700">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Where to?</label>
                  <div className="relative">
                    <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Kyoto, Japan or Amalfi Coast"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Who is going?</label>
                    <div className="relative">
                      <select 
                        value={travelerType}
                        onChange={(e) => {
                          const val = e.target.value as TravelerType;
                          setTravelerType(val);
                          if (val === TravelerType.SINGLE) setTravelerCount(1);
                          if (val === TravelerType.COUPLE) setTravelerCount(2);
                        }}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        {Object.values(TravelerType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">How many people?</label>
                    <div className="relative">
                      <i className="fa-solid fa-users absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={travelerCount}
                        onChange={(e) => setTravelerCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                        disabled={travelerType === TravelerType.SINGLE || travelerType === TravelerType.COUPLE}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">How Many Days?</label>
                    <div className="relative">
                      <i className="fa-solid fa-calendar-days absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        type="number" 
                        min="1" 
                        max="30"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Budget <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <i className="fa-solid fa-wallet absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        type="number" 
                        min="1"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value === '' ? '' : parseInt(e.target.value))}
                        placeholder="e.g. 1500"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Country for Currency <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <i className="fa-solid fa-earth-americas absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        type="text" 
                        value={currencyInfo}
                        onChange={(e) => setCurrencyInfo(e.target.value)}
                        placeholder="e.g. USA, India, UK"
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Trip Mood</label>
                  <div className="relative">
                    <select 
                      value={mood}
                      onChange={(e) => setMood(e.target.value as TravelMood)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(TravelMood).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Personal Touches (Optional)</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Traveling with kids, vegan food only, must see museums..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-500 transition-all h-24"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>
                      <p className="text-red-700 text-sm font-medium leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      Crafting Your Journey...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      Generate My Trip
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section id="itinerary-view" className="py-20 bg-slate-50 min-h-[600px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-plane-departure text-blue-600 text-4xl animate-bounce"></i>
                  </div>
                </div>
                <div className="text-center space-y-4 max-w-md">
                  <h3 className="text-3xl font-bold text-slate-900">Crafting Your Adventure</h3>
                  <p className="text-slate-500 text-lg font-medium h-8 flex items-center justify-center italic">
                    {loadingMessage}
                  </p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full animate-[loading_15s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Powered by Gemini 3 Flash</p>
                </div>
              </div>
            ) : plan ? (
              <ItineraryDisplay 
                plan={plan} 
                heroImage={heroImage} 
              />
            ) : (
              <div className="text-center py-20 animate-in fade-in duration-1000">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl text-blue-600 mx-auto mb-6">
                    <i className="fa-solid fa-map"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No Trip Generated Yet</h3>
                  <p className="text-slate-500">Fill in the form above and let NomadAI create a personalized, mood-based itinerary for your next dream destination.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features / Explorers */}
        <section id="explorer" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Beyond Simple Planning</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Discover how NomadAI leverages the power of Gemini to make every trip unique and stress-free.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'fa-brain',
                  title: 'Mood Intelligence',
                  desc: 'Our AI analyzes your desired "vibe" to pick activities that match your emotional state, from deep relaxation to high-octane thrills.'
                },
                {
                  icon: 'fa-comments',
                  title: '24/7 Travel Coach',
                  desc: 'Stuck at a station? Need a late-night dinner recommendation? Chat with our AI coach anytime, anywhere.'
                },
                {
                  icon: 'fa-coins',
                  title: 'Smart Budgeting',
                  desc: 'Real-time estimated costs help you manage your funds without the spreadsheets. Know what to expect before you arrive.'
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <i className={`fa-solid ${feature.icon}`}></i>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <ChatCoach destination={plan?.destination || destination} heroImage={heroImage} />
      
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">Nomad<span className="text-blue-500">AI</span> Trip Planner</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
            <p className="text-slate-500 text-xs font-medium tracking-wide flex items-center gap-2">
              Proudly made by an Indian.
              <span className="text-orange-500">●</span>
              <span className="text-white">●</span>
              <span className="text-green-500">●</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
