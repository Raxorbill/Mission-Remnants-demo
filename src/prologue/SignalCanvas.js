/**
 * Signal Canvas — Renders the signal line, particles, and geometric effects
 * for the prologue background layer.
 */

export class SignalCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.animationId = null;
    this.time = 0;

    // Signal line state
    this.signalProgress = 0;       // 0–1 horizontal sweep
    this.signalOpacity = 0;        // overall opacity
    this.signalFlicker = false;
    this.signalExpanded = false;

    // Particles
    this.particles = [];

    // Orbital curves
    this.orbitalOpacity = 0;

    // Pulse rings (scene 04)
    this.pulseRings = [];

    // Horizontal reveal line (scene 05)
    this.revealLineProgress = 0;
    this.revealLineOpacity = 0;

    this._resize = this.resize.bind(this);
    window.addEventListener('resize', this._resize);
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    // Reset transform then apply DPR scale (setting canvas.width already resets)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  start() {
    if (this.animationId) return;
    const loop = () => {
      this.time += 0.016;
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resize);
  }

  render() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    this.renderSignalLine(ctx, width, height);
    this.renderParticles(ctx, width, height);
    this.renderOrbitalCurves(ctx, width, height);
    this.renderPulseRings(ctx, width, height);
    this.renderRevealLine(ctx, width, height);
  }

  /* ── Signal Line ── */
  renderSignalLine(ctx, w, h) {
    if (this.signalOpacity <= 0) return;

    const cy = h / 2;
    const lineWidth = w * this.signalProgress;

    ctx.save();
    ctx.globalAlpha = this.signalOpacity;

    // Main line
    ctx.beginPath();
    ctx.moveTo(0, cy);

    if (this.signalExpanded) {
      // Expanded: thicker glow streak
      const gradient = ctx.createLinearGradient(0, cy, w, cy);
      gradient.addColorStop(0, 'rgba(0, 217, 245, 0)');
      gradient.addColorStop(0.3, 'rgba(0, 217, 245, 0.4)');
      gradient.addColorStop(0.5, 'rgba(0, 217, 245, 0.6)');
      gradient.addColorStop(0.7, 'rgba(0, 217, 245, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 217, 245, 0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineTo(w, cy);
      ctx.stroke();

      // Glow
      ctx.shadowColor = '#00D9F5';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = 'rgba(0, 217, 245, 0.15)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      // Scanning line with subtle wave
      for (let x = 0; x < lineWidth; x += 2) {
        const wave = Math.sin(x * 0.02 + this.time * 3) * 2;
        const flicker = this.signalFlicker ? (Math.random() * 4 - 2) : 0;
        ctx.lineTo(x, cy + wave + flicker);
      }
      ctx.strokeStyle = '#00D9F5';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dot at the leading edge
      if (this.signalProgress > 0 && this.signalProgress < 1) {
        const dotX = lineWidth;
        const dotWave = Math.sin(dotX * 0.02 + this.time * 3) * 2;
        ctx.beginPath();
        ctx.arc(dotX, cy + dotWave, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00D9F5';
        ctx.shadowColor = '#00D9F5';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  /* ── Particles ── */
  spawnParticles(count, originX, originY, spread = 200) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: originX + (Math.random() - 0.5) * spread,
        y: originY + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1,
        decay: 0.003 + Math.random() * 0.008,
        size: 0.5 + Math.random() * 1.5,
        color: Math.random() > 0.5 ? '#00D9F5' : '#A78BFA',
      });
    }
  }

  renderParticles(ctx, w, h) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Orbital Curves ── */
  renderOrbitalCurves(ctx, w, h) {
    if (this.orbitalOpacity <= 0) return;

    const cx = w / 2;
    const cy = h / 2;

    ctx.save();
    ctx.globalAlpha = this.orbitalOpacity * 0.15;
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 0.5;

    // Ellipse 1
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.3, h * 0.15, Math.PI * 0.1 + this.time * 0.05, 0, Math.PI * 2);
    ctx.stroke();

    // Ellipse 2
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.22, h * 0.2, -Math.PI * 0.15 + this.time * 0.03, 0, Math.PI * 2);
    ctx.stroke();

    // Ellipse 3 — very subtle
    ctx.globalAlpha = this.orbitalOpacity * 0.08;
    ctx.strokeStyle = '#A78BFA';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.38, h * 0.1, this.time * 0.02, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /* ── Pulse Rings ── */
  addPulseRing(x, y) {
    this.pulseRings.push({
      x, y,
      radius: 0,
      maxRadius: 120,
      opacity: 0.4,
      speed: 0.8,
    });
  }

  renderPulseRings(ctx, w, h) {
    for (let i = this.pulseRings.length - 1; i >= 0; i--) {
      const ring = this.pulseRings[i];
      ring.radius += ring.speed;
      ring.opacity -= 0.003;

      if (ring.opacity <= 0 || ring.radius > ring.maxRadius) {
        this.pulseRings.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ring.opacity;
      ctx.strokeStyle = '#00D9F5';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Reveal Line ── */
  renderRevealLine(ctx, w, h) {
    if (this.revealLineOpacity <= 0 || this.revealLineProgress <= 0) return;

    const cy = h / 2 - 20;
    const halfLen = (w * 0.4) * this.revealLineProgress;

    const gradient = ctx.createLinearGradient(w / 2 - halfLen, cy, w / 2 + halfLen, cy);
    gradient.addColorStop(0, 'rgba(0, 217, 245, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 217, 245, 0.5)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.7)');
    gradient.addColorStop(0.8, 'rgba(0, 217, 245, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 217, 245, 0)');

    ctx.save();
    ctx.globalAlpha = this.revealLineOpacity;
    ctx.beginPath();
    ctx.moveTo(w / 2 - halfLen, cy);
    ctx.lineTo(w / 2 + halfLen, cy);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glow
    ctx.shadowColor = '#00D9F5';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(w / 2 - halfLen, cy);
    ctx.lineTo(w / 2 + halfLen, cy);
    ctx.strokeStyle = 'rgba(0, 217, 245, 0.1)';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.restore();
  }
}
