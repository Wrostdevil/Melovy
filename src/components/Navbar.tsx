import React, { useState } from 'react';
import { useTheme } from '../lib/themeContext';
import { ThemeMode } from '../types';
import { Palette, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAIDiscovery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAIDiscovery }) => {
  const { theme, setTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const themesList: { id: ThemeMode; label: string; previewColor: string }[] = [
    { id: 'editorial-parchment', label: 'Editorial Parchment', previewColor: 'bg-[#F4F1EA] border border-[#1A1A1A]/20' },
    { id: 'editorial-noir', label: 'Editorial Noir', previewColor: 'bg-[#121212] border border-[#CC4422]' },
    { id: 'retro-vinyl', label: 'Vinyl Amber', previewColor: 'bg-[#E3DCCE] border border-[#C85A28]' },
    { id: 'minimal', label: 'Minimal Studio', previewColor: 'bg-[#FAFAFA] border border-[#111111]/30' },
  ];

  const navItems = [
    { id: 'home', label: 'Essays' },
    { id: 'vibe-canvas', label: 'Vibe Canvas' },
    { id: 'discovery', label: 'Indices' },
    { id: 'vibe-rooms', label: 'Dialogues' },
    { id: 'music-dna', label: 'Photometry' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F4F1EA]/95 border-b border-[#1A1A1A]/15 backdrop-blur-md px-6 sm:px-10 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand Logo & Issue Vol Tag */}
        <motion.div 
          onClick={() => setActiveTab('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-4 h-4 bg-[#CC4422] rounded-full shrink-0 animate-pulse" />
            <span className="absolute w-6 h-6 border border-[#CC4422] rounded-full animate-ping opacity-40" />
          </div>
          <div>
            <div className="text-[10px] font-sans tracking-[0.3em] font-bold text-[#1A1A1A]/60 uppercase">
              ARCHIVE / VOL. 42
            </div>
            <span className="text-2xl font-serif font-black tracking-tight text-[#1A1A1A] group-hover:text-[#CC4422] transition-colors">
              MELOVY.
            </span>
          </div>
        </motion.div>

        {/* Center Editorial Nav Links with Motion Layout Indicator */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-sans uppercase tracking-[0.2em] font-bold text-[#1A1A1A] relative">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-1.5 transition-colors ${
                  isActive ? 'text-[#CC4422]' : 'text-[#1A1A1A]/70 hover:text-[#CC4422]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#CC4422]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAIDiscovery}
            className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest font-bold bg-[#1A1A1A] hover:bg-[#CC4422] text-[#F4F1EA] px-4 py-2.5 border border-[#1A1A1A] transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#CC4422] animate-pulse" />
            <span className="hidden sm:inline">AI Curator</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowThemeModal(!showThemeModal)}
            className="p-2.5 bg-[#EAE7DF] border border-[#1A1A1A]/20 text-[#1A1A1A] hover:border-[#CC4422] hover:text-[#CC4422] transition-colors relative"
            title="Theme Palette"
          >
            <Palette className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Theme Selector Modal Dropdown */}
      <AnimatePresence>
        {showThemeModal && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-20 right-8 z-50 w-64 bg-[#F4F1EA] border border-[#1A1A1A]/30 p-4 shadow-xl space-y-2"
          >
            <div className="text-[10px] font-sans font-bold text-[#1A1A1A]/60 uppercase tracking-[0.2em] mb-2 border-b border-[#1A1A1A]/10 pb-1">
              EDITORIAL EDITION PALETTES
            </div>
            <div className="space-y-1">
              {themesList.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setShowThemeModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                    theme === t.id ? 'bg-[#CC4422] text-[#F4F1EA]' : 'text-[#1A1A1A] hover:bg-[#EAE7DF]'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`w-3 h-3 rounded-full ${t.previewColor}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

