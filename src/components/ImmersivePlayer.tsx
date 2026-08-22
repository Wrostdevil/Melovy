import React, { useState, useRef } from 'react';
import { usePlayer } from '../lib/playerContext';
import { GramophoneQuality } from '../types';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Plus,
  Share2,
  Sparkles,
  Disc3,
  Radio,
  Music,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Upload,
  Sliders,
  Layers,
  Volume2,
  Info,
  RotateCw,
} from 'lucide-react';
import { Realistic3DGramophone } from './gramophone/Realistic3DGramophone';
import { Realistic3DTapeRecorder } from './retro/Realistic3DTapeRecorder';
import { CassetteDeck } from './retro/CassetteDeck';
import { GramophoneCanvas } from './gramophone/GramophoneCanvas';
import { FloatingAcousticNotes } from './gramophone/FloatingAcousticNotes';
import { ClassicVolumeKnob } from './retro/ClassicVolumeKnob';

type VisualStageMode = 'gramophone' | 'taperecorder' | 'cassette' | 'turntable';
type MobileViewTab = 'stage' | 'notes' | 'settings';

interface BackgroundTheme {
  id: string;
  name: string;
  url: string;
  credit?: string;
}

const PRESET_BACKGROUNDS: BackgroundTheme[] = [
  {
    id: 'heritage-lake',
    name: 'Melovy Heritage Palace & Lotus Lake',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'udaipur-sunset',
    name: 'Royal Lakeside Sunset',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'peacock-garden',
    name: 'Mystic Sitar Sanctuary',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 'cosmic-mandala',
    name: 'Midnight Celestial Vibe',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop',
  },
];

