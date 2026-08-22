import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song, Playlist, MoodType, VibeRoom, PlayerMode, GramophoneQuality, ChatMessage, NavTab } from '../types';
import { CATALOG, INITIAL_PLAYLISTS, ROOM_DEFS, GRADIENTS } from '../data/musicCatalog';
import { audioEngine } from './audioEngine';
import { useTheme } from './themeContext';

interface PlayerContextType {
  // Navigation State
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Current track & playback
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: boolean;
  currentMood: MoodType;

  // Queue & Lists
  queue: string[]; // Song IDs
  queueIndex: number;
  history: string[]; // Song IDs
  likedSongIds: Set<string>;
  playlists: Playlist[];
  recentlyPlayed: string[];

  // Features state
  discoveryValue: number;
  canvasCoords: { x: number; y: number };
  gramophoneQuality: GramophoneQuality;
  
  // Active room state
  activeRoom: VibeRoom | null;
  roomMessages: ChatMessage[];

  // Modals & Overlay flags
  isImmersiveOpen: boolean;
  isSearchModalOpen: boolean;
  isPlaylistModalOpen: boolean;
  isAddToPlaylistModalOpen: boolean;
  addToPlaylistTargetTrackId: string | null;
  isQueueModalOpen: boolean;
  isShareModalOpen: boolean;
  shareTargetTrackId: string | null;
  isRoomModalOpen: boolean;
  isSpotifyModalOpen: boolean;

  // Spotify Auth & Sync State
  spotifyToken: string | null;
  spotifyUser: any | null;
  allSongs: Song[];

  // Local audio files import
  importLocalAudioFiles: (files: FileList | File[]) => Promise<void>;
  addCustomAudioTrack: (title: string, artist: string, audioUrl: string, mood?: MoodType) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Actions
  playTrack: (trackId: string) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleLike: (trackId: string) => void;
  toggleRepeat: () => void;
  shuffleQueue: () => void;
  setDiscoveryValue: (val: number) => void;
  setCanvasCoords: (coords: { x: number; y: number }) => void;
  setCurrentMood: (mood: MoodType) => void;
  setGramophoneQuality: (quality: GramophoneQuality) => void;

  // Playlists management
  createPlaylist: (name: string, desc: string, colorIndex: number) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  addImportedPlaylist: (playlist: Playlist, newSongs: Song[]) => void;

  // Queue manipulation
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  removeFromQueue: (index: number) => void;

  // Room actions
  openRoom: (room: VibeRoom) => void;
  closeRoom: () => void;
  sendRoomMessage: (text: string) => void;

  // Playlists & Library Navigation
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;
  librarySubTab: 'liked' | 'playlists' | 'recent' | 'uploads';
  setLibrarySubTab: (tab: 'liked' | 'playlists' | 'recent' | 'uploads') => void;
  openPlaylist: (playlistId: string) => void;

  // Modals toggles
  setIsImmersiveOpen: (open: boolean) => void;
  setIsSearchModalOpen: (open: boolean) => void;
  setIsPlaylistModalOpen: (open: boolean) => void;
  openAddToPlaylistModal: (trackId: string) => void;
  closeAddToPlaylistModal: () => void;
  setIsQueueModalOpen: (open: boolean) => void;
  openShareModal: (trackId: string) => void;
  closeShareModal: () => void;
  setIsSpotifyModalOpen: (open: boolean) => void;
  setSpotifyToken: (token: string | null) => void;
  setSpotifyUser: (user: any | null) => void;
  logoutSpotify: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { applyMoodAmbient } = useTheme();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [librarySubTab, setLibrarySubTab] = useState<'liked' | 'playlists' | 'recent' | 'uploads'>('liked');
  const [queue, setQueue] = useState<string[]>(CATALOG.slice(0, 20).map(t => t.id));
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(CATALOG[0].duration);
  const [volume, setVolumeState] = useState<number>(0.7);
  const [repeatMode, setRepeatMode] = useState<boolean>(false);
  const [currentMood, setCurrentMoodState] = useState<MoodType>('chill');

  const [history, setHistory] = useState<string[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set(['t0', 't3', 't8']));
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([...CATALOG]);

  const [discoveryValue, setDiscoveryValue] = useState<number>(35);
  const [canvasCoords, setCanvasCoords] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [gramophoneQuality, setGramophoneQuality] = useState<GramophoneQuality>('high');

