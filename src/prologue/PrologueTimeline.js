/**
 * PrologueTimeline — Master GSAP timeline orchestrating all six scenes.
 *
 * Duration: ~30 seconds total
 * Scene 01 (The Signal):       0–5s
 * Scene 02 (The Silence):      5–10s
 * Scene 03 (What Remains):     10–16s
 * Scene 04 (The Realization):  16–22s
 * Scene 05 (The Reveal):       22–27s
 * Scene 06 (Enter):            27–30s
 */

import gsap from 'gsap';
import { SignalCanvas } from './SignalCanvas.js';
import { SoundManager } from './SoundManager.js';

// Subtitle data synced to voiceover
const SUBTITLES = [
  { time: 0.5,  end: 4.5,  text: 'Every journey into the unknown begins with a question.' },
  { time: 5.5,  end: 9.5,  text: 'Somewhere beyond our world, machines carried our curiosity farther than we could go.' },
  { time: 10.5, end: 15.5, text: 'Some fell silent. Some completed their missions. But what they discovered did not disappear.' },
  { time: 16.5, end: 21.5, text: 'They measured distant worlds, listened to unfamiliar landscapes, and changed what humanity understood about the universe.' },
  { time: 22.5, end: 26.5, text: 'And every discovery leaves us with another question.' },
];

export class PrologueTimeline {
  constructor() {
    this.prologue = document.getElementById('prologue');
    this.canvas = new SignalCanvas(document.getElementById('prologueCanvas'));
    this.sound = new SoundManager();
    this.timeline = null;
    this.isPlaying = false;
    this.isComplete = false;
    this.subtitleEl = document.getElementById('subtitleText');
    this.progressFill = document.getElementById('progressFill');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._subtitleTimeout = null;

    this._bindControls();
    this._loadAssets();
  }

