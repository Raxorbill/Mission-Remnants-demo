import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createLunarModule(materials: MaterialLibrary): THREE.Group {
  const lm = new THREE.Group();
  lm.name = 'lunar_module';

  // 1. Octagonal Descent Stage (Covered in gold Kapton and black nickel foil)
  const descentGeo = new THREE.CylinderGeometry(2.3, 2.5, 1.6, 8);
  const descent = new THREE.Mesh(descentGeo, materials.goldFoil);
  descent.position.y = 1.8;
  descent.castShadow = true;
  lm.add(descent);

  // Descent engine bell skirt
  const engineGeo = new THREE.ConeGeometry(0.75, 1.2, 16, 1, true);
  const engine = new THREE.Mesh(engineGeo, materials.darkChassis);
  engine.position.y = 0.6;
  lm.add(engine);

  // 2. MESA / Equipment Bay (where scientific gear and LRRR/ALSEP were stowed)
  const mesaGeo = new THREE.BoxGeometry(0.8, 0.9, 0.5);
  const mesa = new THREE.Mesh(mesaGeo, materials.silverMetal);
  mesa.position.set(0, 1.7, 2.25);
  mesa.name = 'equipment_bay';
  lm.add(mesa);

  // 3. Four Quad Landing Gear Legs with shock struts and large dish footpads
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach((angle, idx) => {
    const legGroup = new THREE.Group();
    legGroup.rotation.y = angle;

    // Primary strut
    const strutGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8);
    const strut = new THREE.Mesh(strutGeo, materials.goldFoil);
    strut.position.set(0, 1.0, 2.2);
    strut.rotation.x = -Math.PI * 0.22;
    legGroup.add(strut);

    // Footpad (0.9m circular dish)
    const padGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 12);
    const pad = new THREE.Mesh(padGeo, materials.silverMetal);
    pad.position.set(0, 0.04, 3.2);
    legGroup.add(pad);

    // Lunar contact sensing probe on 3 legs
    if (idx !== 0) { // No probe under ladder leg on Apollo 11/12
      const probeGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6);
      const probe = new THREE.Mesh(probeGeo, materials.silverMetal);
      probe.position.set(0, 0.0, 3.2);
      probe.rotation.x = Math.PI * 0.45;
      legGroup.add(probe);
    } else {
      // Ladder on forward leg
      const ladderGroup = new THREE.Group();
      for (let r = 0; r < 8; r++) {
        const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6);
        rungGeo.rotateZ(Math.PI / 2);
        const rung = new THREE.Mesh(rungGeo, materials.silverMetal);
        rung.position.set(0, 0.3 + r * 0.22, 1.4 + r * 0.18);
        ladderGroup.add(rung);
      }
      legGroup.add(ladderGroup);
    }

    lm.add(legGroup);
  });

  // 4. Ascent Stage (Cabin, Triangular Windows, Docking Tunnel, RCS Thruster Quads)
  const ascentCabinGeo = new THREE.BoxGeometry(2.2, 1.6, 2.0);
  const ascentCabin = new THREE.Mesh(ascentCabinGeo, materials.silverMetal);
  ascentCabin.position.y = 3.3;
  ascentCabin.castShadow = true;
  lm.add(ascentCabin);

  // Forward cabin hatch & porch
  const porchGeo = new THREE.BoxGeometry(0.8, 0.1, 0.6);
  const porch = new THREE.Mesh(porchGeo, materials.silverMetal);
  porch.position.set(0, 2.55, 1.3);
  lm.add(porch);

  // Triangular Commander & LMP forward windows
  const winGeo = new THREE.PlaneGeometry(0.4, 0.35);
  const leftWin = new THREE.Mesh(winGeo, materials.darkChassis);
  leftWin.position.set(-0.55, 3.4, 1.01);
  lm.add(leftWin);

  const rightWin = new THREE.Mesh(winGeo, materials.darkChassis);
  rightWin.position.set(0.55, 3.4, 1.01);
  lm.add(rightWin);

  // Upper docking tunnel & rendezvous radar
  const dockGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 12);
  const dock = new THREE.Mesh(dockGeo, materials.darkChassis);
  dock.position.y = 4.3;
  lm.add(dock);

  // 4 Reaction Control System (RCS) thruster clusters (cross quads)
  const rcsOffsets = [
    { x: -1.3, z: 0 },
    { x: 1.3, z: 0 },
    { x: 0, z: -1.2 },
    { x: 0, z: 1.2 }
  ];
  rcsOffsets.forEach(pos => {
    const rcs = new THREE.Group();
    rcs.position.set(pos.x, 3.3, pos.z);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), materials.darkChassis);
    rcs.add(box);
    for (let i = 0; i < 4; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), materials.silverMetal);
      cone.rotation.z = (i * Math.PI) / 2;
      cone.position.y = 0.08 * (i % 2 === 0 ? 1 : -1);
      rcs.add(cone);
    }
    lm.add(rcs);
  });

  return lm;
}
