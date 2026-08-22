import React, { useState, useRef } from 'react';
import { usePlayer } from '../lib/playerContext';
import { CATALOG } from '../data/musicCatalog';
import { Play, Heart, Plus, ArrowLeft, Trash2, Music2, ExternalLink, UploadCloud, Radio, Sparkles } from 'lucide-react';

interface LibraryViewProps {
  initialPlaylistId?: string | null;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ initialPlaylistId }) => {
  const {
    likedSongIds,
    playlists,
    recentlyPlayed,
    playTrack,
    toggleLike,
    openAddToPlaylistModal,
    setIsPlaylistModalOpen,
    setIsSpotifyModalOpen,
    importLocalAudioFiles,
    addCustomAudioTrack,
    allSongs,
    selectedPlaylistId,
    setSelectedPlaylistId,
    librarySubTab,
    setLibrarySubTab,
  } = usePlayer();

  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [isAddingStream, setIsAddingStream] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getTrackById = (id: string) => allSongs.find(t => t.id === id) || CATALOG.find(t => t.id === id);

  const likedTracks = (allSongs.length > 0 ? allSongs : CATALOG).filter(t => likedSongIds.has(t.id));
  const uploadedTracks = allSongs.filter(t => t.id.startsWith('local_') || t.id.startsWith('stream_'));
  const recentTracks = recentlyPlayed.map(id => getTrackById(id)!).filter(Boolean);
  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  // Set initial playlist if prop passed
  React.useEffect(() => {
    if (initialPlaylistId) {
      setSelectedPlaylistId(initialPlaylistId);
      setLibrarySubTab('playlists');
    }
  }, [initialPlaylistId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importLocalAudioFiles(e.target.files);
    }
  };

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;
    addCustomAudioTrack(streamTitle || 'Web Radio / Stream', 'Live Stream', streamUrl.trim());
    setStreamUrl('');
    setStreamTitle('');
    setIsAddingStream(false);
  };

  return (
    <div className="space-y-6 animate-fadein">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Universal Audio Uploader & Stream Bar */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-[#10212c] via-[#0b1720] to-[#10212c] border border-[#d4af37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4af37] font-bold">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            Universal Music Player & Library
          </div>
          <h3 className="font-display text-lg text-white font-medium mt-0.5">
            Play any music file, stream URL, or Spotify playlist
          </h3>
          <p className="text-xs text-[#d4c5a9]">
            Load your local MP3 / audio files or stream direct audio feeds directly with full synthesizer enhancements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] text-xs font-bold hover:brightness-110 shadow-[0_2px_12px_rgba(212,175,55,0.35)] transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Import MP3 / Audio Files</span>
          </button>

          <button
            onClick={() => setIsAddingStream(!isAddingStream)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#10212c] border border-[#d4af37]/40 text-[#fcd34d] hover:bg-[#d4af37]/15 text-xs font-semibold transition-all"
          >
            <Radio className="w-4 h-4 text-[#d4af37]" />
            <span>{isAddingStream ? 'Close Stream' : 'Add Stream URL'}</span>
          </button>
        </div>
      </div>

      {/* Stream Input Form */}
      {isAddingStream && (
        <form onSubmit={handleAddStream} className="p-4 rounded-xl bg-[#10212c] border border-[#d4af37]/40 space-y-3 animate-fadein">
          <div className="text-xs font-mono font-semibold text-[#d4af37] uppercase">Add Direct Audio Stream URL (MP3/Radio)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Track Title (e.g. Raga Darbari Live Radio)"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="bg-[#0b1720] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e806a] focus:outline-none focus:border-[#d4af37]"
            />
            <input
              type="url"
              placeholder="Direct Audio / Stream URL (https://...mp3)"
              required
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="bg-[#0b1720] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#8e806a] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingStream(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#d4c5a9] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#070e14] text-xs font-bold hover:brightness-110"
            >
              Play & Add Stream
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setSelectedPlaylistId(null); setLibrarySubTab('liked'); }}
            className={`text-base md:text-lg font-display font-medium whitespace-nowrap transition-colors ${librarySubTab === 'liked' && !selectedPlaylistId ? 'text-[#f3f1f7]' : 'text-[#6e6685] hover:text-[#a79fbf]'}`}
          >
            Liked Songs ({likedTracks.length})
          </button>
          <button
            onClick={() => { setSelectedPlaylistId(null); setLibrarySubTab('uploads'); }}
            className={`text-base md:text-lg font-display font-medium whitespace-nowrap transition-colors ${librarySubTab === 'uploads' && !selectedPlaylistId ? 'text-[#fcd34d]' : 'text-[#6e6685] hover:text-[#a79fbf]'}`}
          >
            My Uploads ({uploadedTracks.length})
          </button>
          <button
            onClick={() => { setSelectedPlaylistId(null); setLibrarySubTab('playlists'); }}
            className={`text-base md:text-lg font-display font-medium whitespace-nowrap transition-colors ${librarySubTab === 'playlists' && !selectedPlaylistId ? 'text-[#f3f1f7]' : 'text-[#6e6685] hover:text-[#a79fbf]'}`}
          >
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => { setSelectedPlaylistId(null); setLibrarySubTab('recent'); }}
            className={`text-base md:text-lg font-display font-medium whitespace-nowrap transition-colors ${librarySubTab === 'recent' && !selectedPlaylistId ? 'text-[#f3f1f7]' : 'text-[#6e6685] hover:text-[#a79fbf]'}`}
          >
            Recently Played
          </button>
        </div>

        {librarySubTab === 'playlists' && !selectedPlaylistId && (
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e88d30] text-[#070e14] text-xs font-bold hover:brightness-110 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {/* Playlist Detail View */}
      {selectedPlaylistId && selectedPlaylist ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedPlaylistId(null)}
            className="flex items-center gap-2 text-xs text-[#a79fbf] hover:text-[#f3f1f7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to playlists</span>
          </button>

          <div className="flex items-center gap-6 p-6 rounded-2xl bg-[#15121e] border border-white/10">
            {selectedPlaylist.coverUrl ? (
              <img
                src={selectedPlaylist.coverUrl}
                alt={selectedPlaylist.name}
                className="w-28 h-28 rounded-xl shrink-0 object-cover shadow-lg border border-white/10"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-xl shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${selectedPlaylist.color[0]}, ${selectedPlaylist.color[1]})` }}
              />
            )}
            <div>
              <div className="text-xs uppercase tracking-wider text-[#6e6685] font-mono flex items-center gap-2">
                <span>PLAYLIST</span>
                {selectedPlaylist.isSpotifyImport && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-[#1DB954]/20 text-[#1DB954] rounded-full border border-[#1DB954]/30">
                    Spotify Synced
                  </span>
                )}
              </div>
              <h1 className="font-display italic text-3xl font-medium text-[#f3f1f7] mt-1">{selectedPlaylist.name}</h1>
              <p className="text-sm text-[#a79fbf] mt-2">{selectedPlaylist.desc}</p>
              <div className="text-xs text-[#6e6685] mt-3">{selectedPlaylist.trackIds.length} tracks</div>
            </div>
          </div>

          <div className="space-y-1">
            {selectedPlaylist.trackIds.map((tid, i) => {
              const track = getTrackById(tid);
              if (!track) return null;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track.id)}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#15121e] border border-transparent hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-mono text-[#6e6685] w-5 text-right shrink-0">{i + 1}</span>
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg shrink-0 object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-display text-xs text-white"
                        style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
                      >
                        <Play className="w-4 h-4 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#f3f1f7] truncate flex items-center gap-2">
                        <span>{track.title}</span>
                        {track.spotifyUrl && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#1DB954]/20 text-[#1DB954] rounded border border-[#1DB954]/30">
                            Spotify
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#6e6685] truncate">{track.artist}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#6e6685]">{formatTime(track.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : librarySubTab === 'playlists' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Connect Spotify Playlist Card */}
          <div
            onClick={() => setIsSpotifyModalOpen(true)}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#1DB954]/15 via-[#15121e] to-[#15121e] border border-[#1DB954]/40 hover:border-[#1DB954] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="w-full aspect-square rounded-xl mb-3 bg-[#1DB954]/20 border border-[#1DB954]/30 flex flex-col items-center justify-center text-[#1DB954] p-4 text-center group-hover:scale-[1.02] transition-transform">
              <Music2 className="w-10 h-10 mb-2" />
              <span className="text-xs font-mono uppercase font-bold tracking-wider">Connect Spotify</span>
            </div>
            <div>
              <div className="font-display italic text-lg text-[#f3f1f7] flex items-center gap-2">
                Import Playlist
                <ExternalLink className="w-4 h-4 text-[#1DB954]" />
              </div>
              <div className="text-xs text-[#1DB954] mt-1 font-mono">Sync live Spotify tracks →</div>
            </div>
          </div>

          {playlists.map(pl => (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className="p-4 rounded-2xl bg-[#15121e] border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all cursor-pointer group"
            >
              {pl.coverUrl ? (
                <div className="w-full aspect-square rounded-xl mb-3 shadow-md relative overflow-hidden">
                  <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              ) : (
                <div
                  className="w-full aspect-square rounded-xl mb-3 shadow-md relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${pl.color[0]}, ${pl.color[1]})` }}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              )}
              <div className="font-display italic text-lg text-[#f3f1f7] truncate">{pl.name}</div>
              <div className="text-xs text-[#6e6685] mt-1">{pl.trackIds.length} tracks</div>
            </div>
          ))}
        </div>
      ) : librarySubTab === 'uploads' ? (
        /* Uploaded Audio Files */
        <div className="space-y-4">
          {uploadedTracks.length === 0 ? (
            <div className="p-8 md:p-12 text-center rounded-2xl bg-[#10212c]/60 border border-dashed border-[#d4af37]/30 flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-[#d4af37]/60 mb-3" />
              <h4 className="font-display text-lg text-white">No local audio files imported yet</h4>
              <p className="text-xs text-[#d4c5a9] max-w-md mt-1 mb-4">
                You can import MP3, WAV, FLAC, M4A, or AAC audio files from your device to play them seamlessly inside Melovy.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-[#070e14] text-xs font-bold hover:brightness-110 shadow-lg cursor-pointer"
              >
                Choose Audio Files from Device
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {uploadedTracks.map((track, i) => {
                const isLiked = likedSongIds.has(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track.id)}
                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#15121e] border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono text-[#6e6685] w-5 text-right shrink-0">{i + 1}</span>
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-display text-xs text-white"
                        style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
                      >
                        <Play className="w-4 h-4 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#f3f1f7] truncate flex items-center gap-2">
                          <span>{track.title}</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#d4af37]/20 text-[#d4af37] rounded border border-[#d4af37]/30">
                            {track.genre}
                          </span>
                        </div>
                        <div className="text-xs text-[#6e6685] truncate">{track.artist}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${isLiked ? 'text-[#e057c1]' : 'text-[#6e6685]'}`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylistModal(track.id);
                        }}
                        className="p-1.5 rounded-md text-[#6e6685] hover:text-[#f3f1f7] hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono text-[#6e6685] w-10 text-right">{formatTime(track.duration)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Liked Songs or Recently Played Track List */
        <div className="space-y-1">
          {(librarySubTab === 'liked' ? likedTracks : recentTracks).map((track, i) => {
            const isLiked = likedSongIds.has(track.id);
            return (
              <div
                key={track.id + i}
                onClick={() => playTrack(track.id)}
                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#15121e] border border-transparent hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-[#6e6685] w-5 text-right shrink-0">{i + 1}</span>
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-display text-xs text-white"
                    style={{ background: `linear-gradient(135deg, ${track.colors[0]}, ${track.colors[1]})` }}
                  >
                    <Play className="w-4 h-4 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#f3f1f7] truncate">{track.title}</div>
                    <div className="text-xs text-[#6e6685] truncate">{track.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${isLiked ? 'text-[#e057c1]' : 'text-[#6e6685]'}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylistModal(track.id);
                    }}
                    className="p-1.5 rounded-md text-[#6e6685] hover:text-[#f3f1f7] hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-[#6e6685] w-10 text-right">{formatTime(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
