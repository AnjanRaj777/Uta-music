
import React, { useState, useEffect } from 'react';
import { Song, RepeatMode } from '../types';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';

interface CoverFlowProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  isShuffle: boolean;
  setIsShuffle: (val: boolean) => void;
  repeatMode: RepeatMode;
  setRepeatMode: (mode: RepeatMode) => void;
}

const CoverFlow: React.FC<CoverFlowProps> = ({ 
  songs, 
  onSelect, 
  currentSong, 
  isPlaying, 
  onTogglePlay,
  onNext,
  onPrev,
  isShuffle,
  setIsShuffle,
  repeatMode,
  setRepeatMode
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setActiveIndex(Math.floor(songs.length / 2));
    } else if (currentSong) {
      const idx = songs.findIndex(s => s.id === currentSong.id);
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [songs, currentSong]);

  const handleNext = () => {
    onNext();
  };

  const handlePrev = () => {
    onPrev();
  };

  const handleCenterClick = (song: Song, index: number) => {
    if (index === activeIndex) {
      if (currentSong?.id === song.id) {
        onTogglePlay();
      } else {
        onSelect(song);
      }
    } else {
      onSelect(song);
    }
  };

  const activeSong = songs[activeIndex] || currentSong || songs[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start overflow-hidden pt-4 select-none">
      <div className="absolute top-6 flex flex-col items-center text-center z-10 pointer-events-none opacity-40">
         <h2 className="text-white text-[10px] font-black tracking-[0.5em] uppercase mb-1">Coverflow</h2>
         <p className="text-white text-3xl font-black">Browse Collections</p>
      </div>

      <div className="relative w-full max-w-6xl h-[420px] flex items-center justify-center perspective-1000 mt-6">
        {songs.map((song, index) => {
          const diff = index - activeIndex;
          const absDiff = Math.abs(diff);
          const isVisible = absDiff < 5;
          const isActuallyActive = currentSong?.id === song.id;

          if (!isVisible) return null;

          const translateX = diff * 180;
          const rotateY = diff > 0 ? -40 : diff < 0 ? 40 : 0;
          const translateZ = -absDiff * 200;
          const scale = absDiff === 0 ? 1.35 : 0.8;
          const opacity = 1 - absDiff * 0.22;
          const zIndex = 100 - absDiff;

          return (
            <div
              key={song.id}
              onClick={() => handleCenterClick(song, index)}
              className="absolute w-64 h-64 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transformStyle: 'preserve-3d',
              }}
            >
              <div className={`relative w-full h-full rounded-[48px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-500 ${isActuallyActive && isPlaying ? 'ring-4 ring-white/30' : ''}`}>
                <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isActuallyActive && isPlaying ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                   <Play className="w-14 h-14 text-white fill-current ml-2" />
                </div>
              </div>
              
              {/* Reflection */}
              <div 
                className="absolute top-[108%] left-0 w-full h-full rounded-[48px] overflow-hidden opacity-10 pointer-events-none"
                style={{ 
                  transform: 'rotateX(180deg) scaleY(0.7)', 
                  filter: 'blur(12px)',
                  maskImage: 'linear-gradient(to top, transparent, rgba(0,0,0,0.6))'
                }}
              >
                <img src={song.thumbnail} alt="reflection" className="w-full h-full object-cover" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Playback Control Panel (Matching Screenshot) */}
      <div className="mt-14 relative z-30 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="bg-black/40 backdrop-blur-3xl border-2 border-blue-400/30 rounded-[40px] p-8 flex flex-col items-center gap-6 shadow-[0_0_60px_rgba(59,130,246,0.15)] overflow-hidden">
          {/* Subtle Dynamic Ambient BG */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
             {activeSong && <img src={activeSong.thumbnail} className="w-full h-full object-cover blur-3xl scale-125" alt="bg" />}
          </div>
          
          <div className="text-center relative z-10 w-full">
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg mb-2 truncate px-4">
              {activeSong?.title || "Uta Player"}
            </h3>
            <p className="text-base text-white/50 font-bold uppercase tracking-[0.2em] truncate px-4">
              {activeSong?.artist || "Select music to play"}
            </p>
          </div>

          <div className="flex items-center gap-10 relative z-10 mt-2">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition-all transform hover:scale-110 active:scale-90 ${isShuffle ? 'text-blue-400' : 'text-white/20 hover:text-white'}`}
            >
              <Shuffle size={20}/>
            </button>
            
            <button onClick={handlePrev} className="text-white hover:text-white/80 transition-all transform hover:scale-110 active:scale-90">
              <SkipBack size={36} fill="currentColor" />
            </button>
            
            <button 
              onClick={onTogglePlay}
              className={`w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 ${isPlaying && currentSong?.id === activeSong?.id ? 'scale-105' : ''}`}
            >
              {isPlaying && currentSong?.id === activeSong?.id ? <Pause size={42} fill="currentColor" /> : <Play size={42} fill="currentColor" className="ml-2" />}
            </button>
            
            <button onClick={handleNext} className="text-white hover:text-white/80 transition-all transform hover:scale-110 active:scale-90">
              <SkipForward size={36} fill="currentColor" />
            </button>
            
            <button 
              onClick={() => setRepeatMode(repeatMode === RepeatMode.NONE ? RepeatMode.ALL : repeatMode === RepeatMode.ALL ? RepeatMode.ONE : RepeatMode.NONE)}
              className={`transition-all transform hover:scale-110 active:scale-90 ${repeatMode !== RepeatMode.NONE ? 'text-blue-400' : 'text-white/20 hover:text-white'}`}
            >
              <div className="relative">
                <Repeat size={20}/>
                {repeatMode === RepeatMode.ONE && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 2500px;
        }
      `}</style>
    </div>
  );
};

export default CoverFlow;
