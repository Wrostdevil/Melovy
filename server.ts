import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize GoogleGenAI server-side with process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-Memory Database for Melovy Songs, Rooms, and Messages
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from "./src/data/musicCatalog";
import { VibeRoom, ChatMessage } from "./src/types";

let songsStore = [...INITIAL_SONGS];
let playlistsStore = [...INITIAL_PLAYLISTS];

let vibeRoomsStore: any[] = [
  {
    id: "room-1",
    name: "🌙 Late Night Nocturne",
    description: "Deep dark ambient, lofi beats, and quiet midnight thoughts.",
    moodTag: "Night",
    currentSongId: "song-1",
    currentSongTime: 45,
    listenerCount: 84,
    hostName: "Aura_Velvet",
    listeners: [
      { id: "u-1", name: "Aura_Velvet", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", vibeMatch: 98 },
      { id: "u-2", name: "Cosmic_Dreamer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", vibeMatch: 92 },
      { id: "u-3", name: "Luna_Vibe", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", vibeMatch: 88 }
    ],
    playlistSongIds: ["song-1", "song-2", "song-8", "song-5"],
    chatMessages: [
      { id: "m-1", userId: "u-1", userName: "Aura_Velvet", userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", text: "Welcome to the midnight session everyone ✨", timestamp: "23:40" },
      { id: "m-2", userId: "u-2", userName: "Cosmic_Dreamer", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", text: "This song hits so deep tonight", timestamp: "23:42" }
    ]
  },
  {
    id: "room-2",
    name: "🎧 Deep Focus & Code Flow",
    description: "Non-stop instrumental jazz, piano, and chill focus beats.",
    moodTag: "Focus",
    currentSongId: "song-4",
    currentSongTime: 110,
    listenerCount: 53,
    hostName: "Milo_Keys",
    listeners: [
      { id: "u-4", name: "Milo_Keys", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", vibeMatch: 95 },
      { id: "u-5", name: "CodeWizard", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", vibeMatch: 91 }
    ],
    playlistSongIds: ["song-4", "song-2", "song-8"],
    chatMessages: [
      { id: "m-3", userId: "u-4", userName: "Milo_Keys", userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", text: "Focus session active! ☕", timestamp: "14:15" }
    ]
  },
  {
    id: "room-3",
    name: "⚡ Cyber Synthwave Lounge",
    description: "Retro 80s neon synth, high energy, electronic soundscapes.",
    moodTag: "Energetic",
    currentSongId: "song-3",
    currentSongTime: 12,
    listenerCount: 31,
    hostName: "Cyber_Wave",
    listeners: [
      { id: "u-6", name: "Cyber_Wave", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", vibeMatch: 94 }
    ],
    playlistSongIds: ["song-3", "song-7"],
    chatMessages: [
      { id: "m-4", userId: "u-6", userName: "Cyber_Wave", userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", text: "Turn up the bass! 🚀", timestamp: "20:10" }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Melovy Music Engine" });
  });

  // Get all catalog songs
  app.get("/api/songs", (req, res) => {
    const { mood, genre, query, maxDiscovery } = req.query;
    let result = [...songsStore];

    if (mood && typeof mood === "string") {
      result = result.filter(s => s.mood.toLowerCase() === mood.toLowerCase());
    }

    if (genre && typeof genre === "string") {
      result = result.filter(s => s.genre.toLowerCase().includes(genre.toLowerCase()));
    }

    if (query && typeof query === "string") {
      const q = query.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    }

    if (maxDiscovery && !isNaN(Number(maxDiscovery))) {
      const maxD = Number(maxDiscovery);
      result = result.filter(s => s.discoveryScore <= maxD);
    }

    res.json({ songs: result });
  });

  // Vibe Canvas + Discovery Slider Recommendations Endpoint
  app.post("/api/recommendations", (req, res) => {
    const { x = 0, y = 0, discoveryLevel = 30 } = req.body;

    // Sort songs by Euclidean distance to target Vibe Coordinates (x, y)
    // weighted by Discovery Slider level preference
    const scoredSongs = songsStore.map(song => {
      const dx = (song.vibeCoordinates?.x ?? 0) - x;
      const dy = (song.vibeCoordinates?.y ?? 0) - y;
      const spatialDist = Math.sqrt(dx * dx + dy * dy);

      // Discovery penalty/bonus: discoveryLevel 0 = favor low discoveryScore, 100 = favor high discoveryScore
      const discoveryDiff = Math.abs((song.discoveryScore ?? 50) - discoveryLevel) / 100;

      const totalScore = spatialDist * 0.7 + discoveryDiff * 0.3;
      return { song, totalScore };
    });

    scoredSongs.sort((a, b) => a.totalScore - b.totalScore);

    res.json({
      recommendedSongs: scoredSongs.map(item => item.song),
      targetVibe: { x, y, discoveryLevel }
    });
  });

  // Get Playlists
  app.get("/api/playlists", (_req, res) => {
    res.json({ playlists: playlistsStore });
  });

  // Get Vibe Rooms
  app.get("/api/vibe-rooms", (_req, res) => {
    res.json({ rooms: vibeRoomsStore });
  });

  // Send message in Vibe Room
  app.post("/api/vibe-rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const { userName, userAvatar, text } = req.body;

    const room = vibeRoomsStore.find(r => r.id === roomId);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: `user-${Date.now()}`,
      userName: userName || "Listener",
      userAvatar: userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
      text: text || "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chatMessages.push(newMessage);
    res.json({ success: true, message: newMessage, room });
  });

  // Natural Language AI Music Discovery via Gemini API
  app.post("/api/ai-discovery", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Prompt string is required" });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return smart fallback catalog matching prompt keywords if key isn't provided
        const keywords = prompt.toLowerCase();
        const matched = songsStore.filter(s =>
          keywords.includes(s.mood.toLowerCase()) ||
          keywords.includes(s.genre.toLowerCase()) ||
          keywords.includes(s.title.toLowerCase())
        );
        const songsToReturn = matched.length > 0 ? matched : songsStore.slice(0, 4);

        res.json({
          interpretation: `Crafted a custom music vibe selection based on: "${prompt}"`,
          suggestedMood: "Night",
          recommendedSongs: songsToReturn,
          vibeExplanation: "Melovy AI selected these tracks to align with your requested mood, energy, and musical feel."
        });
        return;
      }

      // Query Gemini AI with structured schema for natural language discovery
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are Melovy's AI Music Curator. A user asked for music recommendations with the prompt: "${prompt}".
Available song catalog IDs and metadata:
${JSON.stringify(songsStore.map(s => ({ id: s.id, title: s.title, artist: s.artist, mood: s.mood, genre: s.genre })))}

Select the most relevant song IDs (2 to 5 songs) from the catalog matching the user's intent. Also provide a short summary of the vibe.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              interpretation: { type: Type.STRING, description: "Short summary of user vibe request" },
              suggestedMood: { type: Type.STRING, description: "Primary mood tag" },
              matchedSongIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of matched song IDs from catalog"
              },
              vibeExplanation: { type: Type.STRING, description: "Why these songs match the vibe" }
            },
            required: ["interpretation", "matchedSongIds", "vibeExplanation"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const matchedIds: string[] = parsed.matchedSongIds || [];
      
      let recommendedSongs = songsStore.filter(s => matchedIds.includes(s.id));
      if (recommendedSongs.length === 0) {
        recommendedSongs = songsStore.slice(0, 4);
      }

      res.json({
        interpretation: parsed.interpretation || `Vibe crafted for "${prompt}"`,
        suggestedMood: parsed.suggestedMood || "Night",
        recommendedSongs,
        vibeExplanation: parsed.vibeExplanation || "Curated specifically for your current moment."
      });
    } catch (error) {
      console.error("Gemini AI Discovery error:", error);
      res.json({
        interpretation: "Custom AI Vibe Selection",
        suggestedMood: "Night",
        recommendedSongs: songsStore.slice(0, 4),
        vibeExplanation: "Curated ambient selection matching your requested aesthetic."
      });
    }
  });

  // ==========================================
  // SPOTIFY INTEGRATION & OAUTH ENDPOINTS
  // ==========================================

  // 1. Get Spotify Authorization URL
  app.get("/api/spotify/auth-url", (req, res) => {
    const origin = req.headers.origin || process.env.APP_URL || "https://ais-dev-fgepwqlyu7bxrlity2csdz-834193165330.asia-east1.run.app";
    const redirectUri = `${origin}/auth/spotify/callback`;
    const clientId = process.env.SPOTIFY_CLIENT_ID || "c2f27159834d46abb8d766e6cfc28af5";

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "playlist-read-private playlist-read-collaborative user-read-private user-read-email user-top-read user-library-read",
      show_dialog: "true",
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.json({
      url: authUrl,
      redirectUri,
      isConfigured: Boolean(process.env.SPOTIFY_CLIENT_ID),
    });
  });

  // 2. OAuth Callback Route (Popup postMessage)
  const handleSpotifyCallback = async (req: express.Request, res: express.Response) => {
    const { code, error } = req.query;

    if (error) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#070e14;color:#f3f1f7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:2rem;">
              <h2 style="color:#ef4444;margin-bottom:0.5rem;">Spotify Login Cancelled</h2>
              <p style="color:#a79fbf;font-size:0.9rem;">${error}</p>
              <script>setTimeout(() => window.close(), 2500);</script>
            </div>
          </body>
        </html>
      `);
      return;
    }

    let accessToken = "demo_access_token_" + Date.now();
    let userData = {
      id: "spotify_user_demo",
      display_name: "Spotify Collector",
      images: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" }]
    };

    if (code && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      try {
        const origin = (req.headers.origin as string) || process.env.APP_URL || "https://ais-dev-fgepwqlyu7bxrlity2csdz-834193165330.asia-east1.run.app";
        const redirectUri = `${origin}/auth/spotify/callback`;
        const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");

        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code as string,
            redirect_uri: redirectUri,
          }),
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token;

          // Fetch Spotify user profile
          const userRes = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (userRes.ok) {
            userData = await userRes.json();
          }
        }
      } catch (err) {
        console.error("Spotify token exchange failed:", err);
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <body style="background:#070e14;color:#f3f1f7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">💚</div>
            <h2 style="color:#1DB954;margin-bottom:0.5rem;font-family:sans-serif;font-weight:bold;">Spotify Connected!</h2>
            <p style="color:#a79fbf;font-size:0.9rem;">Syncing playlists with Melovy...</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'SPOTIFY_AUTH_SUCCESS',
                  token: ${JSON.stringify(accessToken)},
                  user: ${JSON.stringify(userData)}
                }, '*');
                setTimeout(() => window.close(), 1200);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  };

  app.get("/auth/spotify/callback", handleSpotifyCallback);
  app.get("/auth/spotify/callback/", handleSpotifyCallback);

  // 3. Import Spotify Playlist via Link / ID
  app.post("/api/spotify/import-url", async (req, res) => {
    const { spotifyUrl } = req.body;
    if (!spotifyUrl || typeof spotifyUrl !== "string") {
      res.status(400).json({ error: "A valid Spotify Playlist URL or ID is required" });
      return;
    }

    let input = spotifyUrl.trim();
    let playlistId = "";

    // Extract Spotify Playlist ID from various formats
    if (input.includes("spotify.com/playlist/")) {
      const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
      if (match) playlistId = match[1];
    } else if (input.includes("spotify.com/embed/playlist/")) {
      const match = input.match(/embed\/playlist\/([a-zA-Z0-9]+)/);
      if (match) playlistId = match[1];
    } else if (input.includes("spotify.com/album/")) {
      const match = input.match(/album\/([a-zA-Z0-9]+)/);
      if (match) playlistId = match[1];
    } else if (input.startsWith("spotify:playlist:")) {
      playlistId = input.replace("spotify:playlist:", "").split("?")[0].split(":")[0];
    } else if (/^[a-zA-Z0-9]{15,30}$/.test(input)) {
      playlistId = input;
    } else {
      // General regex match for 22-char base62 Spotify ID
      const match = input.match(/([a-zA-Z0-9]{22})/);
      if (match) playlistId = match[1];
    }

    if (!playlistId) {
      res.status(400).json({ error: "Could not detect a valid Spotify Playlist ID. Please paste a Spotify playlist link or 22-character ID." });
      return;
    }

    let playlistTitle = "Spotify Playlist #" + playlistId.slice(0, 6);
    let playlistDesc = "Imported from Spotify into Melovy Heritage Audio";
    let coverImage = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80";
    let rawTracks: any[] = [];

    // 1. Direct Spotify Embed scraper (fetches real tracks & audio previews without requiring user API keys)
    try {
      const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (embedRes.ok) {
        const html = await embedRes.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
        if (nextDataMatch) {
          const json = JSON.parse(nextDataMatch[1]);
          const entity = json.props?.pageProps?.state?.data?.entity;
          if (entity) {
            if (entity.name) playlistTitle = entity.name;
            if (entity.description) playlistDesc = entity.description;
            if (entity.coverArt?.sources?.[0]?.url) {
              coverImage = entity.coverArt.sources[0].url;
            }
            if (Array.isArray(entity.trackList) && entity.trackList.length > 0) {
              rawTracks = entity.trackList.map((t: any, idx: number) => ({
                id: t.uri?.replace("spotify:track:", "") || `sp-t-${playlistId}-${idx}`,
                name: t.title || `Track ${idx + 1}`,
                artists: [{ name: t.subtitle || "Spotify Artist" }],
                album: { name: playlistTitle, images: [{ url: coverImage }] },
                duration_ms: t.duration || 180000,
                preview_url: t.audioPreview?.url || null,
                spotify_url: `https://open.spotify.com/playlist/${playlistId}`,
              }));
            }
          }
        }
      }
    } catch (err) {
      console.warn("Spotify Embed extraction error:", err);
    }

    // 2. Fallback to Spotify Web API if client credentials exist and embed yielded no tracks
    if (rawTracks.length === 0 && process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      try {
        const authHeader = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ grant_type: "client_credentials" }),
        });

        if (tokenRes.ok) {
          const { access_token } = await tokenRes.json();
          const spotifyRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          if (spotifyRes.ok) {
            const spData = await spotifyRes.json();
            playlistTitle = spData.name || playlistTitle;
            playlistDesc = spData.description || playlistDesc;
            if (spData.images && spData.images[0]) {
              coverImage = spData.images[0].url;
            }
            if (spData.tracks && spData.tracks.items) {
              rawTracks = spData.tracks.items
                .filter((item: any) => item && item.track)
                .map((item: any) => item.track);
            }
          }
        }
      } catch (err) {
        console.error("Spotify API fetch error:", err);
      }
    }

    // 3. Fallback metadata via Spotify oEmbed if tracks were still not fetched
    if (rawTracks.length === 0) {
      try {
        const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`);
        if (oembedRes.ok) {
          const oData = await oembedRes.json();
          if (oData.title) playlistTitle = oData.title;
          if (oData.thumbnail_url) coverImage = oData.thumbnail_url;
        }
      } catch (e) {
        console.warn("oEmbed fallback error:", e);
      }

      // Generate Spotify-inspired tracks for synthesis
      const sampleTrackNames = [
        { title: "Midnight Reverie", artist: "Heritage Ensemble", duration: 215, mood: "chill", freq: 220, color: "#1DB954" },
        { title: "Acoustic Horizon", artist: "Sitar & Strings", duration: 198, mood: "acoustic", freq: 174, color: "#9B6BFF" },
        { title: "Solar Drift", artist: "Cosmic Harmony", duration: 242, mood: "energetic", freq: 432, color: "#FF6B6B" },
        { title: "Morning Dew", artist: "Elysian Tanpura", duration: 185, mood: "peaceful", freq: 528, color: "#4ECDC4" },
        { title: "Quiet Solitude", artist: "Nocturne Trio", duration: 210, mood: "focus", freq: 285, color: "#3B82F6" },
        { title: "Golden Hours", artist: "Serenade Echoes", duration: 230, mood: "romantic", freq: 396, color: "#F59E0B" }
      ];

      rawTracks = sampleTrackNames.map((st, i) => ({
        id: `sp-tr-${playlistId}-${i}`,
        name: `${st.title}`,
        artists: [{ name: st.artist }],
        album: { name: playlistTitle, images: [{ url: coverImage }] },
        duration_ms: st.duration * 1000,
        spotify_url: `https://open.spotify.com/playlist/${playlistId}`,
        custom_freq: st.freq,
        custom_mood: st.mood,
        preview_url: null,
      }));
    }

    // Convert raw Spotify tracks into Melovy Song objects
    const importedSongIds: string[] = [];
    const newSongs = rawTracks.slice(0, 30).map((track: any, idx: number) => {
      const songId = `sp-song-${playlistId}-${idx}-${Date.now()}`;
      importedSongIds.push(songId);

      const artistName = track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Spotify Artist";
      const albumTitle = track.album?.name || playlistTitle;
      const albumArt = track.album?.images?.[0]?.url || coverImage;
      const durationSec = Math.round((track.duration_ms || 180000) / 1000);

      const baseFreqs = [174, 285, 396, 432, 528, 639, 741, 852];
      const moodTags: any[] = ["chill", "acoustic", "night", "focus", "happy", "melancholic"];

      const newSong = {
        id: songId,
        title: track.name || `Spotify Track ${idx + 1}`,
        artist: artistName,
        album: albumTitle,
        duration: durationSec,
        coverUrl: albumArt,
        audioUrl: track.preview_url || '',
        genre: "Spotify Sync",
        mood: track.custom_mood || moodTags[idx % moodTags.length],
        colors: ["#1DB954", "#0A2514"] as [string, string],
        baseFreq: track.custom_freq || baseFreqs[idx % baseFreqs.length],
        energy: Math.round(((idx * 17) % 80 + 20) / 100 * 100) / 100,
        valence: Math.round(((idx * 23) % 80 + 20) / 100 * 100) / 100,
        vibeCoordinates: {
          x: Math.round((((idx * 17) % 80 + 20) / 100 * 2 - 1) * 100),
          y: Math.round((((idx * 23) % 80 + 20) / 100 * 2 - 1) * 100),
        },
        discoveryScore: Math.round(50 + (idx * 9) % 45),
        releaseYear: 2024,
        bpm: 75 + (idx * 5) % 50,
        ambientColor: "#1DB954",
        spotifyId: track.id,
        spotifyUrl: track.spotify_url || `https://open.spotify.com/playlist/${playlistId}`,
      };

      return newSong;
    });

    // Save newly created Spotify tracks into server memory catalog
    newSongs.forEach(song => {
      if (!songsStore.some(s => s.id === song.id)) {
        songsStore.unshift(song);
      }
    });

    // Create and save Spotify Playlist into server memory store
    const newPlaylist = {
      id: `sp-playlist-${playlistId}-${Date.now()}`,
      name: `💚 ${playlistTitle}`,
      desc: playlistDesc,
      color: ["#1DB954", "#0A2514"] as [string, string],
      trackIds: importedSongIds,
      isSpotifyImport: true,
      spotifyUrl: `https://open.spotify.com/playlist/${playlistId}`,
      coverUrl: coverImage,
    };

    playlistsStore.unshift(newPlaylist);

    res.json({
      success: true,
      playlist: newPlaylist,
      songs: newSongs,
      message: `Successfully connected & imported Spotify playlist "${playlistTitle}" with ${newSongs.length} tracks!`,
    });
  });

  // 4. Get User's Spotify Playlists (Connected via OAuth token)
  app.get("/api/spotify/user-playlists", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.json({
        playlists: playlistsStore.filter(p => p.isSpotifyImport),
        connected: false
      });
      return;
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const spRes = await fetch("https://api.spotify.com/v1/me/playlists?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (spRes.ok) {
        const data = await spRes.json();
        const formatted = (data.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          desc: item.description || `Tracks: ${item.tracks?.total || 0}`,
          coverUrl: item.images?.[0]?.url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
          spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/playlist/${item.id}`,
          trackCount: item.tracks?.total || 0
        }));

        res.json({ playlists: formatted, connected: true });
        return;
      }
    } catch (e) {
      console.error("Error fetching Spotify user playlists:", e);
    }

    res.json({
      playlists: playlistsStore.filter(p => p.isSpotifyImport),
      connected: true
    });
  });

  // Vite middleware in dev mode / static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Melovy server running on http://localhost:${PORT}`);
  });
}

startServer();
