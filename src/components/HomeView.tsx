import React, { useState } from 'react';
import { usePlayer } from '../lib/playerContext';
import { useTheme } from '../lib/themeContext';
import { CATALOG, ROOM_DEFS } from '../data/musicCatalog';
import { MoodType, Song } from '../types';
import { Play, Heart, Sparkles, Palette, BookOpen, Compass } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    currentSong,
    isPlaying,
    currentMood,
    setCurrentMood,
    playTrack,
    toggleLike,
    likedSongIds,
    recentlyPlayed,
    openRoom,
    showToast
  } = usePlayer();

  const { setIsGenreArtModalOpen, genreArt } = useTheme();

  const [nlQuery, setNlQuery] = useState('');

  // Greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 5 ? "Late night frequencies." : h < 12 ? "Good morning, traveler." : h < 18 ? "Good afternoon." : "Good evening.";
  };

  const moods: MoodType[] = ["chill", "acoustic", "focus", "romantic", "energetic", "melancholic", "nostalgic", "happy", "night"];

  const handleNLSearch = () => {
    const q = nlQuery.trim().toLowerCase();
    if (!q) {
      showToast("Describe a mood first — try “peaceful sunrise lake” or “sitar focus”");
      return;
    }
    const keywords: Record<string, string[]> = {
      chill: ["calm", "chill", "relax", "rainy", "rain", "evening", "mellow", "laid back", "quiet", "lake", "tea"],
      energetic: ["energetic", "pump", "workout", "gym", "hype", "fast", "upbeat energy", "run", "running", "electronic"],
      romantic: ["romantic", "love", "date", "crush", "valentine", "heart"],
      melancholic: ["sad", "lonely", "melanchol", "heartbreak", "cry", "blue", "down", "mist"],
      acoustic: ["acoustic", "unplugged", "sitar", "tanpura", "raga", "campfire", "strings"],
      focus: ["focus", "study", "work", "concentrate", "deep work", "coding", "zen", "meditation", "peace"],
      nostalgic: ["nostalgic", "throwback", "old times", "memory", "heritage", "gramophone"],
      happy: ["happy", "joy", "upbeat", "fun", "celebrate", "festive", "sun"],
      night: ["night", "late night", "midnight", "2am", "dark drive", "stars"]
    };

    let bestMood: MoodType = "chill";
    let maxScore = 0;
    for (const [m, words] of Object.entries(keywords)) {
      let score = 0;
      words.forEach(w => { if (q.includes(w)) score++; });
      if (score > maxScore) {
        maxScore = score;
        bestMood = m as MoodType;
      }
    }

    setCurrentMood(bestMood);
    showToast(`Matched to “${bestMood}” · based on: “${q}”`);
  };

  // Section collections
  const madeForYou = CATALOG.filter(t => t.mood === currentMood).slice(0, 12);
  const continueList = recentlyPlayed.length 
    ? recentlyPlayed.map(id => CATALOG.find(t => t.id === id)!).filter(Boolean) 
    : CATALOG.slice(10, 20);
  const discoverNew = CATALOG.filter(t => t.mood !== currentMood).slice(0, 12);
  const relevantRooms = ROOM_DEFS.filter(r => r.mood === currentMood).length 
    ? ROOM_DEFS.filter(r => r.mood === currentMood) 
    : ROOM_DEFS.slice(0, 3);

  const getInitials = (str: string) => str.split(" ").slice(0, 3).map(w => w[0]).join("");

  return (
    <div className="space-y-9 animate-fadein">
      {/* Hero Greeting Section with Ornate Royal Heritage Framing */}
      <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-6 p-5 md:p-[34px] rounded-[24px] bg-gradient-to-br from-[#10212c]/90 via-[#0e1c26]/95 to-[#162c3a]/90 border border-[#d4af37]/35 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(75%_140%_at_85%_0%,rgba(212,175,55,0.22),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden lg:block">
          <Sparkles className="w-48 h-48 text-[#d4af37]" />
        </div>
        
        <div className="relative z-10 max-w-[580px] w-full">
          {/* Today's Vibe Journal Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#fcd34d] text-[11px] font-mono tracking-wider uppercase mb-3 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>Today's Vibe: Peace · Focus · Chill · Dream</span>
          </div>

          <h1 className="font-display italic text-2xl md:text-[34px] leading-tight font-normal text-[#fdfbf7]">
            {getGreeting()} <span className="text-[#d4af37] not-italic">Feel the music.</span>
          </h1>
          <p className="text-[#d4c5a9] text-xs md:text-sm mt-2 max-w-[480px]">
            Immerse yourself in acoustic resonance, generative ragas, and live mood atmospheres.
          </p>

          {/* Mood Chips */}
          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4 md:mt-5">
            {moods.map(m => (
              <button
                key={m}
                onClick={() => {
                  setCurrentMood(m);
                  showToast(`Vibe set to ${m}`);
                }}
                className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-full border text-xs md:text-[12.5px] font-medium transition-all ${
                  currentMood === m
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] border-transparent font-semibold shadow-[0_8px_24px_rgba(212,175,55,0.4)] scale-105'
                    : 'border-[#d4af37]/20 bg-[#0b1720]/60 text-[#d4c5a9] hover:text-[#fdfbf7] hover:border-[#d4af37]'
                }`}
              >
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          {/* Natural Language Vibe Search + Genre Art Trigger */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-[520px] w-full">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNLSearch()}
                placeholder="Describe it: “peaceful sunset lake raga”"
                className="flex-1 px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl bg-[#0b1720]/80 border border-[#d4af37]/25 text-[#fdfbf7] placeholder-[#8e806a] focus:outline-none focus:border-[#d4af37] transition-all text-xs"
              />
              <button
                onClick={handleNLSearch}
                className="px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] text-xs font-semibold hover:brightness-110 transition-all shrink-0 shadow-md"
              >
                Find
              </button>
            </div>

            <button
              onClick={() => setIsGenreArtModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#162c3a] border border-[#d4af37]/35 text-[#fcd34d] text-xs font-semibold hover:bg-[#1f3b4d] transition-all flex items-center justify-center gap-1.5 shrink-0"
              title="Customize Genre Art Backgrounds"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Genre Art</span>
            </button>
          </div>
        </div>

        {/* Hero Mini Disc with Ornate Brass Rim */}
        <div className="relative z-10 shrink-0 w-full md:w-[190px] flex md:flex-col items-center justify-between md:justify-center gap-2.5 border-t md:border-t-0 border-[#d4af37]/20 pt-4 md:pt-0">
          <div className={`w-20 h-20 md:w-[130px] md:h-[130px] rounded-full relative shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${isPlaying ? 'animate-spin-disc' : ''}`}>
            <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#070e14_0_2px,#10212c_2px_4px)] shadow-[inset_0_0_0_2px_rgba(212,175,55,0.4)]" />
            <div
              className="absolute inset-[30%] rounded-full flex items-center justify-center text-center text-[8px] md:text-[9px] font-bold tracking-wider text-[#070e14] p-1 overflow-hidden text-ellipsis whitespace-nowrap shadow-inner"
              style={{
                background: currentSong
                  ? `linear-gradient(135deg, ${currentSong.colors[0]}, ${currentSong.colors[1]})`
                  : 'linear-gradient(135deg, #d4af37, #f59e0b)'
              }}
            >
              {currentSong ? getInitials(currentSong.title) : 'Melovy'}
            </div>
          </div>
          <div className="text-xs md:text-[11.5px] text-[#8e806a]">
            Vibe · <span className="text-[#fcd34d] font-medium font-mono uppercase">{currentMood}</span>
          </div>
        </div>
      </div>

      {/* Made For You */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-[21px] font-medium tracking-tight text-[#fdfbf7] flex items-center gap-2">
            <span>Made For You</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#fcd34d] font-mono uppercase">
              {currentMood}
            </span>
          </h2>
          <button onClick={() => onNavigate('search')} className="text-[12.5px] text-[#8e806a] hover:text-[#d4af37] font-medium transition-colors">See all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none">
          {madeForYou.map(track => (
            <CardItem key={track.id} track={track} />
          ))}
        </div>
      </section>

      {/* Continue Listening */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-[21px] font-medium tracking-tight text-[#fdfbf7]">Continue Listening</h2>
          <button onClick={() => onNavigate('library')} className="text-[12.5px] text-[#8e806a] hover:text-[#d4af37] font-medium transition-colors">See all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none">
          {continueList.map(track => (
            <CardItem key={track.id} track={track} />
          ))}
        </div>
      </section>

      {/* Discover Something New */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-[21px] font-medium tracking-tight text-[#fdfbf7]">Discover Something New</h2>
          <button onClick={() => onNavigate('discovery')} className="text-[12.5px] text-[#8e806a] hover:text-[#d4af37] font-medium transition-colors">Adjust discovery</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none">
          {discoverNew.map(track => (
            <CardItem key={track.id} track={track} />
          ))}
        </div>
      </section>

      {/* People Sharing Your Vibe */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-[21px] font-medium tracking-tight text-[#fdfbf7]">People Sharing Your Vibe</h2>
          <button onClick={() => onNavigate('rooms')} className="text-[12.5px] text-[#8e806a] hover:text-[#d4af37] font-medium transition-colors">Open Vibe Rooms</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none">
          {relevantRooms.map(room => (
            <div key={room.id} className="shrink-0 w-[210px] p-4 rounded-[16px] bg-[#10212c]/85 border border-[#d4af37]/25 backdrop-blur-md flex flex-col justify-between hover:border-[#d4af37]/60 transition-all shadow-md">
              <div>
                <div className="text-[24px]">{room.emoji}</div>
                <div className="font-display italic text-[17px] text-[#fdfbf7] mt-2">{room.name}</div>
                <div className="text-xs text-[#8e806a] mt-0.5">{room.listeners} listening now</div>
              </div>
              <button
                onClick={() => openRoom(room)}
                className="mt-3.5 w-full py-2 rounded-lg border border-[#d4af37]/35 bg-[#0b1720]/80 hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#f59e0b] hover:border-transparent text-[#d4c5a9] hover:text-[#070e14] text-[12.5px] font-semibold transition-all shadow-sm"
              >
                Join room
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* Subcomponent for Card items */
const CardItem: React.FC<{ track: Song }> = ({ track }) => {
  const { currentSong, playTrack } = usePlayer();
  const isCurrent = currentSong?.id === track.id;

  return (
    <div
      onClick={() => playTrack(track.id)}
      className="shrink-0 w-[172px] cursor-pointer group"
    >
      <div
        className="w-[172px] h-[172px] rounded-[16px] relative overflow-hidden shadow-[0_10px_26px_rgba(0,0,0,0.5)] border border-[#d4af37]/20 group-hover:border-[#d4af37]/60 group-hover:-translate-y-1 transition-all"
        style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center font-display italic text-[15px] text-white/90 text-center p-3.5 leading-tight">
          {track.title}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            playTrack(track.id);
          }}
          className="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-full bg-[#070e14]/80 backdrop-blur-md border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 hover:bg-[#d4af37] hover:text-[#070e14] transition-all shadow-md"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
      <div className={`text-[13.5px] font-semibold mt-2.5 truncate ${isCurrent ? 'text-[#d4af37]' : 'text-[#fdfbf7]'}`}>
        {track.title}
      </div>
      <div className="text-xs text-[#8e806a] mt-0.5 truncate">{track.artist}</div>
    </div>
  );
};
