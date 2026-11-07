import * as THREE from 'three';
import { MaterialLibrary } from '../materials';
import { getLunarTerrainHeight } from '../terrainHeight';

export function createLunarEnvironment(scene: THREE.Scene, materials: MaterialLibrary): {
  ground: THREE.Mesh;
  earth: THREE.Group;
  rocks: THREE.InstancedMesh;
} {
  // 1. Pitch-Black Deep Lunar Sky
  scene.background = new THREE.Color(0x020306);
  scene.fog = new THREE.FogExp2(0x020306, 0.0035);

  // 2. Harsh Directional Solar Key Light (No atmosphere = stark, razor-sharp shadows)
  const sunLight = new THREE.DirectionalLight(0xfff8eb, 3.2);
  sunLight.position.set(50, 28, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 160;
  const d = 35;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  // Faint Earthshine fill light (cool cyan-tinted light reflected from Earth)
  const earthshine = new THREE.DirectionalLight(0x406085, 0.45);
  earthshine.position.set(-35, 40, -60);
  scene.add(earthshine);

  const hemiLight = new THREE.HemisphereLight(0x182030, 0x05070a, 0.35);
  scene.add(hemiLight);

  // 3. Realistic Cratered Lunar Surface
  // 240m x 240m ultra-high-resolution terrain mesh with analytical craters & mare swell
  const groundGeo = new THREE.PlaneGeometry(240, 240, 180, 180);
  groundGeo.rotateX(-Math.PI / 2);

  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, getLunarTerrainHeight(x, z));
  }
  groundGeo.computeVertexNormals();

  const ground = new THREE.Mesh(groundGeo, materials.moonGround);
  ground.receiveShadow = true;
  scene.add(ground);

  // 4. Two-Tier Distant Lunar Horizon (Outer Montes Apenninus + Inner Crater Rim)
  // Outer mountain range (Montes Apenninus mountain silhouette)
  const outerMountainGeo = new THREE.CylinderGeometry(138, 144, 35, 64, 1, true);
  const omPos = outerMountainGeo.attributes.position;
  for (let i = 0; i < omPos.count; i++) {
    const y = omPos.getY(i);
    if (y > 0) {
      const angle = Math.atan2(omPos.getZ(i), omPos.getX(i));
      const peak = Math.sin(angle * 6) * 6.2 + Math.sin(angle * 13) * 4.1 + Math.cos(angle * 23) * 2.2;
      omPos.setY(i, y + peak);
    }
  }
  outerMountainGeo.computeVertexNormals();
  const outerMountainMat = new THREE.MeshStandardMaterial({
    color: 0x3a3e47,
    roughness: 0.95,
    metalness: 0.04,
    side: THREE.BackSide,
  });
  const outerMountains = new THREE.Mesh(outerMountainGeo, outerMountainMat);
  outerMountains.position.y = 4;
  scene.add(outerMountains);

  // Inner crater rim ridge
  const innerMountainGeo = new THREE.CylinderGeometry(95, 100, 20, 64, 1, true);
  const imPos = innerMountainGeo.attributes.position;
  for (let i = 0; i < imPos.count; i++) {
    const y = imPos.getY(i);
    if (y > 0) {
      const angle = Math.atan2(imPos.getZ(i), imPos.getX(i));
      const peak = Math.sin(angle * 5 + 0.8) * 3.4 + Math.cos(angle * 11) * 2.1;
      imPos.setY(i, y + peak);
    }
  }
  innerMountainGeo.computeVertexNormals();
  const innerMountainMat = new THREE.MeshStandardMaterial({
    color: 0x2e323a,
    roughness: 0.96,
    metalness: 0.04,
    side: THREE.BackSide,
  });
  const innerMountains = new THREE.Mesh(innerMountainGeo, innerMountainMat);
  innerMountains.position.y = 2;
  scene.add(innerMountains);

  // 5. Tier 1: Scattered Lunar Boulders & Rocks (Angular, faceted, embedded basalt slabs)
  const rockGeo = new THREE.DodecahedronGeometry(0.5, 0); // subdivision 0 = flat polygonal facets
  const rockCount = 90;
  const rocks = new THREE.InstancedMesh(rockGeo, materials.rockMaterial, rockCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < rockCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 8.0 + Math.random() * 82;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const scale = 0.5 + Math.random() * 1.8;
    const groundY = getLunarTerrainHeight(x, z);

    dummy.position.set(x, groundY + scale * 0.1, z);
    dummy.rotation.set(
      Math.random() * 0.4,
      Math.random() * Math.PI * 2,
      Math.random() * 0.4
    );
    dummy.scale.set(
      scale * (1.1 + Math.random() * 0.7),
      scale * (0.35 + Math.random() * 0.3),
      scale * (0.9 + Math.random() * 0.6)
    );
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.instanceMatrix.needsUpdate = true;
  rocks.receiveShadow = true;
  rocks.castShadow = true;
  scene.add(rocks);

  // 6. Tier 2: Small Breccia & Basalt Pebble Clusters (Micro-gravel)
  const pebbleGeo = new THREE.DodecahedronGeometry(0.16, 0);
  const pebbleCount = 160;
  const pebbles = new THREE.InstancedMesh(pebbleGeo, materials.rockMaterial, pebbleCount);

  for (let i = 0; i < pebbleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 5.0 + Math.random() * 75;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const pScale = 0.4 + Math.random() * 0.9;
    const groundY = getLunarTerrainHeight(x, z);

    dummy.position.set(x, groundY + pScale * 0.05, z);
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    dummy.scale.set(
      pScale * (0.8 + Math.random() * 0.5),
      pScale * (0.4 + Math.random() * 0.4),
      pScale * (0.8 + Math.random() * 0.5)
    );
    dummy.updateMatrix();
    pebbles.setMatrixAt(i, dummy.matrix);
  }
  pebbles.instanceMatrix.needsUpdate = true;
  pebbles.receiveShadow = true;
  scene.add(pebbles);

  // 6. Earth in the Lunar Sky with Soft Blue Atmospheric Glow
  const earthGroup = new THREE.Group();
  earthGroup.position.set(-38, 45, -70);

  // High-res procedural Earth globe
  const earthCanvas = document.createElement('canvas');
  earthCanvas.width = 512;
  earthCanvas.height = 256;
  const eCtx = earthCanvas.getContext('2d')!;
  eCtx.fillStyle = '#0c306b'; // Deep ocean blue
  eCtx.fillRect(0, 0, 512, 256);

  // Continents (Africa, Europe, Americas, Asia)
  eCtx.fillStyle = '#3a6634';
  eCtx.beginPath();
  eCtx.ellipse(160, 100, 70, 45, 0.3, 0, Math.PI * 2);
  eCtx.fill();
  eCtx.beginPath();
  eCtx.ellipse(330, 120, 85, 55, -0.2, 0, Math.PI * 2);
  eCtx.fill();
  eCtx.beginPath();
  eCtx.ellipse(250, 60, 50, 30, 0.1, 0, Math.PI * 2);
  eCtx.fill();

  // White Cloud swirls and weather systems
  eCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  eCtx.beginPath();
  eCtx.arc(180, 90, 45, 0, Math.PI * 2);
  eCtx.arc(320, 110, 50, 0, Math.PI * 2);
  eCtx.arc(120, 150, 35, 0, Math.PI * 2);
  eCtx.arc(280, 50, 30, 0, Math.PI * 2);
  eCtx.fill();

  const earthTex = new THREE.CanvasTexture(earthCanvas);
  earthTex.colorSpace = THREE.SRGBColorSpace;

  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 32, 24),
    new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.55,
      metalness: 0.1,
      emissive: new THREE.Color(0x061835),
      emissiveIntensity: 0.4,
    })
  );
  earthGroup.add(earthMesh);

  // Atmospheric halo glow
  const haloGeo = new THREE.SphereGeometry(4.5, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x4fa8ff,
    transparent: true,
    opacity: 0.22,
    side: THREE.BackSide,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  earthGroup.add(halo);

  scene.add(earthGroup);

  // 7. Thousands of Glittering Stars in the Void of Space
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * 500,
      Math.random() * 250 + 10,
      (Math.random() - 0.5) * 500
    ).normalize().multiplyScalar(220);
    starPos[i] = v.x;
    starPos[i + 1] = v.y;
    starPos[i + 2] = v.z;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.4,
    transparent: true,
    opacity: 0.9,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  return { ground, earth: earthGroup, rocks };
}
