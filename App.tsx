
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Dashboard from './components/Dashboard';
import CoverFlow from './components/CoverFlow';
import LyricsView from './components/LyricsView';
import { Song, ViewMode, RepeatMode } from './types';
import { getTrendingMusic, searchMusic } from './services/youtubeService';
import { Search, Bell, Battery, Wifi, Mic2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.NONE);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    const trending = await getTrendingMusic();
    setSongs(trending);
    if (trending.length > 0 && !currentSong) {
      setCurrentSong(trending[0]);
    }
    setIsLoading(false);
  }, [currentSong]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchSongs();
      return;
    }
    setIsLoading(true);
    const results = await searchMusic(searchQuery);
    setSongs(results);
    setIsLoading(false);
  };

  const handleNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    
    if (repeatMode === RepeatMode.ONE) {
      // Re-trigger current song (logic handled in Player usually, but we can force it here)
      const currentId = currentSong.id;
      setCurrentSong(null); // Brief reset to trigger useEffect in Player
      setTimeout(() => {
        const song = songs.find(s => s.id === currentId);
        if (song) setCurrentSong(song);
      }, 50);
      return;
    }

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]);
    } else {
      const idx = songs.findIndex(s => s.id === currentSong.id);
      const nextIdx = (idx + 1) % songs.length;
      setCurrentSong(songs[nextIdx]);
    }
  }, [currentSong, songs, isShuffle, repeatMode]);

  const handlePrev = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const prevIdx = (idx - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIdx]);
  }, [currentSong, songs]);

  const handleTogglePlay = () => {
    if (!currentSong && songs.length > 0) {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(p => !p);
    }
  };

  const handleSelectSong = (song: Song) => {
    if (song && typeof song === 'object' && song.id) {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      <Sidebar currentView={currentView} setView={(v) => setCurrentView(v)} />

      <main className="flex-1 flex flex-col min-w-0 m-4 mb-0 bg-white/[0.04] backdrop-blur-[40px] rounded-t-[56px] border-t border-x border-white/10 relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <header className="h-20 flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-8 flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search artists, songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-full py-3.5 pl-14 pr-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/10 transition-all placeholder:text-white/20 font-semibold"
              />
            </form>
          </div>

          <div className="flex items-center gap-8 ml-6">
            <div className="hidden lg:flex items-center gap-5 text-white/40">
               <Wifi className="w-4 h-4 text-blue-400/80" />
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-tight">100%</span>
                  <Battery className="w-5 h-5 text-green-500/60 rotate-90" />
               </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentView(ViewMode.LYRICS)}
                className={`p-2 transition ${currentView === ViewMode.LYRICS ? 'text-pink-500' : 'text-white/30 hover:text-white'}`}
              >
                <Mic2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/30 hover:text-white transition"><Bell className="w-5 h-5" /></button>
              <div className="w-10 h-10 bg-gradient-to-br from-white/15 to-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
                 <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Uta" alt="user" className="w-full h-full opacity-60" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-y-auto no-scrollbar scroll-smooth">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="w-16 h-16 border-[4px] border-white/5 border-t-white rounded-full animate-spin shadow-2xl"></div>
              <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.4em] animate-pulse">Syncing Library</p>
            </div>
          ) : (
            <div className="pb-44 h-full">
              {currentView === ViewMode.DASHBOARD && (
                <Dashboard songs={songs} onSelect={handleSelectSong} />
              )}
              {currentView === ViewMode.COVERFLOW && (
                <CoverFlow 
                  songs={songs} 
                  onSelect={handleSelectSong} 
                  currentSong={currentSong} 
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  isShuffle={isShuffle}
                  setIsShuffle={setIsShuffle}
                  repeatMode={repeatMode}
                  setRepeatMode={setRepeatMode}
                />
              )}
              {currentView === ViewMode.LYRICS && (
                <LyricsView currentSong={currentSong} />
              )}
              {currentView === ViewMode.LIBRARY && (
                <div className="p-24 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-white/5 text-white/20 font-black">?</div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Your Collection</h2>
                  <p className="text-white/30 max-w-sm mx-auto text-base font-medium leading-relaxed">Your personal vault of favorites and playlists. Connect a service to begin.</p>
                  <button className="mt-10 px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl active:scale-95">Link YouTube</button>
                </div>
              )}
            </div>
          )}
        </div>

        <Player 
          currentSong={currentSong} 
          onNext={handleNext} 
          onPrev={handlePrev} 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
