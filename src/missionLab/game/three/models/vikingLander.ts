import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createVikingLander(materials: MaterialLibrary): {
  lander: THREE.Group;
  roboticArm: THREE.Group;
  scoop: THREE.Mesh;
} {
  const lander = new THREE.Group();
  lander.name = 'viking_lander';

  const rtgOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xc24924,
    roughness: 0.42,
    metalness: 0.35,
  });

  const oliveDrabMat = new THREE.MeshStandardMaterial({
    color: 0x8b8f7a,
    roughness: 0.55,
    metalness: 0.3,
  });

  // 1. Hexagonal Main Equipment Bus (alternating long/short sides simulated with detailed hexagonal body + side bays)
  const deckGeo = new THREE.CylinderGeometry(1.42, 1.48, 0.62, 6);
  const deck = new THREE.Mesh(deckGeo, materials.whiteMLI);
  deck.position.y = 1.08;
  deck.castShadow = true;
  deck.receiveShadow = true;
  lander.add(deck);

  // Structural aluminum rim plates & top deck thermal cover
  const topPlateGeo = new THREE.CylinderGeometry(1.44, 1.44, 0.06, 6);
  const topPlate = new THREE.Mesh(topPlateGeo, materials.silverMetal);
  topPlate.position.y = 1.41;
  lander.add(topPlate);

  const bottomPlate = new THREE.Mesh(topPlateGeo, materials.silverMetal);
  bottomPlate.position.y = 0.76;
  lander.add(bottomPlate);

  // 2. Twin SNAP-19 RTG Wind Shroud Domes on Top Deck (Iconic Viking signature)
  [-0.52, 0.52].forEach((rx) => {
    const rtgGroup = new THREE.Group();
    rtgGroup.position.set(rx, 1.44, -0.25);

    const shroudCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.42, 14),
      rtgOrangeMat
    );
    shroudCyl.position.y = 0.21;
    shroudCyl.castShadow = true;
    rtgGroup.add(shroudCyl);

    const shroudCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.24, 0.12, 14),
       materials.silverMetal
    );
    shroudCap.position.y = 0.48;
    rtgGroup.add(shroudCap);

    // Radial thermal cooling fins around RTG base
    for (let f = 0; f < 6; f++) {
      const finAngle = (f * Math.PI) / 3;
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.34, 0.12),
        rtgOrangeMat
      );
      fin.position.set(Math.sin(finAngle) * 0.26, 0.2, Math.cos(finAngle) * 0.26);
      fin.rotation.y = finAngle;
      rtgGroup.add(fin);
    }

    lander.add(rtgGroup);
  });

  // 3. Three Shock-Attenuating Tripod Landing Legs + Terminal Descent Engine Clusters
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  legAngles.forEach((angle) => {
    const legGroup = new THREE.Group();
    legGroup.rotation.y = angle;

    // Main oleo-pneumatic shock strut
    const mainStrutGeo = new THREE.CylinderGeometry(0.065, 0.055, 1.78, 10);
    const strut = new THREE.Mesh(mainStrutGeo, materials.silverMetal);
    strut.position.set(0, 0.66, 1.72);
    strut.rotation.x = -Math.PI * 0.27;
    strut.castShadow = true;
    legGroup.add(strut);

    // Lower A-frame wishbone support links
    [-0.28, 0.28].forEach((lx) => {
      const linkGeo = new THREE.CylinderGeometry(0.028, 0.028, 1.15, 8);
      const link = new THREE.Mesh(linkGeo, oliveDrabMat);
      link.position.set(lx, 0.46, 1.78);
      link.rotation.x = -Math.PI * 0.41;
      link.rotation.z = lx > 0 ? 0.24 : -0.24;
      legGroup.add(link);
    });

    // Concave Aluminum Honeycomb Footpad with Dust Skirt
    const padOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.46, 0.08, 18),
      materials.silverMetal
    );
    padOuter.position.set(0, 0.04, 2.32);
    padOuter.castShadow = true;
    padOuter.receiveShadow = true;
    legGroup.add(padOuter);

    const padInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.09, 18),
      materials.darkChassis
    );
    padInner.position.set(0, 0.05, 2.32);
    legGroup.add(padInner);

    // Terminal Descent Hydrazine Engine Cluster (mounted between legs on hull)
    const enginePod = new THREE.Group();
    enginePod.rotation.y = Math.PI / 3;
    const podHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.26, 0.34),
      oliveDrabMat
    );
    podHousing.position.set(0, 0.96, 1.38);
    enginePod.add(podHousing);

    [-0.14, 0, 0.14].forEach((nx) => {
      const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.065, 0.16, 10),
        materials.darkChassis
      );
      nozzle.position.set(nx, 0.78, 1.42);
      enginePod.add(nozzle);
    });
    legGroup.add(enginePod);

    lander.add(legGroup);
  });

  // 4. Steerable S-Band Parabolic High-Gain Antenna Dish + UHF Low-Gain Antenna
  const hgaGroup = new THREE.Group();
  hgaGroup.position.set(-0.56, 1.46, -0.52);

  const mastPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 0.48, 10),
    materials.darkChassis
  );
  mastPost.position.y = 0.22;
  hgaGroup.add(mastPost);

  const dishPivot = new THREE.Group();
  dishPivot.position.y = 0.48;
  dishPivot.rotation.set(-0.48, 0.35, 0);

  const dishGeo = new THREE.SphereGeometry(0.52, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.36);
  const dish = new THREE.Mesh(dishGeo, materials.whiteMLI);
  dish.material = materials.whiteMLI.clone();
  (dish.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  dish.rotation.x = Math.PI * 0.5;
  dish.castShadow = true;
  dishPivot.add(dish);

  // Feed horn & tripods
  const feedHorn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.36, 10),
    materials.darkChassis
  );
  feedHorn.rotation.x = Math.PI * 0.5;
  feedHorn.position.z = 0.28;
  dishPivot.add(feedHorn);

  for (let s = 0; s < 3; s++) {
    const sa = (s * Math.PI * 2) / 3;
    const fStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.44, 6),
      materials.silverMetal
    );
    fStrut.position.set(Math.cos(sa) * 0.18, Math.sin(sa) * 0.18, 0.24);
    fStrut.lookAt(0, 0, 0.42);
    dishPivot.add(fStrut);
  }

  hgaGroup.add(dishPivot);
  lander.add(hgaGroup);

  // Low-Gain UHF Blade Antenna
  const uhfGroup = new THREE.Group();
  uhfGroup.position.set(0.62, 1.44, -0.58);
  const uhfMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.035, 0.55, 10),
    oliveDrabMat
  );
  uhfMast.position.y = 0.27;
  uhfGroup.add(uhfMast);
  const uhfTurnstile = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8),
    materials.darkChassis
  );
  uhfTurnstile.position.y = 0.56;
  uhfGroup.add(uhfTurnstile);
  lander.add(uhfGroup);

  // 5. Twin Facsimile Cameras with Slit Sun-Shades & Calibration Targets
  [-0.44, 0.44].forEach((x) => {
    const camTurret = new THREE.Group();
    camTurret.position.set(x, 1.44, 0.48);

    const basePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.13, 0.18, 14),
      oliveDrabMat
    );
    basePedestal.position.y = 0.09;
    camTurret.add(basePedestal);

    const bodyCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.46, 16),
      materials.whiteMLI
    );
    bodyCyl.position.y = 0.4;
    bodyCyl.castShadow = true;
    camTurret.add(bodyCyl);

    // Optical vertical slit baffle & window
    const baffle = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.24, 0.08),
      materials.darkChassis
    );
    baffle.position.set(0, 0.44, 0.09);
    camTurret.add(baffle);

    const lensWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.16, 0.02),
      materials.opticalGlass
    );
    lensWindow.position.set(0, 0.44, 0.13);
    camTurret.add(lensWindow);

    lander.add(camTurret);
  });

  // 6. Meteorology Boom & Sensor Array
  const metGroup = new THREE.Group();
  metGroup.position.set(-0.95, 1.25, 0.45);
  metGroup.rotation.z = 0.35;

  const metMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.028, 1.25, 8),
    materials.silverMetal
  );
  metMast.position.y = 0.62;
  metGroup.add(metMast);

  const windSensorCross = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.38, 6),
    materials.silverMetal
  );
  windSensorCross.rotation.z = Math.PI / 2;
  windSensorCross.position.y = 1.22;
  metGroup.add(windSensorCross);
  lander.add(metGroup);

  // 7. Biology, GCMS & X-Ray Fluorescence Soil Processing Hoppers on Deck
  [-0.2, 0.22].forEach((ix, idx) => {
    const hopperGroup = new THREE.Group();
    hopperGroup.position.set(ix, 1.44, 0.72);

    const funnel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.08, 0.18, 14),
      idx === 0 ? materials.goldFoil : materials.silverMetal
    );
    funnel.position.y = 0.09;
    hopperGroup.add(funnel);

    const grate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.02, 12),
      materials.darkChassis
    );
    grate.position.y = 0.18;
    hopperGroup.add(grate);

    if (idx === 1) hopperGroup.name = 'sample_inlet';
    lander.add(hopperGroup);
  });

  // 8. Articulated 3-Meter Surface Sampler Boom & Backhoe Collector Scoop
  const roboticArm = new THREE.Group();
  roboticArm.name = 'viking_robotic_arm';
  roboticArm.position.set(0, 1.18, 1.18);

  // Gimbaled collector boom housing drum
  const boomHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.38, 14),
    oliveDrabMat
  );
  boomHousing.rotation.z = Math.PI / 2;
  roboticArm.add(boomHousing);

  // Extendable tubular boom shroud
  const upperBoomGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.15, 10);
  upperBoomGeo.rotateX(Math.PI / 3.8);
  const upperBoom = new THREE.Mesh(upperBoomGeo, materials.silverMetal);
  upperBoom.position.set(0, 0.36, 0.42);
  upperBoom.castShadow = true;
  roboticArm.add(upperBoom);

  // Inner rolled-stem stainless steel extension tube
  const forearmGeo = new THREE.CylinderGeometry(0.036, 0.036, 1.35, 10);
  forearmGeo.rotateX(Math.PI / 2.18);
  const forearm = new THREE.Mesh(forearmGeo, materials.silverMetal);
  forearm.position.set(0, 0.46, 1.22);
  forearm.castShadow = true;
  roboticArm.add(forearm);

  // Collector Head Assembly (Scoop + Backhoe Spade + Sieve Lid)
  const scoopGeo = new THREE.BoxGeometry(0.2, 0.12, 0.28);
  const scoop = new THREE.Mesh(scoopGeo, materials.silverMetal);
  scoop.position.set(0, 0.25, 1.82);
  scoop.name = 'viking_scoop';
  scoop.castShadow = true;

  // Front cutting spade lip
  const spade = new THREE.Mesh(
    new THREE.BoxGeometry(0.21, 0.03, 0.1),
    materials.darkChassis
  );
  spade.position.set(0, -0.04, 0.16);
  spade.rotation.x = 0.25;
  scoop.add(spade);

  // Lower backhoe trenching tooth
  const backhoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.1, 0.025),
    rtgOrangeMat
  );
  backhoe.position.set(0, -0.09, -0.04);
  backhoe.rotation.x = 0.3;
  scoop.add(backhoe);

  roboticArm.add(scoop);
  lander.add(roboticArm);

  return { lander, roboticArm, scoop };
}
