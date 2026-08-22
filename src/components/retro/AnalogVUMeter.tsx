import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { audioEngine } from '../../lib/audioEngine';

interface AnalogVUMeterProps {
  isPlaying: boolean;
  label?: string;
  compact?: boolean;
}

export const AnalogVUMeter: React.FC<AnalogVUMeterProps> = ({
  isPlaying,
  label = 'STEREO VU METER',
  compact = false
}) => {
  const [leftDb, setLeftDb] = useState<number>(-20);
  const [rightDb, setRightDb] = useState<number>(-20);

  useEffect(() => {
    let animId: number;

    const updateNeedles = () => {
      if (isPlaying) {
        const freqData = audioEngine.getFrequencyData();
        if (freqData.length > 0) {
          // Calculate average energy in lower vs higher frequencies for L/R channel variation
          const leftSum = freqData.slice(0, 16).reduce((a, b) => a + b, 0);
          const rightSum = freqData.slice(16, 32).reduce((a, b) => a + b, 0);

          const leftNorm = (leftSum / (16 * 255)) * 100;
          const rightNorm = (rightSum / (16 * 255)) * 100;

          // Convert to dB scale (-20 to +3)
          const lDb = -20 + (leftNorm / 100) * 23 + (Math.random() * 1.5 - 0.75);
          const rDb = -20 + (rightNorm / 100) * 23 + (Math.random() * 1.5 - 0.75);

          setLeftDb(Math.min(3, Math.max(-20, lDb)));
          setRightDb(Math.min(3, Math.max(-20, rDb)));
        }
      } else {
        setLeftDb(-20);
        setRightDb(-20);
      }

      animId = requestAnimationFrame(updateNeedles);
    };

    animId = requestAnimationFrame(updateNeedles);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Convert dB to rotation angle (-45 deg to +45 deg)
  const dbToAngle = (db: number) => {
    const minDb = -20;
    const maxDb = 3;
    const clamped = Math.min(maxDb, Math.max(minDb, db));
    const ratio = (clamped - minDb) / (maxDb - minDb);
    return -45 + ratio * 90;
  };

  return (
    <div className={`relative bg-black/40 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-[#F4F1EA] overflow-hidden ${compact ? 'max-w-xs' : 'max-w-md w-full'}`}>
      {/* Background Vintage Amber Dial Backlight Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-orange-950/20 to-black/80 pointer-events-none" />
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/20 blur-2xl rounded-full transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-40'}`} />

      {/* Header Stamp */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <span className="text-[9px] font-sans font-extrabold uppercase tracking-[0.25em] text-amber-400/90 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-400 animate-ping' : 'bg-amber-800'}`} />
          {label}
        </span>
        <span className="text-[8px] font-mono text-white/40 tracking-widest uppercase">MODEL 1974-VU</span>
      </div>

      {/* Dual Meters Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {/* Left Channel */}
        <div className="relative aspect-[16/10] bg-[#1a1714] border border-amber-900/40 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Meter Scale Arc SVG */}
          <div className="relative w-full h-full flex flex-col justify-between">
            <svg viewBox="0 0 100 50" className="w-full h-full text-amber-200/80 font-mono text-[6px]">
              {/* Tick Marks */}
              <path d="M 10 40 A 35 35 0 0 1 90 40" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" strokeDasharray="1, 3" />
              {/* Red Overload Zone */}
              <path d="M 75 18 A 35 35 0 0 1 90 40" fill="none" stroke="#ef4444" strokeWidth="2.5" />
              
              <text x="12" y="38" fill="rgba(251, 191, 36, 0.7)">-20</text>
              <text x="32" y="22" fill="rgba(251, 191, 36, 0.7)">-7</text>
              <text x="50" y="16" fill="rgba(251, 191, 36, 0.9)">0</text>
              <text x="70" y="22" fill="#ef4444">+3</text>
              <text x="50" y="36" fill="rgba(251, 191, 36, 0.4)" textAnchor="middle" className="text-[5px] uppercase font-sans">LEFT CH</text>
            </svg>

            {/* Bouncing Needle */}
            <motion.div
              className="absolute bottom-1 left-1/2 w-0.5 h-[80%] bg-amber-400 origin-bottom shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{
                transformOrigin: 'bottom center',
              }}
              animate={{ rotate: dbToAngle(leftDb) }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-200 -translate-x-[2px] -translate-y-1" />
            </motion.div>

            {/* Pivot Pin */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-900 border border-amber-500/50 shadow-md" />
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-amber-400/80 mt-1">
            <span>LEFT</span>
            <span>{leftDb > 0 ? `+${leftDb.toFixed(1)}` : leftDb.toFixed(1)} dB</span>
          </div>
        </div>

        {/* Right Channel */}
        <div className="relative aspect-[16/10] bg-[#1a1714] border border-amber-900/40 rounded-lg p-2 flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="relative w-full h-full flex flex-col justify-between">
            <svg viewBox="0 0 100 50" className="w-full h-full text-amber-200/80 font-mono text-[6px]">
              <path d="M 10 40 A 35 35 0 0 1 90 40" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="1" strokeDasharray="1, 3" />
              <path d="M 75 18 A 35 35 0 0 1 90 40" fill="none" stroke="#ef4444" strokeWidth="2.5" />
              
              <text x="12" y="38" fill="rgba(251, 191, 36, 0.7)">-20</text>
              <text x="32" y="22" fill="rgba(251, 191, 36, 0.7)">-7</text>
              <text x="50" y="16" fill="rgba(251, 191, 36, 0.9)">0</text>
              <text x="70" y="22" fill="#ef4444">+3</text>
              <text x="50" y="36" fill="rgba(251, 191, 36, 0.4)" textAnchor="middle" className="text-[5px] uppercase font-sans">RIGHT CH</text>
            </svg>

            {/* Bouncing Needle */}
            <motion.div
              className="absolute bottom-1 left-1/2 w-0.5 h-[80%] bg-amber-400 origin-bottom shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{
                transformOrigin: 'bottom center',
              }}
              animate={{ rotate: dbToAngle(rightDb) }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-200 -translate-x-[2px] -translate-y-1" />
            </motion.div>

            {/* Pivot Pin */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-900 border border-amber-500/50 shadow-md" />
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-amber-400/80 mt-1">
            <span>RIGHT</span>
            <span>{rightDb > 0 ? `+${rightDb.toFixed(1)}` : rightDb.toFixed(1)} dB</span>
          </div>
        </div>
      </div>

      {/* Glass Reflection Glare Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};
