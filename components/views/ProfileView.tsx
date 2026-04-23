import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Settings, Bell, Shield, CreditCard, ChevronRight, Camera, Trash2, Wand2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { TravelPlan } from '../../types';

interface ProfileViewProps {
  user: FirebaseUser | null;
  onLogout: () => void;
  savedPlans: TravelPlan[];
  onOpenSettings: () => void;
  onViewPlan: (plan: TravelPlan) => void;
  onDeletePlan: (id: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, savedPlans, onOpenSettings, onViewPlan, onDeletePlan }) => {
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="pb-24 pt-6 px-4 max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-blue-600">{initials}</span>
              )}
            </div>
            <label 
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="flex-grow space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{user?.displayName || 'Traveler'}</h1>
            <p className="text-slate-500 font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{savedPlans.length} Trips Saved</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onOpenSettings}
              className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={onLogout}
              className="p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Menu Options */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Bell, title: 'Notifications', sub: 'Arrival alerts, flight updates', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: Shield, title: 'Privacy & Safety', sub: 'Manage your data and security', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: User, title: 'Travel Partners', sub: 'Shared plans and contacts', color: 'text-rose-600', bg: 'bg-rose-50' },
          { icon: Wand2, title: '24/7 Travel Coach', sub: 'AI assistance anytime', color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((item, i) => (
          <button 
            key={i} 
            className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all"
          >
            <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-grow text-left">
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-widest">{item.title}</h3>
              <p className="text-sm text-slate-400 font-medium">{item.sub}</p>
            </div>
          </button>
        ))}
      </section>

      {/* Recent Trips */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 px-2 tracking-tight">Recent Itineraries</h2>
        <div className="space-y-4">
          {savedPlans.length > 0 ? (
            savedPlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white p-4 rounded-[28px] border border-slate-50 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
              >
                <div onClick={() => onViewPlan(plan)} className="flex items-center gap-4 flex-grow">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                    <img src={plan.heroImage || `https://picsum.photos/seed/${plan.destination}/200`} alt={plan.destination} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{plan.destination}</h4>
                    <p className="text-xs text-slate-500 font-medium">{plan.duration} Days • {plan.mood}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.id && confirm('Delete this trip?')) onDeletePlan(plan.id);
                  }}
                  className="p-3 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-[40px] font-medium italic">
              No trips saved yet. Start planning above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
