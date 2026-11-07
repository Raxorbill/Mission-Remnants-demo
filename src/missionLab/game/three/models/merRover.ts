import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createMERRover(
  materials: MaterialLibrary,
  roverName: 'Spirit' | 'Opportunity' = 'Spirit'
): {
  rover: THREE.Group;
  wheels: THREE.Mesh[];
  iddArm: THREE.Group;
  ratTool: THREE.Mesh;
  pancamHead: THREE.Group;
} {
  const rover = new THREE.Group();
  rover.name = `mer_rover_${roverName.toLowerCase()}`;

  // 1. Warm Electronics Box (WEB) Core Chassis (Gold-Kapton multi-layer insulation + carbon composite top)
  const chassisGeo = new THREE.BoxGeometry(0.88, 0.44, 1.12);
  const chassis = new THREE.Mesh(chassisGeo, materials.goldFoil);
  chassis.position.y = 0.56;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  rover.add(chassis);

  // Front & Rear structuralbulkheads
  const frontPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.36, 0.06),
    materials.darkChassis
  );
  frontPlate.position.set(0, 0.55, 0.56);
  rover.add(frontPlate);

  // Front Hazcam stereo lens pair mounted low on chassis
  [-0.14, 0.14].forEach((hx) => {
    const hazcam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8),
      materials.opticalGlass
    );
    hazcam.rotation.x = Math.PI / 2;
    hazcam.position.set(hx, 0.52, 0.6);
    rover.add(hazcam);
  });

  // 2. Iconic Gull-Wing Multi-Panel Solar Array Deck
  const solarGroup = new THREE.Group();
  solarGroup.position.y = 0.8;

  // Center main solar deck
  const centerPanel = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.035, 1.32),
    materials.solarPanel
  );
  centerPanel.castShadow = true;
  solarGroup.add(centerPanel);

  // Left & Right Gull-Wing Trapezoidal/Triangular Outrigger Wings
  [-1, 1].forEach((dir) => {
    const wingGroup = new THREE.Group();
    wingGroup.position.set(dir * 0.84, -0.02, 0.02);
    wingGroup.rotation.z = -dir * 0.11;

    const mainWing = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.028, 1.18),
      materials.solarPanel
    );
    mainWing.castShadow = true;
    wingGroup.add(mainWing);

    // Metallic wing frame trim
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.018, 1.2),
      materials.silverMetal
    );
    trim.position.y = -0.012;
    wingGroup.add(trim);

    solarGroup.add(wingGroup);
  });

  // Rear solar tail flap
  const rearFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.028, 0.46),
    materials.solarPanel
  );
  rearFlap.position.set(0, -0.02, -0.84);
  rearFlap.rotation.x = -0.1;
  solarGroup.add(rearFlap);

  // MarsDial Calibration Sundial on rear corner of deck
  const sundialBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12),
    materials.silverMetal
  );
  sundialBase.position.set(0.42, 0.028, -0.52);
  const gnomon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6),
    materials.goldFoil
  );
  gnomon.position.y = 0.025;
  sundialBase.add(gnomon);
  solarGroup.add(sundialBase);

  rover.add(solarGroup);

  // 3. Complete 6-Wheel Rocker-Bogie Titanium Suspension & Machined Cleated Wheels
  const wheels: THREE.Mesh[] = [];
  const wheelPositions: [number, number, number][] = [
    [-0.82, 0.2, 0.72],  // Front Left
    [0.82, 0.2, 0.72],   // Front Right
    [-0.88, 0.2, 0.0],   // Mid Left
    [0.88, 0.2, 0.0],    // Mid Right
    [-0.82, 0.2, -0.72], // Rear Left
    [0.82, 0.2, -0.72],  // Rear Right
  ];

  // Rocker-Bogie tubular titanium linkage on both sides
  [-1, 1].forEach((side) => {
    const sx = side * 0.64;
    // Main Rocker Arm (connects chassis pivot to front wheel & rear bogie pivot)
    const frontRocker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.82, 8),
      materials.silverMetal
    );
    frontRocker.position.set(sx, 0.44, 0.42);
    frontRocker.rotation.x = Math.PI * 0.34;
    rover.add(frontRocker);

    // Rear Bogie Arm
    const rearBogie = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.78, 8),
      materials.silverMetal
    );
    rearBogie.position.set(sx, 0.36, -0.36);
    rearBogie.rotation.x = -Math.PI * 0.42;
    rover.add(rearBogie);

    // Pivot joint hub
    const pivotHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.12, 12),
      materials.darkChassis
    );
    pivotHub.rotation.z = Math.PI / 2;
    pivotHub.position.set(sx, 0.56, 0.08);
    rover.add(pivotHub);
  });

  wheelPositions.forEach(([x, y, z]) => {
    // Outer tire drum
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, materials.darkChassis);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;

    // Inner machined aluminum hub with spiral flexure spokes
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.165, 12),
      materials.silverMetal
    );
    hub.rotation.z = Math.PI / 2;
    wheel.add(hub);

    // 10 Cleat treads around circumference so rotation is clearly visible
    for (let c = 0; c < 10; c++) {
      const ca = (c * Math.PI * 2) / 10;
      const cleat = new THREE.Mesh(
        new THREE.BoxGeometry(0.162, 0.016, 0.022),
        materials.silverMetal
      );
      cleat.position.set(0, Math.cos(ca) * 0.2, Math.sin(ca) * 0.2);
      cleat.rotation.x = ca;
      wheel.add(cleat);
    }

    rover.add(wheel);
    wheels.push(wheel);

    // Vertical steering / bogie drop strut
    const dropStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.32, 8),
      materials.silverMetal
    );
    dropStrut.position.set(x > 0 ? x - 0.14 : x + 0.14, 0.34, z);
    rover.add(dropStrut);
  });

  // 4. Pancam Mast Assembly (PMA) with Pancams, Navcams & Mini-TES
  const mastX = 0.28;
  const mastZ = 0.44;
  const mastGeo = new THREE.CylinderGeometry(0.036, 0.044, 0.96, 12);
  const mast = new THREE.Mesh(mastGeo, materials.silverMetal);
  mast.position.set(mastX, 1.28, mastZ);
  mast.castShadow = true;
  rover.add(mast);

  const pancamHead = new THREE.Group();
  pancamHead.position.set(mastX, 1.78, mastZ);

  // Main stereo camera bar
  const camBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.1, 0.12),
    materials.whiteMLI
  );
  camBar.castShadow = true;
  pancamHead.add(camBar);

  // Outer Pancam High-Resolution Stereo Eyes + Inner Wide-Angle Navcam Eyes
  [-0.14, -0.06, 0.06, 0.14].forEach((lx, i) => {
    const isPancam = i === 0 || i === 3;
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(isPancam ? 0.026 : 0.02, isPancam ? 0.026 : 0.02, 0.06, 10),
      materials.darkChassis
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(lx, isPancam ? 0.01 : -0.01, 0.065);
    pancamHead.add(barrel);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(isPancam ? 0.02 : 0.015, isPancam ? 0.02 : 0.015, 0.01, 10),
      materials.opticalGlass
    );
    glass.rotation.x = Math.PI / 2;
    glass.position.set(lx, isPancam ? 0.01 : -0.01, 0.095);
    pancamHead.add(glass);
  });

  rover.add(pancamHead);

  // 5. Communications Package: High-Gain X-Band Paddle & UHF Low-Gain Monopole
  const hgaGroup = new THREE.Group();
  hgaGroup.position.set(-0.28, 0.92, -0.25);
  const hgaPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.22, 8),
    materials.silverMetal
  );
  hgaGroup.add(hgaPedestal);
  const hgaDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.03, 18),
    materials.whiteMLI
  );
  hgaDish.position.y = 0.14;
  hgaDish.rotation.x = -0.45;
  hgaGroup.add(hgaDish);
  rover.add(hgaGroup);

  const lgaMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.015, 0.62, 8),
    materials.darkChassis
  );
  lgaMast.position.set(-0.36, 1.12, -0.52);
  rover.add(lgaMast);

  // 6. 5-DOF Instrument Deployment Device (IDD) Robotic Arm & 4-Instrument Turret (RAT, MI, MB, APXS)
  const iddArm = new THREE.Group();
  iddArm.name = 'idd_arm';
  iddArm.position.set(-0.08, 0.44, 0.62);

  const shoulderAzimuth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.12, 10),
    materials.darkChassis
  );
  iddArm.add(shoulderAzimuth);

  const armBone1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.48, 10),
    materials.silverMetal
  );
  armBone1.position.set(0, 0.08, 0.22);
  armBone1.rotation.x = Math.PI * 0.36;
  armBone1.castShadow = true;
  iddArm.add(armBone1);

  const elbowJoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 10, 10),
    materials.darkChassis
  );
  elbowJoint.position.set(0, 0.16, 0.42);
  iddArm.add(elbowJoint);

  const armBone2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.46, 10),
    materials.silverMetal
  );
  armBone2.position.set(0, -0.02, 0.52);
  armBone2.rotation.x = -Math.PI * 0.24;
  armBone2.castShadow = true;
  iddArm.add(armBone2);

  // Cross-shaped Turret carrying RAT, Microscopic Imager, Mössbauer & APXS
  const ratTool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.11, 14),
    materials.darkChassis
  );
  ratTool.rotation.x = Math.PI / 2;
  ratTool.position.set(0, -0.22, 0.68);
  ratTool.name = 'rat_grinder';

  // RAT Diamond Grinding Bit + Dust Brush
  const bit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12),
    materials.silverMetal
  );
  bit.position.set(0, 0.065, 0);
  ratTool.add(bit);

  // APXS & Microscopic Imager side barrels on turret
  const apxsHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.09, 10),
    materials.goldFoil
  );
  apxsHead.rotation.z = Math.PI / 2;
  apxsHead.position.set(0.07, 0, 0);
  ratTool.add(apxsHead);

  const miLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.028, 0.08, 10),
    materials.silverMetal
  );
  miLens.rotation.z = -Math.PI / 2;
  miLens.position.set(-0.07, 0, 0);
  ratTool.add(miLens);

  iddArm.add(ratTool);
  rover.add(iddArm);

  return { rover, wheels, iddArm, ratTool, pancamHead };
}
