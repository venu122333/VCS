
import React, { useState } from 'react';
import SettingsModal from './SettingsModal';
import { User } from 'firebase/auth';
import { User as UserIcon, LogOut, Menu, X, Wand2, Settings, Home, Compass, MessageSquare } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  currentView: string;
  onNavigate: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenProfile, onOpenSettings, currentView, onNavigate }) => {
  const navItems = [
    { id: 'HOME', icon: Home, label: 'Home' },
    { id: 'EXPLORE', icon: Compass, label: 'Explore' },
    { id: 'PLAN', icon: Wand2, label: 'Build' },
    { id: 'CHAT', icon: MessageSquare, label: 'Coach' },
    { id: 'PROFILE', icon: UserIcon, label: 'Profile' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('HOME')}>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
                Nomad<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Trip Planner
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${currentView === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={onOpenSettings}
              className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="hidden md:block h-4 w-px bg-slate-200" />
            {user && (
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-3 md:bg-slate-50 md:hover:bg-slate-100 md:px-4 md:py-2 rounded-2xl transition-all md:border md:border-slate-100"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 md:w-8 md:h-8 rounded-xl object-cover shadow-sm" />
                ) : (
                  <div className="w-9 h-9 md:w-8 md:h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.displayName?.[0]}
                  </div>
                )}
                <span className="hidden md:block text-sm font-bold text-slate-700">{user.displayName?.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

