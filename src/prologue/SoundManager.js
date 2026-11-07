/**
 * SoundManager — Handles meditative voiceover, warm airy ambient pads,
 * soft crystal chimes, sub-bass cosmic resonances, and laser telemetry acoustics.
 * Never autoplays. Sound must be explicitly enabled by the visitor.
 */

export class SoundManager {
  constructor() {
    this.enabled = false;
    this.audioCtx = null;
    this.voiceover = null;
    this.voiceoverLoaded = false;

    // Ambient synth nodes
    this.ambientGain = null;
    this.ambientOsc = null;
    this.ambientOsc2 = null;
    this.ambientFilter = null;
    this.subDroneOsc = null;
    this.subDroneGain = null;

    this._initAudioContext();
  }

  _initAudioContext() {
    this.audioCtx = null;
  }

  _ensureContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this._ensureContext();
      this.startAmbient();
      this.playMeditativeChime();
    } else {
      this.stopAmbient();
      this.stopVoiceover();
    }
    return this.enabled;
  }

  /* ── Voiceover ── */
  async loadVoiceover(url = '/audio/prologue-voiceover.mp3') {
    try {
      this.voiceover = new Audio(url);
      this.voiceover.preload = 'auto';
      this.voiceover.volume = 0.85;
      await new Promise((resolve, reject) => {
        this.voiceover.addEventListener('canplaythrough', resolve, { once: true });
        this.voiceover.addEventListener('error', reject, { once: true });
        setTimeout(resolve, 3000);
      });
      this.voiceoverLoaded = true;
    } catch {
      this.voiceoverLoaded = false;
    }
  }

  playVoiceover(time = 0) {
    if (!this.enabled || !this.voiceoverLoaded || !this.voiceover) return;
    this.voiceover.currentTime = time;
    this.voiceover.play().catch(() => {});
  }

  stopVoiceover() {
    if (this.voiceover) {
      this.voiceover.pause();
      this.voiceover.currentTime = 0;
    }
  }

  /* ── Meditative Ambient Sound (Airy, Soothing, Warm Pad) ── */
  startAmbient() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (this.ambientOsc) return;

    // 1. Warm Low-Pass Filter for that late-night velvety acoustic warmth
    this.ambientFilter = ctx.createBiquadFilter();
    this.ambientFilter.type = 'lowpass';
    this.ambientFilter.frequency.setValueAtTime(320, ctx.currentTime);
    this.ambientFilter.connect(ctx.destination);

    // 2. Sub-bass cosmic floor (42 Hz warm resonance)
    this.subDroneGain = ctx.createGain();
    this.subDroneGain.gain.setValueAtTime(0, ctx.currentTime);
    this.subDroneGain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 3);
    this.subDroneGain.connect(this.ambientFilter);

    this.subDroneOsc = ctx.createOscillator();
    this.subDroneOsc.type = 'sine';
    this.subDroneOsc.frequency.setValueAtTime(42, ctx.currentTime);
    this.subDroneOsc.connect(this.subDroneGain);
    this.subDroneOsc.start();

    // 3. Velvety root drone (55 Hz Low A)
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 4);
    this.ambientGain.connect(this.ambientFilter);

    this.ambientOsc = ctx.createOscillator();
    this.ambientOsc.type = 'triangle'; // Warmer, more organic timbre than harsh square/saw
    this.ambientOsc.frequency.setValueAtTime(55, ctx.currentTime);
    this.ambientOsc.connect(this.ambientGain);
    this.ambientOsc.start();

    // 4. Ethereal singing fifth (110 Hz / 165 Hz airy pad)
    this.ambientGain2 = ctx.createGain();
    this.ambientGain2.gain.setValueAtTime(0, ctx.currentTime);
    this.ambientGain2.gain.linearRampToValueAtTime(0.016, ctx.currentTime + 5);
    this.ambientGain2.connect(this.ambientFilter);

    this.ambientOsc2 = ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(110, ctx.currentTime);
    this.ambientOsc2.connect(this.ambientGain2);
    this.ambientOsc2.start();
  }

  stopAmbient() {
    const ctx = this.audioCtx;
    if (!ctx) return;

    if (this.ambientGain) this.ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    if (this.ambientGain2) this.ambientGain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    if (this.subDroneGain) this.subDroneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    setTimeout(() => {
      try { this.ambientOsc?.stop(); } catch {}
      try { this.ambientOsc2?.stop(); } catch {}
      try { this.subDroneOsc?.stop(); } catch {}
      this.ambientOsc = null;
      this.ambientOsc2 = null;
      this.subDroneOsc = null;
      this.ambientGain = null;
      this.ambientGain2 = null;
      this.subDroneGain = null;
    }, 850);
  }

  /* ── Meditative Soft Singing Bowl Chime ── */
  playMeditativeChime() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(460, now);
    filter.connect(ctx.destination);

    // Warm, low-frequency singing bowl triad (144 Hz, 216 Hz, 324 Hz)
    const freqs = [144, 216, 324];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const vol = idx === 0 ? 0.02 : idx === 1 ? 0.014 : 0.007;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(now);
      osc.stop(now + 3.7);
    });
  }

  /* ── Soft Warm Harmonic Breath (Replaces sharp 880 Hz blip) ── */
  playSignalBlip() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(288, now);
    osc.frequency.exponentialRampToValueAtTime(216, now + 0.35);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.009, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  /* ── Laser Pulse Firing Acoustic ── */
  playLaserPulse() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  /* ── Cinematic Title Reveal Impact (Deep Velvet Breath) ── */
  playRevealImpact() {
    if (!this.enabled) return;
    const ctx = this._ensureContext();

    // Deep 48Hz Sub-Breath
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(54, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(26, ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2.8);
  }

  destroy() {
    this.stopAmbient();
    this.stopVoiceover();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}
