import * as THREE from 'three';

export function createDeepSpaceEnvironment(scene: THREE.Scene): {
  jupiterGroup: THREE.Group;
  saturnGroup: THREE.Group;
  earthDot: THREE.Mesh;
  heliopauseMesh: THREE.Mesh;
  sunBeam: THREE.Mesh;
} {
  scene.background = new THREE.Color(0x020408);
  scene.fog = null; // No atmospheric fog in deep space!

  // Ambient starlight
  const ambientLight = new THREE.AmbientLight(0x222a38, 0.8);
  scene.add(ambientLight);

  // Distant Sun directional light
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(-60, 20, 80);
  scene.add(sunLight);

  // 1. Distant Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 3000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 800
    ).normalize().multiplyScalar(350);
    starPos[i] = v.x;
    starPos[i + 1] = v.y;
    starPos[i + 2] = v.z;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 0.9,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // 2. Procedural JUPITER & Moon Io with volcanic plume
  const jupiterGroup = new THREE.Group();
  jupiterGroup.position.set(45, 12, -70);

  // Jupiter canvas texture with cloud bands and Great Red Spot
  const jupCanvas = document.createElement('canvas');
  jupCanvas.width = 512;
  jupCanvas.height = 256;
  const jCtx = jupCanvas.getContext('2d')!;

  const bands = ['#c88b58', '#ecd9bd', '#b07042', '#dfc4a4', '#995a32', '#d8ba98', '#aa6a3c'];
  for (let y = 0; y < 256; y++) {
    const idx = Math.floor((y / 256) * bands.length);
    jCtx.fillStyle = bands[idx];
    jCtx.fillRect(0, y, 512, 1);
  }
  // Great Red Spot
  jCtx.fillStyle = '#b84222';
  jCtx.beginPath();
  jCtx.ellipse(320, 160, 42, 22, 0.1, 0, Math.PI * 2);
  jCtx.fill();

  const jupTex = new THREE.CanvasTexture(jupCanvas);
  jupTex.colorSpace = THREE.SRGBColorSpace;
  const jupGeo = new THREE.SphereGeometry(14, 32, 24);
  const jupMat = new THREE.MeshStandardMaterial({
    map: jupTex,
    roughness: 0.8,
    metalness: 0.05,
  });
  const jupiter = new THREE.Mesh(jupGeo, jupMat);
  jupiterGroup.add(jupiter);

  // Moon IO with active volcanic plume
  const ioGroup = new THREE.Group();
  ioGroup.position.set(-18, 5, 12);
  const ioGeo = new THREE.SphereGeometry(2.2, 16, 12);
  const ioMat = new THREE.MeshStandardMaterial({ color: 0xdbbe39, roughness: 0.7 }); // Sulfur pizza color
  const io = new THREE.Mesh(ioGeo, ioMat);
  ioGroup.add(io);

  // Volcanic plume on Io (Pele / Prometheus volcano)
  const plumeGeo = new THREE.ConeGeometry(0.8, 2.2, 12, 1, true);
  const plumeMat = new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.65 });
  const plume = new THREE.Mesh(plumeGeo, plumeMat);
  plume.position.set(1.5, 1.8, 0.5);
  plume.rotation.z = -Math.PI * 0.3;
  ioGroup.add(plume);

  jupiterGroup.add(ioGroup);
  scene.add(jupiterGroup);

  // 3. Procedural SATURN with rings & Moon Titan
  const saturnGroup = new THREE.Group();
  saturnGroup.position.set(-80, -15, -120);

  const satGeo = new THREE.SphereGeometry(10, 32, 24);
  const satMat = new THREE.MeshStandardMaterial({ color: 0xe0c896, roughness: 0.75 });
  const saturn = new THREE.Mesh(satGeo, satMat);
  saturnGroup.add(saturn);

  // Concentric Rings (Cassini Division)
  const ringGeo = new THREE.RingGeometry(13, 22, 48);
  ringGeo.rotateX(Math.PI / 2.3);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xc4b28a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    roughness: 0.7,
  });
  const rings = new THREE.Mesh(ringGeo, ringMat);
  saturnGroup.add(rings);

  // Moon Titan with hazy nitrogen atmosphere
  const titanGeo = new THREE.SphereGeometry(2.5, 16, 12);
  const titanMat = new THREE.MeshStandardMaterial({ color: 0xd98638, roughness: 0.9 });
  const titan = new THREE.Mesh(titanGeo, titanMat);
  titan.position.set(22, 6, 8);
  saturnGroup.add(titan);

  scene.add(saturnGroup);

  // 4. "Pale Blue Dot" Earth (Tiny speck of light suspended in a sunbeam, 1990)
  const earthDotGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const earthDotMat = new THREE.MeshBasicMaterial({ color: 0x8fd9ff });
  const earthDot = new THREE.Mesh(earthDotGeo, earthDotMat);
  earthDot.position.set(30, -5, -45);
  scene.add(earthDot);

  // Sunbeam ray streak across the Pale Blue Dot frame
  const beamGeo = new THREE.PlaneGeometry(0.8, 45);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xeeddbb,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
  });
  const sunBeam = new THREE.Mesh(beamGeo, beamMat);
  sunBeam.position.set(30, -5, -45);
  sunBeam.rotation.z = Math.PI * 0.28;
  scene.add(sunBeam);

  // 5. HELIOPAUSE BOUNDARY (Dynamic interstellar plasma bubble)
  const helioGeo = new THREE.SphereGeometry(60, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const helioMat = new THREE.MeshBasicMaterial({
    color: 0x4466ff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  const heliopauseMesh = new THREE.Mesh(helioGeo, helioMat);
  heliopauseMesh.position.set(0, 0, -50);
  scene.add(heliopauseMesh);

  return { jupiterGroup, saturnGroup, earthDot, heliopauseMesh, sunBeam };
}
