import React, { useState } from 'react';
import { useTheme } from '../lib/themeContext';
import { usePlayer } from '../lib/playerContext';
import { GENRE_ARTWORKS } from '../data/genreArt';
import { ThemeMode } from '../types';
import {
  Palette,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  X,
  Sliders,
  RotateCcw,
  Sun,
  Eye
} from 'lucide-react';

export const GenreArtModal: React.FC = () => {
  const {
    isGenreArtModalOpen,
    setIsGenreArtModalOpen,
    theme,
    setTheme,
    themeLabel,
    genreArt,
    customArtworks,
    setCustomGenreArtwork,
    resetGenreArtwork,
    bgSettings,
    updateBgSettings
  } = useTheme();

  const { showToast } = usePlayer();

  const [activeTab, setActiveTab] = useState<'artworks' | 'theme' | 'fx'>('artworks');
  const [urlInput, setUrlInput] = useState('');
  const [selectedGenreKey, setSelectedGenreKey] = useState<string>('indian-classical');

  if (!isGenreArtModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomGenreArtwork(selectedGenreKey, result);
        updateBgSettings({ activeGenreOverride: selectedGenreKey });
        showToast(`Custom artwork applied to ${GENRE_ARTWORKS[selectedGenreKey]?.genre || selectedGenreKey}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setCustomGenreArtwork(selectedGenreKey, urlInput.trim());
    updateBgSettings({ activeGenreOverride: selectedGenreKey });
    showToast(`Artwork URL set for ${GENRE_ARTWORKS[selectedGenreKey]?.genre}!`);
    setUrlInput('');
  };

  const themesList: Array<{ id: ThemeMode; name: string; desc: string; colors: string[] }> = [
    {
      id: 'royal-heritage',
      name: 'Royal Raga Heritage',
      desc: 'Ornate Mughal gold, peacock teal, sitar amber & lotus accents',
      colors: ['#d4af37', '#f59e0b', '#0c2633', '#e26b8d']
    },
    {
      id: 'lotus-sunset',
      name: 'Lotus Bloom Sunset',
      desc: 'Warm rose gold, sunset magenta & evening terracotta',
      colors: ['#f472b6', '#e11d48', '#f59e0b', '#291222']
    },
    {
      id: 'emerald-peacock',
      name: 'Emerald Peacock',
      desc: 'Deep imperial jade, emerald plumage & golden accents',
      colors: ['#34d399', '#059669', '#facc15', '#0e2921']
    },
    {
      id: 'midnight',
      name: 'Midnight Aura',
      desc: 'Classic violet neon, dark indigo & electric magenta',
      colors: ['#9b6bff', '#e057c1', '#15121e', '#4fd6e8']
    },
    {
      id: 'aurora',
      name: 'Aurora Breeze',
      desc: 'Ethereal teal, crystalline cyan & northern blue',
      colors: ['#5ee6c5', '#6ba8ff', '#0f1a24', '#9df3d1']
    },
    {
      id: 'neon',
      name: 'Neon Cyber',
      desc: 'High contrast ultraviolet, electric pink & cyber cyan',
      colors: ['#ff5ecb', '#7c4dff', '#00e5ff', '#150e1c']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadein select-none">
      <div className="relative w-full max-w-[780px] max-h-[88vh] bg-[#0b1720] border border-[#d4af37]/35 rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-[#fdfbf7]">
        {/* Header with Ornate Golden Border */}
        <div className="relative px-6 py-5 border-b border-[#d4af37]/20 flex items-center justify-between bg-gradient-to-r from-[#10212c] via-[#0b1720] to-[#10212c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#e88d30] flex items-center justify-center text-[#070e14] shadow-[0_4px_16px_rgba(212,175,55,0.4)] font-display font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-medium tracking-wide flex items-center gap-2">
                Genre Art & Visual Aesthetic
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f59e0b] font-mono uppercase">
                  {themeLabel}
                </span>
              </h2>
              <p className="text-xs text-[#d4c5a9]/80 mt-0.5">
                Customize website backgrounds per genre, upload artwork, or refine the visual atmosphere.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGenreArtModalOpen(false)}
            className="p-2 rounded-xl text-[#d4c5a9] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-[#081219]/60">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'artworks'
                ? 'border-[#d4af37] text-[#fcd34d]'
                : 'border-transparent text-[#92846d] hover:text-[#d4c5a9]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Genre Wallpapers
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-[#d4af37] text-[#fcd34d]'
                : 'border-transparent text-[#92846d] hover:text-[#d4c5a9]'
            }`}
          >
            <Sun className="w-4 h-4" />
            Theme Palette
          </button>

          <button
            onClick={() => setActiveTab('fx')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'fx'
                ? 'border-[#d4af37] text-[#fcd34d]'
                : 'border-transparent text-[#92846d] hover:text-[#d4c5a9]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Atmosphere & Particles
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'artworks' && (
            <div className="space-y-6">
              {/* Active Art Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/40 h-44 flex items-end p-5 shadow-lg group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${genreArt.image}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070e14] via-[#070e14]/50 to-transparent" />
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Active Genre Wallpaper · {genreArt.genre}
                    </div>
                    <div className="font-display text-2xl font-normal text-white mt-1">
                      {genreArt.title}
                    </div>
                    <div className="text-xs text-[#d4c5a9] max-w-[480px] line-clamp-1 mt-0.5">
                      {genreArt.subtitle}
                    </div>
                  </div>

                  {bgSettings.activeGenreOverride && (
                    <button
                      onClick={() => updateBgSettings({ activeGenreOverride: null })}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-[#d4c5a9] hover:text-white flex items-center gap-1.5 backdrop-blur-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Auto-sync with track
                    </button>
                  )}
                </div>
              </div>

              {/* Upload or Link Custom Artwork Section */}
              <div className="p-4 rounded-xl bg-[#10212c]/80 border border-[#d4af37]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#fcd34d] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Image for Genre
                  </div>
                  <select
                    value={selectedGenreKey}
                    onChange={(e) => setSelectedGenreKey(e.target.value)}
                    className="bg-[#0b1720] border border-[#d4af37]/30 text-xs rounded-lg px-2.5 py-1 text-[#fdfbf7] focus:outline-none"
                  >
                    {Object.values(GENRE_ARTWORKS).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-[#d4af37]/40 hover:border-[#d4af37] bg-[#0b1720]/60 cursor-pointer text-xs font-medium text-[#d4c5a9] hover:text-white transition-all">
                    <Upload className="w-4 h-4 text-[#d4af37]" />
                    <span>Choose / Drop image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Or paste direct image URL..."
                      className="flex-1 bg-[#0b1720] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e806a] focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      onClick={handleApplyUrl}
                      className="px-4 py-2 rounded-xl bg-[#d4af37] text-[#070e14] font-semibold text-xs hover:brightness-110 shrink-0"
                    >
                      Set
                    </button>
                  </div>
                </div>

                {customArtworks[selectedGenreKey] && (
                  <div className="flex items-center justify-between text-xs text-[#a3e635] pt-1">
                    <span>Custom image currently active for this genre</span>
                    <button
                      onClick={() => {
                        resetGenreArtwork(selectedGenreKey);
                        showToast(`Reset ${GENRE_ARTWORKS[selectedGenreKey]?.genre} to default artwork.`);
                      }}
                      className="text-xs text-[#fb7185] hover:underline"
                    >
                      Reset to default
                    </button>
                  </div>
                )}
              </div>

              {/* Genre Grid Selector */}
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#92846d] mb-3">
                  Select Genre to preview or lock background:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.values(GENRE_ARTWORKS).map((item) => {
                    const isSelected = (bgSettings.activeGenreOverride || genreArt.id) === item.id;
                    const imgSrc = customArtworks[item.id] || item.image;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          updateBgSettings({ activeGenreOverride: item.id });
                          showToast(`Background set to ${item.title}`);
                        }}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all h-28 flex flex-col justify-end p-2.5 ${
                          isSelected
                            ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 shadow-lg scale-[1.02]'
                            : 'border-white/10 hover:border-[#d4af37]/50'
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url("${imgSrc}")` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070e14] via-[#070e14]/60 to-transparent" />
                        
                        <div className="relative z-10">
                          {isSelected && (
                            <div className="absolute top-[-44px] right-0 w-5 h-5 rounded-full bg-[#d4af37] text-[#070e14] flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="text-[10px] font-mono text-[#d4af37] truncate font-semibold">
                            {item.genre}
                          </div>
                          <div className="text-xs font-medium text-white truncate">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <p className="text-xs text-[#d4c5a9]">
                Choose the color palette and decorative styling of the entire interface. The <b>Royal Raga Heritage</b> theme matches your ornate Indian Classical sunset aesthetic.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {themesList.map((t) => {
                  const isCurrent = theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        showToast(`Theme changed to ${t.name}`);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#d4af37] bg-[#162c3a]/80 shadow-[0_8px_24px_rgba(212,175,55,0.2)]'
                          : 'border-white/10 bg-[#10212c]/40 hover:border-[#d4af37]/40 hover:bg-[#10212c]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-display font-medium text-sm text-white flex items-center gap-2">
                          {t.name}
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {t.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#92846d]">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'fx' && (
            <div className="space-y-6">
              {/* Opacity Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-[#10212c]/50 border border-white/10">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#fdfbf7]">Background Wallpaper Opacity</span>
                  <span className="text-[#d4af37] font-mono">{Math.round(bgSettings.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.05"
                  value={bgSettings.opacity}
                  onChange={(e) => updateBgSettings({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#d4af37]"
                />
              </div>

              {/* Blur Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-[#10212c]/50 border border-white/10">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#fdfbf7]">Artwork Blur Depth</span>
                  <span className="text-[#d4af37] font-mono">{bgSettings.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={bgSettings.blur}
                  onChange={(e) => updateBgSettings({ blur: parseInt(e.target.value) })}
                  className="w-full accent-[#d4af37]"
                />
              </div>

              {/* Particle Type */}
              <div className="space-y-2 p-4 rounded-xl bg-[#10212c]/50 border border-white/10">
                <span className="text-xs font-semibold text-[#fdfbf7]">Ambient Floating Particles</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                  {[
                    { id: 'lotus', label: '🌸 Lotus Petals' },
                    { id: 'gold-dust', label: '✨ Golden Dust' },
                    { id: 'fireflies', label: '💡 Fireflies' },
                    { id: 'stars', label: '⭐ Stars' },
                    { id: 'notes', label: '🎵 Music Notes' },
                    { id: 'off', label: 'Off' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => updateBgSettings({ particles: p.id as any })}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                        bgSettings.particles === p.id
                          ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#fcd34d]'
                          : 'border-white/10 text-[#92846d] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vignette Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#10212c]/50 border border-white/10">
                <div>
                  <div className="text-xs font-semibold text-white">Vignette & Contrast Protection</div>
                  <div className="text-[11px] text-[#92846d]">
                    Darkens container edges to ensure text and buttons remain ultra-legible
                  </div>
                </div>
                <button
                  onClick={() => updateBgSettings({ vignette: !bgSettings.vignette })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    bgSettings.vignette
                      ? 'bg-[#d4af37] text-[#070e14]'
                      : 'bg-white/10 text-[#92846d]'
                  }`}
                >
                  {bgSettings.vignette ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#d4af37]/20 bg-[#081219] flex items-center justify-between">
          <div className="text-xs text-[#92846d] font-mono">
            ✨ Changes apply in real-time
          </div>
          <button
            onClick={() => setIsGenreArtModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] font-semibold text-xs shadow-md hover:brightness-110 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
