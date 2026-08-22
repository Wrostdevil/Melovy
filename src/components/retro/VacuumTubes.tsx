import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '../../lib/audioEngine';
import { Zap } from 'lucide-react';

interface VacuumTubesProps {
  isPlaying: boolean;
  compact?: boolean;
}

export const VacuumTubes: React.FC<VacuumTubesProps> = ({ isPlaying, compact = false }) => {
  const [tubeGlowIntensity, setTubeGlowIntensity] = useState<number>(0.5);

  useEffect(() => {
    let animId: number;

    const updateGlow = () => {
      if (isPlaying) {
        const freqData = audioEngine.getFrequencyData();
        if (freqData.length > 0) {
          const bassSum = freqData.slice(0, 8).reduce((a, b) => a + b, 0);
          const norm = bassSum / (8 * 255);
          setTubeGlowIntensity(0.5 + norm * 0.5 + (Math.random() * 0.1 - 0.05));
        }
      } else {
        setTubeGlowIntensity(0.2);
      }
      animId = requestAnimationFrame(updateGlow);
    };

    animId = requestAnimationFrame(updateGlow);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className={`relative bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-[#F4F1EA] overflow-hidden ${compact ? 'max-w-xs' : 'max-w-md w-full'}`}>
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> CLASS-A VACUUM TUBE PREAMP
        </span>
        <span className="text-[8px] font-mono text-white/40">3x 12AX7 TRIODES</span>
      </div>

      {/* 3 Glowing Vacuum Tubes Assembly */}
      <div className="relative z-10 flex items-center justify-around py-2">
        {[1, 2, 3].map((tubeIdx) => (
          <div key={tubeIdx} className="relative flex flex-col items-center">
            {/* Glass Vacuum Bulb Outer Envelope */}
            <div className="relative w-10 h-24 bg-gradient-to-b from-white/10 via-amber-950/20 to-black/80 rounded-t-full border border-white/30 p-1 flex flex-col items-center justify-between overflow-hidden shadow-lg">
              {/* Internal Filament & Anode Plate */}
              <div className="w-6 h-12 border border-amber-600/30 rounded mt-2 flex flex-col items-center justify-center relative bg-black/40">
                {/* Glowing Filament Core */}
                <motion.div
                  className="w-1.5 h-6 bg-gradient-to-b from-amber-300 via-orange-500 to-amber-400 rounded-full shadow-[0_0_12px_#f59e0b]"
                  style={{
                    opacity: tubeGlowIntensity,
                    boxShadow: `0 0 ${10 + tubeGlowIntensity * 20}px #f59e0b`,
                  }}
                />
              </div>

              {/* Glass Reflection Highlight */}
              <div className="absolute top-2 left-1 w-2 h-14 bg-white/20 rounded-full blur-[1px]" />

              {/* Metal Base Pins */}
              <div className="w-full h-3 bg-zinc-800 border-t border-zinc-600 rounded-b" />
            </div>

            {/* Base Socket */}
            <div className="w-12 h-3 bg-amber-950/80 border border-amber-700/50 rounded-xs mt-1" />

            {/* Ambient Base Glow */}
            <div
              className="absolute -bottom-2 w-12 h-12 bg-amber-500 rounded-full blur-xl pointer-events-none transition-opacity duration-150"
              style={{ opacity: tubeGlowIntensity * 0.6 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
