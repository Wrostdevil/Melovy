import React from 'react';
import { usePlayer } from '../lib/playerContext';
import { ROOM_DEFS } from '../data/musicCatalog';
import { Users, Music, MessageCircle } from 'lucide-react';

export const VibeRooms: React.FC = () => {
  const { openRoom } = usePlayer();

  return (
    <div className="space-y-6 animate-fadein">
      <div>
        <h1 className="font-display text-[28px] font-medium text-[#f3f1f7]">Vibe Rooms</h1>
        <p className="text-sm text-[#a79fbf] mt-1">
          Synchronized live listening rooms where music lovers listen and react together in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {ROOM_DEFS.map(room => (
          <div
            key={room.id}
            className="p-6 rounded-2xl bg-[#15121e] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{room.emoji}</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#a79fbf]">
                  <Users className="w-3 h-3 text-[#4fd6e8]" />
                  <span>{room.listeners} listening</span>
                </span>
              </div>

              <h2 className="font-display italic text-2xl text-[#f3f1f7] group-hover:text-[#9b6bff] transition-colors">
                {room.name}
              </h2>
              <p className="text-xs text-[#a79fbf] mt-2 line-clamp-2">{room.desc}</p>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 text-xs text-[#6e6685]">
                <Music className="w-3.5 h-3.5 text-[#e057c1]" />
                <span className="truncate">Now playing in room</span>
              </div>
            </div>

            <button
              onClick={() => openRoom(room)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join listening room</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
