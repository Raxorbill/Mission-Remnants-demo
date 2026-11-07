import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createCuriosityRover(materials: MaterialLibrary): {
  rover: THREE.Group;
  wheels: THREE.Mesh[];
  drillArm: THREE.Group;
  drillBit: THREE.Mesh;
} {
  const rover = new THREE.Group();
  rover.name = 'curiosity_rover';

  // 1. Large Main Body Chassis (Warm Electronics Box)
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.75, 2.2);
  const chassis = new THREE.Mesh(chassisGeo, materials.whiteMLI);
  chassis.position.y = 0.95;
  chassis.castShadow = true;
  rover.add(chassis);

  // Top instrument deck
  const deckPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 2.1), materials.silverMetal);
  deckPlate.position.set(0, 1.35, 0);
  rover.add(deckPlate);

  // 2. MMRTG (Multi-Mission Radioisotope Thermoelectric Generator) on rear tail
  const mmrtgGroup = new THREE.Group();
  mmrtgGroup.position.set(0, 1.15, -1.45);
  mmrtgGroup.rotation.x = -Math.PI * 0.18; // angled upward

  const canisterGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.7, 12);
  const canister = new THREE.Mesh(canisterGeo, materials.darkChassis);
  canister.rotation.x = Math.PI / 2;
  mmrtgGroup.add(canister);

  // RTG cooling fins
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.65), materials.silverMetal);
    fin.rotation.z = (i * Math.PI) / 4;
    mmrtgGroup.add(fin);
  }
  rover.add(mmrtgGroup);

  // 3. Six Large Aluminum Wheels (0.5m diameter with cleats)
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.26, 18);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.2, 0.25, 1.0],   // Front L
    [1.2, 0.25, 1.0],    // Front R
    [-1.25, 0.25, 0.0],  // Mid L
    [1.25, 0.25, 0.0],   // Mid R
    [-1.2, 0.25, -1.0],  // Rear L
    [1.2, 0.25, -1.0],   // Rear R
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, materials.silverMetal);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    rover.add(wheel);
    wheels.push(wheel);

    // Rocker-bogie titanium tubes
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), materials.darkChassis);
    tube.position.set(x > 0 ? x - 0.15 : x + 0.15, 0.55, z);
    rover.add(tube);
  });

  // 4. Remote Sensing Mast (RSM) with ChemCam & Mastcam
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.45, 8), materials.silverMetal);
  mast.position.set(0.55, 2.05, 0.7);
  rover.add(mast);

  const rsmHead = new THREE.Group();
  rsmHead.position.set(0.55, 2.75, 0.7);

  // ChemCam circular laser telescope aperture
  const chemBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.25), materials.whiteMLI);
  rsmHead.add(chemBox);

  const chemLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), materials.opticalGlass);
  chemLens.rotation.x = Math.PI / 2;
  chemLens.position.set(0, 0.04, 0.14);
  rsmHead.add(chemLens);

  // Twin Mastcam lenses
  [-0.1, 0.1].forEach(lx => {
    const mCam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), materials.darkChassis);
    mCam.rotation.x = Math.PI / 2;
    mCam.position.set(lx, -0.06, 0.14);
    rsmHead.add(mCam);
  });
  rover.add(rsmHead);

  // 5. CheMin and SAM Sample Inlet Funnel Ports on deck
  const inletChemin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.12, 10), materials.silverMetal);
  inletChemin.position.set(0.15, 1.4, 0.25);
  inletChemin.name = 'chemin_inlet';
  rover.add(inletChemin);

  const inletSam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.12, 10), materials.silverMetal);
  inletSam.position.set(-0.25, 1.4, 0.1);
  inletSam.name = 'sam_inlet';
  rover.add(inletSam);

  // High-Gain Antenna dish
  const hga = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.02, 0.05, 16), materials.silverMetal);
  hga.position.set(-0.45, 1.5, -0.6);
  hga.rotation.x = -Math.PI * 0.25;
  rover.add(hga);

  // 6. 2.1m Heavy Robotic Arm & Rotary Percussion Drill Turret
  const drillArm = new THREE.Group();
  drillArm.name = 'curiosity_robotic_arm';
  drillArm.position.set(0.4, 0.9, 1.15);

  // Upper arm
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.8, 8), materials.silverMetal);
  arm1.position.set(0, 0.25, 0.35);
  arm1.rotation.x = Math.PI * 0.35;
  drillArm.add(arm1);

  // Forearm
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.85, 8), materials.silverMetal);
  arm2.position.set(0, -0.05, 0.8);
  arm2.rotation.x = -Math.PI * 0.2;
  drillArm.add(arm2);

  // Heavy cross-shaped Turret housing the percussion drill, MAHLI, and APXS
  const turret = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.32), materials.darkChassis);
  turret.position.set(0, -0.35, 1.25);
  drillArm.add(turret);

  // Percussion Drill mechanism cylinder
  const drillBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.45, 12), materials.silverMetal);
  drillBody.position.set(0, -0.5, 1.25);
  drillArm.add(drillBody);

  // Drill Bit stem
  const drillBit = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.015, 0.28, 8), materials.darkChassis);
  drillBit.position.set(0, -0.8, 1.25);
  drillBit.name = 'percussion_drill_bit';
  drillArm.add(drillBit);

  // Stabilizer contact prongs
  [-0.1, 0.1].forEach(px => {
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6), materials.silverMetal);
    prong.position.set(px, -0.75, 1.25);
    drillArm.add(prong);
  });

  rover.add(drillArm);

  return { rover, wheels, drillArm, drillBit };
}