  // Spotify Auth State with LocalStorage Persistence
  const [spotifyToken, setSpotifyTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('melovy_spotify_token');
    } catch {
      return null;
    }
  });

  const [spotifyUser, setSpotifyUserState] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('melovy_spotify_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setSpotifyToken = (token: string | null) => {
    setSpotifyTokenState(token);
    try {
      if (token) {
        localStorage.setItem('melovy_spotify_token', token);
      } else {
        localStorage.removeItem('melovy_spotify_token');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const setSpotifyUser = (user: any | null) => {
    setSpotifyUserState(user);
    try {
      if (user) {
        localStorage.setItem('melovy_spotify_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('melovy_spotify_user');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const logoutSpotify = () => {
    setSpotifyToken(null);
    setSpotifyUser(null);
    showToast('Logged out of Spotify account.');
  };

  // Vibe Room state
  const [activeRoom, setActiveRoom] = useState<VibeRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);

  // Modals
  const [isImmersiveOpen, setIsImmersiveOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState<boolean>(false);
  const [addToPlaylistTargetTrackId, setAddToPlaylistTargetTrackId] = useState<string | null>(null);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareTargetTrackId, setShareTargetTrackId] = useState<string | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState<boolean>(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2400);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const openPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setLibrarySubTab('playlists');
    setActiveTab('library');
  };

  const addImportedPlaylist = (newPlaylist: Playlist, newSongs: Song[]) => {
    setPlaylists(prev => [newPlaylist, ...prev.filter(p => p.id !== newPlaylist.id)]);
    setAllSongs(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filteredNew = newSongs.filter(s => !existingIds.has(s.id));
      return [...filteredNew, ...prev];
    });
    setSelectedPlaylistId(newPlaylist.id);
    setLibrarySubTab('playlists');
    setActiveTab('library');

    if (newPlaylist.trackIds && newPlaylist.trackIds.length > 0) {
      setQueue(newPlaylist.trackIds);
      setQueueIndex(0);
      loadAndPlayTrack(newPlaylist.trackIds[0]);
    }

    showToast(`Spotify Playlist "${newPlaylist.name.replace('💚 ', '')}" imported! Now playing track 1.`);
  };

  // Sync audio engine callbacks
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        if (dur && dur > 0) setDuration(dur);
      },
      () => {
        playNext();
      }
    );
  }, [queue, queueIndex, repeatMode]);

  // Timer loop for time progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        const t = audioEngine.getTime();
        const d = audioEngine.getDuration();
        setCurrentTime(t);
        setDuration(d);
        if (t >= d) {
          playNext();
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying, queue, queueIndex, repeatMode]);

  const loadAndPlayTrack = (trackId: string) => {
    const track = allSongs.find(t => t.id === trackId) || CATALOG.find(t => t.id === trackId);
    if (!track) return;

    setCurrentSong(track);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(true);
    setCurrentMoodState(track.mood);
    applyMoodAmbient(track.mood);

    setRecentlyPlayed(prev => [trackId, ...prev.filter(id => id !== trackId)].slice(0, 20));

    audioEngine.loadTrack(track);
    audioEngine.play();
  };

  const playTrack = (trackId: string) => {
    const idx = queue.indexOf(trackId);
    if (idx >= 0) {
      setQueueIndex(idx);
    } else {
      setQueue(prev => [trackId, ...prev]);
      setQueueIndex(0);
    }
    loadAndPlayTrack(trackId);
  };

  const togglePlay = () => {
    if (!currentSong && CATALOG.length > 0) {
      playTrack(CATALOG[0].id);
      return;
    }
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!queue.length) return;
    if (repeatMode && currentSong) {
      loadAndPlayTrack(currentSong.id);
      return;
    }
    const nextIdx = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIdx);
    loadAndPlayTrack(queue[nextIdx]);
  };

  const playPrev = () => {
    if (!queue.length) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    setQueueIndex(prevIdx);
    loadAndPlayTrack(queue[prevIdx]);
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
  };

  const toggleLike = (trackId: string) => {
    setLikedSongIds(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
        showToast("Removed from Liked Songs");
      } else {
        next.add(trackId);
        showToast("Added to Liked Songs");
      }
      return next;
    });
  };

  const toggleRepeat = () => {
    const next = !repeatMode;
    setRepeatMode(next);
    showToast(next ? "Repeat one: on" : "Repeat off");
  };

  const shuffleQueue = () => {
    const wild = discoveryValue / 100;
    const likedMoods = new Set(Array.from(likedSongIds).map(id => CATALOG.find(t => t.id === id)?.mood).filter(Boolean));
    const sorted = CATALOG.slice().sort((a, b) => {
      const aScore = (likedMoods.has(a.mood) ? 1 : 0) * (1 - wild) + Math.random() * wild;
      const bScore = (likedMoods.has(b.mood) ? 1 : 0) * (1 - wild) + Math.random() * wild;
      return bScore - aScore;
    });
    const newQueue = sorted.slice(0, 25).map(t => t.id);
    setQueue(newQueue);
    setQueueIndex(0);
    showToast("Intelligent shuffle: queue rebuilt for your vibe");
    if (!currentSong || !isPlaying) {
      loadAndPlayTrack(newQueue[0]);
    }
  };

  const setCurrentMood = (mood: MoodType) => {
    setCurrentMoodState(mood);
    applyMoodAmbient(mood);
  };

  const createPlaylist = (name: string, desc: string, colorIndex: number) => {
    const newPl: Playlist = {
      id: "pl" + Date.now(),
      name: name || "Untitled Playlist",
      desc: desc || "A new Melovy playlist.",
      color: GRADIENTS[colorIndex] || GRADIENTS[0],
      trackIds: []
    };
    setPlaylists(prev => [...prev, newPl]);
    showToast("Playlist created");
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        if (pl.trackIds.includes(trackId)) {
          showToast("Already in " + pl.name);
          return pl;
        }
        showToast("Added to " + pl.name);
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      }
      return pl;
    }));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) return;
    const newQ = [...queue];
    const [moved] = newQ.splice(fromIndex, 1);
    newQ.splice(toIndex, 0, moved);
    setQueue(newQ);
    if (queueIndex === fromIndex) {
      setQueueIndex(toIndex);
    } else if (queueIndex === toIndex) {
      setQueueIndex(fromIndex);
    }
  };

  const removeFromQueue = (index: number) => {
    if (index < 0 || index >= queue.length) return;
    const newQ = queue.filter((_, i) => i !== index);
    setQueue(newQ);
    if (queueIndex > index) {
      setQueueIndex(prev => prev - 1);
    } else if (queueIndex === index) {
      setQueueIndex(prev => Math.min(prev, newQ.length - 1));
    }
  };

  const openRoom = (room: VibeRoom) => {
    setActiveRoom(room);
    setRoomMessages([
      { id: "m1", userId: "u1", userName: "wren.mp3", userAvatar: "", text: "this track is doing something to me rn", timestamp: "Just now" },
      { id: "m2", userId: "u2", userName: "amber_l", userAvatar: "", text: "anyone else up for this vibe?", timestamp: "Just now" }
    ]);
    setIsRoomModalOpen(true);
  };

  const closeRoom = () => {
    setIsRoomModalOpen(false);
    if (activeRoom) {
      showToast("Left " + activeRoom.name);
    }
    setActiveRoom(null);
  };

  const sendRoomMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: "msg" + Date.now(),
      userId: "me",
      userName: "you",
      userAvatar: "",
      text: text.trim(),
      timestamp: "Just now",
      me: true
    };
    setRoomMessages(prev => [...prev, msg]);
  };

  const openAddToPlaylistModal = (trackId: string) => {
    setAddToPlaylistTargetTrackId(trackId);
    setIsAddToPlaylistModalOpen(true);
  };

  const closeAddToPlaylistModal = () => {
    setIsAddToPlaylistModalOpen(false);
    setAddToPlaylistTargetTrackId(null);
  };

  const openShareModal = (trackId: string) => {
    setShareTargetTrackId(trackId);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareTargetTrackId(null);
  };

  // Import local audio files (MP3, WAV, FLAC, M4A, OGG)
  const importLocalAudioFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const newTracks: Song[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const objectUrl = URL.createObjectURL(file);
      
      // Clean up filename for title and artist
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      let title = nameWithoutExt;
      let artist = "Local Device File";

      if (nameWithoutExt.includes(" - ")) {
        const parts = nameWithoutExt.split(" - ");
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      }

      const songId = "local_" + Date.now() + "_" + i;
      const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

      const newSong: Song = {
        id: songId,
        title,
        artist,
        album: "Local Uploads",
        duration: 210, // estimated initial duration
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
        audioUrl: objectUrl,
        genre: "USER LOCAL AUDIO",
        mood: "chill",
        colors: g,
        baseFreq: 220,
        energy: 0.6,
        valence: 0.6,
        releaseYear: new Date().getFullYear(),
        bpm: 90,
        ambientColor: g[0]
      };

      // Try reading actual audio duration
      try {
        const tempAudio = new Audio(objectUrl);
        await new Promise((resolve) => {
          tempAudio.addEventListener('loadedmetadata', () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              newSong.duration = Math.round(tempAudio.duration);
            }
            resolve(true);
          });
          tempAudio.addEventListener('error', () => resolve(false));
          setTimeout(resolve, 600);
        });
      } catch {
        // Fallback
      }

      newTracks.push(newSong);
    }

    if (newTracks.length > 0) {
      setAllSongs(prev => [...newTracks, ...prev]);

      // Add to or create 'Local Audio Tracks' playlist
      setPlaylists(prev => {
        const localPl = prev.find(p => p.id === 'pl_local');
        if (localPl) {
          return prev.map(p => p.id === 'pl_local' ? {
            ...p,
            trackIds: [...newTracks.map(t => t.id), ...p.trackIds]
          } : p);
        } else {
          return [{
            id: 'pl_local',
            name: '📂 My Local Uploaded Audio',
            desc: 'Music and sound files imported directly from your device.',
            color: GRADIENTS[1],
            trackIds: newTracks.map(t => t.id)
          }, ...prev];
        }
      });

      // Play first track immediately
      playTrack(newTracks[0].id);
      showToast(`Imported & playing ${newTracks.length} song${newTracks.length > 1 ? 's' : ''}!`);
    }
  };

  const addCustomAudioTrack = (title: string, artist: string, audioUrl: string, mood: MoodType = 'chill') => {
    if (!audioUrl.trim()) return;
    const songId = "stream_" + Date.now();
    const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

    const newSong: Song = {
      id: songId,
      title: title.trim() || "Web Audio Stream",
      artist: artist.trim() || "Custom Stream",
      album: "Direct Audio Stream",
      duration: 240,
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
      audioUrl: audioUrl.trim(),
      genre: "LIVE STREAM",
      mood,
      colors: g,
      baseFreq: 220,
      energy: 0.7,
      valence: 0.6,
      releaseYear: 2024,
      bpm: 95,
      ambientColor: g[0]
    };

    setAllSongs(prev => [newSong, ...prev]);
    playTrack(songId);
    showToast(`Streaming "${newSong.title}"`);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      } else if (e.key === 'n' || e.key === 'N') {
        playNext();
      } else if (e.key === 'p' || e.key === 'P') {
        playPrev();
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentSong) toggleLike(currentSong.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, volume, currentSong, queue, queueIndex]);

  return (
    <PlayerContext.Provider value={{
      activeTab,
      setActiveTab,
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      repeatMode,
      currentMood,
      queue,
      queueIndex,
      history,
      likedSongIds,
      playlists,
      recentlyPlayed,
      discoveryValue,
      canvasCoords,
      gramophoneQuality,
      activeRoom,
      roomMessages,
      isImmersiveOpen,
      isSearchModalOpen,
      isPlaylistModalOpen,
      isAddToPlaylistModalOpen,
      addToPlaylistTargetTrackId,
      isQueueModalOpen,
      isShareModalOpen,
      shareTargetTrackId,
      isRoomModalOpen,
      isSpotifyModalOpen,
      spotifyToken,
      spotifyUser,
      allSongs,
      toastMessage,
      importLocalAudioFiles,
      addCustomAudioTrack,
      selectedPlaylistId,
      setSelectedPlaylistId,
      librarySubTab,
      setLibrarySubTab,
      openPlaylist,

      showToast,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seek,
      setVolume,
      toggleLike,
      toggleRepeat,
      shuffleQueue,
      setDiscoveryValue,
      setCanvasCoords,
      setCurrentMood,
      setGramophoneQuality,
      createPlaylist,
      addTrackToPlaylist,
      addImportedPlaylist,
      reorderQueue,
      removeFromQueue,
      openRoom,
      closeRoom,
      sendRoomMessage,
      setIsImmersiveOpen,
      setIsSearchModalOpen,
      setIsPlaylistModalOpen,
      openAddToPlaylistModal,
      closeAddToPlaylistModal,
      setIsQueueModalOpen,
      openShareModal,
      closeShareModal,
      setIsSpotifyModalOpen,
      setSpotifyToken,
      setSpotifyUser,
      logoutSpotify,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

