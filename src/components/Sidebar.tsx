import React from 'react';
import { usePlayer } from '../lib/playerContext';
import { useTheme } from '../lib/themeContext';
import { Home, Search, Library, Disc, Sliders, Dna, Users, Plus, Sun, Music2, X, Palette, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenNewPlaylist: () => void;
  onOpenPlaylistDetail: (playlistId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewPlaylist,
  onOpenPlaylistDetail,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { playlists, setIsSpotifyModalOpen } = usePlayer();
  const { cycleTheme, themeLabel, setIsGenreArtModalOpen } = useTheme();

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col gap-6 h-full overflow-y-auto select-none p-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-[32px] h-[32px] rounded-[10px] bg-gradient-to-br from-[#d4af37] to-[#e88d30] relative shrink-0 shadow-[0_4px_18px_rgba(212,175,55,0.4)] flex items-center justify-center font-bold text-[#070e14] text-xs">
            M
          </div>
          <div>
            <div className="font-display font-medium text-[20px] tracking-wide text-[#fdfbf7]">Melovy</div>
            <div className="text-[10px] text-[#d4af37] tracking-[0.14em] uppercase -mt-0.5 font-mono">Heritage Audio</div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 text-[#d4c5a9] hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col gap-0.5">
        <button
          onClick={() => handleSelectTab('home')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'home' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Home className="w-[18px] h-[18px] opacity-85" />
          <span>Home</span>
          {activeTab === 'home' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => handleSelectTab('search')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'search' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Search className="w-[18px] h-[18px] opacity-85" />
          <span>Search & Ragas</span>
          {activeTab === 'search' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => handleSelectTab('library')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'library' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Library className="w-[18px] h-[18px] opacity-85" />
          <span>Library</span>
          {activeTab === 'library' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>
      </nav>

      {/* Discovery Nav */}
      <nav className="flex flex-col gap-0.5">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#8e806a] px-3 py-1 font-semibold">Discovery</div>
        <button
          onClick={() => handleSelectTab('canvas')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'canvas' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Disc className="w-[18px] h-[18px] opacity-85" />
          <span>Vibe Canvas</span>
          {activeTab === 'canvas' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => handleSelectTab('discovery')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'discovery' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Sliders className="w-[18px] h-[18px] opacity-85" />
          <span>Discovery Slider</span>
          {activeTab === 'discovery' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => handleSelectTab('dna')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'dna' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Dna className="w-[18px] h-[18px] opacity-85" />
          <span>Music DNA</span>
          {activeTab === 'dna' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => handleSelectTab('rooms')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left ${
            activeTab === 'rooms' ? '!bg-[#162c3a] !text-[#fcd34d] border-l-2 border-[#d4af37]' : ''
          }`}
        >
          <Users className="w-[18px] h-[18px] opacity-85" />
          <span>Vibe Rooms</span>
          {activeTab === 'rooms' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
        </button>

        <button
          onClick={() => {
            setIsGenreArtModalOpen(true);
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#fcd34d] bg-[#d4af37]/10 border border-[#d4af37]/30 hover:bg-[#d4af37]/20 transition-all text-left mt-1"
        >
          <Palette className="w-[18px] h-[18px] text-[#d4af37]" />
          <span>Genre Backgrounds</span>
          <Sparkles className="w-3.5 h-3.5 ml-auto text-[#d4af37]" />
        </button>
      </nav>

      {/* Your Playlists */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#8e806a] px-3 py-1 font-semibold">Your Playlists</div>
        <div className="overflow-y-auto flex flex-col gap-0.5 flex-1 pr-1">
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => {
                handleSelectTab('library');
                onOpenPlaylistDetail(pl.id);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] text-[#d4c5a9] hover:bg-[#162c3a]/70 hover:text-[#fdfbf7] transition-all text-left w-full truncate"
            >
              <div
                className="w-6 h-6 rounded-md shrink-0"
                style={{ background: `linear-gradient(135deg, ${pl.color[0]}, ${pl.color[1]})` }}
              />
              <span className="truncate">{pl.name}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={() => {
              onOpenNewPlaylist();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-[12px] text-[#d4c5a9] py-2 border border-dashed border-[#d4af37]/30 rounded-lg hover:text-[#fdfbf7] hover:border-[#d4af37] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={() => {
              setIsSpotifyModalOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-[12px] text-[#1DB954] py-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg hover:bg-[#1DB954]/20 transition-all font-semibold"
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Spotify</span>
          </button>
        </div>
      </div>

      {/* Footer Profile & Theme Toggle */}
      <div className="flex items-center gap-2.5 pt-3.5 border-t border-[#d4af37]/20">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#e88d30] shrink-0 flex items-center justify-center font-display text-sm font-semibold text-[#070e14]">
          L
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-[#fdfbf7] truncate">Listener</div>
          <div className="text-[11px] text-[#8e806a] truncate">{themeLabel}</div>
        </div>
        <button
          onClick={cycleTheme}
          className="w-8 h-8 rounded-lg bg-[#10212c] border border-[#d4af37]/25 flex items-center justify-center text-[#d4c5a9] hover:text-[#fdfbf7] hover:border-[#d4af37] transition-all shadow-sm"
          title="Switch theme"
          aria-label="Switch theme"
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside id="sidebar" className="hidden md:flex w-[250px] bg-[#070e14]/90 backdrop-blur-md border-r border-[#d4af37]/20 shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-[280px] max-w-[80vw] bg-[#070e14] border-r border-[#d4af37]/25 h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
