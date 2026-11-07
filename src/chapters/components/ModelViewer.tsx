import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Layers, Play, RotateCcw, Sun, Eye, ExternalLink } from 'lucide-react';
import { ChapterData, Hotspot } from '../data/types';
import { audioService } from '../utils/audio';
import { generatePlanetMaps } from './3d/SpaceTextures';
import { createAerospaceMaterials, buildSpacecraft } from './3d/SpacecraftBuilder';

interface ModelViewerProps {
  chapter: ChapterData;
  activeHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  reducedMotion: boolean;
  roverSelection?: 'opportunity' | 'spirit';
  onRoverChange?: (rover: 'opportunity' | 'spirit') => void;
  laserTrigger?: number;
}

type LightingMode = 'solar' | 'studio' | 'terminator';

const MODEL_TYPE_TO_ARTIFACT_ID: Record<ChapterData['modelType'], string> = {
  retroreflector: 'apollo-11-lrrr',
  seismometer: 'apollo-pse',
  viking: 'viking-lander',
  rover: 'spirit-opportunity',
  ingenuity: 'ingenuity',
  voyager: 'voyager-1',
};

const SIM_LABELS: Record<ChapterData['modelType'], string> = {
  retroreflector: 'Fire Laser Pulse',
  seismometer: 'Trigger Moonquake',
  viking: 'Run Soil Telemetry',
  rover: 'Drive Rover Traverse',
  ingenuity: 'Spin Coaxial Rotors',
  voyager: 'Transmit Deep Space Ping',
};

const CAD_REFERENCES: Record<
  string,
  { title: string; credit: string; url: string; nasaUrl: string }[]
> = {
  'apollo-11-lrrr': [
    {
      title: 'Apollo 11 Lunar Laser Retroreflector (LRRR)',
      credit: 'NASA 3D Resources / Bendix & Perkin-Elmer CAD',
      url: 'https://science.nasa.gov/3d-resources/',
      nasaUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-04',
    },
  ],
  'apollo-pse': [
    {
      title: 'Apollo Passive Seismic Experiment (PSE)',
      credit: 'NASA ALSEP / Lamont-Doherty Earth Observatory',
      url: 'https://science.nasa.gov/3d-resources/',
      nasaUrl: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-02',
    },
  ],
  'viking-lander': [
    {
      title: 'Viking I Lander — High-Poly 3D Model [eabeb7e]',
      credit: 'someaurelius (@someaurelius) · Sketchfab / NASA Science',
      url: 'https://share.google/JmyvTvUUaImKRrd46',
      nasaUrl: 'https://share.google/63tw9xZfoHkBZwdn2',
    },
    {
      title: 'Viking Lander — Detailed 3D Reconstruction [709ac35]',
      credit: 'tashtego (@tashtego) · Sketchfab',
      url: 'https://share.google/LBYVUBFPVtSlXh30G',
      nasaUrl: 'https://share.google/63tw9xZfoHkBZwdn2',
    },
  ],
  'spirit-opportunity': [
    {
      title: 'Mars Rover Spirit — 3D Model [8993a76]',
      credit: 'joren.arens (@joren.arens) · Sketchfab',
      url: 'https://share.google/e9JB8OQtRmIGJCM8k',
      nasaUrl: 'https://share.google/vpaTDE6bkQIPC0iV0',
    },
    {
      title: 'Mars Rover Opportunity — 3D Model [0484a80]',
      credit: 'Serhii_Sarkisian (@Serhii_Sarkisian) · Sketchfab',
      url: 'https://share.google/YLOcoaOroOzxPpCRs',
      nasaUrl: 'https://share.google/0frvBG0Cnj8x7FRoU',
    },
    {
      title: 'Curiosity [0696a38] & Perseverance [53034df] Heritage CAD',
      credit: 'Thomas Flynn & Cybertron B-127 · NASA JPL',
      url: 'https://sketchfab.com/3d-models/perseverance-mars-rover-53034dff0df04f698f2a5d532366adc4',
      nasaUrl: 'https://share.google/E9MkOWF202Lh8kVch',
    },
  ],
  ingenuity: [
    {
      title: 'Mars Ingenuity Helicopter Flight Model [175a9ef]',
      credit: 'Sakado (@HermanKruger) · Sketchfab / NASA Science',
      url: 'https://share.google/LZVIaII9crYex3DF4',
      nasaUrl: 'https://share.google/ofNL1lJKOvU61MsI1',
    },
    {
      title: 'Ingenuity Mars Helicopter — High-Poly [0d5bdd6]',
      credit: 'Cybertron B-127 (@robo-reboot) · Sketchfab',
      url: 'https://share.google/VwL8E0j3oOYmU0I9Z',
      nasaUrl: 'https://share.google/ofNL1lJKOvU61MsI1',
    },
  ],
  'voyager-1': [
    {
      title: 'Voyager 1 Interstellar Probe — NASA 3D Model',
      credit: 'NASA / JPL-Caltech 3D Resources',
      url: 'https://science.nasa.gov/mission/voyager/',
      nasaUrl: 'https://voyager.jpl.nasa.gov/',
    },
  ],
};

