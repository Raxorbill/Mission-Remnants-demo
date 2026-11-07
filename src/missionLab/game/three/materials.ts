import * as THREE from 'three';
import {
  generateFoilTexture,
  generateFoilNormalMap,
  generatePanelNormalMap,
  generateBetaClothTexture,
} from '../../../chapters/components/3d/SpaceTextures';

// Procedural high-fidelity planetary surface & spacecraft texture generators
function createMoonTexture(): {
  diffuse: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  // 1. Diffuse Albedo Canvas (1024x1024)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base Lunar Mare Tranquillitatis basaltic regolith tone
  ctx.fillStyle = '#626772';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. High-Frequency Bump Canvas (1024x1024) — synced with craters for true 3D crater relief
  const bCanvas = document.createElement('canvas');
  bCanvas.width = 1024;
  bCanvas.height = 1024;
  const bCtx = bCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 1024, 1024);

  // Micro-noise & multi-mineral grain variation (anorthosite plagioclase white flecks + ilmenite dark grains)
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  const bData = bCtx.getImageData(0, 0, 1024, 1024);
  const bd = bData.data;

  for (let i = 0; i < data.length; i += 4) {
    const n1 = (Math.random() - 0.5) * 42;
    const sparkle = Math.random() < 0.08 ? Math.random() * 58 - 12 : 0;
    const lum = n1 + sparkle;
    data[i] = Math.min(255, Math.max(0, data[i] + lum));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + lum));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + lum + 5));

    const bv = Math.min(255, Math.max(0, 128 + n1 * 1.4));
    bd[i] = bv;
    bd[i + 1] = bv;
    bd[i + 2] = bv;
  }
  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bData, 0, 0);

  // Bright highland impact ejecta rays & regolith albedo swirls
  for (let i = 0; i < 32; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 1024;
    const angle = Math.random() * Math.PI * 2;
    const len = 180 + Math.random() * 340;
    const rayGrad = ctx.createLinearGradient(
      cx,
      cy,
      cx + Math.cos(angle) * len,
      cy + Math.sin(angle) * len
    );
    rayGrad.addColorStop(0, 'rgba(226, 232, 242, 0.22)');
    rayGrad.addColorStop(0.45, 'rgba(185, 195, 208, 0.10)');
    rayGrad.addColorStop(1, 'rgba(98, 103, 114, 0)');

    ctx.strokeStyle = rayGrad;
    ctx.lineWidth = 14 + Math.random() * 24;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Multi-scale Lunar Impact Craters (synced in both Albedo and Bump maps!)
  for (let c = 0; c < 65; c++) {
    const cx = 60 + Math.random() * 904;
    const cy = 60 + Math.random() * 904;
    const r = 8 + Math.pow(Math.random(), 2.2) * 52;

    // Albedo crater bowl shadow & sunlit ejecta rim
    const bowlGrad = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.18, r * 0.1, cx, cy, r * 1.25);
    bowlGrad.addColorStop(0, 'rgba(34, 37, 44, 0.72)');
    bowlGrad.addColorStop(0.68, 'rgba(54, 58, 66, 0.45)');
    bowlGrad.addColorStop(0.86, 'rgba(210, 218, 230, 0.35)');
    bowlGrad.addColorStop(1, 'rgba(98, 103, 114, 0)');
    ctx.fillStyle = bowlGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // Bump height crater rim (white = raised rim, dark = depressed bowl)
    const bumpGrad = bCtx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.2);
    bumpGrad.addColorStop(0, 'rgba(28, 28, 28, 0.85)');
    bumpGrad.addColorStop(0.72, 'rgba(70, 70, 70, 0.65)');
    bumpGrad.addColorStop(0.88, 'rgba(235, 235, 235, 0.8)');
    bumpGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bCtx.fillStyle = bumpGrad;
    bCtx.beginPath();
    bCtx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
    bCtx.fill();
  }

  // Astronaut boot-print tread impressions near landing site center
  ctx.strokeStyle = 'rgba(28, 31, 38, 0.48)';
  ctx.lineWidth = 2.5;
  for (let s = -4; s <= 4; s++) {
    const bx = 512 + s * 14;
    const by = 512 + s * 20;
    ctx.strokeRect(bx - 4, by - 8, 8, 16);
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(9, 9);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(9, 9);

  // 3. Roughness Map (512x512)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 512;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.fillStyle = '#e4e4e4';
  rCtx.fillRect(0, 0, 512, 512);

  const rData = rCtx.getImageData(0, 0, 512, 512);
  const rd = rData.data;
  for (let i = 0; i < rd.length; i += 4) {
    const val = 226 + (Math.random() - 0.5) * 38;
    rd[i] = val;
    rd[i + 1] = val;
    rd[i + 2] = val;
  }
  rCtx.putImageData(rData, 0, 0);

  const roughness = new THREE.CanvasTexture(rCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(9, 9);

  return { diffuse, bump, roughness };
}

function createMarsTexture(): {
  diffuse: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Rich Martian ferric oxide regolith base (terracotta / burnt ochre)
  ctx.fillStyle = '#a84724';
  ctx.fillRect(0, 0, 1024, 1024);

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 1024;
  bCanvas.height = 1024;
  const bCtx = bCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 1024, 1024);

  // Granular mineral variation (oxidized rust dust, gray crystalline hematite spherules, dark basalt sand)
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  const bData = bCtx.getImageData(0, 0, 1024, 1024);
  const bd = bData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 54;
    const blueberry = Math.random() < 0.03 ? -28 : 0; // dark hematite spherule grit
    data[i] = Math.min(255, Math.max(0, data[i] + noise + 14 + blueberry));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.68 + blueberry * 0.7));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.28 + blueberry * 0.5));

    const bv = Math.min(255, Math.max(0, 128 + noise * 1.1));
    bd[i] = bv;
    bd[i + 1] = bv;
    bd[i + 2] = bv;
  }
  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bData, 0, 0);

  // Exposed buff-colored sulfate bedrock slabs (Meridiani / Jezero evaporite outcrops)
  for (let p = 0; p < 16; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const pr = 65 + Math.random() * 120;
    const pGrad = ctx.createRadialGradient(px, py, pr * 0.15, px, py, pr);
    pGrad.addColorStop(0, 'rgba(218, 145, 92, 0.34)');
    pGrad.addColorStop(0.6, 'rgba(186, 104, 58, 0.18)');
    pGrad.addColorStop(1, 'rgba(168, 71, 36, 0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wind-carved Transverse Aeolian Ridges (TARs) & barchan sand ripples
  for (let y = 0; y < 1024; y += 34) {
    // Dark basaltic sand trough
    ctx.strokeStyle = 'rgba(58, 20, 10, 0.48)';
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(280, y + 18, 720, y - 14, 1024, y + 8);
    ctx.stroke();

    // Sunlit butterscotch crest highlight
    ctx.strokeStyle = 'rgba(244, 158, 94, 0.36)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, y - 4);
    ctx.bezierCurveTo(280, y + 14, 720, y - 18, 1024, y + 4);
    ctx.stroke();

    // Matching 3D ridge bump crest
    bCtx.strokeStyle = 'rgba(235, 235, 235, 0.52)';
    bCtx.lineWidth = 8;
    bCtx.beginPath();
    bCtx.moveTo(0, y - 3);
    bCtx.bezierCurveTo(280, y + 15, 720, y - 17, 1024, y + 5);
    bCtx.stroke();
  }

  // Eroded Martian wind-filled craters
  for (let c = 0; c < 24; c++) {
    const cx = 60 + Math.random() * 904;
    const cy = 60 + Math.random() * 904;
    const r = 14 + Math.random() * 44;

    const cGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
    cGrad.addColorStop(0, 'rgba(68, 25, 12, 0.55)');
    cGrad.addColorStop(0.75, 'rgba(130, 50, 24, 0.35)');
    cGrad.addColorStop(0.9, 'rgba(238, 152, 92, 0.35)');
    cGrad.addColorStop(1, 'rgba(168, 71, 36, 0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(9, 9);
  diffuse.colorSpace = THREE.SRGBColorSpace;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(9, 9);

  // Mars Roughness Map
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 512;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.fillStyle = '#dcdcdc';
  rCtx.fillRect(0, 0, 512, 512);

  const rData = rCtx.getImageData(0, 0, 512, 512);
  const rd = rData.data;
  for (let i = 0; i < rd.length; i += 4) {
    const v = 212 + (Math.random() - 0.5) * 46;
    rd[i] = v;
    rd[i + 1] = v;
    rd[i + 2] = v;
  }
  rCtx.putImageData(rData, 0, 0);

  const roughness = new THREE.CanvasTexture(rCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(9, 9);

  return { diffuse, bump, roughness };
}

function createSolarPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep triple-junction gallium arsenide photovoltaic cell blue-violet sheen
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
  bgGrad.addColorStop(0, '#0a193d');
  bgGrad.addColorStop(0.5, '#11285c');
  bgGrad.addColorStop(1, '#081330');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Silver interconnect busbars
  ctx.strokeStyle = 'rgba(205, 222, 248, 0.72)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(160, 190, 235, 0.45)';
  ctx.lineWidth = 1;
  for (let y = 0; y <= 512; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class MaterialLibrary {
  public moonGround: THREE.MeshStandardMaterial;
  public marsGround: THREE.MeshStandardMaterial;
  public goldFoil: THREE.MeshStandardMaterial;
  public silverMetal: THREE.MeshStandardMaterial;
  public darkChassis: THREE.MeshStandardMaterial;
  public whiteMLI: THREE.MeshStandardMaterial;
  public solarPanel: THREE.MeshStandardMaterial;
  public carbonFiber: THREE.MeshStandardMaterial;
  public rockMaterial: THREE.MeshStandardMaterial;
  public groundRockMars: THREE.MeshStandardMaterial;
  public opticalGlass: THREE.MeshPhysicalMaterial;
  public laserBeam: THREE.MeshBasicMaterial;
  public markerRing: THREE.MeshBasicMaterial;

  constructor() {
    const moonMaps = createMoonTexture();
    const marsMaps = createMarsTexture();
    const solarTex = createSolarPanelTexture();
    const foilTex = generateFoilTexture();
    const foilNormal = generateFoilNormalMap();
    const panelNormal = generatePanelNormalMap();
    const betaClothTex = generateBetaClothTexture();

    this.moonGround = new THREE.MeshStandardMaterial({
      map: moonMaps.diffuse,
      bumpMap: moonMaps.bump,
      bumpScale: 0.34,
      roughnessMap: moonMaps.roughness,
      roughness: 0.9,
      metalness: 0.04,
    });

    this.marsGround = new THREE.MeshStandardMaterial({
      map: marsMaps.diffuse,
      bumpMap: marsMaps.bump,
      bumpScale: 0.36,
      roughnessMap: marsMaps.roughness,
      roughness: 0.86,
      metalness: 0.06,
    });

    this.goldFoil = new THREE.MeshPhysicalMaterial({
      color: 0xffcf54,
      map: foilTex,
      normalMap: foilNormal,
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughness: 0.24,
      metalness: 0.92,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
    });

    this.silverMetal = new THREE.MeshPhysicalMaterial({
      color: 0xdce2ea,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughness: 0.2,
      metalness: 0.92,
      clearcoat: 0.35,
    });

    this.darkChassis = new THREE.MeshPhysicalMaterial({
      color: 0x22262e,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.38,
      metalness: 0.78,
      clearcoat: 0.2,
    });

    this.whiteMLI = new THREE.MeshPhysicalMaterial({
      color: 0xe8eaef,
      map: betaClothTex,
      normalMap: foilNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.55,
      metalness: 0.12,
      clearcoat: 0.25,
    });

    this.solarPanel = new THREE.MeshPhysicalMaterial({
      map: solarTex,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughness: 0.14,
      metalness: 0.72,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
    });

    this.carbonFiber = new THREE.MeshPhysicalMaterial({
      color: 0x15171b,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.32, 0.32),
      roughness: 0.3,
      metalness: 0.52,
      clearcoat: 0.65,
    });

    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x727782,
      bumpMap: moonMaps.bump,
      bumpScale: 0.15,
      roughness: 0.94,
      metalness: 0.05,
    });

    this.groundRockMars = new THREE.MeshStandardMaterial({
      color: 0x7c331e,
      bumpMap: marsMaps.bump,
      bumpScale: 0.16,
      roughness: 0.92,
      metalness: 0.08,
    });

    this.opticalGlass = new THREE.MeshPhysicalMaterial({
      color: 0x8fe3ff,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.88,
      ior: 1.5,
    });

    this.laserBeam = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.85,
    });

    this.markerRing = new THREE.MeshBasicMaterial({
      color: 0x00d9f5,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
  }

  public dispose() {
    this.moonGround.map?.dispose();
    this.moonGround.bumpMap?.dispose();
    this.moonGround.roughnessMap?.dispose();
    this.moonGround.dispose();
    this.marsGround.map?.dispose();
    this.marsGround.bumpMap?.dispose();
    this.marsGround.roughnessMap?.dispose();
    this.marsGround.dispose();
    this.solarPanel.map?.dispose();
    this.solarPanel.dispose();
    this.goldFoil.dispose();
    this.silverMetal.dispose();
    this.darkChassis.dispose();
    this.whiteMLI.dispose();
    this.carbonFiber.dispose();
    this.rockMaterial.dispose();
    this.groundRockMars.dispose();
    this.opticalGlass.dispose();
    this.laserBeam.dispose();
    this.markerRing.dispose();
  }
}
