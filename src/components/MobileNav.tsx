import React from 'react';
import { usePlayer } from '../lib/playerContext';
import { Home, Search, Library, Disc, Sliders, Dna, Users, Sparkles } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsImmersiveOpen } = usePlayer();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Ragas', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'canvas', label: 'Canvas', icon: Disc },
    { id: 'discovery', label: 'Slider', icon: Sliders },
    { id: 'dna', label: 'DNA', icon: Dna },
    { id: 'rooms', label: 'Rooms', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070e14]/95 backdrop-blur-2xl border-t border-[#d4af37]/25 px-1 py-1 flex items-center justify-around select-none shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all min-w-[44px] min-h-[44px] ${
              isActive
                ? 'text-[#fcd34d] bg-[#d4af37]/15 font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                : 'text-[#8e806a] hover:text-[#d4c5a9]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110 text-[#d4af37]' : ''} transition-transform`} />
            <span className={`text-[9px] mt-0.5 font-mono uppercase tracking-wider ${isActive ? 'font-bold text-[#fdfbf7]' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