  _bindControls() {
    // Skip button
    const skipBtn = document.getElementById('skipBtn');
    skipBtn.addEventListener('click', () => this.skip());

    // Sound toggle
    const soundBtn = document.getElementById('soundBtn');
    soundBtn.addEventListener('click', () => {
      const enabled = this.sound.toggle();
      soundBtn.classList.toggle('is-active', enabled);
      soundBtn.querySelector('.icon-sound-off').style.display = enabled ? 'none' : 'block';
      soundBtn.querySelector('.icon-sound-on').style.display = enabled ? 'block' : 'none';
      soundBtn.setAttribute('aria-label', enabled ? 'Disable sound' : 'Enable sound');

      if (enabled && this.isPlaying && this.timeline) {
        this.sound.playVoiceover(this.timeline.time());
      }
    });

    // Begin the Journey
    const beginBtn = document.getElementById('beginBtn');
    beginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.transitionToChapter();
    });
  }

  async _loadAssets() {
    await this.sound.loadVoiceover('/audio/prologue-voiceover.mp3');
  }

  /**
   * Build and play the master timeline.
   */
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.reducedMotion) {
      this._playReducedMotion();
      return;
    }

    this.canvas.start();
    this.timeline = gsap.timeline({
      onUpdate: () => this._onUpdate(),
      onComplete: () => this._onTimelineComplete(),
    });

    const tl = this.timeline;

    // Show controls with fade
    tl.to('.prologue__controls', {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    }, 0.5);

    // Ambient lighting orbs fade in subtly
    tl.to('.prologue__ambient-orb--cyan', {
      opacity: 0.7,
      duration: 4,
      ease: 'power2.out',
    }, 1);

    tl.to('.prologue__ambient-orb--indigo', {
      opacity: 0.6,
      duration: 5,
      ease: 'power2.out',
    }, 3);

    this._buildScene01(tl);
    this._buildScene02(tl);
    this._buildScene03(tl);
    this._buildScene04(tl);
    this._buildScene05(tl);
    this._buildScene06(tl);
  }

  /* ═══════════════════════════════════════════
     SCENE 01 — THE SIGNAL (0–5s)
     ═══════════════════════════════════════════ */
  _buildScene01(tl) {
    const scene = document.getElementById('scene01');

    // Show scene
    tl.set(scene, { visibility: 'visible', opacity: 1 }, 0);

    // Signal line fades in
    tl.to(this.canvas, {
      signalOpacity: 0.8,
      duration: 1,
      ease: 'power2.out',
    }, 0.2);

    // Signal line sweeps across
    tl.to(this.canvas, {
      signalProgress: 1,
      duration: 3.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        this.canvas.signalFlicker = Math.random() > 0.85;
      },
    }, 0.5);

    // Technical labels — staggered appearance
    const labels = scene.querySelectorAll('.tech-label');
    labels.forEach((label) => {
      const delay = parseFloat(label.dataset.delay);
      tl.to(label, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onStart: () => this.sound.playSignalBlip(),
      }, delay);

      tl.to(label, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      }, delay + 1.3);
    });

    // Subtitle
    tl.call(() => this._showSubtitle(0), null, 0.5);

    // Transition: signal expands into streak
    tl.call(() => {
      this.canvas.signalExpanded = true;
      this.sound.playTransitionTone();
    }, null, 4.2);

    tl.to(this.canvas, {
      signalOpacity: 0.3,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 4.3);

    // Fade out scene
    tl.to(scene, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => { scene.style.visibility = 'hidden'; },
    }, 4.5);
  }

  /* ═══════════════════════════════════════════
     SCENE 02 — THE SILENCE (5–10s)
     ═══════════════════════════════════════════ */
  _buildScene02(tl) {
    const scene = document.getElementById('scene02');
    const words = scene.querySelectorAll('.silence-word');

    tl.set(scene, { visibility: 'visible' }, 5);
    tl.to(scene, { opacity: 1, duration: 0.4 }, 5);

    // Dim the signal line
    tl.to(this.canvas, {
      signalOpacity: 0.03,
      duration: 2,
      ease: 'power2.out',
    }, 5);

    // Words appear one at a time with staggered timing
    const wordTimings = [5.6, 6.8, 7.8];
    words.forEach((word, i) => {
      gsap.set(word, { y: 25, opacity: 0 });
      tl.to(word, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, wordTimings[i]);
    });

    // Subtitle
    tl.call(() => this._showSubtitle(1), null, 5.5);

    // Words dissolve into particles
    tl.call(() => {
      words.forEach(word => {
        const rect = word.getBoundingClientRect();
        this.canvas.spawnParticles(
          12,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          rect.width * 0.8
        );
      });
      this.sound.playTransitionTone();
    }, null, 9.1);

    tl.to(words, {
      opacity: 0,
      scale: 0.96,
      filter: 'blur(3px)',
      duration: 0.7,
      stagger: 0.08,
      ease: 'power2.in',
    }, 9.1);

    tl.to(scene, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => { scene.style.visibility = 'hidden'; },
    }, 9.6);
  }

  /* ═══════════════════════════════════════════
     SCENE 03 — WHAT REMAINS (10–16s)
     ═══════════════════════════════════════════ */
  _buildScene03(tl) {
    const scene = document.getElementById('scene03');
    const lines = scene.querySelectorAll('.remains-line');

    tl.set(scene, { visibility: 'visible' }, 10);
    tl.to(scene, { opacity: 1, duration: 0.4 }, 10);

    // Dim signal completely
    tl.to(this.canvas, {
      signalOpacity: 0,
      duration: 0.5,
    }, 10);

    // Show orbital curves
    tl.to(this.canvas, {
      orbitalOpacity: 1,
      duration: 2.5,
      ease: 'power2.out',
    }, 10);

    // Lines reveal with clip-mask text animation
    const lineTimings = [10.6, 12.2, 13.8];
    lines.forEach((line, i) => {
      // Wrap text in span for translateY reveal
      const text = line.textContent;
      line.textContent = '';
      const span = document.createElement('span');
      span.textContent = text;
      span.style.display = 'inline-block';
      line.appendChild(span);

      gsap.set(span, { y: '110%' });
      gsap.set(line, { opacity: 0 });

      tl.set(line, { opacity: 1 }, lineTimings[i]);
      tl.to(span, {
        y: '0%',
        duration: 0.7,
        ease: 'power3.out',
      }, lineTimings[i]);

      // Fade previous line to de-emphasize
      if (i > 0) {
        tl.to(lines[i - 1], {
          opacity: 0.2,
          duration: 0.4,
          ease: 'power2.out',
        }, lineTimings[i]);
      }
    });

    // Subtitle
    tl.call(() => this._showSubtitle(2), null, 10.5);

    // Transition out
    tl.to(this.canvas, {
      orbitalOpacity: 0.2,
      duration: 0.8,
    }, 15.2);

    tl.to(scene, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => { scene.style.visibility = 'hidden'; },
    }, 15.5);
  }

  /* ═══════════════════════════════════════════
     SCENE 04 — THE REALIZATION (16–22s)
     ═══════════════════════════════════════════ */
  _buildScene04(tl) {
    const scene = document.getElementById('scene04');
    const words = scene.querySelectorAll('.action-word');

    tl.set(scene, { visibility: 'visible' }, 16);
    tl.to(scene, { opacity: 1, duration: 0.3 }, 16);

    // Each word appears emphatically with pulse ring
    const wordTimings = [16.5, 17.9, 19.1, 20.3];
    const colors = ['#00D9F5', '#6366F1', '#A78BFA', '#FFFFFF'];

    words.forEach((word, i) => {
      gsap.set(word, { opacity: 0, scale: 0.88 });

      tl.to(word, {
        opacity: 1,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        onStart: () => {
          // Use current viewport centre for pulse ring
          this.canvas.addPulseRing(
            window.innerWidth / 2,
            window.innerHeight / 2
          );
          this.sound.playSignalBlip();
        },
      }, wordTimings[i]);

      // Flash accent color then back to white
      tl.to(word, {
        color: colors[i],
        duration: 0.2,
        ease: 'power1.out',
      }, wordTimings[i]);

      tl.to(word, {
        color: '#FFFFFF',
        duration: 0.6,
        ease: 'power2.inOut',
      }, wordTimings[i] + 0.4);

      // Fade previous word
      if (i > 0) {
        tl.to(words[i - 1], {
          opacity: 0.12,
          scale: 0.96,
          duration: 0.35,
          ease: 'power2.in',
        }, wordTimings[i]);
      }
    });

    // Subtitle
    tl.call(() => this._showSubtitle(3), null, 16.5);

    // Transition out — all words fade
    tl.to(words, {
      opacity: 0,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power2.in',
    }, 21.1);

    tl.to(this.canvas, {
      orbitalOpacity: 0,
      duration: 0.8,
    }, 21);

    tl.to(scene, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => { scene.style.visibility = 'hidden'; },
    }, 21.5);
  }

  /* ═══════════════════════════════════════════
     SCENE 05 — THE REVEAL (22–27s)
     ═══════════════════════════════════════════ */
  _buildScene05(tl) {
    const scene = document.getElementById('scene05');
    const titleLines = scene.querySelectorAll('.reveal__title-line');
    const tagline = scene.querySelector('.reveal__tagline');

    tl.set(scene, { visibility: 'visible' }, 22);
    tl.to(scene, { opacity: 1, duration: 0.3 }, 22);

    // Cyan reveal line draws from centre
    tl.to(this.canvas, {
      revealLineOpacity: 1,
      revealLineProgress: 1,
      duration: 1.0,
      ease: 'power2.inOut',
    }, 22.2);

    // Title lines appear sequentially
    titleLines.forEach((line, i) => {
      gsap.set(line, { opacity: 0, y: 35 });

      tl.to(line, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, 22.8 + i * 0.35);
    });

    // Cinematic impact sound on first title word
    tl.call(() => {
      this.sound.playRevealImpact();
    }, null, 22.8);

    // Tagline fades in
    gsap.set(tagline, { opacity: 0, y: 15 });
    tl.to(tagline, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 24.6);

    // Subtitle
    tl.call(() => this._showSubtitle(4), null, 22.5);

    // Fade reveal line
    tl.to(this.canvas, {
      revealLineOpacity: 0,
      duration: 1.2,
      ease: 'power2.in',
    }, 25.2);

    // Transition out — title and tagline
    titleLines.forEach((line, i) => {
      tl.to(line, {
        opacity: 0,
        y: -15,
        duration: 0.6,
        ease: 'power2.in',
      }, 26.2 + i * 0.08);
    });

    tl.to(tagline, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: 'power2.in',
    }, 26.5);

    tl.to(scene, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => { scene.style.visibility = 'hidden'; },
    }, 27);
  }

  /* ═══════════════════════════════════════════
     SCENE 06 — ENTER THE EXPERIENCE (27–30s)
     ═══════════════════════════════════════════ */
  _buildScene06(tl) {
    const scene = document.getElementById('scene06');
    const question = scene.querySelector('.enter__question');
    const cta = scene.querySelector('.enter__cta');

    gsap.set(question, { opacity: 0, y: 20 });
    gsap.set(cta, { opacity: 0, y: 15 });

    tl.set(scene, { visibility: 'visible' }, 27);
    tl.to(scene, { opacity: 1, duration: 0.4 }, 27);

    // Question appears
    tl.to(question, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, 27.4);

    // CTA button appears
    tl.to(cta, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, 28.2);

    // Hide subtitle
    tl.call(() => this._hideSubtitle(), null, 27.5);
  }

  /* ═══════════════════════════════════════════
     SUBTITLE MANAGEMENT
     ═══════════════════════════════════════════ */
  _showSubtitle(index) {
    const sub = SUBTITLES[index];
    if (!sub) return;

    this.subtitleEl.textContent = sub.text;
    this.subtitleEl.classList.add('is-visible');

    const hideDelay = (sub.end - sub.time) * 1000;
    clearTimeout(this._subtitleTimeout);
    this._subtitleTimeout = setTimeout(() => {
      this._hideSubtitle();
    }, hideDelay);
  }

  _hideSubtitle() {
    this.subtitleEl.classList.remove('is-visible');
    clearTimeout(this._subtitleTimeout);
  }

  /* ═══════════════════════════════════════════
     PROGRESS & UPDATES
     ═══════════════════════════════════════════ */
  _onUpdate() {
    if (!this.timeline) return;
    const progress = this.timeline.progress();
    this.progressFill.style.width = (progress * 100) + '%';
  }

  _onTimelineComplete() {
    this.isComplete = true;
  }

  /* ═══════════════════════════════════════════
     SKIP INTRO
     ═══════════════════════════════════════════ */
  skip() {
    if (this.timeline) {
      this.timeline.kill();
    }
    this._hideSubtitle();
    this.canvas.stop();
    this.sound.stopVoiceover();
    this.transitionToChapter();
  }

  /* ═══════════════════════════════════════════
     TRANSITION TO CHAPTER 01
     ═══════════════════════════════════════════ */
  transitionToChapter() {
    const prologue = this.prologue;
    const mainContent = document.getElementById('mainContent');

    if (this.timeline) {
      this.timeline.kill();
    }
    this._hideSubtitle();
    this.sound.stopAmbient();
    this.sound.stopVoiceover();

    // Fade out prologue
    prologue.classList.add('prologue--exiting');

    setTimeout(() => {
      prologue.classList.add('prologue--hidden');
      prologue.style.display = 'none';

      // Show main content
      mainContent.style.display = 'block';
      document.body.style.overflow = '';

      // Fade in chapter
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const chapter = document.getElementById('chapter-01');
          if (chapter) {
            chapter.classList.add('is-visible');
          }
        });
      });

      // Cleanup
      this.destroy();
    }, 1000);
  }

  /* ═══════════════════════════════════════════
     REDUCED MOTION — Simplified experience
     ═══════════════════════════════════════════ */
  _playReducedMotion() {
    gsap.set('.prologue__controls', { opacity: 1 });

    const scene06 = document.getElementById('scene06');
    gsap.set(scene06, { visibility: 'visible', opacity: 1 });
    gsap.set(scene06.querySelector('.enter__question'), { opacity: 1, y: 0 });
    gsap.set(scene06.querySelector('.enter__cta'), { opacity: 1, y: 0 });

    this.isComplete = true;
    this.progressFill.style.width = '100%';
  }

  /* ═══════════════════════════════════════════
     CLEANUP
     ═══════════════════════════════════════════ */
  destroy() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.canvas.destroy();
    this.sound.destroy();
    this._hideSubtitle();
    this.isPlaying = false;
  }
}
