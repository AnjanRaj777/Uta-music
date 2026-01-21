
import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Music, Loader2 } from 'lucide-react';

interface LyricsViewProps {
  currentSong: Song | null;
}

const LyricsView: React.FC<LyricsViewProps> = ({ currentSong }) => {
  const [lyrics, setLyrics] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!currentSong) return;
      setLoading(true);
      setLyrics('');

      try {
        const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Provide the full lyrics for the song "${currentSong.title}" by "${currentSong.artist}". 
          Return ONLY the plain text lyrics with normal line breaks. 
          Do not include any conversational text, introductions, or metadata. 
          If you truly cannot find the lyrics, just say "Lyrics not found for this track."`,
        });

        const text = response.text || 'Lyrics not found.';
        setLyrics(text);
      } catch (error) {
        // Do not log the error directly to avoid circular structure issues in bridge environments
        setLyrics("Failed to load lyrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-white/20">
        <Music size={64} className="mb-4 opacity-10" />
        <p className="text-xl font-black uppercase tracking-widest">Select a song to see lyrics</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-10 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-8 mb-16">
        <div className="w-32 h-32 rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
          <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">{currentSong.title}</h2>
          <p className="text-xl text-white/40 font-bold uppercase tracking-widest">{currentSong.artist}</p>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">Transcribing Audio...</p>
          </div>
        ) : (
          <pre className="text-2xl md:text-3xl font-bold text-white/80 leading-relaxed whitespace-pre-wrap font-sans tracking-tight">
            {lyrics}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LyricsView;
