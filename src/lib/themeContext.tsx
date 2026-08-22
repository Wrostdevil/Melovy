import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, MoodType } from '../types';
import { GENRE_ARTWORKS, GenreArtConfig, getGenreArt } from '../data/genreArt';

const MOOD_COLORS: Record<string, [string, string, string]> = {
  chill: ["rgba(212,175,55,.24)", "rgba(232,141,48,.18)", "rgba(12,38,51,.20)"],
  energetic: ["rgba(255,0,127,.30)", "rgba(245,158,11,.22)", "rgba(121,40,202,.18)"],
  romantic: ["rgba(244,114,182,.32)", "rgba(225,29,72,.20)", "rgba(245,158,11,.12)"],
  melancholic: ["rgba(59,130,246,.25)", "rgba(30,58,138,.20)", "rgba(14,165,233,.10)"],
  acoustic: ["rgba(245,158,11,.28)", "rgba(146,64,14,.22)", "rgba(217,119,6,.15)"],
  focus: ["rgba(45,212,191,.26)", "rgba(8,47,73,.22)", "rgba(20,184,166,.12)"],
  nostalgic: ["rgba(212,175,55,.25)", "rgba(180,83,9,.18)", "rgba(120,53,15,.12)"],
  happy: ["rgba(251,191,36,.30)", "rgba(234,88,12,.22)", "rgba(244,114,182,.14)"],
  night: ["rgba(8,23,32,.40)", "rgba(12,38,51,.30)", "rgba(212,175,55,.10)"]
};

export interface BgSettings {
  opacity: number;
  blur: number;
  particles: 'lotus' | 'gold-dust' | 'stars' | 'fireflies' | 'notes' | 'off';
  vignette: boolean;
  activeGenreOverride: string | null;
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  cycleTheme: () => void;
  applyMoodAmbient: (mood: MoodType | string) => void;
  visualizerOn: boolean;
  toggleVisualizer: () => void;
  themeLabel: string;
  // Genre Art & Background System
  genreArt: GenreArtConfig;
  setGenreArtByGenreOrMood: (genreOrMood: string) => void;
  customArtworks: Record<string, string>;
  setCustomGenreArtwork: (genreId: string, imageUrl: string) => void;
  resetGenreArtwork: (genreId: string) => void;
  bgSettings: BgSettings;
  updateBgSettings: (settings: Partial<BgSettings>) => void;
  isGenreArtModalOpen: boolean;
  setIsGenreArtModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_THEME_KEY = 'melovy_theme_mode';
const LOCAL_STORAGE_ART_KEY = 'melovy_custom_genre_artworks';
const LOCAL_STORAGE_BG_SETTINGS_KEY = 'melovy_bg_settings';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (saved) return saved as ThemeMode;
    } catch (_) {}
    return 'royal-heritage';
  });

  const [visualizerOn, setVisualizerOn] = useState<boolean>(true);
  const [isGenreArtModalOpen, setIsGenreArtModalOpen] = useState<boolean>(false);

  const [customArtworks, setCustomArtworks] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ART_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });

  const [bgSettings, setBgSettings] = useState<BgSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BG_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      opacity: 0.48,
      blur: 0,
      particles: 'lotus',
      vignette: true,
      activeGenreOverride: null
    };
  });

  const [currentGenreKey, setCurrentGenreKey] = useState<string>('indian-classical');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
    } catch (_) {}
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = [
      'royal-heritage',
      'lotus-sunset',
      'emerald-peacock',
      'midnight',
      'aurora',
      'neon'
    ];
    const idx = (themes.indexOf(theme) + 1) % themes.length;
    const nextTheme = themes[idx];
    setThemeState(nextTheme);
  };

  const applyMoodAmbient = (mood: MoodType | string) => {
    const key = mood.toLowerCase();
    const c = MOOD_COLORS[key] || MOOD_COLORS.chill;
    document.documentElement.style.setProperty("--mood-a", c[0]);
    document.documentElement.style.setProperty("--mood-b", c[1]);
    document.documentElement.style.setProperty("--mood-c", c[2]);
    setGenreArtByGenreOrMood(mood);
  };

  const setGenreArtByGenreOrMood = (genreOrMood: string) => {
    if (bgSettings.activeGenreOverride) return;
    const art = getGenreArt(genreOrMood);
    setCurrentGenreKey(art.id);
  };

  const setCustomGenreArtwork = (genreId: string, imageUrl: string) => {
    const updated = { ...customArtworks, [genreId]: imageUrl };
    setCustomArtworks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_ART_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const resetGenreArtwork = (genreId: string) => {
    const updated = { ...customArtworks };
    delete updated[genreId];
    setCustomArtworks(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_ART_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const updateBgSettings = (settings: Partial<BgSettings>) => {
    const next = { ...bgSettings, ...settings };
    setBgSettings(next);
    try {
      localStorage.setItem(LOCAL_STORAGE_BG_SETTINGS_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  const toggleVisualizer = () => {
    const next = !visualizerOn;
    setVisualizerOn(next);
    const ambientEl = document.getElementById("ambient");
    if (ambientEl) {
      ambientEl.style.opacity = next ? "1" : "0.15";
    }
  };

  // Resolve base genre art with custom image if user uploaded/linked one
  const baseGenreArt = GENRE_ARTWORKS[bgSettings.activeGenreOverride || currentGenreKey] || GENRE_ARTWORKS['indian-classical'];
  const resolvedImage = customArtworks[baseGenreArt.id] || baseGenreArt.image;
  const genreArt: GenreArtConfig = {
    ...baseGenreArt,
    image: resolvedImage
  };

  const themeLabelMap: Record<ThemeMode, string> = {
    'royal-heritage': "Royal Raga Heritage",
    'lotus-sunset': "Lotus Bloom Sunset",
    'emerald-peacock': "Emerald Peacock",
    'midnight': "Midnight Aura",
    'aurora': "Aurora Breeze",
    'neon': "Neon Cyber",
    'editorial-parchment': "Vedic Parchment",
    'editorial-noir': "Obsidian Gold",
    'retro-vinyl': "Vintage Gramophone",
    'minimal': "Pure Minimal"
  };

  const themeLabel = themeLabelMap[theme] || "Royal Raga Heritage";

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      cycleTheme,
      applyMoodAmbient,
      visualizerOn,
      toggleVisualizer,
      themeLabel,
      genreArt,
      setGenreArtByGenreOrMood,
      customArtworks,
      setCustomGenreArtwork,
      resetGenreArtwork,
      bgSettings,
      updateBgSettings,
      isGenreArtModalOpen,
      setIsGenreArtModalOpen
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
