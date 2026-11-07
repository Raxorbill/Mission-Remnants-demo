import * as THREE from 'three';
import { MaterialLibrary } from '../materials';
import { getMartianTerrainHeight } from '../terrainHeight';

export type MartianEnvironmentVariant = 'viking' | 'spirit-opportunity' | 'ingenuity';

function createMarsSkyDome(variant: MartianEnvironmentVariant): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  if (variant === 'viking') {
    // Chryse Planitia: Deep rust zenith to salmon-butterscotch dust horizon
    grad.addColorStop(0.0, '#321006');
    grad.addColorStop(0.35, '#6e2815');
    grad.addColorStop(0.68, '#a44d2e');
    grad.addColorStop(0.88, '#d1764d');
    grad.addColorStop(1.0, '#e6a078');
  } else if (variant === 'ingenuity') {
    // Jezero Crater flight valley: Brighter high-altitude butterscotch sky
    grad.addColorStop(0.0, '#3d170b');
    grad.addColorStop(0.35, '#7e341d');
    grad.addColorStop(0.68, '#b55e3c');
    grad.addColorStop(0.88, '#df895e');
    grad.addColorStop(1.0, '#f0b68e');
  } else {
    // Spirit & Opportunity: Warm ochre-terracotta sky over Meridiani/Gusev
    grad.addColorStop(0.0, '#381308');
    grad.addColorStop(0.35, '#752d19');
    grad.addColorStop(0.68, '#aa5233');
    grad.addColorStop(0.88, '#d47b52');
    grad.addColorStop(1.0, '#e8a57e');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  const skyGeo = new THREE.SphereGeometry(152, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    fog: false,
  });
  return new THREE.Mesh(skyGeo, skyMat);
}

function createMarsSunGlow(): THREE.Group {
  const sunGroup = new THREE.Group();
  // Pale golden-white Sun disk as seen through thin CO2 & dust atmosphere
  const sunDisk = new THREE.Mesh(
    new THREE.CircleGeometry(3.6, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfff5dc,
      side: THREE.DoubleSide,
      fog: false,
    })
  );
  // Forward-scattered dust halo (famous Martian bluish-peach glow discovered by Viking & Curiosity)
  const haloDisk = new THREE.Mesh(
    new THREE.CircleGeometry(16.0, 32),
    new THREE.MeshBasicMaterial({
      color: 0x86c2e2,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      fog: false,
    })
  );
  sunGroup.add(haloDisk);
  sunGroup.add(sunDisk);

  // Position along the sun light direction (normalized * 142m)
  sunGroup.position.set(45, 32, 25).normalize().multiplyScalar(142);
  sunGroup.lookAt(0, 0, 0);
  return sunGroup;
}

