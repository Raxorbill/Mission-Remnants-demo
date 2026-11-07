import * as THREE from 'three';

function createFBM(seed = 42) {
  const p = new Uint8Array(512);
  let s = seed;
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }
  function grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) !== 0 ? -u : u) + ((h & 2) !== 0 ? -2.0 * v : 2.0 * v);
  }

  function noise2D(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    const x1 = lerp(u, grad(aa, xf, yf), grad(ba, xf - 1, yf));
    const x2 = lerp(u, grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1));
    return (lerp(v, x1, x2) + 1) * 0.5;
  }

  return function fbm(x: number, y: number, octaves = 5) {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let max = 0;
    for (let i = 0; i < octaves; i++) {
      val += noise2D(x * freq, y * freq) * amp;
      max += amp;
      freq *= 2.05;
      amp *= 0.5;
    }
    return val / max;
  };
}

let cachedFoilTex: THREE.CanvasTexture | null = null;
let cachedFoilNormal: THREE.CanvasTexture | null = null;
let cachedPanelNormal: THREE.CanvasTexture | null = null;
let cachedBetaClothTex: THREE.CanvasTexture | null = null;
let cachedSolarTex: THREE.CanvasTexture | null = null;

/**
 * Multi-layer Kapton gold thermal blanket (MLI) with amber/copper/gold variation,
 * stitched thermal seams, and diamond crinkle facets.
 */
export function generateFoilTexture(): THREE.CanvasTexture {
  if (cachedFoilTex) return cachedFoilTex;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const fbm = createFBM(901);
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;

      // Crinkle ridge folding (ridged multifractal)
      const n1 = Math.abs(fbm(nx * 14, ny * 14, 4) - 0.5) * 2.0;
      const n2 = Math.abs(fbm(nx * 34 + 3.1, ny * 34 + 1.7, 3) - 0.5) * 2.0;
      const facet = Math.pow(1.0 - (n1 * 0.65 + n2 * 0.35), 1.6);

      // Rich Kapton polyimide amber-gold palette (from deep copper-gold to bright specular gold)
      const r = Math.min(255, Math.floor(175 + facet * 78));
      const g = Math.min(255, Math.floor(112 + facet * 92));
      const b = Math.min(255, Math.floor(18 + facet * 44));

      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Add subtle Kapton tape seams and thermal blanket quilting lines
  ctx.strokeStyle = 'rgba(110, 62, 8, 0.45)';
  ctx.lineWidth = 2;
  for (let i = 64; i < size; i += 128) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedFoilTex = texture;
  return texture;
}

/**
 * Tangent-space normal map for crinkled Kapton MLI foil so light scatters
 * across sharp angular micro-facets like real Apollo/Viking/Rover blankets.
 */
