
import React from 'react';
import { Song } from '../types';
import { Play } from 'lucide-react';

interface DashboardProps {
  songs: Song[];
  onSelect: (song: Song) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ songs, onSelect }) => {
  return (
    <div className="p-8 md:p-12 space-y-12">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight">Top 50 Trending</h3>
          <button className="text-white/40 text-xs font-bold hover:text-white transition tracking-widest uppercase">See all</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
          {songs.map((song) => (
            <div 
              key={song.id} 
              onClick={() => onSelect(song)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Card Image Wrapper with Pill-like rounding */}
              <div className="aspect-square rounded-[40px] overflow-hidden mb-5 relative shadow-2xl bg-white/5 border border-white/5 transition-transform duration-500 group-hover:scale-[1.03] group-active:scale-95">
                <img 
                  src={song.thumbnail} 
                  alt={song.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                    <Play className="w-7 h-7 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>

              {/* Text Meta */}
              <div className="px-2 space-y-1">
                <h4 className="text-sm font-bold text-white/90 truncate group-hover:text-white transition-colors tracking-tight leading-snug">
                  {song.title}
                </h4>
                <p className="text-[10px] text-white/40 font-bold truncate uppercase tracking-[0.15em]">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary section for extra variety */}
      <section className="opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold text-white mb-6">Discover New</h3>
        <div className="flex gap-4 overflow-hidden">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="min-w-[200px] h-32 bg-white/5 rounded-[30px] border border-white/5 animate-pulse" />
           ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
