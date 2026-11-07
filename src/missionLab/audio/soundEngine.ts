/**
 * Procedural Web Audio API sound engine for NovoSriti Mission Lab.
 * Zero external audio files, zero 404s, completely synthetic and lightweight.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private continuousOscillator: {
    osc?: OscillatorNode;
    gain?: GainNode;
    filter?: BiquadFilterNode;
  } | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.6, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
    }
  }

  /** Subtle UI button click */
  public playClick() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /** Authentic Apollo Quindar Beep (1250 Hz intro or 2475 Hz outro) */
  public playQuindar(type: 'intro' | 'outro' = 'intro') {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const freq = type === 'intro' ? 2524 : 2475;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
    gain.gain.setValueAtTime(0.12, t + 0.09);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /** Objective Completed celebratory chime */
  public playObjectiveComplete() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  /** Laser Pulse fired from Earth observatory */
  public playLaserPulse() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  /** Laser Return Echo signal detected */
  public playLaserReturn() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /** Robotic Arm servo movement */
  public playRoboticServo() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.2);
    osc.frequency.linearRampToValueAtTime(280, t + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  /** Rock Percussion Drill or Abrasion Tool (RAT) */
  public playDrillSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Fast buzzing harmonic percussion
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + i * 0.08;

      osc.type = 'square';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, st);

      gain.gain.setValueAtTime(0.1, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(st);
      osc.stop(st + 0.08);
    }
  }

  /** Ingenuity Helicopter Rotor sound */
  public playHelicopterRotor(duration = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + duration * 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /** Deep space telemetry tone */
  public playTelemetryTone() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.setValueAtTime(2100, t + 0.06);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /** Rover Motor continuous driving loop */
  public startRoverMotor() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted || this.continuousOscillator) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    this.continuousOscillator = { osc, gain, filter };
  }

  public stopRoverMotor() {
    if (this.continuousOscillator && this.ctx) {
      const t = this.ctx.currentTime;
      this.continuousOscillator.gain?.gain.linearRampToValueAtTime(0.001, t + 0.1);
      this.continuousOscillator.osc?.stop(t + 0.11);
      this.continuousOscillator = null;
    }
  }

  /** Mission Victory fanfare */
  public playMissionVictory() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0, st);
      gain.gain.linearRampToValueAtTime(0.25, st + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(st);
      osc.stop(st + 0.65);
    });
  }
}

export const soundEngine = new SoundEngine();
