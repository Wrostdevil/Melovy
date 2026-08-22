import React, { useState } from 'react';
import { usePlayer } from '../lib/playerContext';
import { CATALOG, GRADIENTS } from '../data/musicCatalog';
import { X, Search, Plus, Send, Copy, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

/* Search Modal Overlay */
export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen, playTrack } = usePlayer();
  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const filtered = CATALOG.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase()) ||
    t.mood.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-fadein">
      <div className="w-full max-w-xl bg-[#15121e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6e6685]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, moods..."
            className="flex-1 bg-transparent text-[#f3f1f7] text-base placeholder-[#6e6685] focus:outline-none"
          />
          <button onClick={() => setIsSearchModalOpen(false)} className="p-1 text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.map(track => (
            <div
              key={track.id}
              onClick={() => {
                playTrack(track.id);
                setIsSearchModalOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg shrink-0 font-display text-xs text-white flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
              >
                {track.title[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#f3f1f7] truncate">{track.title}</div>
                <div className="text-xs text-[#6e6685] truncate">{track.artist}</div>
              </div>
              <span className="text-xs font-mono text-[#a79fbf] uppercase px-2 py-0.5 rounded bg-white/5">
                {track.mood}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* New Playlist Modal */
export const NewPlaylistModal: React.FC = () => {
  const { isPlaylistModalOpen, setIsPlaylistModalOpen, createPlaylist } = usePlayer();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  if (!isPlaylistModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlaylist(name, desc, colorIdx);
    setName('');
    setDesc('');
    setIsPlaylistModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#15121e] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display italic text-2xl font-medium text-[#f3f1f7]">New Playlist</h2>
          <button type="button" onClick={() => setIsPlaylistModalOpen(false)} className="text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist title..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f3f1f7] placeholder-[#6e6685] text-sm focus:outline-none focus:border-[#9b6bff]"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f3f1f7] placeholder-[#6e6685] text-sm focus:outline-none focus:border-[#9b6bff] h-20 resize-none"
          />
        </div>

        <div>
          <div className="text-xs font-mono uppercase text-[#6e6685] mb-2">COVER GRADIENT</div>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENTS.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setColorIdx(i)}
                className={`h-10 rounded-xl transition-transform ${colorIdx === i ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'}`}
                style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
};

/* Add to Playlist Modal */
export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistModalOpen,
    closeAddToPlaylistModal,
    addToPlaylistTargetTrackId,
    playlists,
    addTrackToPlaylist
  } = usePlayer();

  if (!isAddToPlaylistModalOpen || !addToPlaylistTargetTrackId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
      <div className="w-full max-w-sm bg-[#15121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display italic text-xl font-medium text-[#f3f1f7]">Add to Playlist</h2>
          <button onClick={closeAddToPlaylistModal} className="text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => {
                addTrackToPlaylist(pl.id, addToPlaylistTargetTrackId);
                closeAddToPlaylistModal();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-white/5 text-left transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${pl.color[0]}, ${pl.color[1]})` }}
              />
              <span className="text-sm font-semibold text-[#f3f1f7] truncate">{pl.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Queue Modal */
export const QueueModal: React.FC = () => {
  const {
    isQueueModalOpen,
    setIsQueueModalOpen,
    queue,
    queueIndex,
    reorderQueue,
    removeFromQueue,
    playTrack
  } = usePlayer();

  if (!isQueueModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
      <div className="w-full max-w-lg bg-[#15121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="font-display italic text-2xl font-medium text-[#f3f1f7]">Up Next Queue</h2>
          <button onClick={() => setIsQueueModalOpen(false)} className="text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-1 pr-1">
          {queue.map((trackId, i) => {
            const track = CATALOG.find(t => t.id === trackId);
            if (!track) return null;
            const isPlayingNow = i === queueIndex;

            return (
              <div
                key={trackId + i}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isPlayingNow ? 'bg-[#9b6bff]/20 border-[#9b6bff]/50' : 'bg-white/5 border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => playTrack(track.id)}>
                  <span className="text-xs font-mono text-[#6e6685] w-5 text-right shrink-0">{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 font-display text-xs text-white flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
                  >
                    {track.title[0]}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isPlayingNow ? 'text-[#9b6bff]' : 'text-[#f3f1f7]'}`}>
                      {track.title}
                    </div>
                    <div className="text-[11px] text-[#6e6685] truncate">{track.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reorderQueue(i, i - 1)}
                    disabled={i === 0}
                    className="p-1 text-[#6e6685] hover:text-[#f3f1f7] disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reorderQueue(i, i + 1)}
                    disabled={i === queue.length - 1}
                    className="p-1 text-[#6e6685] hover:text-[#f3f1f7] disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFromQueue(i)}
                    className="p-1 text-[#6e6685] hover:text-[#e057c1]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* Share Modal */
export const ShareModal: React.FC = () => {
  const { isShareModalOpen, closeShareModal, shareTargetTrackId, showToast } = usePlayer();

  if (!isShareModalOpen || !shareTargetTrackId) return null;

  const track = CATALOG.find(t => t.id === shareTargetTrackId);
  const shareUrl = `${window.location.origin}/#track-${shareTargetTrackId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast("Share link copied to clipboard");
    closeShareModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
      <div className="w-full max-w-sm bg-[#15121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display italic text-xl font-medium text-[#f3f1f7]">Share Track</h2>
          <button onClick={closeShareModal} className="text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {track && (
          <div className="text-xs text-[#a79fbf]">
            Sharing <span className="text-[#f3f1f7] font-semibold">{track.title}</span> by {track.artist}
          </div>
        )}

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-[#a79fbf] font-mono px-2 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* Vibe Room Chat Modal */
export const VibeRoomChatModal: React.FC = () => {
  const { isRoomModalOpen, closeRoom, activeRoom, roomMessages, sendRoomMessage } = usePlayer();
  const [text, setText] = useState('');

  if (!isRoomModalOpen || !activeRoom) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendRoomMessage(text);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadein">
      <div className="w-full max-w-lg bg-[#15121e] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl h-[520px] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeRoom.emoji}</span>
            <div>
              <h2 className="font-display italic text-xl font-medium text-[#f3f1f7]">{activeRoom.name}</h2>
              <div className="text-xs text-[#6e6685]">{activeRoom.listeners} listening right now</div>
            </div>
          </div>
          <button onClick={closeRoom} className="text-[#6e6685] hover:text-[#f3f1f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {roomMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.me ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] text-[#6e6685] mb-0.5">{msg.userName}</div>
              <div
                className={`px-3.5 py-2 rounded-2xl text-xs max-w-[80%] ${
                  msg.me ? 'bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white rounded-br-none' : 'bg-white/10 text-[#f3f1f7] rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Send Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something to the room..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f3f1f7] placeholder-[#6e6685] focus:outline-none focus:border-[#9b6bff]"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#9b6bff] to-[#e057c1] text-white shrink-0 hover:brightness-110"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

/* Floating Toast Banner */
export const ToastBanner: React.FC = () => {
  const { toastMessage } = usePlayer();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-[#15121e]/90 border border-[#9b6bff]/50 text-[#f3f1f7] text-xs font-mono px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-fadein">
      {toastMessage}
    </div>
  );
};

import { SpotifyImportModal } from './SpotifyImportModal';
import { GenreArtModal } from './GenreArtModal';

/* Combined Modals Container */
export const Modals: React.FC = () => {
  return (
    <>
      <SearchModal />
      <NewPlaylistModal />
      <AddToPlaylistModal />
      <QueueModal />
      <ShareModal />
      <VibeRoomChatModal />
      <SpotifyImportModal />
      <GenreArtModal />
      <ToastBanner />
    </>
  );
};
