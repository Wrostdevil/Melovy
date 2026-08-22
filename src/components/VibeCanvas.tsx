import React, { useState, useRef } from 'react';
import { usePlayer } from '../lib/playerContext';
import { CATALOG } from '../data/musicCatalog';
import { Song } from '../types';
import { Play } from 'lucide-react';

export const VibeCanvas: React.FC = () => {
  const { canvasCoords, setCanvasCoords, playTrack } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setCanvasCoords({ x, y });
  };

  // Determine active quadrant/label
  const getReadout = () => {
    const { x, y } = canvasCoords;
    if (y < 0.5 && x >= 0.5) return "Energetic · Vibrant & Upbeat";
    if (y < 0.5 && x < 0.5) return "Energetic · Atmospheric & Fast";
    if (y >= 0.5 && x < 0.5) return "Melancholic · Deep & Reflective";
    return "Calm · Peaceful & Mellow";
  };

  // Filter recommendations based on canvas coordinates
  const filteredSongs = CATALOG.slice().sort((a, b) => {
    const targetEnergy = 1 - canvasCoords.y;
    const targetValence = canvasCoords.x;
    const distA = Math.hypot(a.energy - targetEnergy, a.valence - targetValence);
    const distB = Math.hypot(b.energy - targetEnergy, b.valence - targetValence);
    return distA - distB;
  }).slice(0, 10);

  return (
    <div className="space-y-6 animate-fadein">
      <div>
        <h1 className="font-display text-[28px] font-medium text-[#f3f1f7]">Vibe Canvas</h1>
        <p className="text-sm text-[#a79fbf] mt-1">
          Drag the cursor across energy and emotion axes to instantly sculpt your listening experience.
        </p>
      </div>

      {/* Interactive 2D Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={(e) => { setIsDragging(true); handlePointer(e); }}
        onPointerMove={(e) => { if (isDragging) handlePointer(e); }}
        onPointerUp={() => setIsDragging(false)}
        className="relative w-full h-[320px] rounded-2xl bg-[#0f0c18] border border-white/10 overflow-hidden cursor-crosshair touch-none select-none"
      >
        {/* Ambient Gradient Mesh Background */}
        <div
          className="absolute inset-0 opacity-40 transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${canvasCoords.x * 100}% ${canvasCoords.y * 100}%, rgba(155,107,255,0.7), rgba(224,87,193,0.3) 40%, transparent 80%)`
          }}
        />

        {/* Axis Labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-mono tracking-widest text-white/50 uppercase">
          Energetic ▲
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono tracking-widest text-white/50 uppercase">
          ▼ Calm
        </div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono tracking-widest text-white/50 uppercase">
          ◄ Melancholic
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono tracking-widest text-white/50 uppercase">
          Happy ►
        </div>

        {/* Interactive Glowing Orb Pointer */}
        <div
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-gradient-to-br from-[#9b6bff] to-[#e057c1] border-2 border-white shadow-[0_0_30px_rgba(155,107,255,0.8)] pointer-events-none transition-transform duration-75 flex items-center justify-center"
          style={{
            left: `${canvasCoords.x * 100}%`,
            top: `${canvasCoords.y * 100}%`
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        </div>
      </div>

      {/* Live Readout Badge */}
      <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-[#15121e] border border-white/10">
        <div className="text-xs font-mono text-[#6e6685]">COORDINATES: X: {canvasCoords.x.toFixed(2)} | Y: {canvasCoords.y.toFixed(2)}</div>
        <div className="text-sm font-semibold text-[#f3f1f7]">{getReadout()}</div>
      </div>

      {/* Recommended Tracks List */}
      <div>
        <h2 className="font-display text-[20px] font-medium text-[#f3f1f7] mb-4">Matches for this coordinate</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredSongs.map(track => (
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
