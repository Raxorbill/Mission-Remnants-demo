/**
 * ScrollPrologueController — Master Scroll Director orchestrating:
 * 1. 3D Camera fly-through in space (Space3DScene)
 * 2. 2D Signal waves & laser transmissions (SignalCanvas)
 * 3. Narrative scenes & documentary vocal sync (VoiceNarration)
 * 4. HUD Telemetry updates & live Lunar Laser Ranging calculations
 * 5. Interactive scientific simulator in Chapter 01
 */

import gsap from 'gsap';
import { Space3DScene } from './Space3DScene.js';
import { SignalCanvas } from './SignalCanvas.js';
import { SoundManager } from './SoundManager.js';
import { VoiceNarration } from './VoiceNarration.js';

const DOCUMENTARY_SCRIPT = [
  {
    range: [0.00, 0.16],
    text: "Every journey into the unknown begins with a question.",
    status: "CARRIER DETECTED",
    distance: "384,400 KM",
    vector: "RA 17h 45m / DEC -29°"
  },
  {
    range: [0.16, 0.35],
    text: "Somewhere beyond our world, machines carried our curiosity farther than we could go.",
    status: "INTERCEPTING DATA STREAM",
    distance: "1,420,000 KM",
    vector: "VOYAGER 1 // HELIOPAUSE"
  },
  {
    range: [0.35, 0.54],
    text: "Some fell silent. Some completed their missions. But what they discovered did not disappear.",
    status: "ORBITAL TRAJECTORY SYNC",
    distance: "54,600,000 KM",
    vector: "TERRA ORBIT // 1.00 AU"
  },
  {
    range: [0.54, 0.74],
    text: "They measured distant worlds, listened to unfamiliar landscapes, and changed what humanity understood about the universe.",
    status: "TELEMETRY UNLOCKED",
    distance: "384,400 KM",
    vector: "TRANQUILITY BASE LOCK"
  },
  {
    range: [0.74, 0.90],
    text: "And every discovery leaves us with another question.",
    status: "LLR TARGET ACQUIRED",
    distance: "384,402.148 KM",
    vector: "0.67408° N, 23.47297° E"
  },
  {
    range: [0.90, 1.00],
    text: "How far away is the Moon, exactly?",
    status: "EXPERIMENT ONLINE",
    distance: "384,402.148 KM",
    vector: "REFLECTOR ECHO CONFIRMED"
  }
];

export class ScrollPrologueController {
  constructor() {
    this.container = document.getElementById('prologueContainer');
    this.stage = document.getElementById('prologueStage');
    this.canvas3D = new Space3DScene(document.getElementById('space3DCanvas'));
    this.canvas2D = new SignalCanvas(document.getElementById('prologueCanvas'));
    this.sound = new SoundManager();
    this.narration = new VoiceNarration(this.sound);

    // Elements
    this.progressFill = document.getElementById('progressFill');
    this.subtitleText = document.getElementById('subtitleText');
    this.subtitleBadge = document.querySelector('.subtitle-badge');
    this.scrollHook = document.getElementById('scrollHook');
    this.hudDistance = document.getElementById('hudDistance');
    this.hudStatus = document.getElementById('hudStatus');
    this.hudVector = document.getElementById('hudVector');
    this.hudRanging = document.getElementById('hudRanging');
    this.rangingTime = document.getElementById('rangingTime');
    this.rangingDistance = document.getElementById('rangingDistance');
    this.soundBtn = document.getElementById('soundBtn');
    this.soundStatusLabel = document.getElementById('soundStatusLabel');

    // Scenes
    this.scene01 = document.getElementById('scene01');
    this.scene02 = document.getElementById('scene02');
    this.scene03 = document.getElementById('scene03');
    this.scene04 = document.getElementById('scene04');
    this.scene05 = document.getElementById('scene05');
    this.scene06 = document.getElementById('scene06');

    this.currentProgress = 0;
    this.activeVoiceIndex = -1;

    this._bindEvents();
    this._initSimulator();

    this.canvas2D.start();
    this.canvas2D.signalOpacity = 0.85;
    this.canvas2D.signalProgress = 1.0;
  }

