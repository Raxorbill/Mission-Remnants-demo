import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createAstronaut(materials: MaterialLibrary): THREE.Group {
  const group = new THREE.Group();
  group.name = 'astronaut';

  // 1. Torso (A7L spacesuit)
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.75, 12);
  const torso = new THREE.Mesh(torsoGeo, materials.whiteMLI);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  // Chest pack RCU (Remote Control Unit)
  const rcuGeo = new THREE.BoxGeometry(0.24, 0.22, 0.14);
  const rcu = new THREE.Mesh(rcuGeo, materials.silverMetal);
  rcu.position.set(0, 1.15, 0.22);
  group.add(rcu);

  // 2. Helmet & Gold Visor
  const helmetGeo = new THREE.SphereGeometry(0.26, 16, 14);
  const helmet = new THREE.Mesh(helmetGeo, materials.whiteMLI);
  helmet.position.y = 1.58;
  helmet.castShadow = true;
  group.add(helmet);

  // Extravehicular Visor Assembly (Gold-plated sun visor)
  const visorGeo = new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI, 0, Math.PI * 0.55);
  const visor = new THREE.Mesh(visorGeo, materials.goldFoil);
  visor.rotation.x = Math.PI * 0.15;
  visor.position.set(0, 1.58, 0.05);
  group.add(visor);

  // 3. Portable Life Support System (PLSS Backpack)
  const plssGeo = new THREE.BoxGeometry(0.42, 0.72, 0.26);
  const plss = new THREE.Mesh(plssGeo, materials.whiteMLI);
  plss.position.set(0, 1.15, -0.22);
  plss.castShadow = true;
  group.add(plss);

  // Oxygen emergency tank on top of PLSS
  const opsGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.38, 10);
  opsGeo.rotateZ(Math.PI / 2);
  const ops = new THREE.Mesh(opsGeo, materials.silverMetal);
  ops.position.set(0, 1.54, -0.22);
  group.add(ops);

  // 4. Legs and Lunar Overshoes
  const legGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.65, 10);
  const leftLeg = new THREE.Mesh(legGeo, materials.whiteMLI);
  leftLeg.position.set(-0.16, 0.45, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, materials.whiteMLI);
  rightLeg.position.set(0.16, 0.45, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Blue silicone lunar overshoes
  const bootGeo = new THREE.BoxGeometry(0.16, 0.14, 0.28);
  const bootMat = materials.darkChassis;
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftBoot.position.set(-0.16, 0.07, 0.05);
  group.add(leftBoot);

  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightBoot.position.set(0.16, 0.07, 0.05);
  group.add(rightBoot);

  // 5. Arms
  const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.6, 10);
  const leftArm = new THREE.Mesh(armGeo, materials.whiteMLI);
  leftArm.position.set(-0.38, 1.05, 0);
  leftArm.rotation.z = Math.PI * 0.12;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, materials.whiteMLI);
  rightArm.position.set(0.38, 1.05, 0);
  rightArm.rotation.z = -Math.PI * 0.12;
  group.add(rightArm);

  // Equipment carry socket (in front of chest)
  const carrySocket = new THREE.Group();
  carrySocket.name = 'carry_socket';
  carrySocket.position.set(0, 0.95, 0.42);
  group.add(carrySocket);

  return group;
}