export const ModelViewer: React.FC<ModelViewerProps> = ({
  chapter,
  activeHotspot,
  onSelectHotspot,
  reducedMotion,
  roverSelection = 'opportunity',
  onRoverChange,
  laserTrigger = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPart, setSelectedPart] = useState<{ name: string; desc: string } | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('solar');
  const [showCadOverlay, setShowCadOverlay] = useState(false);

  const artifactId = MODEL_TYPE_TO_ARTIFACT_ID[chapter.modelType] || 'apollo-11-lrrr';
  const simLabel = SIM_LABELS[chapter.modelType] || 'Run Simulation';

  const isExplodedRef = useRef(false);
  const simTriggerRef = useRef<number>(0);
  const lightsRef = useRef<{
    sun: THREE.DirectionalLight;
    fill: THREE.DirectionalLight;
    rim: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    renderer: THREE.WebGLRenderer;
  } | null>(null);

  // Trigger laser/sim when external laserTrigger increments
  useEffect(() => {
    if (laserTrigger > 0) {
      simTriggerRef.current = Date.now();
    }
  }, [laserTrigger]);

  const toggleExplode = () => {
    audioService.playClick();
    isExplodedRef.current = !isExplodedRef.current;
    setIsExploded(isExplodedRef.current);
  };

  const triggerSim = () => {
    audioService.playClick();
    simTriggerRef.current = Date.now();
  };

  const cycleLighting = () => {
    audioService.playClick();
    const order: LightingMode[] = ['solar', 'studio', 'terminator'];
    const next = order[(order.indexOf(lightingMode) + 1) % order.length];
    setLightingMode(next);

    if (lightsRef.current) {
      const { sun, fill, rim, hemi, renderer } = lightsRef.current;
      if (next === 'solar') {
        sun.intensity = 4.6;
        sun.color.setHex(0xfffaf0);
        sun.position.set(12, 18, 10);
        fill.intensity = 0.85;
        rim.intensity = 1.65;
        hemi.intensity = 0.55;
        renderer.toneMappingExposure = 1.28;
      } else if (next === 'studio') {
        sun.intensity = 3.2;
        sun.color.setHex(0xffffff);
        sun.position.set(8, 14, 14);
        fill.intensity = 2.1;
        rim.intensity = 2.4;
        hemi.intensity = 1.15;
        renderer.toneMappingExposure = 1.42;
      } else {
        sun.intensity = 3.8;
        sun.color.setHex(0xff9d5c);
        sun.position.set(18, 4.5, -6);
        fill.intensity = 0.55;
        rim.intensity = 2.2;
        hemi.intensity = 0.35;
        renderer.toneMappingExposure = 1.18;
      }
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 500;

    setSelectedPart(null);
    setIsExploded(false);
    isExplodedRef.current = false;

    const isMoon = artifactId === 'apollo-11-lrrr' || artifactId === 'apollo-pse';
    const isSpace = artifactId === 'voyager-1';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isSpace ? 0x020306 : isMoon ? 0x050608 : 0x160b07);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), isSpace ? 0.015 : isMoon ? 0.022 : 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(4.5, 3.0, 5.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = isSpace ? Math.PI : Math.PI / 2 - 0.03;
    controls.minDistance = 2.0;
    controls.maxDistance = 14;
    controls.target.set(0, 0.9, 0);

    // Three-point aerospace lighting rig
    const hemiLight = new THREE.HemisphereLight(
      isSpace ? 0x3b82f6 : isMoon ? 0xdbeafe : 0xfdba74,
      isSpace ? 0x030712 : isMoon ? 0x111827 : 0x431407,
      0.55
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(isMoon ? 0xffffff : 0xfff5ea, 4.6);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.bias = -0.0005;
    const d = 6.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(isMoon ? 0x93c5fd : 0xfed7aa, 0.9);
    fillLight.position.set(-10, 6, -8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 1.65);
    rimLight.position.set(-6, 12, -12);
    scene.add(rimLight);

    lightsRef.current = {
      sun: sunLight,
      fill: fillLight,
      rim: rimLight,
      hemi: hemiLight,
      renderer,
    };

    if (!isSpace) {
      const maps = generatePlanetMaps(isMoon ? 'moon' : 'mars');
      const groundMat = new THREE.MeshStandardMaterial({
        map: maps.colorMap,
        bumpMap: maps.bumpMap,
        bumpScale: isMoon ? 0.14 : 0.11,
        normalMap: maps.normalMap,
        normalScale: new THREE.Vector2(isMoon ? 1.5 : 1.25, isMoon ? 1.5 : 1.25),
        roughness: isMoon ? 0.92 : 0.85,
        metalness: isMoon ? 0.04 : 0.07,
      });

      const groundGeo = new THREE.PlaneGeometry(90, 90, 140, 140);
      const pos = groundGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const distFromCenter = Math.sqrt(vx * vx + vy * vy);

        const u = (((vx / 30) % 1) + 1) % 1;
        const v = (((vy / 30) % 1) + 1) % 1;
        const tx = Math.floor(u * (maps.size - 1));
        const ty = Math.floor(v * (maps.size - 1));
        const hSample = maps.heightField[ty * maps.size + tx] - 0.5;

        if (distFromCenter > 2.4) {
          const blend = Math.min(1, (distFromCenter - 2.4) / 4.0);
          const ridge = Math.sin(vx * 0.22) * Math.cos(vy * 0.22) * (isMoon ? 0.9 : 0.65);
          const relief = hSample * (isMoon ? 2.2 : 1.6);
          pos.setZ(i, (ridge + relief) * blend);
        } else {
          pos.setZ(i, hSample * 0.08);
        }
      }
      groundGeo.computeVertexNormals();
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      const rockMat = new THREE.MeshStandardMaterial({
        map: maps.colorMap,
        normalMap: maps.normalMap,
        normalScale: new THREE.Vector2(1.6, 1.6),
        roughness: 0.92,
        metalness: 0.06,
      });

      let rSeed = isMoon ? 303 : 707;
      const nextRand = () => {
        rSeed = (rSeed * 16807) % 2147483647;
        return (rSeed - 1) / 2147483646;
      };

      for (let i = 0; i < 42; i++) {
        const rockGeo = new THREE.DodecahedronGeometry(nextRand() * 0.22 + 0.04, 1);
        const rPos = rockGeo.attributes.position;
        for (let k = 0; k < rPos.count; k++) {
          const s = 0.8 + nextRand() * 0.35;
          rPos.setXYZ(k, rPos.getX(k) * s, rPos.getY(k) * (s * 0.72), rPos.getZ(k) * s);
        }
        rockGeo.computeVertexNormals();

        const rock = new THREE.Mesh(rockGeo, rockMat);
        const angle = nextRand() * Math.PI * 2;
        const radius = 2.3 + nextRand() * 14;
        rock.position.set(Math.cos(angle) * radius, 0.03, Math.sin(angle) * radius);
        rock.rotation.set(nextRand() * Math.PI, nextRand() * Math.PI, 0);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      }
    }

    if (isSpace || isMoon) {
      const starGeo = new THREE.BufferGeometry();
      const starPos: number[] = [];
      for (let i = 0; i < 1200; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = isMoon ? Math.random() * 100 + 5 : (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        if (Math.sqrt(x * x + y * y + z * z) > 30) starPos.push(x, y, z);
      }
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.8 });
      scene.add(new THREE.Points(starGeo, starMat));
    }

    const mats = createAerospaceMaterials();
    const { group: artifactGroup, animators } = buildSpacecraft(artifactId, mats);
    scene.add(artifactGroup);

    const simEffectsGroup = new THREE.Group();
    scene.add(simEffectsGroup);

    let laserBeam: THREE.Mesh | null = null;
    const seismicRings: THREE.Mesh[] = [];
    const radioWaves: THREE.Mesh[] = [];

    if (artifactId === 'apollo-11-lrrr') {
      const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 40, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      laserBeam = new THREE.Mesh(beamGeo, beamMat);
      laserBeam.position.set(0, 14, 14);
      laserBeam.rotation.x = Math.PI / 4;
      simEffectsGroup.add(laserBeam);
    } else if (artifactId === 'apollo-pse') {
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(0.5, 0.65, 48);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        simEffectsGroup.add(ring);
        seismicRings.push(ring);
      }
    } else if (artifactId === 'voyager-1' || artifactId === 'viking-lander') {
      for (let i = 0; i < 3; i++) {
        const waveGeo = new THREE.RingGeometry(0.2, 0.3, 36);
        const waveMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        if (artifactId === 'voyager-1') {
          wave.position.set(0, 3.0, 0);
          wave.rotation.x = Math.PI / 2;
        } else {
          wave.position.set(-0.5, 2.0, 0);
          wave.rotation.x = Math.PI / 2 - 0.5;
        }
        simEffectsGroup.add(wave);
        radioWaves.push(wave);
      }
    }

    artifactGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData.origPos = child.position.clone();
        const dir = child.position.clone().sub(new THREE.Vector3(0, 0.8, 0)).normalize();
        if (dir.lengthSq() === 0) dir.set(0, 1, 0);
        child.userData.expPos = child.position.clone().add(dir.multiplyScalar(1.2));
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(artifactGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.partName && obj !== artifactGroup) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.partName) {
          renderer.domElement.style.cursor = 'pointer';
          if (hoveredMesh !== intersects[0].object) {
            if (hoveredMesh && (hoveredMesh.material as any).emissive) {
              (hoveredMesh.material as any).emissive.setHex(hoveredMesh.userData.origEmissive || 0x000000);
            }
            hoveredMesh = intersects[0].object as THREE.Mesh;
            if ((hoveredMesh.material as any).emissive) {
              if (hoveredMesh.userData.origEmissive === undefined) {
                hoveredMesh.userData.origEmissive = (hoveredMesh.material as any).emissive.getHex();
              }
              hoveredMesh.material = (hoveredMesh.material as THREE.Material).clone();
              (hoveredMesh.material as any).emissive.setHex(0x2a2008);
            }
            audioService.playHover();
          }
          return;
        }
      }

      renderer.domElement.style.cursor = 'grab';
      if (hoveredMesh && (hoveredMesh.material as any).emissive) {
        (hoveredMesh.material as any).emissive.setHex(hoveredMesh.userData.origEmissive || 0x000000);
        hoveredMesh = null;
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(artifactGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.partName && obj !== artifactGroup) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.partName) {
          audioService.playClick();
          setSelectedPart({ name: obj.userData.partName, desc: obj.userData.partDesc });
          // Also match to chapter hotspot if applicable
          const matchedHs = chapter.hotspots.find((h) =>
            obj!.userData.partName.toLowerCase().includes(h.label.split(' ')[0].toLowerCase())
          );
          if (matchedHs) {
            onSelectHotspot(matchedHs);
          }
          return;
        }
      }
      setSelectedPart(null);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('pointerup', onPointerUp);

    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const t = reducedMotion ? 0 : clock.getElapsedTime();

      if (!reducedMotion) {
        animators.forEach((fn) => fn(t));
      }

      artifactGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.userData.origPos) {
          const target = isExplodedRef.current ? child.userData.expPos : child.userData.origPos;
          child.position.lerp(target, 0.08);
        }
      });

      const simElapsed = (Date.now() - simTriggerRef.current) / 1000;
      if (simElapsed < 4.0) {
        if (artifactId === 'apollo-11-lrrr' && laserBeam) {
          const mat = laserBeam.material as THREE.MeshBasicMaterial;
          if (simElapsed < 0.5) mat.opacity = Math.sin((simElapsed / 0.5) * Math.PI) * 0.85;
          else if (simElapsed > 1.0 && simElapsed < 1.5) mat.opacity = Math.sin(((simElapsed - 1.0) / 0.5) * Math.PI) * 0.85;
          else mat.opacity = 0;
        } else if (artifactId === 'apollo-pse') {
          seismicRings.forEach((ring, i) => {
            const delay = i * 0.4;
            if (simElapsed > delay) {
              const p = (simElapsed - delay) / 2.5;
              if (p < 1) {
                ring.scale.setScalar(1 + p * 12);
                (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.8;
              } else {
                (ring.material as THREE.MeshBasicMaterial).opacity = 0;
              }
            }
          });
        } else if (artifactId === 'voyager-1' || artifactId === 'viking-lander') {
          radioWaves.forEach((wave, i) => {
            const delay = i * 0.5;
            if (simElapsed > delay) {
              const p = (simElapsed - delay) / 2.0;
              if (p < 1) {
                wave.scale.setScalar(1 + p * 8);
                wave.position.y = (artifactId === 'voyager-1' ? 3.0 : 2.0) + p * 6;
                if (artifactId === 'viking-lander') wave.position.z = p * 3;
                (wave.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.8;
              } else {
                (wave.material as THREE.MeshBasicMaterial).opacity = 0;
              }
            }
          });
        } else if (artifactId === 'spirit-opportunity') {
          artifactGroup.position.z = Math.sin(simElapsed * Math.PI * 0.5) * 1.5;
        } else if (artifactId === 'ingenuity') {
          artifactGroup.position.y = Math.sin((simElapsed / 4.0) * Math.PI) * 1.5;
          animators.forEach((fn) => fn(t * 8));
        }
      } else {
        if (laserBeam) (laserBeam.material as THREE.MeshBasicMaterial).opacity = 0;
        seismicRings.forEach((r) => ((r.material as THREE.MeshBasicMaterial).opacity = 0));
        radioWaves.forEach((w) => ((w.material as THREE.MeshBasicMaterial).opacity = 0));
        artifactGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      }

      if (artifactId === 'voyager-1' && !reducedMotion) {
        artifactGroup.position.y = Math.sin(t * 0.8) * 0.08;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(reqId);
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, [artifactId, chapter.hotspots, onSelectHotspot, reducedMotion]);

  const cadList = CAD_REFERENCES[artifactId] || [];

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#05070d] overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />

      {/* Top Left: PBR Lighting Rig & Verified 3D CAD Reference Drawer */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          onClick={cycleLighting}
          className="px-3 py-1.5 bg-[#0a0c10]/85 hover:bg-white/[0.08] border border-white/15 text-slate-200 font-mono text-[10px] tracking-[0.16em] uppercase transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer rounded"
          title="Cycle 3D Physically Based Lighting Rig"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {lightingMode === 'solar'
              ? 'Vacuum Solar'
              : lightingMode === 'studio'
              ? 'Studio Light'
              : 'Terminator Dusk'}
          </span>
        </button>

        {cadList.length > 0 && (
          <button
            onClick={() => {
              audioService.playClick();
              setShowCadOverlay(!showCadOverlay);
            }}
            className={`px-3 py-1.5 border font-mono text-[10px] tracking-[0.16em] uppercase transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer rounded ${
              showCadOverlay
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-medium'
                : 'bg-[#0a0c10]/85 hover:bg-white/[0.08] text-slate-300 border-white/15'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D CAD Refs ({cadList.length})</span>
          </button>
        )}

        {chapter.modelType === 'rover' && onRoverChange && (
          <div className="flex items-center bg-[#0a0c10]/85 border border-white/15 rounded overflow-hidden backdrop-blur-md">
            {(['opportunity', 'spirit'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  audioService.playClick();
                  onRoverChange(r);
                }}
                className={`px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors ${
                  roverSelection === r
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Right: Interactive 3D Simulation & Explode Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2">
        <button
          onClick={triggerSim}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-all flex items-center gap-1.5 shadow-lg cursor-pointer rounded"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{simLabel}</span>
        </button>
        <button
          onClick={toggleExplode}
          className={`px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition-all border flex items-center gap-1.5 backdrop-blur-md cursor-pointer rounded ${
            isExploded
              ? 'bg-white text-slate-950 border-white font-semibold'
              : 'bg-[#0a0c10]/85 text-white border-white/15 hover:border-white/40'
          }`}
        >
          {isExploded ? <RotateCcw className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
          <span>{isExploded ? 'Assemble' : 'Explode'}</span>
        </button>
      </div>

      {/* Verified NASA Science & Sketchfab 3D CAD Reference Drawer */}
      {showCadOverlay && (
        <div className="absolute top-14 left-4 z-30 max-w-md w-[calc(100%-2rem)] bg-[#090b10]/95 backdrop-blur-xl border border-amber-500/35 p-4 rounded-lg shadow-2xl">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
            <span className="font-mono text-[10px] tracking-[0.2em] text-amber-400 uppercase">
              Verified 3D Mesh & NASA Science References
            </span>
            <button
              onClick={() => setShowCadOverlay(false)}
              className="text-slate-400 hover:text-white font-mono text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            This interactive WebGL rig uses physically-based crinkled Kapton MLI normal maps, clearcoated Gallium-Arsenide solar cells, and machined aluminum shaders modeled after these reference reconstructions:
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cadList.map((ref, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white/[0.03] border border-white/10 rounded flex flex-col gap-1"
              >
                <div className="text-xs font-medium text-white">{ref.title}</div>
                <div className="font-mono text-[10px] text-slate-400">{ref.credit}</div>
                <div className="flex items-center gap-3 mt-1">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-amber-400 hover:text-amber-300"
                  >
                    Open 3D Model <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={ref.nasaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase text-sky-400 hover:text-sky-300"
                  >
                    NASA Science <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Selected Component Telemetry Callout */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        {selectedPart ? (
          <div className="bg-[#0a0c10]/92 backdrop-blur-xl border border-amber-500/40 p-4 rounded-lg max-w-md pointer-events-auto shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-amber-400 font-mono text-[10px] tracking-[0.2em] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Component Telemetry
              </div>
              <button
                onClick={() => setSelectedPart(null)}
                className="text-slate-400 hover:text-white font-mono text-[10px] tracking-widest uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1">{selectedPart.name}</h4>
            <p className="text-slate-300 text-xs leading-relaxed">{selectedPart.desc}</p>
          </div>
        ) : activeHotspot ? (
          <div className="bg-[#0a0c10]/90 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded text-xs text-slate-200 pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-medium text-white">{activeHotspot.label}:</span>
            <span className="text-slate-300 truncate max-w-xs">{activeHotspot.job}</span>
          </div>
        ) : (
          <div className="bg-[#0a0c10]/75 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded text-[10px] font-mono tracking-[0.14em] uppercase text-slate-400">
            Drag to orbit · Scroll to zoom · Click any spacecraft mesh to inspect
          </div>
        )}
      </div>
    </div>
  );
};
