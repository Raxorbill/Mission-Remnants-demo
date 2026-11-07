import * as THREE from 'three';

// Primary & Secondary Craters on the Lunar Surface
const LUNAR_CRATERS = [
  // Major prominent craters
  { x: -26, z: 28, r: 14, depth: 3.4 },
  { x: 32, z: -22, r: 16, depth: 4.2 },
  { x: 22, z: 36, r: 10, depth: 2.6 },
  { x: -38, z: -32, r: 24, depth: 5.2 },
  { x: -16, z: -14, r: 7, depth: 1.8 },
  { x: 44, z: 30, r: 15, depth: 3.6 },
  { x: 8, z: -42, r: 18, depth: 4.5 },
  // Secondary micro-craters
  { x: 12, z: 14, r: 4.2, depth: 0.9 },
  { x: -10, z: 18, r: 4.8, depth: 1.1 },
  { x: 18, z: -8, r: 5.5, depth: 1.2 },
  { x: -20, z: 8, r: 3.8, depth: 0.75 },
  { x: 2, z: 24, r: 4.0, depth: 0.8 },
];

/** Analytical elevation function for the Moon surface (in meters) */
export function getLunarTerrainHeight(x: number, z: number): number {
  const distFromOrigin = Math.hypot(x, z);

  // Broad rolling lunar mare swell and basalt lava sheet wrinkle ridge
  const broadSwell = Math.sin(x * 0.024) * Math.cos(z * 0.028) * 1.8 +
                     Math.sin(x * 0.012 + z * 0.015) * 2.2;

  // Wrinkle ridge (sinuous cooling compressional ridge across the mare)
  const ridgeDist = Math.abs(x * 0.45 + z * 0.89 - 18);
  const wrinkleRidge = ridgeDist < 6.0 ? Math.cos((ridgeDist / 6.0) * (Math.PI * 0.5)) * 1.4 : 0;

  // Subtle micro-undulations of the regolith surface
  const microUndulation = Math.sin(x * 0.08 - z * 0.06) * 0.28 + Math.cos(x * 0.14 + z * 0.12) * 0.15;

  let elevation = broadSwell + wrinkleRidge + microUndulation;

  // Impact craters with realistic parabolic depression and raised ejecta rim lips
  for (const c of LUNAR_CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r * 1.5) {
      const norm = d / c.r;
      if (norm <= 1.0) {
        // Inside crater bowl: smooth parabolic depression
        const bowl = (1.0 - Math.pow(norm, 2)) * -c.depth;
        elevation += bowl;
      } else {
        // Elevated rim lip tapering outward into ejecta blanket
        const rim = Math.sin((norm - 1.0) * Math.PI) * (c.depth * 0.26);
        elevation += rim;
      }
    }
  }

  // Keep immediate landing site at origin smooth and level for Apollo Lunar Module
  if (distFromOrigin < 7.5) {
    const smoothFactor = Math.max(0, (distFromOrigin - 3.2) / 4.3);
    elevation *= smoothFactor;
  }

  return elevation;
}

/** Analytical elevation function for the Mars surface (in meters) */
export function getMartianTerrainHeight(x: number, z: number): number {
  const dist = Math.hypot(x, z);

  // 1. Broad rolling Martian crater basin swell (gradual 1-2m topography)
  const broadBasin = Math.sin(x * 0.022 + z * 0.018) * 1.6 +
                     Math.cos(x * 0.014 - z * 0.025) * 1.4;

  // 2. Realistic asymmetric barchan / transverse wind-blown sand dunes
  // Wind direction flows roughly northeast (-0.6, 0.8)
  const duneCoord = x * 0.055 + z * 0.042;
  const dunePhase = (duneCoord % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  // Asymmetrical profile: gentle ramp (0 to 4.2 rad) followed by steep lee slip face
  let duneWave = 0;
  if (dunePhase < 4.2) {
    duneWave = Math.sin((dunePhase / 4.2) * (Math.PI * 0.5));
  } else {
    duneWave = Math.cos(((dunePhase - 4.2) / (Math.PI * 2 - 4.2)) * (Math.PI * 0.5));
  }
  const dunes = (duneWave - 0.5) * 1.85;

  // 3. Layered Sedimentary Bedrock Benches (terrace steps characteristic of Martian outcroppings)
  const terracePhase = (x * 0.038 - z * 0.032) * 3;
  const terraceStep = (Math.sin(terracePhase) + 0.3 * Math.sin(terracePhase * 3)) * 0.35;

  // 4. Subtle wind ripple textures (yardangs and sediment drifts)
  const microRipples = Math.sin(x * 0.18 - z * 0.12) * 0.14 + Math.cos(x * 0.35 + z * 0.25) * 0.06;

  let elevation = broadBasin + dunes + terraceStep + microRipples;

  // 5. Sedimentary layered ridge outcrop on the northeast (Columbia Hills / Jezero Delta style)
  const ridgeDist = Math.hypot(x - 16, z - 18);
  if (ridgeDist < 16) {
    const rFactor = 1.0 - ridgeDist / 16;
    elevation += Math.pow(rFactor, 1.4) * 2.8;
  }

  // 6. Shallow weathered impact crater depression on the southwest
  const craterDist = Math.hypot(x + 22, z + 20);
  if (craterDist < 18) {
    const cn = craterDist / 18;
    if (cn <= 1.0) {
      elevation -= (1.0 - Math.pow(cn, 2)) * 2.8;
    } else if (cn <= 1.4) {
      elevation += Math.sin((cn - 1.0) * Math.PI) * 0.85;
    }
  }

  // Keep starting rover / lander touchdown zone smooth and level
  if (dist < 6.5) {
    const smoothFactor = Math.max(0, (dist - 2.8) / 3.7);
    elevation *= smoothFactor;
  }

  return elevation;
}

/** Calculate analytical terrain surface normal at (x, z) */
export function getTerrainSurfaceNormal(x: number, z: number, destination: 'Moon' | 'Mars'): THREE.Vector3 {
  const delta = 0.35;
  const getHeight = destination === 'Moon' ? getLunarTerrainHeight : getMartianTerrainHeight;

  const hL = getHeight(x - delta, z);
  const hR = getHeight(x + delta, z);
  const hD = getHeight(x, z - delta);
  const hU = getHeight(x, z + delta);

  return new THREE.Vector3(hL - hR, 2 * delta, hD - hU).normalize();
}

