import React, { useState, useEffect } from 'react';
import { usePlayer } from '../lib/playerContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Link2,
  Music2,
  ShieldCheck,
  LogOut,
  Play
} from 'lucide-react';

export const SpotifyImportModal: React.FC = () => {
  const {
    isSpotifyModalOpen,
    setIsSpotifyModalOpen,
    addImportedPlaylist,
    spotifyToken,
    setSpotifyToken,
    spotifyUser,
    setSpotifyUser,
    logoutSpotify,
    showToast,
  } = usePlayer();

  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [fetchingPlaylists, setFetchingPlaylists] = useState(false);

  // Popular sample Spotify playlist IDs
  const samplePlaylists = [
    { title: 'Chill Lofi Study Beats', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', tag: 'Lofi' },
    { title: 'Acoustic Covers & Solitude', url: 'https://open.spotify.com/playlist/37i9dQZF1DX0SM036SpBvL', tag: 'Acoustic' },
    { title: 'Midnight Jazz & Coffee', url: 'https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt', tag: 'Jazz' },
    { title: 'Deep Focus & Code Flow', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZEoA1AA4P2b', tag: 'Focus' },
  ];

  // Fetch playlists when modal opens with active session
  useEffect(() => {
    if (isSpotifyModalOpen && spotifyToken) {
      fetchUserPlaylists(spotifyToken);
    }
  }, [isSpotifyModalOpen, spotifyToken]);

  // Listen for OAuth Success postMessage from Spotify popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        const token = event.data.token;
        const user = event.data.user;
        setSpotifyToken(token);
        setSpotifyUser(user);
        showToast(`Connected to Spotify as ${user?.display_name || 'Spotify User'}!`);
        fetchUserPlaylists(token);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Fetch Spotify User's playlists when token is set
  const fetchUserPlaylists = async (token: string) => {
    setFetchingPlaylists(true);
    try {
      const res = await fetch('/api/spotify/user-playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(data.playlists || []);
      }
    } catch (e) {
      console.error('Failed to fetch Spotify playlists:', e);
    } finally {
      setFetchingPlaylists(false);
    }
  };

  // Launch OAuth Popup
  const handleConnectOAuth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/spotify/auth-url');
      if (!res.ok) throw new Error('Failed to fetch Spotify Auth URL');
      const data = await res.json();

      if (!data.url) {
        showToast('Spotify authorization is not configured.');
        return;
      }

      const popup = window.open(
        data.url,
        'spotify_oauth_popup',
        'width=600,height=720,scrollbars=yes'
      );

      if (!popup) {
        showToast('Please allow popups in your browser to connect Spotify.');
      }
    } catch (err) {
      console.error('Spotify OAuth error:', err);
      showToast('Could not initiate Spotify login popup.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutSpotify();
    setUserPlaylists([]);
  };

  // Handle Playlist URL Import
  const handleImportUrl = async (urlToImport?: string) => {
    const targetUrl = urlToImport || spotifyUrl;
    if (!targetUrl.trim()) {
      showToast('Please enter a Spotify Playlist link or ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/spotify/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyUrl: targetUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addImportedPlaylist(data.playlist, data.songs);
        setSpotifyUrl('');
        setIsSpotifyModalOpen(false);
        showToast(`Imported "${data.playlist.name}" with ${data.songs.length} tracks!`);
      } else {
        showToast(data.error || 'Failed to import Spotify playlist.');
      }
    } catch (err) {
      console.error('Spotify import error:', err);
      showToast('Error connecting to Spotify service.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSpotifyModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0b1720] border border-[#d4af37]/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-[#f3f1f7] relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-[#d4af37]/20 flex items-center justify-between bg-gradient-to-r from-[#1DB954]/15 via-[#0b1720] to-[#d4af37]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center text-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.3)]">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2 text-white">
                  Spotify
                  <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/40 font-bold">
                    {spotifyUser ? 'Connected' : 'Connect'}
                  </span>
                </h2>
                <p className="text-xs text-[#d4c5a9]">
                  Log in, view your playlists, or import any public playlist link
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSpotifyModalOpen(false)}
              className="p-2 text-[#d4c5a9] hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* Account Status / Log In / Log Out Section */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#10212c] border border-[#d4af37]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
                  Spotify Account
                </span>
                {spotifyUser && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-0.5 rounded-full border border-[#1DB954]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
                    Active Session
                  </span>
                )}
              </div>

              {spotifyUser ? (
                /* Logged In View */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#070e14] border border-white/10">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={spotifyUser.images?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                        alt={spotifyUser.display_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#1DB954] shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{spotifyUser.display_name}</p>
                          <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                        </div>
                        <p className="text-xs text-[#a79fbf]">
                          {spotifyUser.email || 'Spotify Linked Account'} {spotifyUser.product ? `• ${spotifyUser.product.toUpperCase()}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-semibold transition-all hover:border-red-500 shadow-sm self-end sm:self-auto cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>

                  {/* Connected Playlists View */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-[#d4af37] font-semibold">Your Spotify Playlists:</p>
                      <button
                        onClick={() => spotifyToken && fetchUserPlaylists(spotifyToken)}
                        disabled={fetchingPlaylists}
                        className="text-xs text-[#a79fbf] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${fetchingPlaylists ? 'animate-spin text-[#1DB954]' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {userPlaylists.length > 0 ? (
                        userPlaylists.map((pl) => (
                          <div
                            key={pl.id}
                            className="p-3 bg-[#070e14] border border-white/10 hover:border-[#1DB954]/50 rounded-xl flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={pl.coverUrl}
                                alt={pl.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-white truncate">{pl.name}</p>
                                <p className="text-[10px] text-[#8e85a6] truncate">{pl.desc}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleImportUrl(pl.spotifyUrl || pl.id)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1aa34a] text-[#070e14] font-bold text-xs rounded-lg transition-colors shrink-0 ml-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Import</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center rounded-xl bg-[#070e14]/50 text-xs text-[#8e85a6]">
                          {fetchingPlaylists ? 'Loading your Spotify playlists...' : 'No personal playlists found. You can paste any playlist link below.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Not Logged In - Clean Spotify Log In Button */
                <div className="space-y-3">
                  <p className="text-xs text-[#d4c5a9] leading-relaxed">
                    Log in with your Spotify account to sync your playlists directly into Melovy.
                  </p>
                  
                  <button
                    onClick={handleConnectOAuth}
                    disabled={loading}
                    className="w-full py-3 bg-[#1DB954] hover:bg-[#1aa34a] text-[#070e14] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(29,185,84,0.3)] cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    <span>Log in with Spotify</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Universal Spotify Link Importer */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5 font-bold">
                <Link2 className="w-3.5 h-3.5 text-[#1DB954]" />
                Import Any Spotify Playlist by Link or ID
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                  className="flex-1 bg-[#10212c] border border-[#d4af37]/30 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder:text-[#8e806a] focus:outline-none focus:border-[#d4af37] transition-colors"
                />
                <button
                  onClick={() => handleImportUrl()}
                  disabled={loading || !spotifyUrl.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:brightness-110 disabled:opacity-50 text-[#070e14] font-bold text-xs md:text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
                  <span>Import</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Playlists */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#d4c5a9]">
                Or try 1-Click popular Spotify playlists:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePlaylists.map((pl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleImportUrl(pl.url)}
                    disabled={loading}
                    className="p-3 bg-[#10212c]/60 hover:bg-[#1DB954]/15 border border-white/5 hover:border-[#1DB954]/50 rounded-xl text-left transition-all group flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-medium text-white group-hover:text-[#1DB954] transition-colors">
                        {pl.title}
                      </p>
                      <span className="text-[10px] text-[#8e806a] font-mono">{pl.tag}</span>
                    </div>
                    <span className="text-xs text-[#1DB954] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      Import →
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
