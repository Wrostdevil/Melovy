import React from 'react';
import { motion } from 'motion/react';
import { Disc, Radio, Flame, Sparkles } from 'lucide-react';
import { Song } from '../../types';

interface CassetteDeckProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  compact?: boolean;
}

export const CassetteDeck: React.FC<CassetteDeckProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  compact = false
}) => {
  return (
    <div className={`relative bg-black/40 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] text-[#F4F1EA] overflow-hidden ${compact ? 'max-w-sm' : 'max-w-md w-full'}`}>
      {/* Metallic Plate & Amber Backlight Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-black/80 to-amber-950/40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-amber-300">
            STEREO CASSETTE TAPE DECK
          </span>
        </div>
        <span className="text-[9px] font-mono bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase">
          TYPE II / CHROME
        </span>
      </div>

      {/* Cassette Tape Window */}
      <div className="relative z-10 bg-[#121214] border-2 border-zinc-700/80 rounded-xl p-4 shadow-inner overflow-hidden flex flex-col justify-between h-44">
        {/* Tape Housing Body Graphic */}
        <div className="relative w-full h-full bg-[#1e1c19] border border-amber-900/30 rounded-lg p-3 flex flex-col justify-between overflow-hidden">
          {/* Top Tape Label Sticker */}
          <div className="bg-[#f2ece1] text-[#121214] px-3 py-1.5 rounded-sm border border-black/20 flex items-center justify-between shadow-xs">
            <div className="truncate font-serif italic text-xs font-bold">
              {currentSong ? `${currentSong.title} — ${currentSong.artist}` : 'Acoustic Archive Vol. 04'}
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest bg-amber-800 text-amber-100 px-1.5 py-0.2 rounded font-black shrink-0 ml-2">
              SIDE A
            </span>
          </div>

          {/* Reel-to-Reel Spinning Hubs Area */}
          <div className="relative flex items-center justify-around my-2 px-6">
            {/* Left Reel Hub */}
            <div className="relative flex items-center justify-center">
              {/* Outer Tape Pack */}
              <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-800/80 flex items-center justify-center shadow-inner relative">
                {/* Spoked Wheel */}
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center relative"
                >
                  <div className="w-full h-0.5 bg-amber-400/40 absolute" />
                  <div className="h-full w-0.5 bg-amber-400/40 absolute" />
                  <div className="w-4 h-4 rounded-full bg-amber-300/80 border border-black shadow-xs" />
                </motion.div>
              </div>
            </div>

            {/* Tape Window Bridge */}
            <div className="w-16 h-8 bg-black/60 border border-white/10 rounded-sm flex items-center justify-center px-1">
              <div className="w-full h-1 bg-amber-700/60 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: isPlaying ? [-20, 20] : 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatType: 'reverse' }}
                  className="w-4 h-full bg-amber-400"
                />
              </div>
            </div>

            {/* Right Reel Hub */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-800/80 flex items-center justify-center shadow-inner relative">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center relative"
                >
                  <div className="w-full h-0.5 bg-amber-400/40 absolute" />
                  <div className="h-full w-0.5 bg-amber-400/40 absolute" />
                  <div className="w-4 h-4 rounded-full bg-amber-300/80 border border-black shadow-xs" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Magnetic Head Bar */}
          <div className="flex items-center justify-between text-[8px] font-mono text-amber-200/60 border-t border-amber-900/30 pt-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" /> TAPE HEAD ENGAGED
            </span>
            <span>HIGH FREQUENCY BIAS</span>
          </div>
        </div>

        {/* Glass reflection cover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Cassette Control Buttons */}
      <div className="relative z-10 flex items-center justify-between mt-4 gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex-1 py-2.5 px-4 font-sans text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 shadow-md ${
            isPlaying
              ? 'bg-amber-500 text-black border-amber-400 hover:bg-amber-400'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isPlaying ? 'PAUSE TAPE' : 'PLAY TAPE'}
        </button>

        <div className="flex items-center gap-1 font-mono text-[9px] text-amber-300/80 bg-black/40 px-3 py-2 border border-white/10 rounded">
          <Radio className="w-3 h-3 text-amber-400" /> DOLBY B NR ACTIVE
        </div>
      </div>
    </div>
  );
};
