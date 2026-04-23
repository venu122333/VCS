import React from 'react';
import HeroSlideshow from '../HeroSlideshow';
import ItineraryDisplay from '../ItineraryDisplay';
import { TravelMood, TravelerType, TravelPlan } from '../../types';
import { Wand2, MapPin, Users, Calendar, Wallet, Globe, Sparkles, CheckCircle2, Save, Compass } from 'lucide-react';

interface PlannerViewProps {
  destination: string;
  setDestination: (val: string) => void;
  duration: number | '';
  setDuration: (val: number | '') => void;
  budget: number | '';
  setBudget: (val: number | '') => void;
  currencyInfo: string;
  setCurrencyInfo: (val: string) => void;
  mood: TravelMood;
  setMood: (val: TravelMood) => void;
  travelerType: TravelerType;
  setTravelerType: (val: TravelerType) => void;
  travelerCount: number | '';
  setTravelerCount: (val: number | '') => void;
  activitiesPerDay: number | '';
  setActivitiesPerDay: (val: number | '') => void;
  notes: string;
  setNotes: (val: string) => void;
  isGenerating: boolean;
  onGenerate: (e: React.FormEvent) => void;
  onNewTrip: () => void;
  error: string;
  plan: TravelPlan | null;
  heroImage: string;
  onSavePlan: () => void;
  isViewingSavedPlan: boolean;
  saveCount: number;
}

const PlannerView: React.FC<PlannerViewProps> = ({
  destination, setDestination,
  duration, setDuration,
  budget, setBudget,
  currencyInfo, setCurrencyInfo,
  mood, setMood,
  travelerType, setTravelerType,
  travelerCount, setTravelerCount,
  activitiesPerDay, setActivitiesPerDay,
  notes, setNotes,
  isGenerating, onGenerate,
  onNewTrip,
  error,
  plan,
  heroImage,
  onSavePlan,
  isViewingSavedPlan,
  saveCount
}) => {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] md:h-[75vh] flex items-center overflow-hidden bg-slate-950 pt-20 md:pt-0">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full pb-32 md:pb-16">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div />
              <button 
                onClick={onNewTrip}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-2 rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                New Trip
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter shrink-0">
                <span className="text-blue-600">DESIGN YOUR</span> <br />
                <span className="italic">NEXT STORY</span>
              </h1>
              <div className="flex-1 flex flex-col gap-6">
                <p className="text-slate-300 text-lg md:text-sm font-medium max-w-sm leading-relaxed mb-1 pb-2 border-l-2 border-blue-500/30 pl-6 md:pl-8">
                  NomadAI transforms your mood into the perfect itinerary. Tell us where you want to go (or let us surprise you), and we'll craft the journey of a lifetime.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 w-64">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-widest">Tailored Experience</h4>
                      <p className="text-slate-400 text-[10px] font-medium mt-1">100% Personal to you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 w-64">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-widest">Sustainable Choices</h4>
                      <p className="text-slate-400 text-[10px] font-medium mt-1">Green routing options</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20 pb-12">
        <form onSubmit={onGenerate} className="bg-white rounded-[40px] p-6 md:p-10 shadow-2xl space-y-8 border border-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-600" /> Where to?
              </label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Japan or Amalfi Coast"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="w-3 h-3 text-blue-600" /> Type
                </label>
                <select 
                  value={travelerType}
                  onChange={(e) => {
                    const val = e.target.value as TravelerType;
                    setTravelerType(val);
                  }}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 appearance-none"
                >
                  {Object.values(TravelerType).map((t) => <option key={t as string} value={t as string}>{t as string}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Users className="w-3 h-3 text-blue-600" /> No. of Travellers
                </label>
                <input 
                  type="number" 
                  value={travelerCount}
                  onChange={(e) => setTravelerCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-blue-600" /> Duration (Days)
              </label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Compass className="w-3 h-3 text-blue-600" /> Trips Per Day
              </label>
              <input 
                type="number" 
                value={activitiesPerDay}
                onChange={(e) => setActivitiesPerDay(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g. 3"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Wallet className="w-3 h-3 text-blue-600" /> Budget
              </label>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Globe className="w-3 h-3 text-blue-600" /> Currency / Region
              </label>
              <input 
                type="text" 
                value={currencyInfo}
                onChange={(e) => setCurrencyInfo(e.target.value)}
                placeholder="e.g. USA, UK, India"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-blue-600" /> Trip Mood
              </label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value as TravelMood)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 appearance-none"
              >
                {Object.values(TravelMood).map((m) => <option key={m as string} value={m as string}>{m as string}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific interests, dietary requirements or hidden gems you wish to include?"
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-blue-600 transition-all font-medium h-32 resize-none"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl text-rose-600 text-sm font-bold animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none uppercase tracking-widest"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Design...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                Generate My Trip
              </>
            )}
          </button>
        </form>

        {/* Itinerary Result Section (Vertical Flow) */}
        {plan && (
          <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white px-8 py-6 rounded-[32px] shadow-xl border border-blue-50 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Itinerary Concept Finalized</h3>
                  <p className="text-slate-400 text-sm font-medium">Precision-Engineered for {plan.destination}</p>
                </div>
              </div>
              {!isViewingSavedPlan && saveCount < 2 && (
                <button 
                  onClick={onSavePlan}
                  className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save to Profile {saveCount > 0 ? `(${saveCount}/2)` : ''}
                </button>
              )}
            </div>
            <ItineraryDisplay plan={plan} heroImage={heroImage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerView;
