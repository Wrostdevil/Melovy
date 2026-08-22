import React, { useEffect, useRef } from 'react';
import { useTheme } from '../lib/themeContext';
import { usePlayer } from '../lib/playerContext';

export const GenreBackground: React.FC = () => {
  const { genreArt, bgSettings, visualizerOn, theme } = useTheme();
  const { isPlaying, currentSong } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated particles (Lotus petals, Gold dust, Fireflies, Stars)
  useEffect(() => {
    if (!visualizerOn || bgSettings.particles === 'off') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = bgSettings.particles === 'gold-dust' ? 45 : bgSettings.particles === 'lotus' ? 22 : 30;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      color: string;
    }> = [];

    const lotusColors = ['#f472b6', '#fb7185', '#fda4af', '#fcd34d', '#e88d30'];
    const goldColors = ['#d4af37', '#f59e0b', '#fbbf24', '#fef08a', '#e5a93b'];
    const starColors = ['#ffffff', '#38bdf8', '#c084fc', '#f472b6'];
    const fireflyColors = ['#a3e635', '#fde047', '#34d399', '#facc15'];

    for (let i = 0; i < particleCount; i++) {
      let colorSet = goldColors;
      if (bgSettings.particles === 'lotus') colorSet = lotusColors;
      else if (bgSettings.particles === 'stars') colorSet = starColors;
      else if (bgSettings.particles === 'fireflies') colorSet = fireflyColors;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: bgSettings.particles === 'lotus' ? 7 + Math.random() * 8 : 1.5 + Math.random() * 3.5,
        speedX: (Math.random() - 0.5) * (isPlaying ? 0.6 : 0.3),
        speedY: (0.2 + Math.random() * 0.5) * (bgSettings.particles === 'lotus' ? 0.8 : 0.4),
        opacity: 0.2 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: colorSet[Math.floor(Math.random() * colorSet.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (bgSettings.particles === 'lotus') {
          // Draw delicate lotus petal
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.3, p.size * 0.7, p.size * 0.5, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.5, -p.size * 0.7, -p.size * 0.3, 0, -p.size);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        } else if (bgSettings.particles === 'gold-dust' || bgSettings.particles === 'fireflies') {
          // Glowing circular orb
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        } else {
          // Star shimmer
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [visualizerOn, bgSettings.particles, isPlaying]);

  const bgImage = genreArt.image;
  const isHeritage = theme === 'royal-heritage' || theme === 'lotus-sunset' || theme === 'emerald-peacock';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Genre Artwork Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{
          backgroundImage: `url("${bgImage}")`,
          opacity: visualizerOn ? bgSettings.opacity : 0.12,
          filter: bgSettings.blur > 0 ? `blur(${bgSettings.blur}px)` : 'none'
        }}
      />

      {/* Atmospheric Theme Color Mesh Gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, ${genreArt.glowColor}, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 85%, rgba(12, 38, 51, 0.65), transparent 70%),
            radial-gradient(ellipse 70% 60% at 10% 90%, rgba(8, 23, 32, 0.75), transparent 70%)
          `
        }}
      />

      {/* Dark Ambient Vignette to Guarantee Pristine Contrast */}
      {bgSettings.vignette && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 35%, rgba(6, 14, 20, 0.85) 90%, rgba(3, 8, 12, 0.96) 100%)'
          }}
        />
      )}

      {/* Subtle Ornate Mughal Arch Filigree Frame Accents for Royal Heritage theme */}
      {isHeritage && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {/* Top Left Arch Filigree */}
          <svg className="absolute top-0 left-0 w-32 md:w-48 h-32 md:h-48 text-[#d4af37]" viewBox="0 0 100 100" fill="none">
            <path d="M0,0 L100,0 C60,5 20,40 0,100 Z" fill="currentColor" fillOpacity="0.08" />
            <path d="M0,0 Q50,0 70,30 Q90,60 100,100" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="15" cy="15" r="4" fill="currentColor" fillOpacity="0.25" />
            <circle cx="35" cy="10" r="2" fill="currentColor" fillOpacity="0.3" />
            <circle cx="10" cy="35" r="2" fill="currentColor" fillOpacity="0.3" />
          </svg>

          {/* Top Right Arch Filigree */}
          <svg className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 text-[#d4af37] transform scale-x-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M0,0 L100,0 C60,5 20,40 0,100 Z" fill="currentColor" fillOpacity="0.08" />
            <path d="M0,0 Q50,0 70,30 Q90,60 100,100" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="15" cy="15" r="4" fill="currentColor" fillOpacity="0.25" />
            <circle cx="35" cy="10" r="2" fill="currentColor" fillOpacity="0.3" />
            <circle cx="10" cy="35" r="2" fill="currentColor" fillOpacity="0.3" />
          </svg>

          {/* Subtle Center Mandala Glow in Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#d4af37]/10 opacity-20 animate-spin-mandala flex items-center justify-center">
            <div className="w-[450px] h-[450px] rounded-full border border-[#d4af37]/15 border-dashed" />
            <div className="w-[300px] h-[300px] rounded-full border border-[#e88d30]/20" />
          </div>
        </div>
      )}

      {/* Floating Canvas Particles (Lotus Petals / Gold Dust) */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Subtle Analog Texture Layer */}
      <div id="noise" />
    </div>
  );
};
