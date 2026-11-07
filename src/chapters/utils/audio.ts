// Procedural Web Audio API sound & Late-Night Deep Meditation Male Voice Narrator
// Strictly opt-in. Autoplay is forbidden. Captions provided.

class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private rumbleOsc: OscillatorNode | null = null;
  private rumbleGain: GainNode | null = null;
  public isSoundEnabled: boolean = false;
  public isNarrating: boolean = false;
  public onCaptionChange: ((caption: string | null) => void) | null = null;
  public onNarrationStateChange: ((speaking: boolean) => void) | null = null;
  private captionTimeout: number | null = null;
  private phraseTimeouts: number[] = [];
  private keepAliveInterval: number | null = null;
  private preferredMaleVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private narrationSessionId: number = 0;

  constructor() {
    this.initVoiceSelection();
  }

  private initVoiceSelection() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    const selectSoothingVoice = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) return;

      const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      if (enVoices.length === 0) {
        this.preferredMaleVoice = voices[0];
        return;
      }

      // Deprioritize legacy robotic SAPI5 desktop voices unless nothing else is available
      const smoothVoices = enVoices.filter(
        v => !/Microsoft (David|Mark|Zira) Desktop|Fred|espeak/i.test(v.name)
      );
      const pool = smoothVoices.length > 0 ? smoothVoices : enVoices;

      // Priority order: Neural/Natural voices first, then Google UK/US smooth voices, then macOS calm voices
      const soothingPatterns = [
        /(Natural|Neural).*(Brian|Andrew|Christopher|Guy|Steffan|Ryan|Eric|Roger|Sonia|Ava|Emma|Aria|Jenny)/i,
        /(Brian|Andrew|Christopher|Guy|Steffan|Ryan|Eric|Sonia|Ava).*Online/i,
        /Google UK English Male/i,
        /Google UK English Female/i,
        /Google US English/i,
        /(Daniel|Oliver|Arthur|Serena|Moira|Karen|Samantha|Tessa).*(Enhanced|Premium)/i,
        /\b(Daniel|Oliver|Arthur|Serena|Moira|Karen|Samantha)\b/i,
        /Natural|Neural|Premium|Enhanced/i,
        /en-GB/i,
        /en-AU/i,
        /en-US/i
      ];

      for (const pattern of soothingPatterns) {
        const match = pool.find(v => pattern.test(v.name) || pattern.test(v.lang));
        if (match) {
          this.preferredMaleVoice = match;
          return;
        }
      }
      this.preferredMaleVoice = pool[0] || enVoices[0];
    };

    selectSoothingVoice();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = selectSoothingVoice;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    if (!enabled) {
      this.stopNarration();
      this.stopAmbient();
      this.stopRumble();
      this.showCaption(null);
    }
  }

  private showCaption(text: string | null, durationMs = 2800) {
    if (this.captionTimeout) {
      window.clearTimeout(this.captionTimeout);
      this.captionTimeout = null;
    }
    if (this.onCaptionChange) {
      this.onCaptionChange(text);
    }
    if (text && durationMs > 0) {
      this.captionTimeout = window.setTimeout(() => {
        if (this.onCaptionChange) this.onCaptionChange(null);
      }, durationMs);
    }
  }

  /**
   * Plays a warm, slow-blooming singing bowl chord (144 Hz, 216 Hz, 324 Hz)
   * filtered through a low-pass filter so there is zero harshness.
   */
  public playVelvetChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, now);
      filter.connect(this.ctx.destination);

      [144, 216, 324].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const peak = idx === 0 ? 0.022 : idx === 1 ? 0.016 : 0.008;
        gain.gain.setValueAtTime(0.0001, now);
        // Slow 0.45s bloom attack for a pillowy, meditative entrance
        gain.gain.linearRampToValueAtTime(peak, now + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
        osc.connect(gain);
        gain.connect(filter);
        osc.start(now);
        osc.stop(now + 3.9);
      });
    } catch {
      // Ignore audio context restriction
    }
  }

  /**
   * Prepares text so the speech synthesizer reads it with a gentle, unhurried human flow
   * instead of rushing through symbols, dashes, or technical abbreviations.
   */
  private smoothTextForSpeech(raw: string): string {
    return raw
      .replace(/—|--|·|•/g, ', ... ')
      .replace(/;/g, ', ... ')
      .replace(/:\s+/g, ', ')
      .replace(/[“”"']/g, '')
      .replace(/±/g, 'plus or minus ')
      .replace(/\bCh\s*0?(\d)\b/gi, 'Chapter $1')
      .replace(/\bkm\/s\b/gi, 'kilometers per second')
      .replace(/\bm\/s\b/gi, 'meters per second')
      .replace(/\bkm\b/g, 'kilometers')
      .replace(/\bmm\b/g, 'millimeters')
      .replace(/\bAU\b/g, 'astronomical units')
      .replace(/\bLLR\b/g, 'Lunar Laser Ranging')
      .replace(/\bPSE\b/g, 'Passive Seismic Experiment')
      .replace(/\bSEIS\b/g, 'Seismic Experiment for Interior Structure')
      .replace(/\bRTG\b/g, 'radioisotope thermoelectric generator')
      .replace(/\bRPM\b/gi, 'rotations per minute')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Narrates chapter story or MIRA response text in a warm, calm, soothing voice
   * with natural breathing pauses and a soft cosmic pad underneath.
   */
  public narrateText(text: string, onStateChange?: (speaking: boolean) => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stopNarration();

    const sessionId = ++this.narrationSessionId;
    if (onStateChange) {
      this.onNarrationStateChange = onStateChange;
    }

    this.isSoundEnabled = true;
    this.toggleAmbient(true);
    this.playVelvetChime();

    const synth = window.speechSynthesis;
    if (!this.preferredMaleVoice) {
      this.initVoiceSelection();
    }

    const displaySentences = text
      .replace(/[“”"]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (displaySentences.length === 0) return;

    this.isNarrating = true;
    this.onNarrationStateChange?.(true);
    this.showCaption(displaySentences[0], 14000);

    // Chromium keep-alive to prevent speechSynthesis from pausing mid-narration
    this.keepAliveInterval = window.setInterval(() => {
      if (this.isNarrating && synth.paused) {
        try {
          synth.resume();
        } catch {}
      }
    }, 2500);

    const speakPhrase = (idx: number, useFallbackDefaultVoice = false) => {
      if (sessionId !== this.narrationSessionId || !this.isNarrating || idx >= displaySentences.length) {
        if (sessionId === this.narrationSessionId) {
          this.finishNarration();
        }
        return;
      }

      const rawSentence = displaySentences[idx];
      const spokenSentence = this.smoothTextForSpeech(rawSentence);
      const utterance = new SpeechSynthesisUtterance(spokenSentence);
      this.currentUtterance = utterance;

      if (!useFallbackDefaultVoice && this.preferredMaleVoice) {
        utterance.voice = this.preferredMaleVoice;
        utterance.lang = this.preferredMaleVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      // Soothing, warm, unhurried planetarium cadence:
      // Rate 0.85 gives a calm, unhurried pace; Pitch 0.94 adds warmth without robotic phase-vocoder distortion;
      // Volume 0.82 keeps the voice intimate and gentle against the warm ambient pad.
      utterance.rate = 0.85;
      utterance.pitch = 0.94;
      utterance.volume = 0.82;

      let started = false;

      utterance.onstart = () => {
        started = true;
        if (sessionId !== this.narrationSessionId) return;
        this.showCaption(rawSentence, 14000);
      };

      utterance.onend = () => {
        if (sessionId !== this.narrationSessionId || !this.isNarrating) return;
        if (idx + 1 < displaySentences.length) {
          // 420ms natural contemplative breath between sentences
          const tid = window.setTimeout(() => speakPhrase(idx + 1, useFallbackDefaultVoice), 420);
          this.phraseTimeouts.push(tid);
        } else {
          this.finishNarration();
        }
      };

      utterance.onerror = (evt) => {
        if (sessionId !== this.narrationSessionId) return;
        const errType = (evt as SpeechSynthesisErrorEvent)?.error;
        if (errType === 'canceled' || errType === 'interrupted') {
          return;
        }
        if (!useFallbackDefaultVoice && this.preferredMaleVoice) {
          this.preferredMaleVoice = null;
          speakPhrase(idx, true);
          return;
        }
        this.finishNarration();
      };

      try {
        if (synth.paused) {
          synth.resume();
        }
        synth.speak(utterance);

        // If a remote cloud voice stalls for >900ms without starting, seamlessly fallback to local voice
        if (!useFallbackDefaultVoice && this.preferredMaleVoice && !this.preferredMaleVoice.localService) {
          const watchdogId = window.setTimeout(() => {
            if (sessionId === this.narrationSessionId && this.isNarrating && !started && !synth.speaking) {
              const voices = synth.getVoices();
              const localEn = voices.find(v => v.localService && v.lang.toLowerCase().startsWith('en'));
              this.preferredMaleVoice = localEn || null;
              try { synth.cancel(); } catch {}
              speakPhrase(idx, true);
            }
          }, 900);
          this.phraseTimeouts.push(watchdogId);
        }
      } catch {
        this.finishNarration();
      }
    };

    speakPhrase(0, false);
  }

  private finishNarration() {
    if (this.keepAliveInterval) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    this.currentUtterance = null;
    this.isNarrating = false;
    this.onNarrationStateChange?.(false);
    this.showCaption(null);
  }

  public stopNarration() {
    this.narrationSessionId++;
    for (const tid of this.phraseTimeouts) {
      window.clearTimeout(tid);
    }
    this.phraseTimeouts = [];

    if (this.keepAliveInterval) {
      window.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    if (this.currentUtterance) {
      this.currentUtterance.onstart = null;
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    }

    if (this.isNarrating) {
      this.isNarrating = false;
      this.onNarrationStateChange?.(false);
    }
    this.showCaption(null);
  }

  public playClick() {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Soft, muted low-frequency velvet tap instead of a sharp beep
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public playHover() {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.006, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {}
  }

  public playLaserPing() {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
      this.showCaption('Laser pulse emitted toward Mare Tranquillitatis');
    } catch {
      // Audio context error fallback
    }
  }

  public playLaserEcho() {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(432, this.ctx.currentTime + 0.42);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.48);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
      this.showCaption('Photon echo received at Earth station (2.56s round trip)');
    } catch {
      // Audio fallback
    }
  }

  public playRumble(active: boolean) {
    if (!this.isSoundEnabled && active) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (active) {
        if (!this.rumbleOsc) {
          this.rumbleOsc = this.ctx.createOscillator();
          this.rumbleGain = this.ctx.createGain();
          this.rumbleOsc.type = 'sine';
          this.rumbleOsc.frequency.setValueAtTime(42, this.ctx.currentTime);
          this.rumbleGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
          this.rumbleGain.gain.linearRampToValueAtTime(0.09, this.ctx.currentTime + 0.4);
          this.rumbleOsc.connect(this.rumbleGain);
          this.rumbleGain.connect(this.ctx.destination);
          this.rumbleOsc.start();
          this.showCaption('Lunar seismic vibration detected', 4000);
        }
      } else {
        this.stopRumble();
      }
    } catch {
      // audio fallback
    }
  }

  public stopRumble() {
    if (this.rumbleOsc && this.rumbleGain && this.ctx) {
      try {
        this.rumbleGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        const osc = this.rumbleOsc;
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, 350);
      } catch {}
      this.rumbleOsc = null;
      this.rumbleGain = null;
    }
  }

  public toggleAmbient(active: boolean) {
    if (!this.isSoundEnabled && active) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (active) {
        if (!this.ambientOsc) {
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(240, this.ctx.currentTime);

          this.ambientGain = this.ctx.createGain();
          this.ambientGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          this.ambientGain.gain.linearRampToValueAtTime(0.028, this.ctx.currentTime + 2.5);

          // 43.2 Hz sub-warmth + 64.8 Hz fifth (deep meditation pad)
          this.subOsc = this.ctx.createOscillator();
          this.subOsc.type = 'sine';
          this.subOsc.frequency.setValueAtTime(43.2, this.ctx.currentTime);

          this.ambientOsc = this.ctx.createOscillator();
          this.ambientOsc.type = 'triangle';
          this.ambientOsc.frequency.setValueAtTime(64.8, this.ctx.currentTime);

          this.ambientOsc2 = this.ctx.createOscillator();
          this.ambientOsc2.type = 'sine';
          this.ambientOsc2.frequency.setValueAtTime(108, this.ctx.currentTime);

          this.subOsc.connect(filter);
          this.ambientOsc.connect(filter);
          this.ambientOsc2.connect(filter);
          filter.connect(this.ambientGain);
          this.ambientGain.connect(this.ctx.destination);

          this.subOsc.start();
          this.ambientOsc.start();
          this.ambientOsc2.start();
        }
      } else {
        this.stopAmbient();
      }
    } catch {}
  }

  public stopAmbient() {
    if (this.ambientOsc && this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);
        const osc1 = this.ambientOsc;
        const osc2 = this.ambientOsc2;
        const sub = this.subOsc;
        setTimeout(() => {
          try { osc1.stop(); osc1.disconnect(); } catch {}
          try { osc2?.stop(); osc2?.disconnect(); } catch {}
          try { sub?.stop(); sub?.disconnect(); } catch {}
        }, 950);
      } catch {}
      this.ambientOsc = null;
      this.ambientOsc2 = null;
      this.subOsc = null;
      this.ambientGain = null;
    }
  }
}

export const audioService = new AudioManager();