export function createMartianEnvironment(
  scene: THREE.Scene,
  materials: MaterialLibrary,
  variant: MartianEnvironmentVariant = 'spirit-opportunity'
): {
  ground: THREE.Mesh;
  rocks: THREE.InstancedMesh;
  pebbles?: THREE.InstancedMesh;
} {
  // 1. Martian Atmospheric Sky Dome & Atmospheric Fog tailored to mission site
  const skyDome = createMarsSkyDome(variant);
  scene.add(skyDome);
  const sunGlow = createMarsSunGlow();
  scene.add(sunGlow);

  const fogColor = variant === 'viking' ? 0xa84c2c : variant === 'ingenuity' ? 0xbd623f : 0xb25636;
  const fogDensity = variant === 'ingenuity' ? 0.0038 : 0.0048;
  scene.background = new THREE.Color(fogColor);
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);

  // 2. Warm Directional Solar Key Light & Scattered Dust Ambient Fill
  const sunLight = new THREE.DirectionalLight(0xfff0e2, variant === 'ingenuity' ? 3.1 : 2.9);
  sunLight.position.set(45, 32, 25);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 160;
  const d = 36;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  // Dusty atmospheric scattered fill: warm peach sky fill + deep rust ground bounce
  const hemiLight = new THREE.HemisphereLight(0xd97c55, 0x481c0e, 0.78);
  scene.add(hemiLight);

  // 3. Martian Surface Terrain with Sand Dunes, Ripples & Stratified Outcroppings
  const groundGeo = new THREE.PlaneGeometry(240, 240, 180, 180);
  groundGeo.rotateX(-Math.PI / 2);

  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, getMartianTerrainHeight(x, z));
  }
  groundGeo.computeVertexNormals();

  const ground = new THREE.Mesh(groundGeo, materials.marsGround);
  ground.receiveShadow = true;
  scene.add(ground);

  // 4. Two-Tier Distant Mountain Horizon (Outer jagged peaks + Inner stratified crater rim)
  const outerRimGeo = new THREE.CylinderGeometry(136, 142, 38, 64, 1, true);
  const oPos = outerRimGeo.attributes.position;
  for (let i = 0; i < oPos.count; i++) {
    const y = oPos.getY(i);
    if (y > 0) {
      const angle = Math.atan2(oPos.getZ(i), oPos.getX(i));
      const peak = Math.sin(angle * 4) * 6.8 + Math.sin(angle * 9) * 4.2 + Math.cos(angle * 17) * 2.5;
      oPos.setY(i, y + peak);
    }
  }
  outerRimGeo.computeVertexNormals();
  const outerRimMat = new THREE.MeshStandardMaterial({
    color: variant === 'ingenuity' ? 0x96452c : 0x8a3c26,
    roughness: 0.98,
    metalness: 0.02,
    side: THREE.BackSide,
  });
  const outerRim = new THREE.Mesh(outerRimGeo, outerRimMat);
  outerRim.position.y = 4;
  scene.add(outerRim);

  // Inner crater rim / Jezero delta ridge
  const innerRimGeo = new THREE.CylinderGeometry(96, 102, 22, 64, 1, true);
  const iPos = innerRimGeo.attributes.position;
  for (let i = 0; i < iPos.count; i++) {
    const y = iPos.getY(i);
    if (y > 0) {
      const angle = Math.atan2(iPos.getZ(i), iPos.getX(i));
      const peak = Math.sin(angle * 6 + 1.2) * 3.8 + Math.cos(angle * 13) * 2.2;
      iPos.setY(i, y + peak);
    }
  }
  innerRimGeo.computeVertexNormals();
  const innerRimMat = new THREE.MeshStandardMaterial({
    color: 0x732815,
    roughness: 0.95,
    metalness: 0.04,
    side: THREE.BackSide,
  });
  const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
  innerRim.position.y = 2;
  scene.add(innerRim);

  // 5. Mission-Specific Geological Landmarks
  if (variant === 'viking') {
    // Chryse Planitia "Big Joe" landmark boulder near Viking 1
    const bigJoeGeo = new THREE.DodecahedronGeometry(1.65, 1);
    const bigJoe = new THREE.Mesh(bigJoeGeo, materials.groundRockMars);
    const bjY = getMartianTerrainHeight(-9.5, -8.0);
    bigJoe.position.set(-9.5, bjY + 0.75, -8.0);
    bigJoe.scale.set(1.35, 0.82, 1.15);
    bigJoe.castShadow = true;
    bigJoe.receiveShadow = true;
    scene.add(bigJoe);
  } else if (variant === 'spirit-opportunity') {
    // Stratified sedimentary bedrock ledges (Meridiani Planum / Columbia Hills outcrops)
    const ledgeMat = new THREE.MeshStandardMaterial({
      color: 0x9c4c2d,
      roughness: 0.92,
      metalness: 0.05,
    });
    const outcropCoords = [
      { x: 12, z: 14, rot: 0.4, scale: 1.2 },
      { x: -14, z: 20, rot: -0.6, scale: 1.4 },
      { x: 6, z: -15, rot: 1.1, scale: 1.0 },
    ];
    outcropCoords.forEach((oc) => {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(4.2 * oc.scale, 0.36, 2.4 * oc.scale), ledgeMat);
      const y = getMartianTerrainHeight(oc.x, oc.z);
      slab.position.set(oc.x, y + 0.14, oc.z);
      slab.rotation.set(0.08, oc.rot, -0.05);
      slab.receiveShadow = true;
      slab.castShadow = true;
      scene.add(slab);
    });
  } else if (variant === 'ingenuity') {
    // Jezero Crater airborne atmospheric dust particles for altitude depth perception
    const dustCount = 220;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 90;
      dustPositions[i * 3 + 1] = 0.8 + Math.random() * 14;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf5b895,
      size: 0.16,
      transparent: true,
      opacity: 0.45,
    });
    const dustCloud = new THREE.Points(dustGeo, dustMat);
    scene.add(dustCloud);
  }

  // 6. Tier 1: Natural Tabular Basalt Slabs & Weathered Outcroppings
  const rockGeo = new THREE.DodecahedronGeometry(0.52, 0);
  const rockCount = variant === 'viking' ? 125 : variant === 'ingenuity' ? 65 : 95;
  const rocks = new THREE.InstancedMesh(rockGeo, materials.groundRockMars, rockCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < rockCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const minRadius = variant === 'viking' ? 4.5 : variant === 'ingenuity' ? 10.0 : 7.5;
    const r = minRadius + Math.random() * 85;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const scale = 0.45 + Math.random() * 1.6;
    const groundY = getMartianTerrainHeight(x, z);

    dummy.scale.set(
      scale * (0.8 + Math.random() * 0.5),
      scale * (variant === 'viking' ? 0.55 : 0.35),
      scale * (0.8 + Math.random() * 0.5)
    );
    dummy.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.3
    );
    dummy.position.set(x, groundY + scale * 0.08, z);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.instanceMatrix.needsUpdate = true;
  rocks.receiveShadow = true;
  rocks.castShadow = true;
  scene.add(rocks);

  // 7. Tier 2: Scattered Small Pebbles, Scree & Gravel Fields
  const pebbleGeo = new THREE.DodecahedronGeometry(0.18, 0);
  const pebbleCount = 180;
  const pebbles = new THREE.InstancedMesh(pebbleGeo, materials.groundRockMars, pebbleCount);

  for (let i = 0; i < pebbleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 5.5 + Math.random() * 75;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const pScale = 0.4 + Math.random() * 0.9;
    const groundY = getMartianTerrainHeight(x, z);

    dummy.scale.set(
      pScale * (0.7 + Math.random() * 0.6),
      pScale * (0.4 + Math.random() * 0.4),
      pScale * (0.7 + Math.random() * 0.6)
    );
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    dummy.position.set(x, groundY + pScale * 0.05, z);
    dummy.updateMatrix();
    pebbles.setMatrixAt(i, dummy.matrix);
  }
  pebbles.instanceMatrix.needsUpdate = true;
  pebbles.receiveShadow = true;
  scene.add(pebbles);

  return { ground, rocks, pebbles };
}
