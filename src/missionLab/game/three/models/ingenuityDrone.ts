import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

export function createIngenuityDrone(materials: MaterialLibrary): {
  drone: THREE.Group;
  topRotor: THREE.Group;
  bottomRotor: THREE.Group;
} {
  const drone = new THREE.Group();
  drone.name = 'ingenuity_helicopter';

  // 1. Kapton-Insulated Avionics Fuselage Box (13.6 x 19.5 x 16.3 cm scaled)
  const cubeGeo = new THREE.BoxGeometry(0.24, 0.23, 0.26);
  const cube = new THREE.Mesh(cubeGeo, materials.goldFoil);
  cube.position.y = 0.33;
  cube.castShadow = true;
  cube.receiveShadow = true;
  drone.add(cube);

  // Carbon-fiber corner structural frames on fuselage box
  [-0.12, 0.12].forEach((cx) => {
    [-0.13, 0.13].forEach((cz) => {
      const frameEdge = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.235, 0.015),
        materials.carbonFiber
      );
      frameEdge.position.set(cx, 0.33, cz);
      drone.add(frameEdge);
    });
  });

  // Forward-angled Return-to-Earth (RTE) 13MP Color Camera window + Nadir Navcam + Garmin LIDAR Altimeter
  const rteBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.026, 0.03, 12),
    materials.darkChassis
  );
  rteBezel.rotation.x = Math.PI * 0.38;
  rteBezel.position.set(0, 0.27, 0.135);
  drone.add(rteBezel);

  const rteLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.034, 12),
    materials.opticalGlass
  );
  rteLens.rotation.x = Math.PI * 0.38;
  rteLens.position.set(0, 0.27, 0.137);
  drone.add(rteLens);

  // Nadir Black & White Navigation Camera + LIDAR window on belly
  [-0.04, 0.04].forEach((bx, i) => {
    const bellySensor = new THREE.Mesh(
      new THREE.CylinderGeometry(i === 0 ? 0.022 : 0.016, i === 0 ? 0.022 : 0.016, 0.03, 10),
      materials.opticalGlass
    );
    bellySensor.position.set(bx, 0.21, 0.02);
    drone.add(bellySensor);
  });

  // 2. Four Ultra-Light Carbon-Fiber Landing Legs with Folding Hinges & Compliant Foot Pegs
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach((angle) => {
    const legGroup = new THREE.Group();
    legGroup.rotation.y = angle;

    // Upper deployment hinge bracket attached to fuselage corner
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.035, 0.045),
      materials.silverMetal
    );
    bracket.position.set(0, 0.29, 0.15);
    legGroup.add(bracket);

    // Tapered hollow carbon-fiber tube leg (0.384 m length scaled)
    const tubeGeo = new THREE.CylinderGeometry(0.01, 0.008, 0.56, 8);
    tubeGeo.rotateX(-Math.PI * 0.245);
    const tube = new THREE.Mesh(tubeGeo, materials.carbonFiber);
    tube.position.set(0, 0.155, 0.28);
    tube.castShadow = true;
    legGroup.add(tube);

    // Secondary support strut near hinge
    const braceGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.18, 6);
    braceGeo.rotateX(-Math.PI * 0.36);
    const brace = new THREE.Mesh(braceGeo, materials.silverMetal);
    brace.position.set(0, 0.23, 0.21);
    legGroup.add(brace);

    // Damped spherical footpad + flexible ground-contact peg
    const footpad = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 10, 10),
      materials.silverMetal
    );
    footpad.position.set(0, 0.02, 0.46);
    legGroup.add(footpad);

    drone.add(legGroup);
  });

  // 3. Coaxial Rotor Mast, Swashplates & Pitch Control Links
  const mastGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.54, 12);
  const mast = new THREE.Mesh(mastGeo, materials.darkChassis);
  mast.position.y = 0.68;
  drone.add(mast);

  // Lower & Upper Swashplate assemblies
  [0.54, 0.72].forEach((sy) => {
    const swash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.052, 0.018, 14),
      materials.silverMetal
    );
    swash.position.y = sy;
    drone.add(swash);

    // Pitch control rods
    [-0.038, 0.038].forEach((px) => {
      const link = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.075, 6),
        materials.silverMetal
      );
      link.position.set(px, sy + 0.04, 0);
      drone.add(link);
    });
  });

  // Helper to build sculpted high-solidity carbon-fiber Mars airfoil blade
  const createAirfoilBlade = (direction: 1 | -1, pitchSign: 1 | -1) => {
    const bladeGroup = new THREE.Group();

    // Root cuff
    const cuff = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.018, 0.042),
      materials.silverMetal
    );
    cuff.position.x = direction * 0.07;
    bladeGroup.add(cuff);

    // Main Wide-Chord Airfoil Section
    const mainSpan = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.01, 0.115),
      materials.carbonFiber
    );
    mainSpan.position.set(direction * 0.31, 0, 0);
    mainSpan.rotation.x = pitchSign * 0.18;
    mainSpan.castShadow = true;
    bladeGroup.add(mainSpan);

    // Tapered Outer Tip Section
    const tipSpan = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.008, 0.082),
      materials.carbonFiber
    );
    tipSpan.position.set(direction * 0.62, 0, -0.01);
    tipSpan.rotation.x = pitchSign * 0.12;
    tipSpan.castShadow = true;
    bladeGroup.add(tipSpan);

    return bladeGroup;
  };

  // 4. Lower Coaxial Rotor Hub & Counter-Rotating Blades (2,537 RPM)
  const bottomRotor = new THREE.Group();
  bottomRotor.position.y = 0.62;

  const hub1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.045, 14),
    materials.darkChassis
  );
  bottomRotor.add(hub1);
  bottomRotor.add(createAirfoilBlade(-1, 1));
  bottomRotor.add(createAirfoilBlade(1, -1));
  drone.add(bottomRotor);

  // 5. Upper Coaxial Rotor Hub & Counter-Rotating Blades
  const topRotor = new THREE.Group();
  topRotor.position.y = 0.8;

  const hub2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.045, 14),
    materials.darkChassis
  );
  topRotor.add(hub2);
  topRotor.add(createAirfoilBlade(-1, -1));
  topRotor.add(createAirfoilBlade(1, 1));
  drone.add(topRotor);

  // 6. Top Rectangular Solar Array & 900 MHz ZigBee Radio Monopole Antenna
  const solarSupport = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.025, 0.06, 10),
    materials.silverMetal
  );
  solarSupport.position.y = 0.91;
  drone.add(solarSupport);

  const solarFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.014, 0.18),
    materials.carbonFiber
  );
  solarFrame.position.y = 0.945;
  solarFrame.castShadow = true;
  drone.add(solarFrame);

  const solarCells = new THREE.Mesh(
    new THREE.BoxGeometry(0.41, 0.016, 0.155),
    materials.solarPanel
  );
  solarCells.position.y = 0.947;
  drone.add(solarCells);

  // Vertical monopole antenna communicating with Perseverance Rover base station
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.17, 6),
    materials.silverMetal
  );
  antenna.position.set(0.14, 1.03, 0);
  drone.add(antenna);

  return { drone, topRotor, bottomRotor };
}
