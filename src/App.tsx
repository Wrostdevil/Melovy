import React, { useState } from 'react';
import { ThemeProvider } from './lib/themeContext';
import { PlayerProvider, usePlayer } from './lib/playerContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { VibeCanvas } from './components/VibeCanvas';
import { DiscoverySlider } from './components/DiscoverySlider';
import { MusicDNA } from './components/MusicDNA';
import { VibeRooms } from './components/VibeRooms';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { MobileNav } from './components/MobileNav';
import { GenreBackground } from './components/GenreBackground';
import { ImmersivePlayer } from './components/ImmersivePlayer';
import { AIDiscoveryModal } from './components/AIDiscoveryModal';
import { Modals } from './components/Modals';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    isImmersiveOpen,
    setIsImmersiveOpen,
    setIsSearchModalOpen,
    setIsPlaylistModalOpen,
    openPlaylist,
  } = usePlayer();

  const [isAIDiscoveryOpen, setIsAIDiscoveryOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleOpenPlaylistDetail = (plId: string) => {
    openPlaylist(plId);
  };

  return (
    <div className="flex h-screen w-screen bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden relative selection:bg-[#d4af37] selection:text-[#070e14]">
      {/* Dynamic Background Genre Artwork & Ambient Mesh */}
      <GenreBackground />

      {/* Sidebar Navigation (Desktop Static + Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPlaylist={() => setIsPlaylistModalOpen(true)}
        onOpenPlaylistDetail={handleOpenPlaylistDetail}
        isOpenMobile={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden pb-[110px] md:pb-24">
        {/* Top Ticker */}
        <div className="bg-[#120f1a] text-[#a79fbf] text-[9px] font-mono uppercase tracking-[0.25em] py-1 px-4 overflow-hidden flex items-center border-b border-white/5 shrink-0 select-none">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            className="whitespace-nowrap flex items-center gap-8 shrink-0"
          >
            <span>MELOVY ACOUSTIC ARCHIVE ISSUE 08</span>
            <span className="text-[#9b6bff]">●</span>
            <span>GENERATIVE SYNTHESIZER & 3D GRAMOPHONE</span>
            <span className="text-[#9b6bff]">●</span>
            <span>NOCTURNAL LO-FI ACOUSTICS & LIVE SALONS</span>
            <span className="text-[#9b6bff]">●</span>
            <span>GEMINI AI VIBE CURATION</span>
            <span className="text-[#9b6bff]">●</span>
            <span>SPOTIFY OAUTH & LIVE PLAYLIST IMPORT</span>
          </motion.div>
        </div>

        {/* Top Navigation Header */}
        <TopHeader
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* View Switcher Container */}
        <main className="flex-1 overflow-y-auto px-3.5 md:px-7 py-3 md:py-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
              {activeTab === 'search' && <SearchView />}
              {activeTab === 'library' && <LibraryView />}
              {activeTab === 'canvas' && <VibeCanvas />}
              {activeTab === 'discovery' && <DiscoverySlider />}
              {activeTab === 'rooms' && <VibeRooms />}
              {activeTab === 'dna' && <MusicDNA />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Bottom Compact Player Bar */}
      <BottomPlayerBar />

      {/* Mobile Bottom Tab Bar */}
      <MobileNav />

      {/* Fullscreen 3D Gramophone & DSP Immersive Player */}
      {isImmersiveOpen && (
        <ImmersivePlayer onClose={() => setIsImmersiveOpen(false)} />
      )}

      {/* Gemini AI Natural Language Discovery Modal */}
      <AIDiscoveryModal
        isOpen={isAIDiscoveryOpen}
        onClose={() => setIsAIDiscoveryOpen(false)}
      />

      {/* Global Modals & Toasts */}
      <Modals />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </ThemeProvider>
  );
}
