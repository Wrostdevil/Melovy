import React from 'react';
import { Dna, Sparkles, Activity } from 'lucide-react';

export const MusicDNA: React.FC = () => {
  const breakdown = [
    { mood: "Chill & Ambient", pct: 32, color: "from-[#4fd6e8] to-[#9b6bff]" },
    { mood: "Energetic & Upbeat", pct: 24, color: "from-[#e057c1] to-[#ff8c5a]" },
    { mood: "Romantic & Mellow", pct: 18, color: "from-[#e057c1] to-[#c83c5a]" },
    { mood: "Focus & Deep Work", pct: 15, color: "from-[#4fd6e8] to-[#4f96e8]" },
    { mood: "Melancholic & Reflective", pct: 11, color: "from-[#4f5ac8] to-[#463c8c]" },
  ];

  return (
    <div className="space-y-6 animate-fadein">
      <div>
        <h1 className="font-display text-[28px] font-medium text-[#f3f1f7]">Music DNA & Photometry</h1>
        <p className="text-sm text-[#a79fbf] mt-1">
          A real-time breakdown of your acoustic taste preferences and mood distribution across listening sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taste Breakdown Bars */}
        <div className="p-6 rounded-2xl bg-[#15121e] border border-white/10 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#f3f1f7]">
            <Dna className="w-4 h-4 text-[#9b6bff]" />
            <span>Mood Spectrum Distribution</span>
          </div>

          <div className="space-y-4 pt-2">
            {breakdown.map((item) => (
              <div key={item.mood} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[#a79fbf]">
                  <span>{item.mood}</span>
                  <span className="text-[#f3f1f7] font-semibold">{item.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listening Profile Snapshot */}
        <div className="p-6 rounded-2xl bg-[#15121e] border border-white/10 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f3f1f7] mb-4">
              <Sparkles className="w-4 h-4 text-[#e057c1]" />
              <span>Acoustic Archetype</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs uppercase font-mono tracking-wider text-[#9b6bff]">ARCHETYPE PROFILE</div>
              <div className="font-display italic text-2xl text-[#f3f1f7]">The Atmospheric Voyager</div>
              <p className="text-xs text-[#a79fbf] leading-relaxed">
                You lean heavily into harmonic ambient pads, gentle acoustic rhythms, and late-night synth soundscapes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-mono uppercase text-[#6e6685]">Peak Hours</div>
                <div className="text-sm font-semibold text-[#f3f1f7] mt-1">10 PM - 2 AM</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] font-mono uppercase text-[#6e6685]">Base Freq Key</div>
                <div className="text-sm font-semibold text-[#f3f1f7] mt-1">D-Minor Ambient</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6e6685] pt-2 border-t border-white/10">
            <Activity className="w-3.5 h-3.5 text-[#4fd6e8]" />
            <span>Updated live from WebAudio engine harmonics</span>
          </div>
        </div>
      </div>
    </div>
  );
};
