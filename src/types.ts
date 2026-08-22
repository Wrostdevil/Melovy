export type NavTab = 'home' | 'search' | 'library' | 'canvas' | 'discovery' | 'rooms' | 'dna';

export type MoodType = 
  | 'chill' 
  | 'energetic' 
  | 'romantic' 
  | 'melancholic' 
  | 'acoustic' 
  | 'focus' 
  | 'nostalgic' 
  | 'happy' 
  | 'night'
  | 'Calm';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  genre: string;
  mood: MoodType;
  colors: [string, string];
  baseFreq: number;
  energy: number;
  valence: number;
  vibeCoordinates?: { x: number; y: number };
  discoveryScore?: number;
  lyrics?: LyricLine[];
  releaseYear?: number;
  bpm?: number;
  ambientColor?: string;
  spotifyId?: string;
  spotifyUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  desc: string;
  color: [string, string];
  trackIds: string[];
  isSpotifyImport?: boolean;
  spotifyUrl?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  me?: boolean;
}

export interface VibeRoom {
  id: string;
  name: string;
  emoji: string;
  mood: MoodType;
  listeners: number;
  desc?: string;
  currentSongId?: string;
  chatMessages?: ChatMessage[];
}

export interface MusicDNABar {
  mood: string;
  pct: number;
}

export type ThemeMode = 'royal-heritage' | 'midnight' | 'aurora' | 'neon' | 'lotus-sunset' | 'emerald-peacock' | 'editorial-parchment' | 'editorial-noir' | 'retro-vinyl' | 'minimal';

export type PlayerMode = 'compact' | 'immersive';
export type VisualizerMode = 'on' | 'off';
export type GramophoneQuality = 'high' | 'medium' | 'low' | 'reduced' | 'motion-off';

