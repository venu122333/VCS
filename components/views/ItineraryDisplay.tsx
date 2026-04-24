
import React from 'react';
import { TravelPlan } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface ItineraryDisplayProps {
  plan: TravelPlan;
  heroImage: string;
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ plan, heroImage }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Hero Section for Trip */}
      <div className="relative h-[450px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
        <AnimatePresence mode="wait">
          <motion.img 
            key={heroImage}
            src={heroImage || null} 
            alt={plan.destination} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-12">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">{plan.mood}</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/10">{plan.duration} Days</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/10">
              {plan.travelerCount} {plan.travelerType}{plan.travelerCount > 1 ? 's' : ''}
            </span>
          </div>
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 leading-tight drop-shadow-md">{plan.destination}</h1>
          <p className="text-white/90 max-w-2xl text-sm md:text-lg leading-relaxed line-clamp-6 md:line-clamp-none drop-shadow-sm">{plan.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Itinerary */}
        <div className="lg:col-span-2 space-y-12">
          <h2 className="text-4xl font-black flex items-center gap-4 text-slate-900 uppercase tracking-tighter">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <i className="fa-solid fa-calendar-day"></i>
            </div>
            Daily Adventure
          </h2>
          
          {plan.itinerary.map((day) => (
            <div key={day.day} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6 border-b-4 border-slate-100 pb-4">
                <span className="text-6xl font-black text-blue-100 italic select-none">0{day.day}</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Day {day.day}: <span className="text-blue-600">{day.theme}</span></h3>
              </div>
              
              <div className="space-y-10 pl-4 md:pl-8 border-l-4 border-slate-50 ml-4 md:ml-8">
                {day.activities.map((act, i) => (
                  <div key={i} className="relative group">
                    {/* Activity dot */}
                    <div className="absolute -left-[30px] md:-left-[46px] top-2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-lg group-hover:scale-125 transition-transform"></div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{act.time}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors tracking-tight">{act.activity}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed max-w-xl text-base">{act.description}</p>
                      
                      {act.location && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <i className="fa-solid fa-location-dot"></i> {act.location}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Budget Summary Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-wallet"></i>
              Total Est. Budget
            </h3>
            <div className="text-4xl font-bold mb-4">
              {plan.estimatedBudget.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              <span className="text-sm ml-2 opacity-70">{plan.currencyCode}</span>
            </div>
            <p className="text-white/70 text-sm">
              Estimated total for {plan.duration} days in {plan.destination} based on {plan.mood} style.
            </p>
          </div>

          {/* Budget Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-receipt text-green-500"></i>
              Cost Breakdown
            </h3>
            <div className="h-64 outline-none focus:outline-none">
              <ResponsiveContainer width="100%" height="100%" className="outline-none focus:outline-none">
                <BarChart 
                  data={plan.estimatedBudget} 
                  layout="vertical"
                  style={{ outline: 'none' }}
                  className="outline-none focus:outline-none"
                  accessibilityLayer={false}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="category" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={false} 
                    formatter={(value: number) => [`${value.toLocaleString()} ${plan.currencyCode}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[0, 4, 4, 0]}
                    activeBar={false}
                    stroke="none"
                  >
                    {plan.estimatedBudget.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke="none"
                        style={{ outline: 'none' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Hotels */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-hotel text-blue-600"></i>
              Best Hotels in Budget
            </h3>
            <div className="space-y-4">
              {plan.recommendedHotels.map((hotel, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{hotel.name}</h4>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {hotel.pricePerNight} {plan.currencyCode}/night
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{hotel.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline"
                    >
                      <i className="fa-solid fa-location-dot"></i> {hotel.location}
                    </a>
                    <a 
                      href={`tel:${hotel.phoneNumber}`}
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 hover:underline"
                    >
                      <i className="fa-solid fa-phone"></i> {hotel.phoneNumber}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packing List */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-suitcase-rolling text-blue-400"></i>
              Essentials
            </h3>
            <ul className="space-y-3">
              {plan.packingList.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <i className="fa-solid fa-check text-blue-400"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Travel Tips */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-yellow-500"></i>
              Expert Tips
            </h3>
            <div className="space-y-4">
              {plan.tips.map((tip, i) => (
                <div key={i} className="text-blue-800 text-sm leading-relaxed border-l-2 border-blue-200 pl-4">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tour Navigator Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8">
        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
          <i className="fa-solid fa-user-tie text-blue-600"></i>
          Meet Your Navigator
        </h3>
        {plan.tourNavigator ? (
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-4xl text-blue-600 shadow-inner border border-blue-100">
              <i className="fa-solid fa-id-card"></i>
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <h4 className="text-xl font-black text-slate-900">{plan.tourNavigator.name}</h4>
              <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">{plan.tourNavigator.description}</p>
              <div className="pt-2">
                <a 
                  href={`tel:${plan.tourNavigator.phoneNumber}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
                >
                  <i className="fa-solid fa-phone"></i>
                  Call Navigator: {plan.tourNavigator.phoneNumber}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
            <i className="fa-solid fa-circle-info text-slate-400 text-3xl mb-4"></i>
            <p className="text-slate-500 font-medium italic">There is no navigator available for this town.</p>
          </div>
        )}
      </div>

      {/* Beyond Simple Planning Section */}
      <div className="space-y-8 pt-6">
        <h3 className="text-2xl font-black text-center text-slate-900 uppercase tracking-[0.2em]">Beyond Simple Planning</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-brain text-blue-600 text-xl"></i>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Intelligence</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Analyzes your desired vibe to pick activities that match your emotional state, from deep relaxation to high-octane thrills.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-comment-dots text-emerald-600 text-xl"></i>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">24/7 Travel Coach</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Stuck at a station? Need a late-night dinner recommendation? Chat with our AI coach anytime, anywhere.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl hover:translate-y-[-4px] transition-all">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-coins text-violet-600 text-xl"></i>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">Smart Budgeting</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Real-time estimated costs help you manage your funds without the spreadsheets. Know what to expect before you arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
