import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createPerseveranceRover(materials: MaterialLibrary): {
  rover: THREE.Group;
  wheels: THREE.Mesh[];
  coringArm: THREE.Group;
  coringBit: THREE.Mesh;
  sampleTube: THREE.Group;
} {
  const rover = new THREE.Group();
  rover.name = 'perseverance_rover';

  // 1. Main Body Chassis
  const chassisGeo = new THREE.BoxGeometry(1.65, 0.78, 2.25);
  const chassis = new THREE.Mesh(chassisGeo, materials.whiteMLI);
  chassis.position.y = 0.98;
  chassis.castShadow = true;
  rover.add(chassis);

  // Deck Plate
  const deckPlate = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 2.15), materials.silverMetal);
  deckPlate.position.set(0, 1.39, 0);
  rover.add(deckPlate);

  // 2. MMRTG Nuclear Power Unit at rear
  const mmrtgGroup = new THREE.Group();
  mmrtgGroup.position.set(0, 1.18, -1.48);
  mmrtgGroup.rotation.x = -Math.PI * 0.18;
  const rtgCan = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.72, 12), materials.darkChassis);
  rtgCan.rotation.x = Math.PI / 2;
  mmrtgGroup.add(rtgCan);
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.68), materials.silverMetal);
    fin.rotation.z = (i * Math.PI) / 4;
    mmrtgGroup.add(fin);
  }
  rover.add(mmrtgGroup);

  // 3. Six Machined Wheels with modified curved cleats (Perseverance design)
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.26, 18);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-1.22, 0.26, 1.05],
    [1.22, 0.26, 1.05],
    [-1.26, 0.26, 0.0],
    [1.26, 0.26, 0.0],
    [-1.22, 0.26, -1.05],
    [1.22, 0.26, -1.05],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, materials.darkChassis);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    rover.add(wheel);
    wheels.push(wheel);

    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), materials.silverMetal);
    tube.position.set(x > 0 ? x - 0.15 : x + 0.15, 0.58, z);
    rover.add(tube);
  });

  // 4. Remote Sensing Mast with Mastcam-Z and SuperCam
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 8), materials.whiteMLI);
  mast.position.set(0.55, 2.1, 0.7);
  rover.add(mast);

  const headGroup = new THREE.Group();
  headGroup.position.set(0.55, 2.85, 0.7);

  // SuperCam top sensor
  const superCam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.26), materials.darkChassis);
  headGroup.add(superCam);

  // Mastcam-Z dual zoom lenses
  [-0.12, 0.12].forEach(lx => {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 10), materials.opticalGlass);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(lx, -0.05, 0.15);
    headGroup.add(lens);
  });
  rover.add(headGroup);

  // 5. Robotic Arm with Rotary-Percussive Coring Drill Turret
  const coringArm = new THREE.Group();
  coringArm.name = 'perseverance_coring_arm';
  coringArm.position.set(0.45, 0.95, 1.18);

  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.85, 8), materials.silverMetal);
  arm1.position.set(0, 0.28, 0.38);
  arm1.rotation.x = Math.PI * 0.35;
  coringArm.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.9, 8), materials.silverMetal);
  arm2.position.set(0, -0.05, 0.85);
  arm2.rotation.x = -Math.PI * 0.2;
  coringArm.add(arm2);

  // Heavy Turret with PIXL, SHERLOC, and Coring Drill
  const turret = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.36), materials.darkChassis);
  turret.position.set(0, -0.38, 1.35);
  coringArm.add(turret);

  // Hollow-Bit Coring Drill cylinder
  const drillHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12), materials.silverMetal);
  drillHousing.position.set(0, -0.55, 1.35);
  coringArm.add(drillHousing);

  // Hollow cylindrical core bit
  const coringBit = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.32, 12, 1, true), materials.darkChassis);
  coringBit.position.set(0, -0.85, 1.35);
  coringBit.name = 'hollow_coring_bit';
  coringArm.add(coringBit);

  rover.add(coringArm);

  // 6. Gold-coated Titanium Sample Tube (shown during sealing & caching)
  const sampleTube = new THREE.Group();
  sampleTube.name = 'sample_tube';
  sampleTube.position.set(0, 0.45, 0.5); // Inside caching belly

  const tubeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12), materials.goldFoil);
  sampleTube.add(tubeCyl);

  const tubeSealCap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.05, 12), materials.silverMetal);
  tubeSealCap.position.y = 0.2;
  sampleTube.add(tubeSealCap);

  rover.add(sampleTube);

  return { rover, wheels, coringArm, coringBit, sampleTube };
}
