import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../lib/playerContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Volume2, VolumeX, ListMusic, Maximize2, Sparkles, Disc } from 'lucide-react';
import { ClassicVolumeKnob } from './retro/ClassicVolumeKnob';

export const BottomPlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleLike,
    likedSongIds,
    toggleRepeat,
    shuffleQueue,
    setIsImmersiveOpen,
    setIsQueueModalOpen,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(volume);
  const [showVolumeKnobPopover, setShowVolumeKnobPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowVolumeKnobPopover(false);
      }
    };
    if (showVolumeKnobPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeKnobPopover]);

  if (!currentSong) return null;

  const isLiked = likedSongIds.has(currentSong.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVol || 0.8);
      setIsMuted(false);
    } else {
      setPrevVol(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer
      id="bottom-player"
      className="fixed bottom-[58px] md:bottom-0 left-0 right-0 z-30 bg-[#070e14]/95 backdrop-blur-2xl border-t border-[#d4af37]/25 px-2.5 sm:px-4 md:px-7 py-2 md:py-3 select-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Interactive Micro Progress Bar for Mobile (Top border scrubber) */}
      <div className="md:hidden absolute -top-1 left-0 right-0 h-2 flex items-center cursor-pointer group">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1.5 accent-[#d4af37] bg-[#162c3a] opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer appearance-none"
        />
      </div>

      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Track Info & 3D Artwork Thumbnail */}
        <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0 md:w-[260px] shrink-0 flex-1 md:flex-initial">
          <div
            onClick={() => setIsImmersiveOpen(true)}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl shrink-0 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.6)] overflow-hidden relative group border border-[#d4af37]/30"
            style={{ background: currentSong.colors ? `linear-gradient(135deg, ${currentSong.colors[0]}, ${currentSong.colors[1]})` : '#d4af37' }}
          >
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-xs text-[#070e14] font-bold">
                M
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-[#fcd34d]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="text-xs md:text-sm font-semibold text-[#fdfbf7] truncate hover:text-[#d4af37] cursor-pointer transition-colors"
              onClick={() => setIsImmersiveOpen(true)}
            >
              {currentSong.title}
            </div>
            <div className="text-[11px] md:text-xs text-[#8e806a] truncate flex items-center gap-1.5 mt-0.5">
              <span>{currentSong.artist}</span>
              <span className="hidden sm:inline text-[#d4af37]/50">•</span>
              <span className="hidden sm:inline font-mono text-[10px] text-[#fcd34d]/80 uppercase">{currentSong.mood}</span>
            </div>
          </div>

          <button
            onClick={() => toggleLike(currentSong.id)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
              isLiked ? 'text-rose-400' : 'text-[#8e806a] hover:text-[#fdfbf7]'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center: Desktop Playback Controls & Full Seekbar */}
        <div className="hidden md:flex flex-1 max-w-[560px] flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={shuffleQueue}
              className="p-1.5 text-[#8e806a] hover:text-[#d4af37] transition-colors"
              title="Intelligent Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrev}
              className="p-1.5 text-[#d4c5a9] hover:text-[#fdfbf7] transition-colors"
              title="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_2px_15px_rgba(212,175,55,0.4)] font-bold"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-[#d4c5a9] hover:text-[#fdfbf7] transition-colors"
              title="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 transition-colors ${repeatMode ? 'text-[#d4af37]' : 'text-[#8e806a] hover:text-[#fdfbf7]'}`}
              title="Repeat mode"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Seekbar */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-[#8e806a]">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="flex-1 h-1.5 accent-[#d4af37] bg-[#162c3a] rounded-full cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Controls for Mobile + Volume/Queue for Desktop */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Quick Play/Pause & Skip */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={playPrev}
              className="p-2 text-[#d4c5a9] hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] flex items-center justify-center shadow-md font-bold"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="p-2 text-[#d4c5a9] hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop & Mobile Volume Control with Classic Knob Popover */}
          <div className="relative flex items-center" ref={popoverRef}>
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowVolumeKnobPopover(!showVolumeKnobPopover)}
                className={`p-1.5 rounded-lg hover:bg-white/10 text-[#8e806a] hover:text-[#d4af37] transition-colors ${
                  showVolumeKnobPopover ? 'text-[#d4af37] bg-[#d4af37]/15' : ''
                }`}
                title="Open Classic Rotary Volume Knob"
              >
                {volume === 0 || isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-18 h-1.5 accent-[#d4af37] bg-[#162c3a] rounded-full cursor-pointer"
              />
            </div>

            {/* Classic Volume Knob Popover Menu */}
            {showVolumeKnobPopover && (
              <div className="absolute bottom-full right-0 mb-3 bg-[#0d161d]/95 backdrop-blur-2xl border border-[#d4af37]/40 p-4 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-mono font-bold text-amber-300 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Master Volume</span>
                </div>
                <ClassicVolumeKnob
                  volume={volume}
                  onChange={setVolume}
                  size="md"
                  showLabel={true}
                />
              </div>
            )}
          </div>

          {/* Queue Button */}
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="p-2 rounded-xl bg-[#10212c] border border-[#d4af37]/25 text-[#d4c5a9] hover:text-[#fdfbf7] hover:border-[#d4af37] transition-all min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Up Next Queue"
            aria-label="Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* 3D Immersive Stage Button */}
          <button
            onClick={() => setIsImmersiveOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-[#f59e0b]/20 border border-[#d4af37]/50 text-[#fcd34d] hover:bg-[#d4af37]/30 transition-all min-h-[38px] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            title="Open 3D Gramophone & Tape Stage"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span className="text-xs font-mono font-bold hidden xs:inline">3D Stage</span>
            <Maximize2 className="w-3.5 h-3.5 xs:hidden" />
          </button>
        </div>
      </div>
    </footer>
  );
};
