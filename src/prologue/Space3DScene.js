/**
 * Space3DScene.js — Ultra-Realistic Photorealistic Solar System Visualizer
 * 
 * Features:
 * 1. Physical Solar System: Sun (convective plasma & corona), Earth (Blue Marble, specular oceans,
 *    city lights, independently rotating cloud systems, Rayleigh atmospheric blue halo),
 *    Moon (cratered regolith, basalt maria, Apollo 11 retro-reflector array), Mars, Saturn & Rings
 * 2. Voyager 1 Interstellar Probe in deep space with high-gain antenna dish & telemetry beacon
 * 3. Interactive Organic Mouse Parallax with smooth cinematic damping
 * 4. Pulsing Earth-Moon Lunar Laser Ranging beam with traveling photon packets
 * 5. Screen-projected celestial coordinate tracking for HUD telemetry
 */

import * as THREE from 'three';
import {
  createEarthDayTexture,
  createEarthCloudsTexture,
  createEarthNightTexture,
  createMoonTexture,
  createSunTexture,
  createSunCoronaTexture,
  createMarsTexture,
  createSaturnTexture,
  createSaturnRingsTexture,
  createAtmosphereShaderMaterial
} from './PlanetTextures.js';

export class Space3DScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();

    // Solar system celestial bodies
    this.sunGroup = null;
    this.earthGroup = null;
    this.earthMesh = null;
    this.earthClouds = null;
    this.moonGroup = null;
    this.moonMesh = null;
    this.apolloReflector = null;
    this.marsGroup = null;
    this.saturnGroup = null;
    this.saturnRings = null;
    this.voyagerGroup = null;
    this.laserBeam = null;
    this.laserPhotons = [];
    this.starfield = null;
    this.milkyWay = null;
    this.orbitLines = [];

    // Scroll progress & Mouse Parallax
    this.scrollProgress = 0;
    this.targetProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this._init();
  }

  _init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07111F, 0.00075);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 3000);
    this.camera.position.set(0, 30, 220);

    // Build the cosmos & solar system
    this._createCosmicEnvironment();
    this._createSun();
    this._createEarthSystem();
    this._createMars();
    this._createSaturn();
    this._createVoyagerProbe();
    this._createOrbits();
    this._createLaserRangingBeam();

    this._bindEvents();

    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  _bindEvents() {
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    // Subtle cinematic mouse parallax
    this._onMouseMove = (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
  }

  _onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ── 1. COSMIC ENVIRONMENT & MILKY WAY ── */
  _createCosmicEnvironment() {
    const count = 3800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colors = [
      new THREE.Color(0xFFFFFF),
      new THREE.Color(0x99CCFF),
      new THREE.Color(0xFFEEAA),
      new THREE.Color(0xFFCC88),
      new THREE.Color(0x00D9F5)
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = 250 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const c = colors[Math.floor(Math.random() * colors.length)];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);

    // Milky Way galactic dust band
    const mwCount = 1800;
    const mwGeo = new THREE.BufferGeometry();
    const mwPos = new Float32Array(mwCount * 3);
    const mwCol = new Float32Array(mwCount * 3);

    const cIndigo = new THREE.Color(0x6366F1);
    const cViolet = new THREE.Color(0xA78BFA);
    const cCyan = new THREE.Color(0x00D9F5);

    for (let i = 0; i < mwCount; i++) {
      const i3 = i * 3;
      const angle = (Math.random() - 0.5) * Math.PI * 1.8;
      const dist = 400 + Math.random() * 700;
      const spread = (Math.random() - 0.5) * 120;

      mwPos[i3] = Math.cos(angle) * dist + spread;
      mwPos[i3 + 1] = Math.sin(angle) * dist * 0.4 + (Math.random() - 0.5) * 80;
      mwPos[i3 + 2] = -300 + (Math.random() - 0.5) * 400;

      const mix = Math.random();
      const colSel = mix < 0.5 ? cIndigo.clone().lerp(cViolet, mix * 2) : cViolet.clone().lerp(cCyan, (mix - 0.5) * 2);

      mwCol[i3] = colSel.r;
      mwCol[i3 + 1] = colSel.g;
      mwCol[i3 + 2] = colSel.b;
    }

    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwCol, 3));

    const mwMat = new THREE.PointsMaterial({
      size: 4.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.milkyWay = new THREE.Points(mwGeo, mwMat);
    this.scene.add(this.milkyWay);
  }

  /* ── 2. THE SUN (Convective Plasma & Corona) ── */
  _createSun() {
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(240, 75, -420);

    const sunGeo = new THREE.SphereGeometry(32, 64, 64);
    const sunTex = createSunTexture();
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      color: 0xFFE082
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunGroup.add(sunMesh);

    // Corona Sprite Layers
    const coronaTex = createSunCoronaTexture();
    const coronaMat1 = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xFF9800,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85
    });
    const coronaSprite1 = new THREE.Sprite(coronaMat1);
    coronaSprite1.scale.set(130, 130, 1);
    this.sunGroup.add(coronaSprite1);

    const coronaMat2 = new THREE.SpriteMaterial({
      map: coronaTex,
      color: 0xFFD54F,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5
    });
    const coronaSprite2 = new THREE.Sprite(coronaMat2);
    coronaSprite2.scale.set(200, 200, 1);
    this.sunGroup.add(coronaSprite2);

    // Sunlight source
    const sunLight = new THREE.PointLight(0xFFF8E7, 3.4, 2500, 0.4);
    this.sunGroup.add(sunLight);

    const sunDirLight = new THREE.DirectionalLight(0xFFF4D6, 1.8);
    sunDirLight.position.copy(this.sunGroup.position);
    sunDirLight.target.position.set(0, 0, 0);
    this.scene.add(sunDirLight);
    this.scene.add(sunDirLight.target);

    // Subtle cosmic ambient fill so planetary unlit sides (especially Moon) aren't pitch black
    const ambLight = new THREE.AmbientLight(0x28384E, 1.1);
    this.scene.add(ambLight);

    // Dedicated soft Earthshine fill light directed at the Moon
    const earthshineLight = new THREE.DirectionalLight(0x406085, 0.9);
    earthshineLight.position.set(0, 0, 0);
    earthshineLight.target.position.set(72, 12, 45);
    this.scene.add(earthshineLight);
    this.scene.add(earthshineLight.target);

    this.scene.add(this.sunGroup);
  }

  /* ── 3. EARTH & MOON SYSTEM ── */
  _createEarthSystem() {
    this.earthGroup = new THREE.Group();
    this.earthGroup.position.set(0, 0, 0);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(18, 64, 64);
    const earthDayTex = createEarthDayTexture();
    const earthNightTex = createEarthNightTexture();

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayTex,
      roughness: 0.38,
      metalness: 0.08,
      emissiveMap: earthNightTex,
      emissive: new THREE.Color(0xFFEAA7),
      emissiveIntensity: 0.45
    });

    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.rotation.z = THREE.MathUtils.degToRad(23.5);
    this.earthGroup.add(this.earthMesh);

    // Earth Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(18.35, 64, 64);
    const cloudTex = createEarthCloudsTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.88,
      blending: THREE.NormalBlending,
      roughness: 0.9,
      depthWrite: false
    });
    this.earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthClouds.rotation.z = THREE.MathUtils.degToRad(23.5);
    this.earthGroup.add(this.earthClouds);

    // Earth Atmosphere Rayleigh Glow Halo
    const atmoGeo = new THREE.SphereGeometry(20.4, 64, 64);
    const atmoMat = createAtmosphereShaderMaterial();
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    this.earthGroup.add(atmoMesh);

    // ── THE MOON ──
    this.moonGroup = new THREE.Group();
    this.moonGroup.position.set(72, 12, 45);

    const moonGeo = new THREE.SphereGeometry(4.85, 48, 48);
    const moonTex = createMoonTexture();
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.88,
      metalness: 0.05
    });

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.rotation.y = Math.PI * 0.95;
    this.moonGroup.add(this.moonMesh);

    // Apollo 11 Lunar Laser Retro-Reflector Array on Tranquility Base
    const reflectorGroup = new THREE.Group();
    reflectorGroup.position.set(-3.2, 0.4, 3.5);

    const panelGeo = new THREE.BoxGeometry(0.85, 0.85, 0.16);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xDAA520,
      metalness: 0.92,
      roughness: 0.18
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    reflectorGroup.add(panel);

    const prismGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const prismMat = new THREE.MeshBasicMaterial({
      color: 0x00D9F5,
      wireframe: true
    });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.z = 0.09;
    reflectorGroup.add(prism);

    const ringGeo = new THREE.RingGeometry(0.9, 1.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00D9F5,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    reflectorGroup.add(ring);

    this.apolloReflector = reflectorGroup;
    this.moonGroup.add(reflectorGroup);

    this.scene.add(this.earthGroup);
    this.scene.add(this.moonGroup);
  }

  /* ── 4. MARS (Red Planet) ── */
  _createMars() {
    this.marsGroup = new THREE.Group();
    this.marsGroup.position.set(-145, 32, -110);

    const marsGeo = new THREE.SphereGeometry(9.6, 48, 48);
    const marsTex = createMarsTexture();
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.9,
      metalness: 0.05
    });

    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsMesh.rotation.z = THREE.MathUtils.degToRad(25.2);
    this.marsGroup.add(marsMesh);

    const marsAtmoGeo = new THREE.SphereGeometry(10.2, 32, 32);
    const marsAtmoMat = new THREE.MeshBasicMaterial({
      color: 0xC1440E,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    this.marsGroup.add(new THREE.Mesh(marsAtmoGeo, marsAtmoMat));

    this.scene.add(this.marsGroup);
  }

  /* ── 5. SATURN WITH REALISTIC RINGS ── */
  _createSaturn() {
    this.saturnGroup = new THREE.Group();
    this.saturnGroup.position.set(195, -35, -240);

    const satGeo = new THREE.SphereGeometry(14, 48, 48);
    const satTex = createSaturnTexture();
    const satMat = new THREE.MeshStandardMaterial({
      map: satTex,
      roughness: 0.8,
      metalness: 0.0
    });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    this.saturnGroup.add(satMesh);

    const ringGeo = new THREE.RingGeometry(18, 38, 96);
    const ringTex = createSaturnRingsTexture();
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - 18) / (38 - 18);
      uv.setXY(i, u, 0.5);
    }
    ringGeo.attributes.uv.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.6,
      opacity: 0.95
    });

    this.saturnRings = new THREE.Mesh(ringGeo, ringMat);
    this.saturnRings.rotation.x = Math.PI / 2 + THREE.MathUtils.degToRad(26.7);
    this.saturnRings.rotation.y = THREE.MathUtils.degToRad(12);
    this.saturnGroup.add(this.saturnRings);

    this.scene.add(this.saturnGroup);
  }

  /* ── 6. VOYAGER 1 INTERSTELLAR PROBE (Chapter 6 Remnant) ── */
  _createVoyagerProbe() {
    this.voyagerGroup = new THREE.Group();
    this.voyagerGroup.position.set(-175, 68, -165);

    // 1. High-Gain Parabolic Reflector Dish (3.7m diameter antenna)
    const dishGeo = new THREE.CylinderGeometry(4.2, 0.4, 1.2, 32, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xEAEAEA,
      roughness: 0.4,
      metalness: 0.3,
      side: THREE.DoubleSide
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI / 2;
    this.voyagerGroup.add(dish);

    // Central sub-reflector feed horn
    const feedGeo = new THREE.ConeGeometry(0.4, 2.2, 16);
    const feedMat = new THREE.MeshBasicMaterial({ color: 0xDAA520 });
    const feed = new THREE.Mesh(feedGeo, feedMat);
    feed.rotation.x = -Math.PI / 2;
    feed.position.z = 1.3;
    this.voyagerGroup.add(feed);

    // 2. Central Decagonal Equipment Bus
    const busGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.0, 10);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xDAA520, // Gold foil thermal blanket
      metalness: 0.85,
      roughness: 0.25
    });
    const bus = new THREE.Mesh(busGeo, busMat);
    bus.position.z = -1.1;
    this.voyagerGroup.add(bus);

    // 3. Magnetometer Boom Truss extending into deep space
    const boomGeo = new THREE.CylinderGeometry(0.08, 0.08, 16, 6);
    const boomMat = new THREE.MeshBasicMaterial({ color: 0x8899AA });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.rotation.z = Math.PI / 3;
    boom.position.set(7, 3.5, -1.1);
    this.voyagerGroup.add(boom);

    // 4. Radioisotope Thermoelectric Generator (RTG)
    const rtgGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.2, 8);
    const rtgMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 });
    const rtg = new THREE.Mesh(rtgGeo, rtgMat);
    rtg.rotation.z = -Math.PI / 3;
    rtg.position.set(-3.2, -1.8, -1.1);
    this.voyagerGroup.add(rtg);

    // 5. Pulsing Telemetry Carrier Beacon LED
    const beaconGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00D9F5 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0, 2.4);
    this.voyagerBeacon = beacon;
    this.voyagerGroup.add(beacon);

    this.scene.add(this.voyagerGroup);
  }

  /* ── 7. ORBITAL TRAJECTORY LINES ── */
  _createOrbits() {
    const orbits = [
      { r: 85, color: 0x00D9F5, opacity: 0.22, tilt: 0.15 },
      { r: 180, color: 0x6366F1, opacity: 0.15, tilt: 0.28 },
      { r: 310, color: 0xA78BFA, opacity: 0.12, tilt: 0.35 }
    ];

    orbits.forEach(o => {
      const curve = new THREE.EllipseCurve(0, 0, o.r, o.r * 0.92, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(120);
      const geo = new THREE.BufferGeometry().setFromPoints(
        pts.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const mat = new THREE.LineBasicMaterial({
        color: o.color,
        transparent: true,
        opacity: o.opacity
      });
      const line = new THREE.Line(geo, mat);
      line.rotation.x = Math.PI * o.tilt;
      this.orbitLines.push(line);
      this.scene.add(line);
    });
  }

  /* ── 8. EARTH-MOON LASER RANGING BEAM ── */
  _createLaserRangingBeam() {
    const earthStation = new THREE.Vector3(12, 10, 8);
    const moonReflectorPos = new THREE.Vector3(72 - 3.2, 12 + 0.4, 45 + 3.5);

    const points = [earthStation, moonReflectorPos];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x00D9F5,
      transparent: true,
      opacity: 0.65,
      linewidth: 2
    });

    this.laserBeam = new THREE.Line(geo, mat);
    this.scene.add(this.laserBeam);

    // Laser photon pulse packets
    for (let i = 0; i < 4; i++) {
      const pGeo = new THREE.SphereGeometry(0.4, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x00D9F5,
        transparent: true,
        opacity: 0.9
      });
      const photon = new THREE.Mesh(pGeo, pMat);
      photon.userData = { t: i * 0.25 };
      this.laserPhotons.push(photon);
      this.scene.add(photon);
    }
  }

  setProgress(p) {
    this.targetProgress = Math.max(0, Math.min(1, p));
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      requestAnimationFrame(this._animate);
    }
  }

  _animate() {
    if (this.isPaused) return;
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.08;
    const p = this.scrollProgress;

    // Smooth mouse parallax damping
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // ── CELESTIAL ROTATIONS ──
    if (this.earthMesh) {
      this.earthMesh.rotation.y = elapsedTime * 0.05 + p * Math.PI * 1.5;
    }
    if (this.earthClouds) {
      this.earthClouds.rotation.y = elapsedTime * 0.065 + p * Math.PI * 1.6;
    }
    if (this.moonMesh) {
      this.moonMesh.rotation.y = elapsedTime * 0.015 + p * 0.4;
    }
    if (this.apolloReflector) {
      const s = 1 + Math.sin(elapsedTime * 4) * 0.15;
      this.apolloReflector.scale.set(s, s, s);
    }
    if (this.marsGroup) {
      this.marsGroup.rotation.y = elapsedTime * 0.035;
    }
    if (this.saturnGroup) {
      this.saturnGroup.rotation.y = elapsedTime * 0.02;
    }
    if (this.sunGroup) {
      this.sunGroup.rotation.y = elapsedTime * 0.01;
    }
    if (this.voyagerGroup) {
      this.voyagerGroup.rotation.y = Math.sin(elapsedTime * 0.2) * 0.1;
      if (this.voyagerBeacon) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsedTime * 5);
        this.voyagerBeacon.scale.set(1 + pulse * 0.5, 1 + pulse * 0.5, 1 + pulse * 0.5);
      }
    }

    // ── LASER PHOTON TRAFFIC ──
    const earthPos = new THREE.Vector3(12, 10, 8);
    const moonPos = new THREE.Vector3(72 - 3.2, 12 + 0.4, 45 + 3.5);

    this.laserPhotons.forEach(photon => {
      photon.userData.t = (photon.userData.t + 0.008) % 1.0;
      photon.position.lerpVectors(earthPos, moonPos, photon.userData.t);
      const edgeFade = Math.sin(photon.userData.t * Math.PI);
      photon.material.opacity = edgeFade * (p > 0.45 ? 0.95 : 0.25);
    });

    if (this.laserBeam) {
      this.laserBeam.material.opacity = (0.2 + p * 0.75) * (0.8 + Math.sin(elapsedTime * 6) * 0.2);
    }

    // ── CINEMATIC 3D CAMERA PATH + SUBTLE MOUSE PARALLAX (Smooth continuous easing) ──
    // Hermite/smoothstep interpolation helper: 3*t^2 - 2*t^3
    const smooth = (x) => x * x * (3 - 2 * x);

    let camTargetPos = new THREE.Vector3();
    let lookTargetPos = new THREE.Vector3();

    // Keyframes: [progress, camX, camY, camZ, lookX, lookY, lookZ]
    const keyframes = [
      { p: 0.00, cam: [0, 48, 240], look: [0, 4, 0] },
      { p: 0.20, cam: [35, 38, 175], look: [-10, 8, -10] },
      { p: 0.40, cam: [-55, 24, 125], look: [-30, 8, -25] },
      { p: 0.60, cam: [16, 15, 52], look: [0, 0, 0] },
      { p: 0.80, cam: [58, 15, 62], look: [70, 12, 45] },
      { p: 1.00, cam: [66, 14, 54], look: [72 - 3.2, 12 + 0.4, 45 + 3.5] }
    ];

    // Find bounding keyframes
    let k0 = keyframes[0];
    let k1 = keyframes[1];
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (p >= keyframes[i].p && p <= keyframes[i + 1].p) {
        k0 = keyframes[i];
        k1 = keyframes[i + 1];
        break;
      }
    }

    const segmentT = (p - k0.p) / (k1.p - k0.p || 1);
    const easedT = smooth(Math.max(0, Math.min(1, segmentT)));

    camTargetPos.set(
      THREE.MathUtils.lerp(k0.cam[0], k1.cam[0], easedT),
      THREE.MathUtils.lerp(k0.cam[1], k1.cam[1], easedT),
      THREE.MathUtils.lerp(k0.cam[2], k1.cam[2], easedT)
    );

    lookTargetPos.set(
      THREE.MathUtils.lerp(k0.look[0], k1.look[0], easedT),
      THREE.MathUtils.lerp(k0.look[1], k1.look[1], easedT),
      THREE.MathUtils.lerp(k0.look[2], k1.look[2], easedT)
    );

    // Apply gentle mouse parallax offset
    const parallaxOffsetX = this.mouseX * (10 - p * 6);
    const parallaxOffsetY = -this.mouseY * (8 - p * 5);
    camTargetPos.x += parallaxOffsetX;
    camTargetPos.y += parallaxOffsetY;

    this.camera.position.lerp(camTargetPos, 0.065);
    
    // Smooth lookAt interpolation
    if (!this.currentLookAt) {
      this.currentLookAt = lookTargetPos.clone();
    } else {
      this.currentLookAt.lerp(lookTargetPos, 0.065);
    }
    this.camera.lookAt(this.currentLookAt);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._animate);
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
