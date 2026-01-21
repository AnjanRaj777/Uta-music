
import React from 'react';
import { ViewMode } from '../types';
import { Home, Compass, Library, ListMusic, Radio, Settings, Mic2 } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Home', icon: Home },
    { id: ViewMode.COVERFLOW, label: 'Browse', icon: Compass },
    { id: ViewMode.LYRICS, label: 'Lyrics', icon: Mic2 },
    { id: ViewMode.LIBRARY, label: 'Library', icon: Library },
  ];

  const secondaryItems = [
    { label: 'Playlists', icon: ListMusic },
    { label: 'Radio', icon: Radio },
  ];

  return (
    <div className="w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 hidden md:flex">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">U</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Uta Music
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Main Menu</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-white/10 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-pink-500' : 'group-hover:text-pink-400'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 mt-8">Your Collection</p>
        {secondaryItems.map((item, idx) => (
          <button
            key={idx}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/5"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-white transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
