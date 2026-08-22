import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ClassicVolumeKnobProps {
  volume: number; // 0 to 1
  onChange: (volume: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ClassicVolumeKnob: React.FC<ClassicVolumeKnobProps> = ({
  volume,
  onChange,
  size = 'md',
  showLabel = true,
}) => {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Knob configuration: 
  // Minimum angle (volume = 0): -135deg (bottom-left)
  // Maximum angle (volume = 1): +135deg (bottom-right)
  // Total arc range = 270 degrees
  const MIN_ANGLE = -135;
  const MAX_ANGLE = 135;
  const TOTAL_ANGLE = MAX_ANGLE - MIN_ANGLE;

  // Number of indicator dots around the perimeter
  const NUM_DOTS = 11;
  const DOT_START_ANGLE = -135;
  const DOT_END_ANGLE = 135;

  const currentAngle = MIN_ANGLE + volume * TOTAL_ANGLE;

  // Dimension scaling
  const dimensions = {
    sm: { container: 90, knob: 58, dotRadius: 36, maxDotSize: 5, minDotSize: 3, labelSize: 'text-[9px]' },
    md: { container: 130, knob: 84, dotRadius: 52, maxDotSize: 7, minDotSize: 3.5, labelSize: 'text-[11px]' },
    lg: { container: 160, knob: 104, dotRadius: 65, maxDotSize: 9, minDotSize: 4.5, labelSize: 'text-xs' },
  }[size];

  const calculateVolumeFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;

      // Calculate angle in degrees, 0 is straight UP (12 o'clock)
      let deg = Math.atan2(dx, -dy) * (180 / Math.PI); // -180 to 180

      // Normalize to [-180, 180]
      if (deg < MIN_ANGLE && deg >= -180) {
        // Near min
        if (deg < -150) deg = MIN_ANGLE;
      } else if (deg > MAX_ANGLE && deg <= 180) {
        // Near max
        if (deg > 150) deg = MAX_ANGLE;
      }

      // Clamp between MIN_ANGLE and MAX_ANGLE
      const clampedDeg = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, deg));
      const newVol = (clampedDeg - MIN_ANGLE) / TOTAL_ANGLE;
      onChange(Math.max(0, Math.min(1, newVol)));
    },
    [onChange, MIN_ANGLE, MAX_ANGLE, TOTAL_ANGLE]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    calculateVolumeFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    calculateVolumeFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Wheel to adjust volume smoothly
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.05;
    const newVol = Math.max(0, Math.min(1, volume + delta));
    onChange(newVol);
  };

  const handleDotClick = (dotIndex: number) => {
    const newVol = dotIndex / (NUM_DOTS - 1);
    onChange(newVol);
  };

  // Generate dots around the perimeter
  const dots = Array.from({ length: NUM_DOTS }).map((_, index) => {
    const ratio = index / (NUM_DOTS - 1);
    const angleDeg = DOT_START_ANGLE + ratio * (DOT_END_ANGLE - DOT_START_ANGLE);
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // 0 at top (-90 offset)

    // Position coordinates relative to center
    const x = Math.cos(angleRad) * dimensions.dotRadius;
    const y = Math.sin(angleRad) * dimensions.dotRadius;

    // Dot size increases gradually from min to max
    const dotSize =
      dimensions.minDotSize +
      ratio * (dimensions.maxDotSize - dimensions.minDotSize);

    // Is this dot active (illuminated red)?
    // Dot becomes active if current volume is at or past this dot's threshold
    const dotThreshold = ratio;
    const isActive = volume >= dotThreshold - 0.03 && volume > 0.01;

    return {
      index,
      x,
      y,
      dotSize,
      isActive,
      ratio,
    };
  });

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none touch-none"
      onWheel={handleWheel}
      style={{ width: dimensions.container, height: dimensions.container + (showLabel ? 26 : 0) }}
    >
      {/* Outer Circle Container holding Dots & Marks */}
      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ width: dimensions.container, height: dimensions.container }}
      >
        {/* Min Marker "|" at bottom left */}
        <div
          className={`absolute text-[10px] font-mono font-bold transition-colors duration-200 pointer-events-none ${
            volume <= 0.02 ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'text-zinc-500'
          }`}
          style={{
            transform: `translate(${Math.cos(((-148 - 90) * Math.PI) / 180) * (dimensions.dotRadius + 5)}px, ${
              Math.sin(((-148 - 90) * Math.PI) / 180) * (dimensions.dotRadius + 5)
            }px)`,
          }}
        >
          |
        </div>

        {/* Max Marker "||" at bottom right */}
        <div
          className={`absolute text-[10px] font-mono font-bold transition-colors duration-200 pointer-events-none ${
            volume >= 0.95 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]' : 'text-zinc-500'
          }`}
          style={{
            transform: `translate(${Math.cos(((148 - 90) * Math.PI) / 180) * (dimensions.dotRadius + 5)}px, ${
              Math.sin(((148 - 90) * Math.PI) / 180) * (dimensions.dotRadius + 5)
            }px)`,
          }}
        >
          ||
        </div>

        {/* Perimeter Dots (Illuminating Red When Volume is Turned Up) */}
        {dots.map((dot) => (
          <button
            key={dot.index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(dot.index);
            }}
            title={`Set volume to ${Math.round(dot.ratio * 100)}%`}
            className="absolute rounded-full transition-all duration-200 cursor-pointer -translate-x-1/2 -translate-y-1/2 hover:scale-125 focus:outline-none"
            style={{
              left: `calc(50% + ${dot.x}px)`,
              top: `calc(50% + ${dot.y}px)`,
              width: `${dot.dotSize}px`,
              height: `${dot.dotSize}px`,
              backgroundColor: dot.isActive ? '#ef4444' : '#27272a',
              boxShadow: dot.isActive
                ? '0 0 10px #ef4444, 0 0 4px #f87171, inset 0 0 2px #ffffff'
                : 'inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.05)',
              border: dot.isActive ? '1px solid #fca5a5' : '1px solid #3f3f46',
            }}
          />
        ))}

        {/* The Heavy Brushed Aluminum Rotary Metal Knob */}
        <div
          className="relative rounded-full transition-transform duration-75 ease-out shadow-[0_10px_25px_rgba(0,0,0,0.9),0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8)] border border-[#a1a1aa]/40"
          style={{
            width: `${dimensions.knob}px`,
            height: `${dimensions.knob}px`,
            transform: `rotate(${currentAngle}deg)`,
            background:
              'radial-gradient(circle at 40% 35%, #e4e4e7 0%, #a1a1aa 45%, #71717a 70%, #52525b 100%)',
          }}
        >
          {/* Concentric Brushed Metal Radial Surface Ring */}
          <div
            className="absolute inset-[3px] rounded-full border border-white/30"
            style={{
              background: `conic-gradient(
                from 0deg,
                #d4d4d8 0deg,
                #71717a 45deg,
                #e4e4e7 90deg,
                #52525b 135deg,
                #d4d4d8 180deg,
                #71717a 225deg,
                #e4e4e7 270deg,
                #52525b 315deg,
                #d4d4d8 360deg
              )`,
            }}
          >
            {/* Center Machined Metal Cap with Radial Shading */}
            <div
              className="absolute inset-[10%] rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.6)]"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #f4f4f5 0%, #a1a1aa 60%, #71717a 100%)',
              }}
            >
              {/* Fine center machine spin spindle dot */}
              <div className="absolute inset-[38%] rounded-full bg-zinc-600/30 border border-black/20" />
            </div>

            {/* Glowing Red Indicator LED / Dot On the Knob Perimeter */}
            <div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 border border-white/80"
              style={{
                top: '50%',
                left: '16%',
                width: `${size === 'lg' ? 9 : size === 'md' ? 7.5 : 5.5}px`,
                height: `${size === 'lg' ? 9 : size === 'md' ? 7.5 : 5.5}px`,
                backgroundColor: volume > 0 ? '#ef4444' : '#450a0a',
                boxShadow:
                  volume > 0
                    ? '0 0 8px #ef4444, 0 0 3px #f87171, inset 0 1px 1px #fff'
                    : 'inset 0 1px 2px rgba(0,0,0,0.8)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Classic 'VOLUME' Typography Label and Numerical dB / % Readout */}
      {showLabel && (
        <div className="flex flex-col items-center justify-center mt-1 text-center pointer-events-none">
          <span
            className={`font-mono font-semibold tracking-[0.2em] text-zinc-400 uppercase ${dimensions.labelSize}`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            VOLUME
          </span>
          <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
            {volume === 0 ? 'MUTE' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      )}
    </div>
  );
};
