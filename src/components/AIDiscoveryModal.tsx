import React, { useState } from 'react';
import { Sparkles, Bot, Play, X, Loader2, Music } from 'lucide-react';
import { usePlayer } from '../lib/playerContext';
import { Song } from '../types';

interface AIDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDiscoveryModal: React.FC<AIDiscoveryModalProps> = ({ isOpen, onClose }) => {
  const { playTrack } = usePlayer();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    interpretation?: string;
    suggestedMood?: string;
    recommendedSongs?: Song[];
    vibeExplanation?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "I want something calm and nostalgic for studying on a rainy night",
    "High energy futuristic synthwave for late night coding",
    "Soft acoustic melodies for a peaceful sunset walk",
    "Emotional neoclassical piano for quiet reflection"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn font-serif">
      <div className="relative w-full max-w-2xl bg-[#F4F1EA] text-[#1A1A1A] border border-[#1A1A1A]/30 p-6 sm:p-10 space-y-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-[#EAE7DF] border border-[#1A1A1A]/20 hover:border-[#CC4422] text-[#1A1A1A]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-[#1A1A1A]/15 pb-4">
          <div className="w-12 h-12 bg-[#1A1A1A] text-[#F4F1EA] flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-[#CC4422]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#CC4422] font-sans font-bold uppercase tracking-[0.3em]">
              <Sparkles className="w-3.5 h-3.5" /> GEMINI AI CURATOR / ESSAYIST
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1A1A] mt-0.5">
              Natural Language Acoustic Analysis
            </h2>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-serif">
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Describe your current atmospheric mood, emotional landscape, or desired sonic resonance..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-[#EAE7DF] text-[#1A1A1A] text-sm p-4 border border-[#1A1A1A]/20 focus:outline-none focus:border-[#CC4422] resize-none placeholder-[#1A1A1A]/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-sans font-bold text-[#CC4422] uppercase tracking-wider self-center">Presets:</span>
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(sp)}
                className="text-[11px] font-serif bg-[#EAE7DF] hover:bg-[#1A1A1A] hover:text-[#F4F1EA] text-[#1A1A1A] px-3 py-1.5 border border-[#1A1A1A]/15 transition-colors"
              >
                "{sp.slice(0, 32)}..."
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-4 bg-[#1A1A1A] hover:bg-[#CC4422] text-[#F4F1EA] font-sans font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Acoustic DNA with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#CC4422]" /> Synthesize Curated Monograph
              </>
            )}
          </button>
        </form>

        {/* AI Result View */}
        {result && (
          <div className="p-6 bg-[#EAE7DF] border border-[#1A1A1A]/20 space-y-4 animate-fadeIn">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-sans font-bold text-[#CC4422] uppercase tracking-widest">Acoustic Interpretation</span>
                <span className="text-[10px] font-sans bg-[#CC4422] text-[#F4F1EA] px-2.5 py-0.5 font-bold uppercase tracking-wider">
                  {result.suggestedMood}
                </span>
              </div>
              <p className="text-lg font-serif font-bold text-[#1A1A1A]">{result.interpretation}</p>
              <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-1">{result.vibeExplanation}</p>
            </div>

            {result.recommendedSongs && result.recommendedSongs.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#1A1A1A]/15">
                <h4 className="text-xs font-sans font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#CC4422]" /> Curated Movement
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {result.recommendedSongs.map(song => (
                    <div
                      key={song.id}
                      className="p-3 bg-[#FBF9F5] border border-[#1A1A1A]/15 flex items-center justify-between hover:border-[#CC4422] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img src={song.coverUrl} alt={song.title} className="w-10 h-10 border border-[#1A1A1A]/20 object-cover" />
                        <div>
                          <div className="text-sm font-serif font-bold text-[#1A1A1A]">{song.title}</div>
                          <div className="text-xs font-serif italic text-[#1A1A1A]/60">{song.artist} • {song.genre}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playTrack(song.id);
                          onClose();
                        }}
                        className="p-2 bg-[#1A1A1A] hover:bg-[#CC4422] text-[#F4F1EA] flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-wider"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Audition
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

