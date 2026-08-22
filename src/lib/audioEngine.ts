import { Song } from '../types';

// Musical Raga / Scale intervals for procedural synthesis
const SCALES: Record<string, number[]> = {
  // Yaman / Lydian (Peaceful, Evening)
  peaceful: [1, 1.125, 1.25, 1.414, 1.5, 1.687, 1.875, 2],
  // Bhairav (Morning, Meditative)
  morning: [1, 1.066, 1.25, 1.333, 1.5, 1.6, 1.875, 2],
  // Kafi / Dorian (Soulful, Nostalgic)
  soulful: [1, 1.125, 1.2, 1.333, 1.5, 1.687, 1.777, 2],
  // Pentatonic Major (Happy, Uplifting)
  happy: [1, 1.125, 1.25, 1.5, 1.666, 2],
  // Minor Pentatonic / Blues (Deep, Night)
  night: [1, 1.2, 1.333, 1.5, 1.777, 2],
  // Chill Ambient (Ethereal)
  chill: [1, 1.125, 1.25, 1.333, 1.5, 1.666, 1.875, 2]
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterNode: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private nodes: (OscillatorNode | GainNode | BiquadFilterNode | StereoPannerNode | AudioBufferSourceNode)[] = [];
  
  // Real HTML Audio Element for streaming / uploaded files
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private isUsingRealAudio = false;

  private startTime = 0;
  private pausedAt = 0;
  private playing = false;
  private curDur = 180;
  private volume = 0.7;
  private muted = false;
  private currentTrack: Song | null = null;
  private melodyInterval: number | null = null;

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    // Lazy init
  }

  private ensureCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterNode = this.ctx.createGain();
      this.masterNode.gain.value = this.muted ? 0 : this.volume;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
  }

  private stopNodes() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }

    this.nodes.forEach(n => {
      try {
        if ('stop' in n && typeof n.stop === 'function') n.stop();
      } catch {
        // ignore
      }
      try {
        n.disconnect();
      } catch {
        // ignore
      }
    });
    this.nodes = [];

    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public loadTrack(track: Song) {
    this.currentTrack = track;
    this.curDur = track.duration || 180;
    this.pausedAt = 0;
    this.stopNodes();

    if (track.audioUrl && track.audioUrl.trim().length > 0) {
      this.isUsingRealAudio = true;
      this.setupRealAudio(track.audioUrl);
    } else {
      this.isUsingRealAudio = false;
      this.buildGenerativeTrack(track);
    }
  }

  private setupRealAudio(url: string) {
    this.ensureCtx();
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';

      if (this.ctx && this.masterNode) {
        try {
          this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
          this.audioSourceNode.connect(this.masterNode);
        } catch {
          // In case already connected or CORS fallback
        }
      }

      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || this.curDur);
        }
      });

      this.audioElement.addEventListener('ended', () => {
        this.playing = false;
        if (this.onEndedCallback) this.onEndedCallback();
      });
    }

    this.audioElement.src = url;
    this.audioElement.volume = this.muted ? 0 : this.volume;
  }

  /**
   * Generative Musical Synthesizer for full acoustic & melodic playback:
   * Features Tanpura drone, sitar harmonic resonances, melodic scale arpeggios, and rhythmic pulses!
   */
  private buildGenerativeTrack(track: Song) {
    this.ensureCtx();
    this.stopNodes();
    if (!this.ctx || !this.masterNode) return;

    const now = this.ctx.currentTime;
    const energy = track.energy ?? 0.5;
    const valence = track.valence ?? 0.5;
    const base = track.baseFreq ?? 196; // G3 or D3 Indian root

    // Select Scale
    let scale = SCALES.chill;
    if (track.mood === 'happy' || valence > 0.7) scale = SCALES.happy;
    else if (track.mood === 'focus' || track.mood === 'chill') scale = SCALES.peaceful;
    else if (track.mood === 'acoustic' || track.mood === 'nostalgic') scale = SCALES.soulful;
    else if (track.mood === 'night' || valence < 0.3) scale = SCALES.night;
    else if (track.mood === 'romantic') scale = SCALES.morning;

    // 1. TANPURA / CELLO DRONE (Root, Fifth, Octave, High Octave)
    const droneRatios = [0.5, 0.75, 1, 1.5, 2];
    droneRatios.forEach((ratio, i) => {
      if (!this.ctx || !this.masterNode) return;

      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : i % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.value = base * ratio;

      const gain = this.ctx.createGain();
      gain.gain.value = 0;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350 + energy * 900;

      let pan: StereoPannerNode | null = null;
      if (typeof this.ctx.createStereoPanner === 'function') {
        pan = this.ctx.createStereoPanner();
        pan.pan.value = (i - 2) * 0.3;
      }

      osc.connect(filter);
      filter.connect(gain);

      if (pan) {
        gain.connect(pan);
        pan.connect(this.masterNode);
        this.nodes.push(pan);
      } else {
        gain.connect(this.masterNode);
      }

      const targetVol = (0.04 / (i + 1)) * (0.8 + energy * 0.4);
      gain.gain.linearRampToValueAtTime(targetVol, now + 2.0);

      // Shimmer LFO
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08 + (i * 0.03);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = targetVol * 0.35;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.start(now);
      lfo.start(now);
      this.nodes.push(osc, lfo, gain, filter, lfoGain);
    });

    // 2. MELODIC SITAR / ARPEGGIO NOTE GENERATOR
    const tempoMs = Math.max(280, Math.floor(60000 / (track.bpm || 80) / 2));
    let step = 0;

    const playMelodyNote = () => {
      if (!this.ctx || !this.masterNode || !this.playing) return;
      const t = this.ctx.currentTime;
      
      const scaleIdx = (step * 3 + Math.floor(Math.sin(step) * 2) + scale.length) % scale.length;
      const noteFreq = base * scale[scaleIdx] * (Math.random() > 0.65 ? 2 : 1);

      // Main Melody Oscillator (Warm plucked chime / sitar)
      const osc = this.ctx.createOscillator();
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(noteFreq, t);

      // Subtle Pitch bend / meend (Indian classical vocal glide)
      if (Math.random() > 0.6) {
        osc.frequency.exponentialRampToValueAtTime(noteFreq * (Math.random() > 0.5 ? 1.125 : 0.88), t + 0.3);
      }

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0, t);
      noteGain.gain.linearRampToValueAtTime(0.065 + energy * 0.04, t + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

      const noteFilter = this.ctx.createBiquadFilter();
      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(800 + energy * 1800, t);
      noteFilter.frequency.exponentialRampToValueAtTime(300, t + 0.7);

      osc.connect(noteFilter);
      noteFilter.connect(noteGain);
      noteGain.connect(this.masterNode);

      osc.start(t);
      osc.stop(t + 0.85);

      step++;
    };

    // Trigger melodic sequence periodically when playing
    this.melodyInterval = window.setInterval(playMelodyNote, tempoMs);

    // 3. RHYTHMIC TABLA / ACOUSTIC PULSE
    if (energy > 0.45) {
      const pulseOsc = this.ctx.createOscillator();
      pulseOsc.type = 'sine';
      pulseOsc.frequency.value = base * 0.5;

      const pulseGain = this.ctx.createGain();
      pulseGain.gain.value = 0;

      const beatRate = (track.bpm || 72) / 60;
      const pulseLfo = this.ctx.createOscillator();
      pulseLfo.type = 'square';
      pulseLfo.frequency.value = beatRate;

      const pulseLfoGain = this.ctx.createGain();
      pulseLfoGain.gain.value = 0.035;

      pulseLfo.connect(pulseLfoGain);
      pulseLfoGain.connect(pulseGain.gain);

      pulseOsc.connect(pulseGain);
      pulseGain.connect(this.masterNode);

      pulseOsc.start(now);
      pulseLfo.start(now);
      this.nodes.push(pulseOsc, pulseLfo, pulseGain, pulseLfoGain);
    }
  }

  public play() {
    this.ensureCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isUsingRealAudio && this.audioElement) {
      this.audioElement.play().catch(() => {
        // Handled
      });
      this.playing = true;
    } else {
      if (this.currentTrack && this.nodes.length === 0) {
        this.buildGenerativeTrack(this.currentTrack);
      }
      this.startTime = (this.ctx ? this.ctx.currentTime : 0) - this.pausedAt;
      this.playing = true;
    }
  }

  public pause() {
    if (this.isUsingRealAudio && this.audioElement) {
      this.audioElement.pause();
    } else {
      if (this.ctx) {
        this.pausedAt = this.ctx.currentTime - this.startTime;
      }
      this.stopNodes();
    }
    this.playing = false;
  }

  public stop() {
    this.pausedAt = 0;
    this.playing = false;
    this.stopNodes();
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
      this.audioElement.pause();
    }
  }

  public seek(sec: number) {
    this.pausedAt = sec;
    if (this.isUsingRealAudio && this.audioElement) {
      this.audioElement.currentTime = sec;
    } else if (this.playing) {
      this.startTime = (this.ctx ? this.ctx.currentTime : 0) - sec;
    }
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterNode && this.ctx) {
      this.masterNode.gain.value = this.muted ? 0 : this.volume;
    }
    if (this.audioElement) {
      this.audioElement.volume = this.muted ? 0 : this.volume;
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterNode && this.ctx) {
      this.masterNode.gain.value = this.muted ? 0 : this.volume;
    }
    if (this.audioElement) {
      this.audioElement.volume = this.muted ? 0 : this.volume;
    }
  }

  public getTime(): number {
    if (this.isUsingRealAudio && this.audioElement) {
      return this.audioElement.currentTime || 0;
    }
    if (!this.ctx) return 0;
    return this.playing ? (this.ctx.currentTime - this.startTime) : this.pausedAt;
  }

  public getDuration(): number {
    if (this.isUsingRealAudio && this.audioElement && this.audioElement.duration) {
      return this.audioElement.duration;
    }
    return this.curDur;
  }

  public isTrackPlaying(): boolean {
    return this.playing;
  }

  public getFrequencyData(): number[] {
    if (this.analyser && this.playing) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      return Array.from(dataArray.slice(0, 32));
    }
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 10));
  }
}

export const audioEngine = new AudioEngine();


