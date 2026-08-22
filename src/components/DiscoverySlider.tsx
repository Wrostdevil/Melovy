import React from 'react';
import { usePlayer } from '../lib/playerContext';
import { CATALOG } from '../data/musicCatalog';
import { Play, Shuffle } from 'lucide-react';

export const DiscoverySlider: React.FC = () => {
  const { discoveryValue, setDiscoveryValue, playTrack, shuffleQueue, showToast } = usePlayer();

  const getLabel = (val: number) => {
    if (val < 25) return "Comfort Zone · Pure Familiar Favorites";
    if (val < 50) return "Balanced · Comfort with Subtle Surprises";
    if (val < 75) return "Adventurous · Fresh Genres & Emerging Artists";
    return "Wildly Curious · Uncharted Atmospheric Gems";
  };

  // Filter track recommendations based on discovery level
  const wildRatio = discoveryValue / 100;
  const tracks = CATALOG.slice().sort((a, b) => {
    const scoreA = a.valence * (1 - wildRatio) + Math.random() * wildRatio;
    const scoreB = b.valence * (1 - wildRatio) + Math.random() * wildRatio;
    return scoreB - scoreA;
  }).slice(0, 10);

  return (
    <div className="space-y-6 animate-fadein">
      <div>
        <h1 className="font-display text-[28px] font-medium text-[#f3f1f7]">Discovery Slider</h1>
        <p className="text-sm text-[#a79fbf] mt-1">
          Dial between familiar comfort zone sounds and wild, uncharted musical discoveries.
        </p>
      </div>

      {/* Slider Control Box */}
      <div className="p-6 rounded-2xl bg-[#15121e] border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6e6685]">DISCOVERY LEVEL</div>
          <div className="text-sm font-semibold text-[#f3f1f7]">{getLabel(discoveryValue)}</div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={discoveryValue}
          onChange={(e) => setDiscoveryValue(Number(e.target.value))}
          className="w-full accent-[#9b6bff] cursor-pointer"
        />

        <div className="flex justify-between text-xs font-mono text-[#6e6685]">
          <span>0 % (Familiar)</span>
          <span>50 % (Balanced)</span>
          <span>100 % (Wild)</span>
        </div>

        <button
          onClick={() => {
            shuffleQueue();
            showToast("Queue shuffled with discovery level: " + discoveryValue + "%");
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md"
        >
          <Shuffle className="w-4 h-4" />
          <span>Rebuild queue with this discovery level</span>
        </button>
      </div>

      {/* Recommended Songs Grid */}
      <div>
        <h2 className="font-display text-[20px] font-medium text-[#f3f1f7] mb-4">Discovery Recommendations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {tracks.map(track => (
            <div
              key={track.id}
              onClick={() => playTrack(track.id)}
              className="p-3.5 rounded-xl bg-[#15121e] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div
                className="w-full aspect-square rounded-lg mb-2.5 relative shadow-md overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
              >
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
              <div className="text-xs font-semibold text-[#f3f1f7] truncate">{track.title}</div>
              <div className="text-[11px] text-[#6e6685] truncate mt-0.5">{track.artist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
