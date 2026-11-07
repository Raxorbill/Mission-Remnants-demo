/**
 * PlanetTextures.js
 * Generates photorealistic, high-resolution procedural textures for the Solar System:
 * - Earth (Day color map with realistic biomes, oceans, continents, polar caps)
 * - Earth Clouds (Swirling weather systems, storm fronts, trade winds, transparency)
 * - Earth Night Lights (Glowing golden city clusters on dark side)
 * - Earth Atmosphere Halo (Physically-inspired Rayleigh scattering shader)
 * - The Moon (Cratered regolith, impact basins, basaltic maria, Apollo 11 site)
 * - The Moon Bump Map (Craters depth & relief)
 * - The Sun (Dynamic convective granulation, solar plasma, limb darkening)
 * - The Sun Corona (Soft fiery corona rays, solar flare glow)
 * - Mars (Iron-rich red regolith, Valles Marineris canyon, polar ice caps)
 * - Saturn (Amber/cream atmospheric banding)
 * - Saturn's Rings (A-Ring, Cassini Division, B-Ring, C-Ring with realistic alpha)
 */

import * as THREE from 'three';

// ── Simplex/Perlin-style 2D coherent noise helpers ──
function makeNoise2D() {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const t = p[i]; p[i] = p[r]; p[r] = t;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  return function noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const fx = (3 - 2 * x) * x * x;
    const fy = (3 - 2 * y) * y * y;
    const p0 = perm[X] + Y;
    const p1 = perm[X + 1] + Y;
    return (1 - fy) * ((1 - fx) * grad(perm[p0], x, y) + fx * grad(perm[p1], x - 1, y)) +
           fy * ((1 - fx) * grad(perm[p0 + 1], x, y - 1) + fx * grad(perm[p1 + 1], x - 1, y - 1));
  };
}

const noise = makeNoise2D();

