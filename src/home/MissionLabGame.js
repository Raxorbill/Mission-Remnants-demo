/**
 * MissionLabGame.js — Tactical Interactive Space Adventures Engine
 * 
 * Includes 3 Playable Mission Mini-Adventures:
 * 1. APOLLO 11: Lunar Laser Target Lock (Aim Earth telescope, lock on Tranquility Base, fire laser beam)
 * 2. INGENUITY: 1% Martian Atmosphere Flight Simulation (Throttle lift in 0.38g, snap aerial recon photos)
 * 3. VOYAGER 1: Interstellar Deep Space Signal Intercept (Tune DSN 70m radio dish, decode carrier wave)
 */

export class MissionLabGame {
  constructor(canvas, soundManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = soundManager;
    this.activeMission = 'apollo'; // 'apollo' | 'ingenuity' | 'voyager'
    this.animId = null;

    // Common game state
    this.width = 0;
    this.height = 0;
    this.time = 0;

    // Mission 1: Apollo Laser Lock State
    this.apollo = {
      crosshairX: 0,
      crosshairY: 0,
      targetX: 0,
      targetY: 0,
      targetRadius: 28,
      isLocked: false,
      isFiring: false,
      fireTime: 0,
      pulseX: 0,
      pulseReturn: false,
      score: 0,
      shotsFired: 0,
      lastDistance: '384,402.148 km'
    };

    // Mission 2: Ingenuity Flight State
    this.ingenuity = {
      x: 100,
      y: 0,
      vx: 0,
      vy: 0,
      rotorRPM: 0,
      targetRPM: 0,
      isThrottling: false,
      moveLeft: false,
      moveRight: false,
      altitude: 0, // meters
      battery: 100, // %
      photoTaken: false,
      landedSuccessfully: false,
      crashed: false
    };

    // Mission 3: Voyager Signal Decryptor State
    this.voyager = {
      frequency: 8.350, // GHz
      targetFreq: 8.419, // NASA X-Band Voyager 1 frequency
      isLocked: false,
      packetIndex: 0,
      audioPlayed: false
    };

    this._init();
  }

  _init() {
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();

    this._bindControls();

    // Start render/physics loop
    this._loop = this._loop.bind(this);
    this.animId = requestAnimationFrame(this._loop);
  }

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Initial positions
    this.apollo.crosshairX = this.width / 2;
    this.apollo.crosshairY = this.height / 2;
    this.apollo.targetX = this.width * 0.65;
    this.apollo.targetY = this.height * 0.42;

