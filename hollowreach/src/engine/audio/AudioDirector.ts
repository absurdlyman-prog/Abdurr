// Adaptive audio director. HOLLOWREACH's score is generative — built live from
// WebAudio oscillators and filtered noise rather than streamed files — so the
// "haunting, unforgettable atmosphere" ships in the bundle with zero audio
// assets and can morph continuously with location, time, and tension.
//
// Layers:
//   - drone:    two detuned low oscillators = the city's tinnitus hum
//   - pad:      a slow, filtered chord that swaps per district theme
//   - ambience: filtered noise shaped into rain / water / wind / room tone
//   - stingers: short bell/clue motifs fired by gameplay events
//
// Everything is gain-ducked by the user's master/music/sfx settings and starts
// muted until the first user gesture (autoplay policy).

export type ThemeId =
  | 'drowned_quarter_theme'
  | 'spindles_theme'
  | 'rows_theme'
  | 'menu_theme';

export type StingerId = 'clue_found' | 'theme_rise' | 'check_success' | 'check_fail' | 'level_up';

interface ThemeSpec {
  /** Root frequency of the pad chord (Hz). */
  root: number;
  /** Semitone offsets forming the chord. */
  chord: number[];
  /** Pad filter cutoff (Hz). */
  cutoff: number;
  /** Ambience character. */
  ambience: 'water' | 'wind' | 'room' | 'street';
  /** Drone base frequency. */
  drone: number;
}

const THEMES: Record<ThemeId, ThemeSpec> = {
  drowned_quarter_theme: { root: 110, chord: [0, 3, 7, 10], cutoff: 600, ambience: 'water', drone: 55 },
  spindles_theme: { root: 98, chord: [0, 5, 7], cutoff: 480, ambience: 'wind', drone: 49 },
  rows_theme: { root: 123, chord: [0, 4, 7, 11], cutoff: 900, ambience: 'street', drone: 61 },
  menu_theme: { root: 87, chord: [0, 3, 7], cutoff: 520, ambience: 'room', drone: 43 },
};

export interface AudioSettings {
  master: number;
  music: number;
  sfx: number;
}

const semis = (root: number, n: number) => root * Math.pow(2, n / 12);

export class AudioDirector {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private droneOscs: OscillatorNode[] = [];
  private padOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private padFilter!: BiquadFilterNode;
  private ambienceSource: AudioBufferSourceNode | null = null;
  private ambienceFilter!: BiquadFilterNode;
  private ambienceGain!: GainNode;
  private started = false;
  private settings: AudioSettings = { master: 0.8, music: 0.7, sfx: 0.8 };
  private currentTheme: ThemeId | null = null;

  /** Lazily create the context on first user gesture. */
  ensureStarted(): void {
    if (this.started) {
      void this.ctx?.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicGain.connect(this.master);
    this.sfxGain.connect(this.master);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 600;
    this.padFilter.connect(this.musicGain);

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.value = 0.0;
    this.ambienceFilter = this.ctx.createBiquadFilter();
    this.ambienceFilter.type = 'bandpass';
    this.ambienceFilter.frequency.value = 800;
    this.ambienceFilter.Q.value = 0.6;
    this.ambienceFilter.connect(this.ambienceGain);
    this.ambienceGain.connect(this.musicGain);

    this.started = true;
    this.applySettings(this.settings);
    if (this.currentTheme) this.playTheme(this.currentTheme);
  }

  applySettings(s: AudioSettings): void {
    this.settings = s;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.master, t, 0.1);
    this.musicGain.gain.setTargetAtTime(s.music * 0.5, t, 0.1);
    this.sfxGain.gain.setTargetAtTime(s.sfx * 0.8, t, 0.1);
  }

  playTheme(theme: ThemeId): void {
    this.currentTheme = theme;
    if (!this.ctx || !this.started) return;
    const spec = THEMES[theme];
    const t = this.ctx.currentTime;

    // Rebuild drone.
    this.droneOscs.forEach((o) => o.stop());
    this.droneOscs = [];
    for (const detune of [-4, 4]) {
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = spec.drone;
      o.detune.value = detune;
      const g = this.ctx.createGain();
      g.gain.value = 0.12;
      o.connect(g);
      g.connect(this.musicGain);
      o.start();
      this.droneOscs.push(o);
    }

    // Rebuild pad chord with slow swell.
    this.padOscs.forEach((p) => p.osc.stop());
    this.padOscs = [];
    this.padFilter.frequency.setTargetAtTime(spec.cutoff, t, 1.5);
    spec.chord.forEach((n, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.value = semis(spec.root, n);
      const gain = this.ctx!.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.06, t + i * 0.4, 2.2); // staggered swell
      osc.connect(gain);
      gain.connect(this.padFilter);
      osc.start();
      this.padOscs.push({ osc, gain });
    });

    this.setAmbience(spec.ambience);
  }

  private setAmbience(kind: ThemeSpec['ambience']): void {
    if (!this.ctx) return;
    if (this.ambienceSource) {
      this.ambienceSource.stop();
      this.ambienceSource = null;
    }
    const buffer = this.noiseBuffer(2.5);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    switch (kind) {
      case 'water':
        this.ambienceFilter.type = 'lowpass';
        this.ambienceFilter.frequency.value = 1100;
        this.ambienceGain.gain.setTargetAtTime(0.16, this.ctx.currentTime, 1.0);
        break;
      case 'wind':
        this.ambienceFilter.type = 'bandpass';
        this.ambienceFilter.frequency.value = 500;
        this.ambienceGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 1.0);
        break;
      case 'street':
        this.ambienceFilter.type = 'highpass';
        this.ambienceFilter.frequency.value = 1600;
        this.ambienceGain.gain.setTargetAtTime(0.1, this.ctx.currentTime, 1.0);
        break;
      case 'room':
        this.ambienceFilter.type = 'lowpass';
        this.ambienceFilter.frequency.value = 400;
        this.ambienceGain.gain.setTargetAtTime(0.07, this.ctx.currentTime, 1.0);
        break;
    }
    src.connect(this.ambienceFilter);
    src.start();
    this.ambienceSource = src;
  }

  /** Fire a short musical/sfx motif tied to a gameplay event. */
  stinger(id: StingerId): void {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    const notes: Record<StingerId, { f: number; type: OscillatorType; dur: number }[]> = {
      clue_found: [{ f: 880, type: 'sine', dur: 0.5 }, { f: 1320, type: 'sine', dur: 0.6 }],
      theme_rise: [{ f: 220, type: 'triangle', dur: 1.2 }],
      check_success: [{ f: 660, type: 'sine', dur: 0.18 }, { f: 990, type: 'sine', dur: 0.3 }],
      check_fail: [{ f: 196, type: 'sawtooth', dur: 0.4 }],
      level_up: [{ f: 523, type: 'sine', dur: 0.2 }, { f: 784, type: 'sine', dur: 0.35 }],
    };
    notes[id].forEach((n, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = n.type;
      osc.frequency.value = n.f;
      const start = t + i * 0.08;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + n.dur + 0.05);
    });
  }

  private noiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // Brown-ish noise: smoother than white, reads as water/wind.
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buf;
  }

  stop(): void {
    this.droneOscs.forEach((o) => o.stop());
    this.padOscs.forEach((p) => p.osc.stop());
    this.ambienceSource?.stop();
    this.droneOscs = [];
    this.padOscs = [];
    this.ambienceSource = null;
  }
}

export const audio = new AudioDirector();