function fbm(x, y, octaves = 6, lacunarity = 2.0, gain = 0.5) {
  let total = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    total += noise(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return total / maxVal;
}

/**
 * 1. PHOTOREALISTIC EARTH DAY TEXTURE
 */
export function createEarthDayTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI; // -PI/2 to PI/2
    const cosLat = Math.cos(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2; // 0 to 2PI

      // Sphere projection to 3D noise coordinates
      const nx = cosLat * Math.cos(lon) * 2.5;
      const ny = Math.sin(lat) * 2.5;
      const nz = cosLat * Math.sin(lon) * 2.5;

      // Continental elevation
      let elev = fbm(nx + 10, ny + 10, 6);
      elev += fbm(nx * 2 + 50, nz * 2 + 50, 4) * 0.3;

      // Polar ice cap effect
      const absLat = Math.abs(lat);
      const isPolar = absLat > 1.25 + noise(nx * 4, nz * 4) * 0.15;

      const idx = (y * width + x) * 4;

      if (isPolar) {
        // Polar ice sheets (white/pale ice blue)
        data[idx] = 235;
        data[idx + 1] = 245;
        data[idx + 2] = 255;
      } else if (elev < 0.05) {
        // Deep oceans & shallow coastal continental shelves
        const depth = Math.max(0, Math.min(1, (-elev) * 2.5));
        // Deep navy ocean: #07162c, Shallow coastal shelf: #0c4d72
        data[idx] = Math.round(12 * (1 - depth) + 5 * depth);
        data[idx + 1] = Math.round(75 * (1 - depth) + 20 * depth);
        data[idx + 2] = Math.round(115 * (1 - depth) + 45 * depth);
      } else {
        // Landmasses (biomes: rain forest, grassland, savanna, desert, mountain)
        const t = Math.min(1, (elev - 0.05) * 3);
        const desertFactor = Math.abs(Math.sin(lat * 2.2)) * (0.5 + 0.5 * noise(nx * 3, nz * 3));

        let r, g, b;
        if (t > 0.65) {
          // Alpine mountains & high plateau
          r = 160 + t * 40; g = 150 + t * 40; b = 140 + t * 40;
        } else if (desertFactor > 0.45) {
          // Arid / Desert (Sahara, Australian outback, Gobi)
          r = 185; g = 145; b = 95;
        } else {
          // Lush forest & green plains
          r = 35 + t * 30;
          g = 85 + t * 25;
          b = 40 + t * 15;
        }
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 2. EARTH CLOUD COVERAGE (Translucent dynamic weather systems)
 */
export function createEarthCloudsTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;

      const nx = cosLat * Math.cos(lon) * 3.5;
      const ny = Math.sin(lat) * 3.5;
      const nz = cosLat * Math.sin(lon) * 3.5;

      // Swirling cloud structures with turbulence
      let c = fbm(nx, ny + fbm(nx, nz, 3) * 0.5, 5);
      c = Math.max(0, (c - 0.18) * 1.8);

      const idx = (y * width + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.min(255, Math.floor(c * 230));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 3. EARTH NIGHT LIGHTS (Civilization city networks)
 */
export function createEarthNightTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;

      const nx = cosLat * Math.cos(lon) * 2.5;
      const ny = Math.sin(lat) * 2.5;
      const nz = cosLat * Math.sin(lon) * 2.5;

      const elev = fbm(nx + 10, ny + 10, 5);
      const isLand = elev > 0.05 && Math.abs(lat) < 1.15;

      if (isLand) {
        // High frequency sparkle for cities and urban corridors
        const cityDensity = fbm(nx * 12 + 100, nz * 12 + 100, 4);
        if (cityDensity > 0.42) {
          const brightness = Math.min(255, Math.floor((cityDensity - 0.42) * 500));
          const idx = (y * width + x) * 4;
          data[idx] = brightness;
          data[idx + 1] = Math.floor(brightness * 0.85);
          data[idx + 2] = Math.floor(brightness * 0.45);
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * 4. PHOTOREALISTIC MOON REGOLITH & CRATERS
 */
export function createMoonTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  // Pre-seed major lunar impact basins (Maria)
  const maria = [
    { x: 0.35, y: 0.42, r: 0.12, name: 'Mare Tranquillitatis' }, // Apollo 11
    { x: 0.22, y: 0.36, r: 0.16, name: 'Mare Imbrium' },
    { x: 0.15, y: 0.48, r: 0.22, name: 'Oceanus Procellarum' },
    { x: 0.42, y: 0.34, r: 0.10, name: 'Mare Serenitatis' },
    { x: 0.48, y: 0.48, r: 0.08, name: 'Mare Fecunditatis' },
    { x: 0.55, y: 0.38, r: 0.09, name: 'Mare Crisium' }
  ];

  // Rayed prominent craters (Tycho, Copernicus)
  const craters = [
    { x: 0.25, y: 0.72, r: 0.04, rays: true },  // Tycho
    { x: 0.24, y: 0.42, r: 0.035, rays: true }, // Copernicus
    { x: 0.32, y: 0.44, r: 0.025, rays: false },
    { x: 0.18, y: 0.38, r: 0.03, rays: false }
  ];

  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;

      // Base highland regolith (light gray with subtle noise)
      let gray = 145 + fbm(u * 20, v * 20, 6) * 45;

      // Maria basaltic dark lava flows
      for (const m of maria) {
        const dx = Math.abs(u - m.x);
        const dy = y / height - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < m.r) {
          const factor = Math.cos((dist / m.r) * (Math.PI / 2));
          gray -= factor * 65 * (0.8 + 0.2 * noise(u * 15, v * 15));
        }
      }

      // Craters with raised bright rims and central dips
      for (const c of craters) {
        const dx = u - c.x;
        const dy = v - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < c.r * 1.5) {
          if (dist < c.r * 0.7) {
            // Crater floor
            gray -= 30 * (1 - dist / (c.r * 0.7));
          } else if (dist < c.r) {
            // Bright crater rim
            gray += 45;
          }
        }
        if (c.rays && dist < c.r * 5) {
          const angle = Math.atan2(dy, dx);
          const rayNoise = Math.sin(angle * 12) * Math.cos(angle * 5);
          if (rayNoise > 0.6) {
            gray += 25 * (1 - dist / (c.r * 5));
          }
        }
      }

      gray = Math.max(80, Math.min(245, Math.round(gray)));
      const idx = (y * width + x) * 4;
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = Math.round(gray * 1.04); // faint cool silver tint
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Mark the Sea of Tranquility (Apollo 11 site coordinates) with subtle gold locator cross
  const tx = Math.floor(0.35 * width);
  const ty = Math.floor(0.42 * height);
  ctx.strokeStyle = 'rgba(0, 217, 245, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, 5, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * 5. THE SUN (Convective Granulation & Plasma Flare Corona)
 */
export function createSunTexture(width = 512, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;

      // Fiery plasma convective cells
      const n = fbm(u * 16, v * 16, 5);
      const intensity = 0.5 + 0.5 * n;

      const idx = (y * width + x) * 4;
      data[idx] = 255; // Red
      data[idx + 1] = Math.round(180 + intensity * 70); // Green/Gold
      data[idx + 2] = Math.round(60 + intensity * 90);  // Blue/White core
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 6. SUN CORONA GLOW SPRITE
 */
export function createSunCoronaTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.12, 'rgba(255, 230, 140, 0.95)');
  grad.addColorStop(0.35, 'rgba(255, 160, 50, 0.5)');
  grad.addColorStop(0.65, 'rgba(255, 90, 20, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

/**
 * 7. MARS (Red Planet regolith & Polar Ice Cap)
 */
export function createMarsTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const n = fbm(u * 8, v * 8, 5);

      // Polar ice cap
      const isCap = Math.abs(lat) > 1.35;

      const idx = (y * width + x) * 4;
      if (isCap) {
        data[idx] = 240;
        data[idx + 1] = 245;
        data[idx + 2] = 255;
      } else {
        // Rust ochre #c1440e to dark basalt #522615
        const r = Math.round(160 + n * 50);
        const g = Math.round(75 + n * 35);
        const b = Math.round(35 + n * 20);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Valles Marineris canyon slash
  ctx.strokeStyle = 'rgba(50, 20, 10, 0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.54);
  ctx.lineTo(width * 0.55, height * 0.57);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * 8. SATURN (Atmospheric Banding)
 */
export function createSaturnTexture(width = 512, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const band = Math.sin(v * 40) * 0.15 + Math.sin(v * 15) * 0.25;

    const r = Math.round(225 + band * 25);
    const g = Math.round(195 + band * 20);
    const b = Math.round(150 + band * 30);

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y, width, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * 9. SATURN'S RINGS (Concentric divisions with alpha transparency)
 */
export function createSaturnRingsTexture(width = 512, height = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let x = 0; x < width; x++) {
    const u = x / width; // 0 = inner edge, 1 = outer edge

    let alpha = 0;
    let r = 210, g = 190, b = 150;

    if (u < 0.22) {
      // C-Ring (faint crepe ring)
      alpha = u * 0.35;
    } else if (u < 0.62) {
      // B-Ring (bright, dense, high opacity)
      alpha = 0.85 + Math.sin(u * 80) * 0.1;
      r = 235; g = 210; b = 170;
    } else if (u < 0.70) {
      // Cassini Division (dark gap)
      alpha = 0.04;
    } else if (u < 0.94) {
      // A-Ring (structured outer ring)
      alpha = 0.55 + Math.sin(u * 120) * 0.08;
    } else {
      // Encke gap & outer rim fade
      alpha = Math.max(0, (1 - u) * 4);
    }

    const aVal = Math.round(alpha * 255);

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = aVal;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 10. EARTH ATMOSPHERE FRESNEL SHADER MATERIAL
 * Creates that authentic Apollo/ISS blue glowing atmospheric rim!
 */
export function createAtmosphereShaderMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform vec3 glowColor;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        // Inverted Fresnel: highest at silhouette limb
        float intensity = pow(0.68 - dot(vNormal, viewDir), 2.2);
        intensity = clamp(intensity, 0.0, 1.0);
        gl_FragColor = vec4(glowColor, intensity * 0.85);
      }
    `,
    uniforms: {
      glowColor: { value: new THREE.Color(0x00D9F5) } // Cyan/Sky blue
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  });
}