    this.ingenuity.x = this.width * 0.2;
    this.ingenuity.y = this.height - 70;
  }

  _bindControls() {
    // Mouse movement inside canvas for Apollo targeting
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this.activeMission === 'apollo') {
        this.apollo.crosshairX = mx;
        this.apollo.crosshairY = my;
      }
    });

    // Canvas click to fire laser / throttle
    this.canvas.addEventListener('mousedown', () => {
      if (this.activeMission === 'apollo') {
        this.fireApolloLaser();
      } else if (this.activeMission === 'ingenuity') {
        this.ingenuity.isThrottling = true;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.activeMission === 'ingenuity') {
        this.ingenuity.isThrottling = false;
      }
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (this.activeMission === 'apollo' && e.code === 'Space') {
        e.preventDefault();
        this.fireApolloLaser();
      }
      if (this.activeMission === 'ingenuity') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          this.ingenuity.isThrottling = true;
        }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.ingenuity.moveLeft = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.ingenuity.moveRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.activeMission === 'ingenuity') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.ingenuity.isThrottling = false;
        }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.ingenuity.moveLeft = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.ingenuity.moveRight = false;
      }
    });
  }

  setMission(missionId) {
    this.activeMission = missionId;
    this._updateHUDStats();
  }

  /* ═══════════════════════════════════════════
     MISSION 1: APOLLO LASER LOCK & FIRE
     ═══════════════════════════════════════════ */
  fireApolloLaser() {
    if (this.apollo.isFiring) return;
    this.apollo.isFiring = true;
    this.apollo.fireTime = performance.now();
    this.apollo.shotsFired++;
    this.sound.playLaserPulse();

    const hit = this.apollo.isLocked;

    setTimeout(() => {
      this.apollo.isFiring = false;
      if (hit) {
        this.apollo.score += 250;
        this.sound.playSignalBlip();
        this._updateHUDStats(true);
      }
    }, 1800);
  }

  _renderApollo(ctx) {
    // 1. Lunar disc on the right
    const mx = this.width * 0.65;
    const my = this.height * 0.5;
    const moonRadius = Math.min(this.width, this.height) * 0.38;

    // Atmospheric shimmer background
    ctx.fillStyle = '#050D18';
    ctx.fillRect(0, 0, this.width, this.height);

    // Starfield specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * this.width;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * this.height;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    // Moon body
    const grad = ctx.createRadialGradient(mx - moonRadius * 0.3, my - moonRadius * 0.3, 10, mx, my, moonRadius);
    grad.addColorStop(0, '#E2E8F0');
    grad.addColorStop(0.7, '#94A3B8');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mx, my, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lunar Maria (Dark basalt basins)
    ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
    // Mare Tranquillitatis
    ctx.beginPath();
    ctx.arc(this.apollo.targetX, this.apollo.targetY, 45, 0, Math.PI * 2);
    ctx.fill();

    // Mare Imbrium
    ctx.beginPath();
    ctx.arc(mx - 60, my - 50, 65, 0, Math.PI * 2);
    ctx.fill();

    // Tranquility Base Target Beacon
    const targetX = this.apollo.targetX;
    const targetY = this.apollo.targetY;

    // Beacon ring
    ctx.strokeStyle = '#00D9F5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(targetX, targetY, this.apollo.targetRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#00D9F5';
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillText('APOLLO 11 REFLECTOR', targetX - 55, targetY - 35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('0.67408° N, 23.47297° E', targetX - 60, targetY - 22);

    // 2. Earth Observatory Laser Turret on Left
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, this.height - 90, 110, 90);
    ctx.fillStyle = '#00D9F5';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText('APACHE POINT TELESCOPE', 15, this.height - 20);

    // 3. Laser Beam when firing
    if (this.apollo.isFiring) {
      const elapsed = performance.now() - this.apollo.fireTime;
      const progress = Math.min(1, elapsed / 1800);

      const startX = 60;
      const startY = this.height - 50;
      const endX = this.apollo.crosshairX;
      const endY = this.apollo.crosshairY;

      ctx.save();
      ctx.strokeStyle = '#00D9F5';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00D9F5';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      if (progress < 0.5) {
        const p = progress * 2;
        ctx.lineTo(startX + (endX - startX) * p, startY + (endY - startY) * p);
      } else {
        ctx.lineTo(endX, endY);
        // Returning reflected packet
        const rp = (progress - 0.5) * 2;
        ctx.strokeStyle = '#A78BFA';
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + (startX - endX) * rp, endY + (startY - endY) * rp);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Player Crosshairs
    const cx = this.apollo.crosshairX;
    const cy = this.apollo.crosshairY;

    // Check lock
    const distToTarget = Math.sqrt((cx - targetX) ** 2 + (cy - targetY) ** 2);
    this.apollo.isLocked = distToTarget < this.apollo.targetRadius;

    ctx.save();
    ctx.strokeStyle = this.apollo.isLocked ? '#10B981' : '#00D9F5';
    ctx.lineWidth = 1.5;

    // Reticle circle
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy); ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy - 8);
    ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 30);
    ctx.stroke();

    // Lock Indicator Text
    ctx.fillStyle = this.apollo.isLocked ? '#10B981' : '#00D9F5';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText(this.apollo.isLocked ? '[ TARGET LOCKED: 99.8% ]' : '[ SEARCHING LUNAR BEACON ]', cx - 65, cy + 40);
    ctx.restore();
  }

  /* ═══════════════════════════════════════════
     MISSION 2: INGENUITY 1% MARS FLIGHT SIMULATOR
     ═══════════════════════════════════════════ */
  _renderIngenuity(ctx) {
    const ig = this.ingenuity;

    // Mars surface background (Red Ochre landscape + Butterscotch Sky)
    ctx.fillStyle = '#220D08';
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant Martian crater rim mountains
    ctx.fillStyle = '#42170E';
    ctx.beginPath();
    ctx.moveTo(0, this.height - 130);
    ctx.lineTo(this.width * 0.3, this.height - 180);
    ctx.lineTo(this.width * 0.6, this.height - 140);
    ctx.lineTo(this.width, this.height - 170);
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.fill();

    // Foreground sand dunes & rocks
    ctx.fillStyle = '#6E2514';
    ctx.fillRect(0, this.height - 60, this.width, 60);

    // Wright Brothers Field landing pad
    ctx.strokeStyle = '#00D9F5';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.width * 0.15, this.height - 58, 70, 4);

    // Target Reconnaissance Area (Rover Tracks)
    ctx.strokeStyle = '#A78BFA';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(this.width * 0.7, this.height - 58, 90, 4);
    ctx.setLineDash([]);
    ctx.fillStyle = '#A78BFA';
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillText('AERIAL SURVEY ZONE', this.width * 0.7, this.height - 70);

    // ── PHYSICS ENGINE (1% Mars Atmosphere + 0.38g gravity) ──
    const marsGravity = 0.18; // Low gravity
    const airDensity = 0.012; // 1% atmosphere (kg/m3)

    if (ig.isThrottling) {
      ig.targetRPM = 2500; // Counter-rotating blade speed
      ig.battery = Math.max(0, ig.battery - 0.04);
    } else {
      ig.targetRPM = 0;
    }

    ig.rotorRPM += (ig.targetRPM - ig.rotorRPM) * 0.08;

    // Lift formula based on RPM and thin atmosphere
    const lift = (ig.rotorRPM / 2400) ** 2 * airDensity * 32;

    ig.vy += marsGravity - lift;
    ig.y += ig.vy;

    // Horizontal steering
    if (ig.moveLeft) ig.vx -= 0.15;
    if (ig.moveRight) ig.vx += 0.15;
    ig.vx *= 0.95; // drag
    ig.x += ig.vx;

    // Ground collision
    const groundY = this.height - 85;
    if (ig.y >= groundY) {
      ig.y = groundY;
      if (ig.vy > 2.8) {
        ig.crashed = true;
      }
      ig.vy = 0;
    }

    // Altitude calculation
    ig.altitude = Math.max(0, ((groundY - ig.y) / 25)).toFixed(1);

    // Survey Photo Trigger
    if (ig.x > this.width * 0.7 && ig.altitude >= 3.0 && !ig.photoTaken) {
      ig.photoTaken = true;
      this.sound.playSignalBlip();
    }

    // ── DRAW INGENUITY HELICOPTER ──
    ctx.save();
    ctx.translate(ig.x, ig.y);

    // Tilt angle based on velocity
    ctx.rotate(ig.vx * 0.05);

    // 1. Carbon-fiber landing legs (4 struts)
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 18); ctx.lineTo(-6, 4);
    ctx.moveTo(16, 18); ctx.lineTo(6, 4);
    ctx.stroke();

    // 2. Gold fuselage box (avionics & sensor payload)
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(-10, -4, 20, 14);

    // Solar panel top plate
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(-14, -8, 28, 3);

    // 3. Counter-rotating carbon blades (animated with RPM)
    const bladeOffset = Math.sin(this.time * (ig.rotorRPM / 60)) * 28;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2.5;

    // Upper Rotor
    ctx.beginPath();
    ctx.moveTo(-bladeOffset, -14);
    ctx.lineTo(bladeOffset, -14);
    ctx.stroke();

    // Lower Rotor
    ctx.beginPath();
    ctx.moveTo(bladeOffset * 0.9, -11);
    ctx.lineTo(-bladeOffset * 0.9, -11);
    ctx.stroke();

    ctx.restore();

    // Flight Telemetry HUD
    ctx.fillStyle = '#00D9F5';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText(`ROTOR SPEED: ${Math.round(ig.rotorRPM)} RPM`, 20, 30);
    ctx.fillText(`RADAR ALTITUDE: ${ig.altitude} M`, 20, 48);
    ctx.fillText(`BATTERY VOLTAGE: ${Math.round(ig.battery)}%`, 20, 66);
    ctx.fillText(ig.photoTaken ? 'RECON PHOTO: CAPTURED (100%)' : 'RECON PHOTO: PENDING TARGET', 20, 84);
  }

  /* ═══════════════════════════════════════════
     MISSION 3: VOYAGER 1 SIGNAL INTERCEPT
     ═══════════════════════════════════════════ */
  _renderVoyager(ctx) {
    // Deep interstellar void background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, this.width, this.height);

    // Goldstone 70-meter dish silhouette on Earth
    ctx.strokeStyle = 'rgba(0, 217, 245, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, this.width - 40, this.height - 40);

    // Oscilloscope Grid Lines
    ctx.strokeStyle = 'rgba(0, 217, 245, 0.1)';
    for (let x = 40; x < this.width - 40; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, this.height - 40); ctx.stroke();
    }
    for (let y = 40; y < this.height - 40; y += 40) {
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(this.width - 40, y); ctx.stroke();
    }

    // Oscilloscope Radio Waveform
    const diff = Math.abs(this.voyager.frequency - this.voyager.targetFreq);
    const isLocked = diff < 0.005;
    this.voyager.isLocked = isLocked;

    ctx.save();
    ctx.strokeStyle = isLocked ? '#10B981' : '#00D9F5';
    ctx.lineWidth = isLocked ? 2.5 : 1.5;
    ctx.shadowColor = isLocked ? '#10B981' : '#00D9F5';
    ctx.shadowBlur = isLocked ? 15 : 6;

    ctx.beginPath();
    const cy = this.height / 2;
    for (let x = 40; x < this.width - 40; x += 3) {
      // Noise decreases as player tunes closer to 8.419 GHz
      const noise = (Math.random() - 0.5) * (diff * 220);
      const wave = Math.sin(x * 0.04 + this.time * 6) * (isLocked ? 40 : 15);
      ctx.lineTo(x, cy + wave + noise);
    }
    ctx.stroke();
    ctx.restore();

    // Interstellar Telemetry Readout
    ctx.fillStyle = isLocked ? '#10B981' : '#00D9F5';
    ctx.font = '11px "Space Mono", monospace';
    ctx.fillText(`RECEIVER: GOLDSTONE DSN-14 (70M ANTENNA)`, 50, 60);
    ctx.fillText(`CURRENT FREQUENCY: ${this.voyager.frequency.toFixed(3)} GHz`, 50, 80);
    ctx.fillText(`TARGET CARRIER: ${this.voyager.targetFreq.toFixed(3)} GHz (X-BAND)`, 50, 100);
    ctx.fillText(`SIGNAL STRENGTH: ${isLocked ? '-158 dBm (CARRIER LOCKED)' : '-172 dBm (SEARCHING VOID)'}`, 50, 120);

    if (isLocked) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '13px "Outfit", sans-serif';
      ctx.fillText('TRANSMISSION DECODED // VOYAGER 1 GOLDEN RECORD AUDIO PACKET ACTIVE', 50, this.height - 60);
    }
  }

  _loop() {
    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.activeMission === 'apollo') {
      this._renderApollo(this.ctx);
    } else if (this.activeMission === 'ingenuity') {
      this._renderIngenuity(this.ctx);
    } else if (this.activeMission === 'voyager') {
      this._renderVoyager(this.ctx);
    }

    this.animId = requestAnimationFrame(this._loop);
  }

  _updateHUDStats(pointAwarded = false) {
    const scoreVal = document.getElementById('gameScore');
    const missionTitle = document.getElementById('gameMissionTitle');
    const missionGoal = document.getElementById('gameMissionGoal');
    const primaryBtn = document.getElementById('gameActionBtn');

    if (this.activeMission === 'apollo') {
      if (missionTitle) missionTitle.textContent = 'MISSION 01: APOLLO 11 LUNAR LASER LOCK';
      if (missionGoal) missionGoal.textContent = 'Aim crosshairs over Tranquility Base and fire photon beam';
      if (primaryBtn) primaryBtn.innerHTML = '<span>FIRE LASER PULSE</span>';
      if (scoreVal) scoreVal.textContent = `${this.apollo.score} PTS`;
    } else if (this.activeMission === 'ingenuity') {
      if (missionTitle) missionTitle.textContent = 'MISSION 05: INGENUITY 1% ATMOSPHERE FLIGHT';
      if (missionGoal) missionGoal.textContent = 'Hold Throttle to reach 3m altitude, glide to Recon Zone & photograph';
      if (primaryBtn) primaryBtn.innerHTML = '<span>HOLD THROTTLE LIFT</span>';
      if (scoreVal) scoreVal.textContent = this.ingenuity.photoTaken ? '100% SUCCESS' : 'IN FLIGHT';
    } else if (this.activeMission === 'voyager') {
      if (missionTitle) missionTitle.textContent = 'MISSION 06: VOYAGER 1 INTERSTELLAR UPLINK';
      if (missionGoal) missionGoal.textContent = 'Tune DSN antenna receiver to 8.419 GHz to lock onto Golden Record';
      if (primaryBtn) primaryBtn.innerHTML = '<span>TUNE FREQUENCY +0.01</span>';
      if (scoreVal) scoreVal.textContent = this.voyager.isLocked ? 'SIGNAL DECODED' : 'SEARCHING';
    }
  }

  handlePrimaryAction() {
    if (this.activeMission === 'apollo') {
      this.fireApolloLaser();
    } else if (this.activeMission === 'ingenuity') {
      this.ingenuity.isThrottling = true;
      setTimeout(() => { this.ingenuity.isThrottling = false; }, 600);
    } else if (this.activeMission === 'voyager') {
      this.voyager.frequency += 0.015;
      if (this.voyager.frequency > 8.440) this.voyager.frequency = 8.350;
      this.sound.playSignalBlip();
      this._updateHUDStats();
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this._resize);
  }
}

