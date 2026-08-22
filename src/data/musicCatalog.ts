import { Song, Playlist, MoodType, VibeRoom } from '../types';

export const GRADIENTS: [string, string][] = [
  ["#3b2a6b", "#7c3fbd"], ["#1c3a5e", "#3f7cac"], ["#5c1f4e", "#c23a7a"],
  ["#22304a", "#4a6fa5"], ["#3a1f52", "#8b3fd6"], ["#4a1030", "#c23a5e"],
  ["#12283a", "#2f6b6b"], ["#331a4d", "#a13fbf"], ["#0f2a3a", "#1f6b9a"],
  ["#402055", "#a83f9e"], ["#1a2a4a", "#3f5fa8"], ["#3a1a2a", "#a83f6e"]
];

export const MOODS: MoodType[] = [
  "chill", "energetic", "romantic", "melancholic", "acoustic", "focus", "nostalgic", "happy", "night"
];

const ARTISTS = [
  "Wren Halcyon", "Nova Set", "Amber Lane", "Glass Coast", "Faye Orbit",
  "Marlow Deep", "Cinder & Sky", "Blue Static", "Iris Volt", "Low Rooms",
  "Salt Ambient", "Velour Youth", "Skyline Drift", "Paper Moths", "Echo Verne"
];

const TITLES = [
  "Midnight Frequencies", "Slow Static", "Glass Rooms", "Violet Hour",
  "Nocturne Drive", "Paper Sky", "Warm Interference", "Low Light",
  "Halfway Home", "Sable Skies", "Afterglow", "Quiet Static", "Ember Room",
  "Wildflower Radio", "Distant Signal", "Faded Neon", "Soft Landing",
  "Blue Static", "Drift Theory", "Amber Static", "Cathedral Light",
  "Slow Bloom", "Marble Sky", "Night Frequencies", "Velvet Static"
];

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateCatalog(): Song[] {
  const rnd = seedRand(42);
  const list: Song[] = [];
  for (let i = 0; i < 70; i++) {
    const g = GRADIENTS[Math.floor(rnd() * GRADIENTS.length)];
    const mood = MOODS[Math.floor(rnd() * MOODS.length)];
    const artist = ARTISTS[Math.floor(rnd() * ARTISTS.length)];
    const title = TITLES[Math.floor(rnd() * TITLES.length)] + (rnd() > 0.7 ? " " + ["II", "(Reprise)", "- Slow Edit", "(Live Room)"][Math.floor(rnd() * 4)] : "");
    const dur = 150 + Math.floor(rnd() * 90);
    const baseFreq = 110 + rnd() * 260;
    const energy = mood === "energetic" ? 0.85 : mood === "chill" || mood === "acoustic" ? 0.25 : mood === "focus" ? 0.3 : 0.5 + rnd() * 0.3;
    const valence = mood === "happy" || mood === "romantic" ? 0.8 : mood === "melancholic" ? 0.15 : 0.5;
    list.push({
      id: "t" + i,
      title,
      artist,
      album: "Melovy Sessions Vol. " + ((i % 5) + 1),
      duration: dur,
      coverUrl: `https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80`,
      audioUrl: '',
      genre: mood.toUpperCase() + ' SOUNDSCAPE',
      mood,
      colors: g,
      baseFreq,
      energy,
      valence,
      vibeCoordinates: {
        x: Math.round((energy * 2 - 1) * 100),
        y: Math.round((valence * 2 - 1) * 100)
      },
      discoveryScore: Math.round(10 + rnd() * 85),
      releaseYear: 2024 - (i % 6),
      bpm: Math.round(60 + energy * 70),
      ambientColor: g[0],
      lyrics: [
        { time: 0, text: '♪ (Generative ambient synthesizer pad) ♪' },
        { time: 15, text: 'Soft static drifting through quiet air...' },
        { time: 35, text: 'Every note finding room to breathe in midnight shadows...' },
        { time: 60, text: 'Harmonic resonance echoing through time and space...' },
        { time: 90, text: 'Rest your soul in this acoustic embrace...' }
      ]
    });
  }
  return list;
}

export const CATALOG: Song[] = generateCatalog();
export const INITIAL_SONGS: Song[] = CATALOG;

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: "pl1",
    name: "Late Night Drive",
    desc: "Dark navy, soft violet lighting.",
    color: GRADIENTS[0],
    trackIds: CATALOG.slice(2, 9).map(t => t.id)
  },
  {
    id: "pl2",
    name: "Focus Room",
    desc: "Steady, low-distraction listening.",
    color: GRADIENTS[6],
    trackIds: CATALOG.slice(20, 26).map(t => t.id)
  },
  {
    id: "pl3",
    name: "Golden Hour",
    desc: "Warm, nostalgic, unhurried.",
    color: GRADIENTS[9],
    trackIds: CATALOG.slice(30, 36).map(t => t.id)
  }
];

export const ROOM_DEFS: VibeRoom[] = [
  { id: "r1", emoji: "🌙", name: "Late Night", mood: "night", listeners: 84 },
  { id: "r2", emoji: "🎧", name: "Lo-Fi Focus", mood: "focus", listeners: 53 },
  { id: "r3", emoji: "🎸", name: "Indie Drift", mood: "chill", listeners: 31 },
  { id: "r4", emoji: "💫", name: "Golden Hour", mood: "happy", listeners: 46 },
  { id: "r5", emoji: "🌧", name: "Rainy Reflections", mood: "melancholic", listeners: 22 },
  { id: "r6", emoji: "🔥", name: "Pulse", mood: "energetic", listeners: 68 }
];