export function generateFoilNormalMap(): THREE.CanvasTexture {
  if (cachedFoilNormal) return cachedFoilNormal;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const fbm = createFBM(901);

  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;
      // Sharp origami-like creases
      const ridge1 = 1.0 - Math.abs(fbm(nx * 16, ny * 16, 4) - 0.5) * 2.0;
      const ridge2 = 1.0 - Math.abs(fbm(nx * 38 + 5.2, ny * 38 + 2.4, 3) - 0.5) * 2.0;
      heights[y * size + x] = ridge1 * 0.65 + ridge2 * 0.35;
    }
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 6.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const yPrev = (y - 1 + size) % size;
      const yNext = (y + 1) % size;

      const dX = (heights[y * size + xNext] - heights[y * size + xPrev]) * strength;
      const dY = (heights[yNext * size + x] - heights[yPrev * size + x]) * strength;
      const dZ = 1.0;
      const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor(((dX / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor(((dY / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(((dZ / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  cachedFoilNormal = texture;
  return texture;
}

/**
 * Machined aerospace aluminum/titanium panel normal map with recessed panel seams,
 * fastener rivets, and brushed grain so metal parts look engineered, not plastic.
 */
export function generatePanelNormalMap(): THREE.CanvasTexture {
  if (cachedPanelNormal) return cachedPanelNormal;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const heights = new Float32Array(size * size);
  heights.fill(0.5);

  // Panel grid grooves
  const step = 128;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = x % step;
      const gy = y % step;
      let h = 0.5 + (Math.sin(y * 1.4) * 0.015); // fine brushed machining marks
      if (gx < 3 || gx > step - 3 || gy < 3 || gy > step - 3) {
        h -= 0.35; // recessed panel seam
      } else {
        // Corner/edge rivets along panel perimeter
        const rx = gx < 16 ? 10 : gx > step - 16 ? step - 10 : -1;
        const ry = gy < 16 ? 10 : gy > step - 16 ? step - 10 : -1;
        if (rx !== -1 && ry !== -1) {
          const dist = Math.hypot(gx - rx, gy - ry);
          if (dist < 3.2) h += 0.28 * (1 - dist / 3.2);
        }
      }
      heights[y * size + x] = h;
    }
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 4.0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const yPrev = (y - 1 + size) % size;
      const yNext = (y + 1) % size;

      const dX = (heights[y * size + xNext] - heights[y * size + xPrev]) * strength;
      const dY = (heights[yNext * size + x] - heights[yPrev * size + x]) * strength;
      const dZ = 1.0;
      const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor(((dX / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor(((dY / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(((dZ / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  cachedPanelNormal = texture;
  return texture;
}

/**
 * Woven Beta-cloth / Dacron thermal blanket texture for Viking, Voyager, and PSE blankets.
 */
export function generateBetaClothTexture(): THREE.CanvasTexture {
  if (cachedBetaClothTex) return cachedBetaClothTex;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d8d9de';
  ctx.fillRect(0, 0, size, size);

  // Subtle fiberglass weave + stitched quilting
  ctx.fillStyle = 'rgba(160, 165, 175, 0.28)';
  for (let y = 0; y < size; y += 4) {
    for (let x = (y % 8 === 0 ? 0 : 2); x < size; x += 4) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.strokeStyle = 'rgba(120, 125, 135, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  for (let i = 64; i < size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedBetaClothTex = texture;
  return texture;
}

/**
 * High-detail triple-junction Gallium Arsenide solar cell array texture
 * with silver busbars, deep sapphire-blue anti-reflective silicon wafers, and micro-grid lines.
 */
export function generateSolarTexture(): THREE.CanvasTexture {
  if (cachedSolarTex) return cachedSolarTex;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep iridescent photovoltaic wafer base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#07142c');
  grad.addColorStop(0.5, '#0c224a');
  grad.addColorStop(1, '#061126');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Individual solar cell wafers with chamfered corners
  const cols = 8;
  const rows = 16;
  const cw = 512 / cols;
  const ch = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * ch;

      // Slight cell-to-cell reflectance variation
      const shade = ((r * 7 + c * 13) % 5) * 3;
      ctx.fillStyle = `rgb(${10 + shade}, ${28 + shade * 1.5}, ${62 + shade * 2})`;
      ctx.fillRect(x + 2, y + 1.5, cw - 4, ch - 3);

      // Fine silver collector fingers
      ctx.strokeStyle = 'rgba(180, 210, 245, 0.22)';
      ctx.lineWidth = 0.75;
      for (let fy = y + 6; fy < y + ch - 3; fy += 5) {
        ctx.beginPath();
        ctx.moveTo(x + 3, fy);
        ctx.lineTo(x + cw - 3, fy);
        ctx.stroke();
      }

      // Main silver interconnect busbars
      ctx.strokeStyle = 'rgba(215, 228, 245, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x + cw * 0.28, y + 1.5);
      ctx.lineTo(x + cw * 0.28, y + ch - 1.5);
      ctx.moveTo(x + cw * 0.72, y + 1.5);
      ctx.lineTo(x + cw * 0.72, y + ch - 1.5);
      ctx.stroke();
    }
  }

  // Dark kapton substrate grid gaps
  ctx.strokeStyle = '#04070f';
  ctx.lineWidth = 3;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cw, 0);
    ctx.lineTo(c * cw, 512);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * ch);
    ctx.lineTo(512, r * ch);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedSolarTex = texture;
  return texture;
}

/**
 * Generates high-resolution, scientifically grounded planetary regolith textures
 * and tangent-space normal maps using multi-octave FBM, multi-scale impact craters
 * with raised ejecta rims, basaltic/iron-oxide strata, and micro-regolith grain.
 */
export function generatePlanetMaps(type: 'moon' | 'mars') {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const colorCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const normalCtx = normalCanvas.getContext('2d')!;

  const fbm = createFBM(type === 'moon' ? 1969 : 1976);
  const fbmDetail = createFBM(type === 'moon' ? 1972 : 2004);

  const heightField = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const ny = y / size;

      const macro = fbm(nx * 5, ny * 5, 5);
      const meso = fbmDetail(nx * 22, ny * 22, 4) * 0.28;
      const micro = fbmDetail(nx * 90, ny * 90, 2) * 0.08;

      let windRipples = 0;
      if (type === 'mars') {
        const warp = fbm(nx * 8, ny * 8, 3) * 0.35;
        windRipples = Math.sin((nx + warp) * 140) * 0.035;
      }

      heightField[y * size + x] = Math.max(0, Math.min(1, macro * 0.68 + meso + micro + windRipples));
    }
  }

  let cSeed = type === 'moon' ? 11011 : 75321;
  const rand = () => {
    cSeed = (cSeed * 16807) % 2147483647;
    return (cSeed - 1) / 2147483646;
  };

  const craterCount = type === 'moon' ? 210 : 95;
  for (let c = 0; c < craterCount; c++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const sizeRoll = Math.pow(rand(), 2.8);
    const r = (type === 'moon' ? 6 : 5) + sizeRoll * (type === 'moon' ? 82 : 55);
    const depth = (type === 'moon' ? 0.28 : 0.16) * (0.4 + sizeRoll * 0.6);

    const minX = Math.max(0, Math.floor(cx - r * 1.6));
    const maxX = Math.min(size - 1, Math.ceil(cx + r * 1.6));
    const minY = Math.max(0, Math.floor(cy - r * 1.6));
    const maxY = Math.min(size - 1, Math.ceil(cy + r * 1.6));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) / r;
        if (d < 1.55) {
          const idx = y * size + x;
          let delta = 0;
          if (d < 0.85) {
            const normD = d / 0.85;
            delta = -depth * (1 - normD * normD);
            if (r > 42 && d < 0.22) {
              delta += depth * 0.45 * (1 - d / 0.22);
            }
          } else if (d < 1.15) {
            const rimPhase = (d - 0.85) / 0.3;
            delta = depth * 0.42 * Math.sin(rimPhase * Math.PI);
          } else {
            const ejectaPhase = (d - 1.15) / 0.4;
            delta = depth * 0.08 * (1 - ejectaPhase);
          }
          heightField[idx] = Math.max(0.02, Math.min(0.98, heightField[idx] + delta));
        }
      }
    }
  }

  const colorImg = colorCtx.createImageData(size, size);
  const bumpImg = bumpCtx.createImageData(size, size);
  const normalImg = normalCtx.createImageData(size, size);

  const cData = colorImg.data;
  const bData = bumpImg.data;
  const nData = normalImg.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const pIdx = idx * 4;
      const h = heightField[idx];
      const grain = (fbmDetail((x / size) * 160, (y / size) * 160, 2) - 0.5) * 18;

      const bVal = Math.floor(h * 255);
      bData[pIdx] = bVal;
      bData[pIdx + 1] = bVal;
      bData[pIdx + 2] = bVal;
      bData[pIdx + 3] = 255;

      if (type === 'moon') {
        const base = 76 + h * 105 + grain;
        const v = Math.max(24, Math.min(230, base));
        cData[pIdx] = v;
        cData[pIdx + 1] = v * 0.99;
        cData[pIdx + 2] = v * 0.96;
        cData[pIdx + 3] = 255;
      } else {
        const mineral = fbm((x / size) * 12 + 3.1, (y / size) * 12 + 7.4, 3);
        const r = Math.max(45, Math.min(235, 118 + h * 92 + mineral * 22 + grain));
        const g = Math.max(25, Math.min(175, 54 + h * 58 + mineral * 10 + grain * 0.7));
        const b = Math.max(15, Math.min(130, 32 + h * 36 + grain * 0.5));
        cData[pIdx] = r;
        cData[pIdx + 1] = g;
        cData[pIdx + 2] = b;
        cData[pIdx + 3] = 255;
      }

      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;
      const yPrev = (y - 1 + size) % size;
      const yNext = (y + 1) % size;

      const strength = type === 'moon' ? 5.5 : 4.2;
      const dX = (heightField[y * size + xNext] - heightField[y * size + xPrev]) * strength;
      const dY = (heightField[yNext * size + x] - heightField[yPrev * size + x]) * strength;
      const dZ = 1.0;
      const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ);

      nData[pIdx] = Math.floor(((dX / len) * 0.5 + 0.5) * 255);
      nData[pIdx + 1] = Math.floor(((dY / len) * 0.5 + 0.5) * 255);
      nData[pIdx + 2] = Math.floor(((dZ / len) * 0.5 + 0.5) * 255);
      nData[pIdx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  normalCtx.putImageData(normalImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(3, 3);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 3);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(3, 3);

  return { colorMap, bumpMap, normalMap, heightField, size };
}
