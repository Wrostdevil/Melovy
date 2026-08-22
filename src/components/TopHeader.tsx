import React, { useRef } from 'react';
import { usePlayer } from '../lib/playerContext';
import { useTheme } from '../lib/themeContext';
import { Search, Activity, Bell, Music2, Menu, Palette, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface TopHeaderProps {
  onOpenSearch: () => void;
  onOpenMobileDrawer?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSearch, onOpenMobileDrawer }) => {
  const { showToast, setIsSpotifyModalOpen, importLocalAudioFiles } = usePlayer();
  const { visualizerOn, toggleVisualizer, setIsGenreArtModalOpen, setCustomGenreArtwork, updateBgSettings, themeLabel } = useTheme();
  
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);

  const handleAudioFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalAudioFiles(e.target.files);
    }
  };

  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomGenreArtwork('custom_bg', dataUrl);
        updateBgSettings({ activeGenreOverride: 'custom_bg' });
        showToast("Custom background image updated successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header id="topbar" className="sticky top-0 z-20 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-7 py-3 md:py-4 bg-[#070e14]/85 backdrop-blur-md border-b border-[#d4af37]/20">
      {/* Hidden file inputs for instant zero-friction upload */}
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
        multiple
        onChange={handleAudioFiles}
        className="hidden"
      />
      <input
        ref={bgInputRef}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp"
        onChange={handleBgFile}
        className="hidden"
      />

      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-2 md:hidden">
        {onOpenMobileDrawer && (
          <button
            onClick={onOpenMobileDrawer}
            className="p-2 rounded-xl bg-[#10212c] border border-[#d4af37]/20 text-[#d4c5a9] hover:text-white"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#e88d30] shadow-[0_0_10px_rgba(212,175,55,0.4)] shrink-0 flex items-center justify-center text-[11px] font-bold text-[#070e14]">
            M
          </div>
          <span className="font-display font-bold text-lg text-[#fdfbf7]">Melovy</span>
        </div>
      </div>

      {/* Search Pill */}
      <button
        onClick={onOpenSearch}
        className="flex-1 max-w-[380px] flex items-center gap-2 bg-[#10212c]/80 border border-[#d4af37]/20 hover:border-[#d4af37]/50 rounded-full px-3.5 md:px-4 py-2 md:py-2.5 text-[#8e806a] text-xs md:text-[13.5px] transition-all text-left"
      >
        <Search className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-[#d4af37]" />
        <span className="truncate">Search songs, ragas, artists, moods…</span>
      </button>

      {/* Top Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Play/Upload Local Music Button */}
        <button
          onClick={() => audioInputRef.current?.click()}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] hover:brightness-110 transition-all text-[11px] sm:text-xs font-bold shrink-0 shadow-[0_2px_10px_rgba(212,175,55,0.3)] cursor-pointer min-h-[36px]"
          title="Play Any Music: Upload MP3/WAV/Audio Files from Your Device"
        >
          <UploadCloud className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Play My Music</span>
          <span className="sm:hidden font-mono text-[10px]">Audio</span>
        </button>

        {/* Set Custom Background Image Button */}
        <button
          onClick={() => bgInputRef.current?.click()}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10212c] border border-[#d4af37]/30 text-[#d4c5a9] hover:text-white hover:border-[#d4af37] transition-all text-xs font-semibold shrink-0 cursor-pointer min-h-[36px]"
          title="Set Custom Background: Pick your uploaded background artwork"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Backdrop</span>
        </button>

        {/* Genre Art & Theme Button */}
        <button
          onClick={() => setIsGenreArtModalOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fcd34d] hover:bg-[#d4af37]/25 hover:border-[#d4af37] transition-all text-[11px] sm:text-xs font-semibold shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)] min-h-[36px]"
          title="Genre Art & Visual Theme Settings"
        >
          <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="hidden sm:inline">Theme & Art</span>
          <span className="sm:hidden font-mono text-[10px]">Art</span>
        </button>

        <button
          onClick={() => setIsSpotifyModalOpen(true)}
          className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] hover:bg-[#1DB954]/20 transition-all text-[11px] sm:text-xs font-semibold shrink-0 min-h-[36px]"
          title="Connect Spotify Playlist"
        >
          <Music2 className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Spotify</span>
        </button>

        <button
          onClick={() => {
            toggleVisualizer();
            showToast("Ambient visualizer " + (!visualizerOn ? "on" : "off"));
          }}
          className={`w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-full bg-[#10212c] border border-[#d4af37]/20 flex items-center justify-center text-[#d4c5a9] hover:text-[#fdfbf7] hover:border-[#d4af37] transition-all min-w-[36px] min-h-[36px] ${
            visualizerOn ? 'text-[#d4af37] border-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.25)]' : ''
          }`}
          title="Toggle ambient visualizer"
          aria-label="Toggle ambient visualizer"
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={() => showToast("Melovy Heritage Edition is active")}
          className="hidden sm:flex w-8 h-8 md:w-[38px] md:h-[38px] rounded-full bg-[#10212c] border border-[#d4af37]/20 items-center justify-center text-[#d4c5a9] hover:text-[#fdfbf7] hover:border-[#d4af37] transition-all"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </header>
  );
};

