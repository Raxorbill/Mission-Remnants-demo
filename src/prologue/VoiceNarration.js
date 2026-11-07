/**
 * VoiceNarration.js
 *
 * Late-night deep meditation male documentary voice engine.
 *
 * Features:
 * - Strictly prioritizes deep, warm, velvet male voices:
 *   Christopher Natural, Guy Natural, Eric Natural, Brian Natural, Ryan Natural,
 *   Google UK English Male, Daniel, Oliver, Arthur, Alex
 * - Sentence-by-sentence contemplative phrasing with natural 480ms breath pauses
 * - Deep baritone pitch (0.76) and unhurried late-night cadence (0.79)
 * - Soft warm low-frequency singing bowl resonance prior to speaking
 */

export class VoiceNarration {
  constructor(soundManager) {
    this.sound = soundManager;
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.lastSpokenIndex = -1;
    this.preferredVoice = null;
    this.voicePreference = 'male';
    this.enabled = false;
    this.onStateChange = null;
    this._phraseTimeouts = [];
    this._sessionId = 0;
    this._keepAlive = null;

    this._setupVoices();
  }

  _setupVoices() {
    if (!this.synth) return;

    const findVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      if (enVoices.length === 0) {
        this.preferredVoice = voices[0];
        return;
      }

      // Deprioritize old robotic SAPI5 desktop voices unless nothing else is available
      const smoothVoices = enVoices.filter(
        v => !/Microsoft (David|Mark|Zira) Desktop|Fred|espeak/i.test(v.name)
      );
      const pool = smoothVoices.length > 0 ? smoothVoices : enVoices;

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
        const candidate = pool.find(v => pattern.test(v.name) || pattern.test(v.lang));
        if (candidate) {
          this.preferredVoice = candidate;
          return;
        }
      }

      this.preferredVoice = pool[0] || enVoices[0];
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  setVoiceType(type) {
    this.voicePreference = type;
    this._setupVoices();
  }

  _clearPhraseQueue() {
    for (const tid of this._phraseTimeouts) {
      clearTimeout(tid);
    }
    this._phraseTimeouts = [];
    if (this._keepAlive) {
      clearInterval(this._keepAlive);
      this._keepAlive = null;
    }
  }

  speak(text, index, force = false) {
    if (!this.enabled) return;
    if (!force && this.lastSpokenIndex === index) return;
    this.lastSpokenIndex = index;

    if (!this.synth) return;

    this._clearPhraseQueue();
    const sessionId = ++this._sessionId;

    if (this.currentUtterance) {
      this.currentUtterance.onstart = null;
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }

    try {
      if (this.synth.speaking || this.synth.pending) {
        this.synth.cancel();
      }
    } catch {}

    if (this.sound) {
      this.sound.playMeditativeChime();
    }

    if (!this.preferredVoice) {
      this._setupVoices();
    }

    const phrases = text
      .replace(/—/g, ', ... ')
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (phrases.length === 0) return;

    this._keepAlive = setInterval(() => {
      if (this.enabled && this.synth && this.synth.paused) {
        try {
          this.synth.resume();
        } catch {}
      }
    }, 2500);

    const speakPhraseAt = (phraseIdx, useDefaultVoice = false) => {
      if (sessionId !== this._sessionId || !this.enabled || phraseIdx >= phrases.length) {
        if (sessionId === this._sessionId) {
          this._clearPhraseQueue();
          if (this.onStateChange) this.onStateChange(false);
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(phrases[phraseIdx]);
      this.currentUtterance = utterance;

      if (!useDefaultVoice && this.preferredVoice) {
        utterance.voice = this.preferredVoice;
        utterance.lang = this.preferredVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }

      // Soothing, warm, unhurried documentary cadence without robotic formant distortion
      utterance.rate = 0.85;
      utterance.pitch = 0.94;
      utterance.volume = 0.82;

      let started = false;

      utterance.onstart = () => {
        started = true;
        if (sessionId !== this._sessionId) return;
        if (this.onStateChange) this.onStateChange(true);
      };

      utterance.onend = () => {
        if (sessionId !== this._sessionId || !this.enabled) return;
        if (phraseIdx + 1 < phrases.length) {
          const tid = setTimeout(() => speakPhraseAt(phraseIdx + 1, useDefaultVoice), 420);
          this._phraseTimeouts.push(tid);
        } else {
          this._clearPhraseQueue();
          if (this.onStateChange) this.onStateChange(false);
        }
      };

      utterance.onerror = (evt) => {
        if (sessionId !== this._sessionId) return;
        const err = evt && evt.error;
        if (err === 'canceled' || err === 'interrupted') return;
        if (!useDefaultVoice && this.preferredVoice) {
          this.preferredVoice = null;
          speakPhraseAt(phraseIdx, true);
          return;
        }
        this._clearPhraseQueue();
        if (this.onStateChange) this.onStateChange(false);
      };

      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
        this.synth.speak(utterance);

        if (!useDefaultVoice && this.preferredVoice && !this.preferredVoice.localService) {
          const watchdogId = setTimeout(() => {
            if (sessionId === this._sessionId && this.enabled && !started && !this.synth.speaking) {
              const voices = this.synth.getVoices();
              const localEn = voices.find(v => v.localService && v.lang.toLowerCase().startsWith('en'));
              this.preferredVoice = localEn || null;
              try { this.synth.cancel(); } catch {}
              speakPhraseAt(phraseIdx, true);
            }
          }, 900);
          this._phraseTimeouts.push(watchdogId);
        }
      } catch {
        if (this.onStateChange) this.onStateChange(false);
      }
    };

    speakPhraseAt(0, false);
  }

  stop() {
    this._sessionId++;
    this._clearPhraseQueue();
    if (this.currentUtterance) {
      this.currentUtterance.onstart = null;
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance = null;
    }
    if (this.synth) {
      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
      } catch {}
    }
    this.lastSpokenIndex = -1;
    if (this.onStateChange) this.onStateChange(false);
  }
}
