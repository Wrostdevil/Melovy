export interface GenreArtConfig {
  id: string;
  genre: string;
  title: string;
  subtitle: string;
  image: string;
  fallbackGradient: [string, string, string];
  accentColor: string;
  glowColor: string;
  theme: 'royal-heritage' | 'midnight' | 'aurora' | 'neon' | 'lotus-sunset' | 'emerald-peacock';
  mandalaMotif?: string;
  particleType?: 'lotus' | 'gold-dust' | 'stars' | 'fireflies' | 'notes';
}

export const GENRE_ARTWORKS: Record<string, GenreArtConfig> = {
  'classical': {
    id: 'classical',
    genre: 'Classical & Ragas',
    title: 'Royal Raga Sunset',
    subtitle: 'Mughal lake palace, golden mandalas, sitar melodies & blooming lotus ponds',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#d4af37', '#e88d30', '#0c2633'],
    accentColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.4)',
    theme: 'royal-heritage',
    mandalaMotif: 'lotus-mandala',
    particleType: 'lotus'
  },
  'indian-classical': {
    id: 'indian-classical',
    genre: 'Indian Classical / Sufi',
    title: 'Melovy Heritage Lake Palace',
    subtitle: 'Peacocks on blossoming boughs, vintage brass gramophone & serene sunset water',
    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#e5a93b', '#c85a17', '#081720'],
    accentColor: '#e5a93b',
    glowColor: 'rgba(229, 169, 59, 0.45)',
    theme: 'royal-heritage',
    mandalaMotif: 'royal-arch',
    particleType: 'gold-dust'
  },
  'chill': {
    id: 'chill',
    genre: 'Chill / Lofi',
    title: 'Twilight Lotus Pavilion',
    subtitle: 'Warm evening breeze, soothing tea & mellow acoustic frequencies',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#3b2a6b', '#7c3fbd', '#07060b'],
    accentColor: '#9b6bff',
    glowColor: 'rgba(155, 107, 255, 0.35)',
    theme: 'midnight',
    particleType: 'notes'
  },
  'acoustic': {
    id: 'acoustic',
    genre: 'Acoustic / Folk',
    title: 'Golden Hour Sitar & Strings',
    subtitle: 'Handcrafted wooden resonance and warm amber reflections',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#d97706', '#92400e', '#1c1917'],
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    theme: 'royal-heritage',
    particleType: 'gold-dust'
  },
  'focus': {
    id: 'focus',
    genre: 'Focus / Meditation',
    title: 'Sacred Dawn Stillness',
    subtitle: 'Floating diya lamps, gentle rippling waters and clarity of mind',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#0d9488', '#082f49', '#020617'],
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.35)',
    theme: 'aurora',
    particleType: 'fireflies'
  },
  'romantic': {
    id: 'romantic',
    genre: 'Romantic / Soul',
    title: 'Rose Lotus Twilight',
    subtitle: 'Deep magenta horizons and heartfelt melodic expressions',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#db2777', '#701a75', '#17061a'],
    accentColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.4)',
    theme: 'lotus-sunset',
    particleType: 'lotus'
  },
  'energetic': {
    id: 'energetic',
    genre: 'Energetic / Electronic',
    title: 'Electric Mandala Odyssey',
    subtitle: 'Vibrant ultraviolet pulses and hypnotic rhythmic drive',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#ff007f', '#7928ca', '#000000'],
    accentColor: '#ff007f',
    glowColor: 'rgba(255, 0, 127, 0.4)',
    theme: 'neon',
    particleType: 'stars'
  },
  'jazz': {
    id: 'jazz',
    genre: 'Jazz / Night Lounge',
    title: 'Midnight Brass & Velvet',
    subtitle: 'Warm lantern glow, antique gramophone textures and smooth brass',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#b45309', '#1e1b4b', '#030712'],
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.35)',
    theme: 'royal-heritage',
    particleType: 'notes'
  },
  'melancholic': {
    id: 'melancholic',
    genre: 'Melancholic / Nocturne',
    title: 'Monsoon Mist Lake',
    subtitle: 'Gentle raindrops over temple spires and deep indigo calm',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#3b82f6', '#1e3a8a', '#020617'],
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    theme: 'midnight',
    particleType: 'stars'
  },
  'happy': {
    id: 'happy',
    genre: 'Uplifting / Festive',
    title: 'Golden Saffron Celebration',
    subtitle: 'Basking in festive sunlit melodies and joyful rhythms',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=85',
    fallbackGradient: ['#f59e0b', '#ea580c', '#180d04'],
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    theme: 'royal-heritage',
    particleType: 'lotus'
  }
};

export const getGenreArt = (genreOrMood: string): GenreArtConfig => {
  const norm = genreOrMood.toLowerCase().trim();
  if (norm.includes('classical') || norm.includes('raga') || norm.includes('sitar') || norm.includes('heritage')) {
    return GENRE_ARTWORKS['indian-classical'];
  }
  if (norm.includes('acoustic') || norm.includes('folk') || norm.includes('string')) {
    return GENRE_ARTWORKS['acoustic'];
  }
  if (norm.includes('focus') || norm.includes('meditation') || norm.includes('zen')) {
    return GENRE_ARTWORKS['focus'];
  }
  if (norm.includes('romantic') || norm.includes('love') || norm.includes('heart')) {
    return GENRE_ARTWORKS['romantic'];
  }
  if (norm.includes('energetic') || norm.includes('electronic') || norm.includes('dance') || norm.includes('synth')) {
    return GENRE_ARTWORKS['energetic'];
  }
  if (norm.includes('jazz') || norm.includes('brass') || norm.includes('blues')) {
    return GENRE_ARTWORKS['jazz'];
  }
  if (norm.includes('melanchol') || norm.includes('sad') || norm.includes('rain') || norm.includes('night')) {
    return GENRE_ARTWORKS['melancholic'];
  }
  if (norm.includes('happy') || norm.includes('joy') || norm.includes('festive') || norm.includes('sun')) {
    return GENRE_ARTWORKS['happy'];
  }
  return GENRE_ARTWORKS['chill'] || GENRE_ARTWORKS['classical'];
};
