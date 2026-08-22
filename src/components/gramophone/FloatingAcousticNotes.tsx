import React from 'react';

interface FloatingAcousticNotesProps {
  isPlaying: boolean;
}

export const FloatingAcousticNotes: React.FC<FloatingAcousticNotesProps> = ({ isPlaying }) => {
  if (!isPlaying) return null;

  const notes = ['♪', '♫', '♬', '♩', '✨', '♪', '♫'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {notes.map((note, index) => {
        const leftPercent = 15 + ((index * 23) % 70);
        const animDuration = 6 + (index % 4) * 2;
        const animDelay = (index * 1.4) % 5;
        const size = 18 + (index % 3) * 8;

        return (
          <div
            key={index}
            className="absolute bottom-16 text-amber-200/50 font-serif select-none"
            style={{
              left: `${leftPercent}%`,
              fontSize: `${size}px`,
              animation: `floatUpward ${animDuration}s infinite ease-in`,
              animationDelay: `${animDelay}s`,
              textShadow: '0 0 12px rgba(251, 191, 36, 0.6)',
            }}
          >
            {note}
          </div>
        );
      })}

      <style>{`
        @keyframes floatUpward {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.75;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-80vh) translateX(${Math.sin(1) * 60}px) scale(1.3) rotate(35deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