export const ImmersivePlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    gramophoneQuality,
    setGramophoneQuality,
    togglePlay,
    playNext,
    playPrev,
    seek,
    toggleLike,
    likedSongIds,
    openAddToPlaylistModal,
    openShareModal,
    setIsImmersiveOpen,
  } = usePlayer();

  const [stageMode, setStageMode] = useState<VisualStageMode>('gramophone');
  const [isFullscreenStage, setIsFullscreenStage] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileViewTab>('stage');
  const [selectedBgId, setSelectedBgId] = useState<string>('heritage-lake');
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);
  const [isQualityPickerOpen, setIsQualityPickerOpen] = useState(false);
  const [bgDimLevel, setBgDimLevel] = useState<number>(30); // 0 to 80% opacity overlay
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentSong) return null;

  const isLiked = likedSongIds.has(currentSong.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const qualities: { id: GramophoneQuality; label: string }[] = [
    { id: 'high', label: 'High (3D)' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low (2D)' },
    { id: 'motion-off', label: 'Reduced Motion' },
  ];

  const stageOptions = [
    { id: 'gramophone' as const, label: '3D Gramophone', icon: Music, desc: 'Victorian Brass Horn' },
    { id: 'taperecorder' as const, label: '3D Tape Recorder', icon: Radio, desc: 'Reel-to-Reel Studio' },
    { id: 'cassette' as const, label: 'Analog Cassette', icon: Disc3, desc: 'Dolby Chrome Deck' },
    { id: 'turntable' as const, label: 'Hi-Fi Turntable', icon: Disc3, desc: 'Vinyl Audio Plinth' },
  ];

  // Active Background Image
  const activeBg = customBgUrl || PRESET_BACKGROUNDS.find((b) => b.id === selectedBgId)?.url || PRESET_BACKGROUNDS[0].url;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBgUrl(url);
      setSelectedBgId('custom');
      setIsBgPickerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 text-[#f3f1f7] flex flex-col justify-between overflow-hidden select-none animate-fadein">
      {/* 1. Stunning Fullscreen Heritage Background Image Layer */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img
          src={activeBg}
          alt="Immersive Backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 transform"
          style={{
            filter: `brightness(${100 - bgDimLevel}%) contrast(108%) saturate(115%)`,
          }}
        />
        {/* Ornate Vignette Gradient Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(10,8,16,0.15) 0%, rgba(10,8,16,0.7) 75%, rgba(6,5,10,0.95) 100%)`,
          }}
        />
        {/* Dynamic Color Hue Aura Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${currentSong.colors?.[0] || '#f59e0b'} 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* 2. Floating Musical Notes Animation */}
      <FloatingAcousticNotes isPlaying={isPlaying} />

      {/* 3. Top Navigation Bar (Responsive on Mobile & Desktop) */}
      <div className="relative z-30 flex flex-col gap-2 p-3 sm:p-5 bg-gradient-to-b from-[#07060b]/95 via-[#07060b]/60 to-transparent backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Close Button & Track Header */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsImmersiveOpen(false)}
              className="p-2.5 rounded-full bg-black/50 border border-white/15 hover:bg-black/80 hover:border-amber-400/50 transition-all cursor-pointer shadow-lg shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Exit Stage"
              aria-label="Exit Stage"
            >
              <X className="w-5 h-5 text-amber-200" />
            </button>

            <div className="min-w-0">
              <div className="text-[11px] uppercase font-mono tracking-widest text-amber-300/90 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="truncate">MELOVY 3D STAGE</span>
                <span className="text-white/30">•</span>
                <span className="text-amber-200 uppercase">{currentSong.mood}</span>
              </div>
              <div className="text-xs sm:text-base font-semibold text-white truncate drop-shadow">
                {currentSong.title}
              </div>
            </div>
          </div>

          {/* Right Actions: Quality + Backdrop + Full-Screen Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 3D Graphics Quality Dropdown / Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsQualityPickerOpen(!isQualityPickerOpen)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 hover:border-amber-400/50 text-[11px] font-mono text-amber-200 transition-all cursor-pointer shadow-lg min-h-[40px]"
                title="Graphics & Animation Quality"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline uppercase">{gramophoneQuality}</span>
              </button>

              {isQualityPickerOpen && (
                <div className="absolute right-0 top-11 w-44 p-2 rounded-2xl bg-[#0e0c16]/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.9)] z-50 space-y-1 animate-fadein">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-amber-400/80 border-b border-white/10 mb-1">
                    Visual Quality
                  </div>
                  {qualities.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setGramophoneQuality(q.id);
                        setIsQualityPickerOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        gramophoneQuality === q.id
                          ? 'bg-amber-500 text-black font-bold'
                          : 'text-[#d4ceeb] hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Background Wallpaper Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsBgPickerOpen(!isBgPickerOpen)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 hover:border-amber-400/50 text-[11px] sm:text-xs font-mono text-amber-200 transition-all cursor-pointer shadow-lg min-h-[40px]"
                title="Change Background Scene"
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden sm:inline">Backdrop</span>
              </button>

              {/* Background Picker Dropdown Modal */}
              {isBgPickerOpen && (
                <div className="absolute right-0 top-11 w-72 sm:w-80 p-4 rounded-2xl bg-[#0e0c16]/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 space-y-3 animate-fadein">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Backdrop Scenes
                    </span>
                    <button
                      onClick={() => setIsBgPickerOpen(false)}
                      className="text-white/60 hover:text-white text-xs cursor-pointer p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Preset List */}
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBgId(bg.id);
                          setCustomBgUrl(null);
                          setIsBgPickerOpen(false);
                        }}
                        className={`group relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer text-left ${
                          selectedBgId === bg.id && !customBgUrl
                            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={bg.url}
                          alt={bg.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-1.5 flex items-end">
                          <span className="text-[10px] font-medium text-white line-clamp-1 leading-tight">{bg.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Upload Option */}
                  <div className="pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Image</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCustomImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Brightness Dimmer Slider */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-white/70">
                      <span>Backdrop Dimming</span>
                      <span>{bgDimLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={bgDimLevel}
                      onChange={(e) => setBgDimLevel(Number(e.target.value))}
                      className="w-full h-2 accent-amber-400 bg-white/20 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Full Screen Stage Toggle */}
            <button
              onClick={() => setIsFullscreenStage(!isFullscreenStage)}
              className={`p-2 sm:p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg flex items-center gap-1.5 text-[11px] sm:text-xs font-mono min-h-[40px] ${
                isFullscreenStage
                  ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                  : 'bg-black/50 text-amber-200 border-white/15 hover:border-amber-400/50'
              }`}
              title={isFullscreenStage ? 'Exit Full-Screen Stage' : 'Enter Full-Screen 3D Stage'}
            >
              {isFullscreenStage ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden md:inline">{isFullscreenStage ? 'Split View' : 'Full Stage'}</span>
            </button>
          </div>
        </div>

        {/* Visualizer Mode Selector Pills */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/15 p-1 rounded-2xl overflow-x-auto no-scrollbar shadow-lg w-full max-w-xl mx-auto">
          {stageOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = stageMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setStageMode(opt.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'text-[#d4ceeb] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Switcher (Stage / Notes / Acoustics) */}
        {!isFullscreenStage && (
          <div className="flex lg:hidden items-center justify-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl mx-auto w-full max-w-sm">
            <button
              onClick={() => setMobileTab('stage')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono transition-all ${
                mobileTab === 'stage' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-white/60'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setMobileTab('notes')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-mono transition-all ${
                mobileTab === 'notes' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-white/60'
              }`}
            >
              Liner Notes & Hz
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Stage Area */}
      {isFullscreenStage ? (
        /* ================= FULL SCREEN 3D THEATER MODE ================= */
        <div className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
          {/* Centered Grand 3D Model floating in full glory over the panoramic background */}
          <div className="relative w-full h-[55vh] sm:h-[65vh] max-w-4xl flex items-center justify-center">
            {stageMode === 'gramophone' ? (
              <Realistic3DGramophone />
            ) : stageMode === 'taperecorder' ? (
              <Realistic3DTapeRecorder />
            ) : stageMode === 'cassette' ? (
              <div className="max-w-md w-full p-2">
                <CassetteDeck currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
              </div>
            ) : (
              <GramophoneCanvas />
            )}
          </div>

          {/* Floating Glass Control Capsule at Bottom */}
          <div className="w-full max-w-2xl bg-black/70 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-2.5 z-30 mb-2">
            {/* Song Title & Artist Line + Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="truncate min-w-0 flex-1">
                <div className="text-base sm:text-lg font-display italic text-amber-100 font-medium truncate">
                  {currentSong.title}
                </div>
                <div className="text-[11px] sm:text-xs text-amber-300/80 font-mono truncate">{currentSong.artist}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleLike(currentSong.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
                    isLiked
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                  title="Favorite Track"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => openAddToPlaylistModal(currentSong.id)}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                  title="Add to Playlist"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openShareModal(currentSong.id)}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                  title="Share Track"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Seekbar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 accent-amber-400 bg-white/20 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-amber-200/70">
                <span>{formatTime(currentTime)}</span>
                <span className="text-emerald-400 font-bold">{isPlaying ? '● LIVE AUDIO' : 'PAUSED'}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls & Volume */}
            <div className="flex items-center justify-between pt-1 gap-2">
              {/* Classic Rotary Volume Knob */}
              <div className="flex items-center gap-2 shrink-0">
                <ClassicVolumeKnob volume={volume} onChange={setVolume} size="sm" showLabel={true} />
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <button
                  onClick={playPrev}
                  className="p-2 text-amber-200/80 hover:text-white hover:scale-110 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Previous Track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer font-bold"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={playNext}
                  className="p-2 text-amber-200/80 hover:text-white hover:scale-110 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Next Track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="text-right text-[11px] font-mono text-amber-400/90 hidden sm:block">
                <div className="font-bold">{currentSong.baseFreq?.toFixed(1) || '432.0'} Hz</div>
                <div className="text-[10px] text-emerald-400">{isPlaying ? '● Live Acoustics' : 'Standby'}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= SPLIT VIEW MODE (Default) ================= */
        <div className="flex-1 my-2 sm:my-4 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 max-w-6xl mx-auto w-full p-3 sm:p-5 overflow-y-auto">
          {/* Left Column: 3D Stage Visual Canvas floating seamlessly over background */}
          <div
            className={`w-full lg:w-1/2 aspect-square max-w-[420px] relative flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 ${
              mobileTab !== 'stage' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {gramophoneQuality === 'low' ? (
              <div
                className={`w-[240px] h-[240px] rounded-full relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-4 border-white/10 ${
                  isPlaying ? 'animate-spin-disc' : ''
                }`}
                style={{ background: `linear-gradient(135deg, ${currentSong.colors[0]}, ${currentSong.colors[1]})` }}
              >
                <div className="absolute inset-[35%] rounded-full bg-[#0a0810] border-2 border-white/20 flex items-center justify-center font-display italic text-xs text-white">
                  Melovy
                </div>
              </div>
            ) : stageMode === 'gramophone' ? (
              <Realistic3DGramophone />
            ) : stageMode === 'taperecorder' ? (
              <Realistic3DTapeRecorder />
            ) : stageMode === 'cassette' ? (
              <div className="p-4 w-full flex items-center justify-center">
                <CassetteDeck currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
              </div>
            ) : (
              <GramophoneCanvas />
            )}
          </div>

          {/* Right Column: Track Information, Sonic Notes, Controls */}
          <div
            className={`w-full lg:w-1/2 space-y-4 max-w-lg bg-black/55 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/15 shadow-2xl ${
              mobileTab === 'stage' ? 'block' : 'block'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-wider">
                  {currentSong.mood}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-mono uppercase">
                  {currentSong.genre || 'Acoustic Soundscape'}
                </span>
              </div>
              <h1 className="font-display italic text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-tight drop-shadow">
                {currentSong.title}
              </h1>
              <p className="text-sm sm:text-base text-amber-200/80 mt-0.5">{currentSong.artist}</p>
            </div>

            {/* Liner Notes / Sonic Architecture */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-amber-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SONIC ARCHITECTURE & ACOUSTICS</span>
                </div>
                <span className="text-amber-300 font-bold">{currentSong.baseFreq?.toFixed(1) || '174.0'} Hz</span>
              </div>
              <p className="text-xs text-[#d4ceeb] leading-relaxed italic">
                "Composed around fundamental {currentSong.baseFreq?.toFixed(1) || '174.0'} Hz with harmonic ratio{' '}
                {currentSong.valence?.toFixed(2) || '0.75'}. Rendered dynamically with physical acoustic modeling."
              </p>
            </div>

            {/* Playback Seekbar */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-2 accent-amber-400 bg-white/20 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-amber-200/80">
                <span>{formatTime(currentTime)}</span>
                <span className="text-emerald-400 font-semibold">{isPlaying ? '• Playing Live' : 'Paused'}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Action Buttons & Play Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => toggleLike(currentSong.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isLiked ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' : 'text-amber-100'
                  }`}
                  title="Favorite Track"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => openAddToPlaylistModal(currentSong.id)}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/15 text-amber-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Add to Playlist"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openShareModal(currentSong.id)}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/15 text-amber-100 hover:bg-white/10 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Share Track"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Central Playback Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={playPrev}
                  className="p-2 text-amber-200 hover:text-white hover:scale-110 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Previous Track"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer font-bold"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={playNext}
                  className="p-2 text-amber-200 hover:text-white hover:scale-110 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Next Track"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Vintage Hi-Fi Master Volume Control Panel */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-4 bg-gradient-to-r from-black/60 via-[#12101b]/70 to-black/60 p-4 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Classic Metallic Rotary Knob */}
                <ClassicVolumeKnob
                  volume={volume}
                  onChange={setVolume}
                  size="md"
                  showLabel={true}
                />

                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Master Gain</span>
                  </div>
                  <div className="text-[11px] text-[#a79fbf] font-mono leading-tight">
                    {volume === 0
                      ? 'Amplifier Muted'
                      : `Gain Output: ${Math.round(volume * 100)}%`}
                  </div>
                  <div className="text-[10px] text-amber-400/70 font-mono">
                    Drag / Scroll / Click Dots
                  </div>
                </div>
              </div>

              {/* Acoustic Specs & Mode */}
              <div className="text-right space-y-1 border-l border-white/10 pl-3 sm:pl-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Acoustic Engine</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                  {currentSong.baseFreq?.toFixed(1) || '432.0'} Hz
                </div>
                <div className="text-[10px] font-mono text-emerald-400">
                  {isPlaying ? 'Phase Active' : 'Standby'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


