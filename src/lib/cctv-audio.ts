/**
 * Procedural Web Audio synthesizer for CCTV AI Person Search.
 * Generates dynamic futuristic radar, sonar chirps, and scanline audio
 * matching the progress bar and target sighting events in real time.
 */

class CctvAudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private lfoOsc: OscillatorNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem("cctv_scanner_audio_muted");
      if (saved !== null) {
        this.isMuted = saved === "true";
      }
    } catch {}
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sound effect for each progress bar advancement tick.
   * Pitch scales dynamically from 440 Hz up to 880 Hz as progress increases.
   */
  playProgressStep(ratio: number, hasMatch: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (hasMatch) {
      // High-priority "Target Detected" alert: Crisp dual-frequency harmonic ping (C6 + G6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.setValueAtTime(1567.98, now); // G6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.32);
      osc2.stop(now + 0.32);
      return;
    }

    // Normal progress bar advancement: crisp sonar tick with rising pitch
    const baseFreq = 440 + Math.min(1, Math.max(0, ratio)) * 420; // 440Hz -> 860Hz
    const osc = ctx.createOscillator();
    const click = ctx.createOscillator();
    const gain = ctx.createGain();
    const clickGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * 1.15, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.06);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    // Subtle tactile high click
    click.type = "triangle";
    click.frequency.setValueAtTime(2400, now);
    clickGain.gain.setValueAtTime(0.03, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    click.connect(clickGain);
    gain.connect(ctx.destination);
    clickGain.connect(ctx.destination);

    osc.start(now);
    click.start(now);
    osc.stop(now + 0.08);
    click.stop(now + 0.02);
  }

  /**
   * Ambient low-frequency futuristic radar drone during active scanning.
   */
  startAmbientScan() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    this.stopAmbientScan();

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now); // 140Hz radar hum

      // LFO modulation at 1.5 Hz for rhythmic radar sweep effect
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(1.5, now);
      lfoGain.gain.setValueAtTime(0.008, now);

      gain.gain.setValueAtTime(0.012, now);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);

      this.ambientOsc = osc;
      this.ambientGain = gain;
      this.lfoOsc = lfo;
    } catch {}
  }

  stopAmbientScan() {
    try {
      if (this.ambientOsc) {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientOsc = null;
      }
      if (this.lfoOsc) {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
        this.lfoOsc = null;
      }
      if (this.ambientGain) {
        this.ambientGain.disconnect();
        this.ambientGain = null;
      }
    } catch {}
  }

  /**
   * Scan completed celebratory arpeggio.
   */
  playScanComplete(hasMatches: boolean) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopAmbientScan();
    const now = ctx.currentTime;

    // Harmonic triad: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const chords = hasMatches
      ? [523.25, 659.25, 783.99, 1046.5]
      : [440, 554.37, 659.25];

    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.075);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.075);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.075 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.075 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.075);
      osc.stop(now + idx * 0.075 + 0.35);
    });
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem("cctv_scanner_audio_muted", String(this.isMuted));
    } catch {}
    if (this.isMuted) {
      this.stopAmbientScan();
    }
    return this.isMuted;
  }

  setMuted(val: boolean) {
    this.isMuted = val;
    try {
      localStorage.setItem("cctv_scanner_audio_muted", String(val));
    } catch {}
    if (val) this.stopAmbientScan();
  }

  getMuted(): boolean {
    return this.isMuted;
  }
}

export const cctvAudio = new CctvAudioController();