  _bindEvents() {
    // Scroll listener
    this._onScroll = this._onScroll.bind(this);
    window.addEventListener('scroll', this._onScroll, { passive: true });

    // Audio Visualizer Callback
    this.narration.onStateChange = (isSpeaking) => {
      if (this.subtitleBadge) {
        if (isSpeaking) {
          this.subtitleBadge.classList.add('is-speaking');
        } else {
          this.subtitleBadge.classList.remove('is-speaking');
        }
      }
    };

    // Skip Button
    const skipBtn = document.getElementById('skipBtn');
    skipBtn?.addEventListener('click', () => {
      this.transitionToChapter();
    });

    // Scene Navigation Jump Markers
    const markers = document.querySelectorAll('.p-marker');
    markers.forEach(m => {
      m.addEventListener('click', () => {
        const targetP = parseFloat(m.dataset.p);
        const scrollHeight = this.container.offsetHeight - window.innerHeight;
        window.scrollTo({
          top: targetP * scrollHeight,
          behavior: 'smooth'
        });
      });
    });

    // Sound / Narration Toggle
    this.soundBtn?.addEventListener('click', () => {
      const enabled = this.sound.toggle();
      this.narration.enabled = enabled;
      this.soundBtn.classList.toggle('is-active', enabled);

      const offIcon = this.soundBtn.querySelector('.icon-sound-off');
      const onIcon = this.soundBtn.querySelector('.icon-sound-on');

      if (offIcon) offIcon.style.display = enabled ? 'none' : 'block';
      if (onIcon) onIcon.style.display = enabled ? 'block' : 'none';
      if (this.soundStatusLabel) {
        this.soundStatusLabel.textContent = enabled ? 'Voice Active' : 'Enable Voice';
      }

      if (enabled) {
        const idx = this.activeVoiceIndex >= 0 ? this.activeVoiceIndex : 0;
        this.activeVoiceIndex = idx;
        if (DOCUMENTARY_SCRIPT[idx]) {
          this.narration.speak(DOCUMENTARY_SCRIPT[idx].text, idx, true);
        }
      } else {
        this.narration.stop();
      }
    });

    // Begin Button in Scene 06
    const beginBtn = document.getElementById('beginBtn');
    beginBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.transitionToChapter();
    });

    this._onScroll();
  }

  _onScroll() {
    if (this.isPaused || !this.container) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = this.container.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

    this.currentProgress = progress;

    // Update 3D Camera & Relic Progress
    this.canvas3D.setProgress(progress);

    // Update Progress Bar
    if (this.progressFill) {
      this.progressFill.style.width = `${progress * 100}%`;
    }

    // Hide initial scroll mouse indicator once user begins scrolling
    if (this.scrollHook) {
      if (progress > 0.03) {
        this.scrollHook.classList.add('is-hidden');
      } else {
        this.scrollHook.classList.remove('is-hidden');
      }
    }

    // Update Scenes based on continuous progress
    this._updateScenes(progress);
    this._updateNarrationAndHUD(progress);
  }

  _updateScenes(p) {
    // SCENE 01: The Signal (0.00 - 0.16)
    const inS1 = p >= 0.0 && p < 0.16;
    this._setSceneVisible(this.scene01, inS1);
    if (inS1) {
      const labels = this.scene01.querySelectorAll('.tech-label');
      labels.forEach((l, i) => {
        const threshold = 0.02 + i * 0.04;
        const opacity = p >= threshold ? Math.min(1, (p - threshold) * 20) : 0;
        l.style.opacity = opacity;
        l.style.transform = `translateY(${10 - opacity * 10}px)`;
      });
      this.canvas2D.signalOpacity = Math.max(0, 1 - p * 5);
    } else {
      this.canvas2D.signalOpacity = 0;
    }

    // SCENE 02: The Silence (0.16 - 0.35)
    const inS2 = p >= 0.16 && p < 0.35;
    this._setSceneVisible(this.scene02, inS2);
    if (inS2) {
      const localP = (p - 0.16) / 0.19;
      this._animateWords(['sw0', 'sw1', 'sw2'], localP);
    }

    // SCENE 03: What Remains (0.35 - 0.54)
    const inS3 = p >= 0.35 && p < 0.54;
    this._setSceneVisible(this.scene03, inS3);
    if (inS3) {
      const localP = (p - 0.35) / 0.19;
      this._animateWords(['rl0', 'rl1', 'rl2'], localP);
    }

    // SCENE 04: The Realization (0.54 - 0.74)
    const inS4 = p >= 0.54 && p < 0.74;
    this._setSceneVisible(this.scene04, inS4);
    if (inS4) {
      const localP = (p - 0.54) / 0.20;
      const ids = ['aw0', 'aw1', 'aw2', 'aw3'];
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const activeIdx = Math.floor(localP * 4);
        const isActive = activeIdx === i;
        el.style.opacity = isActive ? '1' : '0';
        el.style.transform = isActive ? 'scale(1)' : 'scale(0.85)';
        el.style.color = i === 0 ? '#00D9F5' : i === 1 ? '#6366F1' : i === 2 ? '#A78BFA' : '#FFFFFF';
      });
    }

    // SCENE 05: The Reveal (0.74 - 0.90)
    const inS5 = p >= 0.74 && p < 0.90;
    this._setSceneVisible(this.scene05, inS5);
    if (inS5) {
      const localP = (p - 0.74) / 0.16;
      const titleLines = this.scene05.querySelectorAll('.reveal__title-line');
      const tagline = this.scene05.querySelector('.reveal__tagline');

      titleLines.forEach((tl, i) => {
        const showP = 0.15 + i * 0.2;
        const op = localP >= showP ? 1 : Math.max(0, localP / showP);
        tl.style.opacity = op;
        tl.style.transform = `translateY(${30 - op * 30}px)`;
      });

      if (tagline) {
        const tagOp = localP >= 0.7 ? 1 : 0;
        tagline.style.opacity = tagOp;
        tagline.style.transform = `translateY(${15 - tagOp * 15}px)`;
      }
    }

    // SCENE 06: Enter The Experience (0.90 - 1.00)
    const inS6 = p >= 0.90;
    this._setSceneVisible(this.scene06, inS6);
    if (inS6) {
      const question = this.scene06.querySelector('.enter__question');
      const cta = this.scene06.querySelector('.enter__cta');
      if (question) {
        question.style.opacity = '1';
        question.style.transform = 'translateY(0)';
      }
      if (cta) {
        cta.style.opacity = '1';
        cta.style.transform = 'translateY(0)';
      }
    }

    // Live Lunar Laser Ranging Telemetry Box (Active in Scene 5 & 6)
    if (this.hudRanging) {
      if (p >= 0.72) {
        this.hudRanging.classList.add('is-visible');
        // Subtle micro-jitter simulating real orbital measurement variations
        const jitterMs = ((Math.sin(Date.now() * 0.003) * 0.000008) + 2.564412).toFixed(6);
        const jitterKm = (384402.148 + Math.sin(Date.now() * 0.002) * 0.004).toFixed(3);
        if (this.rangingTime) this.rangingTime.textContent = `${jitterMs} s`;
        if (this.rangingDistance) this.rangingDistance.textContent = `${jitterKm} km`;
      } else {
        this.hudRanging.classList.remove('is-visible');
      }
    }
  }

  _animateWords(ids, localP) {
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const startP = i * 0.3;
      if (localP >= startP) {
        const subP = Math.min(1, (localP - startP) / 0.35);
        el.style.opacity = subP;
        el.style.transform = `translateY(${24 - subP * 24}px)`;
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
      }
    });
  }

  _setSceneVisible(sceneEl, isVisible) {
    if (!sceneEl) return;
    sceneEl.style.opacity = isVisible ? '1' : '0';
    sceneEl.style.visibility = isVisible ? 'visible' : 'hidden';
    sceneEl.style.pointerEvents = isVisible ? 'auto' : 'none';
  }

  _updateNarrationAndHUD(progress) {
    let scriptIdx = -1;
    for (let i = 0; i < DOCUMENTARY_SCRIPT.length; i++) {
      const item = DOCUMENTARY_SCRIPT[i];
      if (progress >= item.range[0] && progress < item.range[1]) {
        scriptIdx = i;
        break;
      }
    }
    if (progress >= 0.98) scriptIdx = DOCUMENTARY_SCRIPT.length - 1;

    if (scriptIdx !== -1) {
      const item = DOCUMENTARY_SCRIPT[scriptIdx];
      if (this.subtitleText && this.subtitleText.textContent !== item.text) {
        this.subtitleText.textContent = item.text;
        this.subtitleText.classList.add('is-visible');
      }

      // Update HUD
      if (this.hudStatus) this.hudStatus.textContent = item.status;
      if (this.hudDistance) this.hudDistance.textContent = item.distance;
      if (this.hudVector && item.vector) this.hudVector.textContent = item.vector;

      // Speak line if voice index changes
      if (this.activeVoiceIndex !== scriptIdx) {
        this.activeVoiceIndex = scriptIdx;
        this.narration.speak(item.text, scriptIdx);
        this.sound.playSignalBlip();
      }
    }
  }

  /* ── Interactive Scientific Simulator in Chapter 01 ── */
  _initSimulator() {
    const fireBtn = document.getElementById('simFireBtn');
    const pulseBar = document.getElementById('simLaserPulse');
    const timerVal = document.getElementById('simTimer');
    const photonsVal = document.getElementById('simPhotons');
    const statusVal = document.getElementById('simStatus');

    if (!fireBtn) return;

    let isFiring = false;

    fireBtn.addEventListener('click', () => {
      if (isFiring) return;
      isFiring = true;

      this.sound.playLaserPulse();

      if (statusVal) {
        statusVal.textContent = 'TRANSMITTING PHOTON PULSE...';
        statusVal.classList.add('firing');
      }

      // Animate laser beam out to Moon (1.28s) and back (1.28s) = ~2.56s
      const startTime = performance.now();
      const totalDuration = 2564; // ms

      const updateAnim = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / totalDuration);

        // Timer readout
        if (timerVal) {
          timerVal.textContent = `${(elapsed / 1000).toFixed(3)} s`;
        }

        // Beam pulse motion (out and back)
        if (pulseBar) {
          if (progress < 0.5) {
            // Outbound to Moon
            const p = progress * 2;
            pulseBar.style.left = '0%';
            pulseBar.style.width = `${p * 100}%`;
          } else {
            // Inbound return to Earth
            const p = (progress - 0.5) * 2;
            pulseBar.style.left = `${p * 100}%`;
            pulseBar.style.width = `${(1 - p) * 100}%`;
          }
        }

        if (progress < 1) {
          requestAnimationFrame(updateAnim);
        } else {
          // Pulse arrived back!
          isFiring = false;
          if (pulseBar) pulseBar.style.width = '0%';
          if (timerVal) timerVal.textContent = '2.564 s';
          if (photonsVal) photonsVal.textContent = '1 PHOTON DETECTED';
          if (statusVal) {
            statusVal.textContent = 'ECHO DETECTED // 384,402.148 KM (±1.2 MM)';
            statusVal.classList.remove('firing');
          }
          this.sound.playSignalBlip();
        }
      };

      requestAnimationFrame(updateAnim);
    });
  }

  transitionToChapter(stageIndex = 0, mode = 'chapter') {
    this.narration.stop();
    this.sound.stopAmbient();
    this.pause();

    window.dispatchEvent(
      new CustomEvent('prologue:enter-journey', {
        detail: { stageIndex, mode }
      })
    );
  }

  pause() {
    this.isPaused = true;
    this.canvas3D?.pause?.();
    this.canvas2D?.stop?.();
    this.narration?.stop?.();
    this.sound?.stopAmbient?.();
  }

  resume() {
    this.isPaused = false;
    this.canvas3D?.resume?.();
    this.canvas2D?.start?.();
    window.scrollTo({ top: 0, behavior: 'instant' });
    this._onScroll();
  }

  destroy() {
    window.removeEventListener('scroll', this._onScroll);
    this.canvas3D.destroy();
    this.canvas2D.destroy();
    this.sound.destroy();
    this.narration.stop();
  }
}
