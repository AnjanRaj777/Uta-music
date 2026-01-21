
import React, { useEffect, useState, useRef } from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, AlertCircle } from 'lucide-react';

interface PlayerProps {
  currentSong: Song | null;
  onNext: () => void;
  onPrev: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const Player: React.FC<PlayerProps> = ({ currentSong, onNext, onPrev, isPlaying, setIsPlaying }) => {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(70);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  // Fix: Use number instead of NodeJS.Timeout for browser environment
  const skipTimeoutRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initPlayer = () => {
      if (playerRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      const playerInstanceDiv = document.getElementById('yt-player-instance');
      if (!playerInstanceDiv) return;

      // The origin must be exactly matching the window location for YouTube IFrame API
      const origin = window.location.protocol + '//' + window.location.host;

      playerRef.current = new window.YT.Player('yt-player-instance', {
        height: '1',
        width: '1',
        videoId: currentSong?.id || '',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1,
          origin: origin,
          enablejsapi: 1,
          playsinline: 1,
          widget_referrer: origin
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            event.target.setVolume(volume);
            if (currentSong && isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setErrorStatus(null);
            }
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) onNext();
          },
          onError: (e: any) => {
            let errorMsg = "Playback error";
            const code = e.data;
            
            // 2: Invalid parameter
            // 5: HTML5 player error
            // 100: Video not found
            // 101/150: Embed restricted by owner
            if (code === 101 || code === 150) {
              errorMsg = "Playback restricted by YouTube";
            } else if (code === 100) {
              errorMsg = "Video not found";
            }
            
            console.warn(`YouTube Player Error (${code}): ${errorMsg}`);
            setErrorStatus(errorMsg);

            // Auto-skip after a short delay to avoid rapid UI jitter
            if (skipTimeoutRef.current) window.clearTimeout(skipTimeoutRef.current);
            skipTimeoutRef.current = window.setTimeout(() => {
              onNext();
              setErrorStatus(null);
            }, 3000);
          }
        }
      });
    };

    const interval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(interval);
        initPlayer();
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (skipTimeoutRef.current) window.clearTimeout(skipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentSong && isReadyRef.current && playerRef.current?.loadVideoById) {
      try {
        setErrorStatus(null);
        playerRef.current.loadVideoById(currentSong.id);
        setIsPlaying(true);
      } catch (e) {
        console.error("Failed to load video:", e);
      }
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current || !playerRef.current.playVideo) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      // Ignore state toggle failures during transitions
    }
  }, [isPlaying]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current && isReadyRef.current && playerRef.current.getCurrentTime) {
        try {
          const current = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          if (dur > 0) {
            setProgress((current / dur) * 100);
            setCurrentTime(formatTime(current));
            setDuration(formatTime(dur));
          }
        } catch (e) {}
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !isReadyRef.current || !playerRef.current.getDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = pct * playerRef.current.getDuration();
    playerRef.current.seekTo(newTime, true);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setVolume(newVol);
    if (playerRef.current && isReadyRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVol);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!currentSong) return null;

  return (
    <div className="absolute bottom-6 left-6 right-6 h-28 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] flex flex-col items-center justify-center px-10 z-50 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
      {/* Container for YouTube player instance (required by API) */}
      <div id="yt-player-instance" className="hidden absolute opacity-0 pointer-events-none"></div>

      {/* Error Feedback Overlay */}
      {errorStatus && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl animate-bounce">
          <AlertCircle size={14} className="text-white" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">{errorStatus}. Skipping...</span>
        </div>
      )}

      <div className="w-full flex items-center justify-between">
        {/* Left: Song Info */}
        <div className="flex items-center gap-5 w-[30%] overflow-hidden">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-xl bg-black/20">
            <img src={currentSong.thumbnail} className="w-full h-full object-cover" alt="cover" />
          </div>
          <div className="truncate">
            <h4 className="text-base font-bold text-white truncate leading-tight tracking-tight">{currentSong.title}</h4>
            <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-black truncate mt-1">{currentSong.artist}</p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-8">
            <button onClick={onPrev} className="text-white hover:text-white/80 transition-all transform hover:scale-110 active:scale-90"><SkipBack size={24} fill="currentColor" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-2xl"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={onNext} className="text-white hover:text-white/80 transition-all transform hover:scale-110 active:scale-90"><SkipForward size={24} fill="currentColor" /></button>
          </div>
        </div>

        {/* Right: Volume & Fullscreen */}
        <div className="flex items-center justify-end gap-8 w-[30%]">
          <div className="flex items-center gap-4">
            <Volume2 size={18} className="text-white/40" />
            <div className="w-28 h-1.5 bg-white/10 rounded-full relative cursor-pointer group" onClick={handleVolumeChange}>
              <div className="absolute top-0 left-0 h-full bg-white/60 rounded-full group-hover:bg-blue-400 transition-colors" style={{ width: `${volume}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl" style={{ left: `${volume}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
          </div>
          <button onClick={toggleFullscreen} className="text-white/30 hover:text-white transition transform hover:scale-110">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* Seek Bar */}
      <div className="w-full flex items-center gap-5 mt-4 px-2">
        <span className="text-[10px] text-white/30 tabular-nums font-black w-10 text-right">{currentTime}</span>
        <div className="flex-1 h-1 bg-white/5 rounded-full relative cursor-pointer group" onClick={handleSeek}>
          <div className="absolute top-0 left-0 h-full bg-white/20 rounded-full" style={{ width: `${progress}%` }} />
          <div className="absolute top-0 left-0 h-full bg-blue-400/40 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]" style={{ width: `${progress}%` }} />
          <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-white/30 tabular-nums font-black w-10">{duration}</span>
      </div>
    </div>
  );
};

export default Player;
