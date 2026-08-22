import React, { useState } from 'react';
import { usePlayer } from '../lib/playerContext';
import { CATALOG } from '../data/musicCatalog';
import { Play, Heart, Plus, Search } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { playTrack, toggleLike, likedSongIds, openAddToPlaylistModal } = usePlayer();
  const [query, setQuery] = useState('');

  const filtered = CATALOG.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase()) ||
    t.mood.toLowerCase().includes(query.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 animate-fadein">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[28px] font-medium text-[#f3f1f7]">Search Melovy</h1>
        <div className="text-xs text-[#6e6685]">{filtered.length} tracks found</div>
      </div>

      <div className="relative max-w-[500px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6685]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by song name, artist, or mood (e.g. chill, focus)..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#15121e] border border-white/10 text-[#f3f1f7] text-sm placeholder-[#6e6685] focus:outline-none focus:border-[#9b6bff] transition-all"
        />
      </div>

      <div className="space-y-1">
        {filtered.map((track, i) => {
          const isLiked = likedSongIds.has(track.id);
          return (
            <div
              key={track.id}
              onClick={() => playTrack(track.id)}
              className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#15121e] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-mono text-[#6e6685] w-5 text-right shrink-0">{i + 1}</span>
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-display text-xs text-white"
                  style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
                >
                  <Play className="w-4 h-4 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#f3f1f7] truncate">{track.title}</div>
                  <div className="text-xs text-[#6e6685] truncate">{track.artist}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#a79fbf] uppercase tracking-wider font-mono">
                  {track.mood}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track.id);
                  }}
                  className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${isLiked ? 'text-[#e057c1]' : 'text-[#6e6685]'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddToPlaylistModal(track.id);
                  }}
                  className="p-1.5 rounded-md text-[#6e6685] hover:text-[#f3f1f7] hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-[#6e6685] w-10 text-right">{formatTime(track.duration)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
