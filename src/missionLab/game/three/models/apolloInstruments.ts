import * as THREE from 'three';
import { MaterialLibrary } from '../materials';

/** Apollo Laser Retroreflector Array (LRRR) */
export function createLaserReflector(materials: MaterialLibrary): THREE.Group {
  const reflector = new THREE.Group();
  reflector.name = 'lunar_reflector';

  // 1. Aluminum pallet frame with legs
  const frameGeo = new THREE.BoxGeometry(0.7, 0.12, 0.7);
  const frame = new THREE.Mesh(frameGeo, materials.silverMetal);
  frame.position.y = 0.22;
  frame.castShadow = true;
  reflector.add(frame);

  // 4 folding tripod support legs
  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
  const legPositions = [
    [-0.32, 0.12, -0.32],
    [0.32, 0.12, -0.32],
    [-0.32, 0.12, 0.32],
    [0.32, 0.12, 0.32],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, materials.silverMetal);
    leg.position.set(x, y, z);
    reflector.add(leg);
  });

  // 2. Angled Array Panel (tilted toward Earth at ~26°)
  const panelGeo = new THREE.BoxGeometry(0.62, 0.08, 0.62);
  const panel = new THREE.Mesh(panelGeo, materials.whiteMLI);
  panel.position.set(0, 0.35, 0);
  panel.rotation.x = -Math.PI * 0.14; // Aimed Earthward
  reflector.add(panel);

  // 3. Grid of Corner-Cube Quartz Prisms (10x10 array of fused silica retroreflectors)
  const prismGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.035, 6);
  const prismMat = materials.opticalGlass;
  for (let r = -4; r <= 4; r++) {
    for (let c = -4; c <= 4; c++) {
      const prism = new THREE.Mesh(prismGeo, prismMat);
      prism.position.set(r * 0.058, 0.05, c * 0.058);
      panel.add(prism);
    }
  }

  // 4. Sun-angle shadow dial (Gnomon) used by astronauts to orient it towards Earth
  const gnomonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6);
  const gnomon = new THREE.Mesh(gnomonGeo, materials.darkChassis);
  gnomon.position.set(0.24, 0.14, 0.24);
  panel.add(gnomon);

  // Carrying handle
  const handleGeo = new THREE.TorusGeometry(0.08, 0.01, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, materials.silverMetal);
  handle.position.set(0, 0.28, -0.35);
  handle.rotation.x = Math.PI / 2;
  reflector.add(handle);

  return reflector;
}

/** Apollo 12-style ALSEP Passive Seismic Experiment (PSE) Station */
export function createApolloSeismometerStation(materials: MaterialLibrary): THREE.Group {
  const station = new THREE.Group();
  station.name = 'apollo_seismometer_station';

  // 1. Passive Seismometer Unit with silver/mylar thermal shroud
  const pseUnit = new THREE.Group();
  pseUnit.name = 'seismometer_unit';
  pseUnit.position.set(0, 0, 0);

  // Drum body
  const pseBodyGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.35, 16);
  const pseBody = new THREE.Mesh(pseBodyGeo, materials.silverMetal);
  pseBody.position.y = 0.18;
  pseBody.castShadow = true;
  pseUnit.add(pseBody);

  // Mylar Thermal Skirt / Shroud
  const skirtGeo = new THREE.ConeGeometry(0.55, 0.18, 16, 1, true);
  const skirt = new THREE.Mesh(skirtGeo, materials.goldFoil);
  skirt.position.y = 0.09;
  pseUnit.add(skirt);

  // Leveling bubble and sensor dome
  const domeGeo = new THREE.SphereGeometry(0.12, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const dome = new THREE.Mesh(domeGeo, materials.darkChassis);
  dome.position.y = 0.35;
  pseUnit.add(dome);

  station.add(pseUnit);

  // 2. ALSEP Central Station (transmitter & electronics hub)
  const centralStation = new THREE.Group();
  centralStation.name = 'central_station';
  centralStation.position.set(2.5, 0, -1.0);

  const csBoxGeo = new THREE.BoxGeometry(0.7, 0.5, 0.6);
  const csBox = new THREE.Mesh(csBoxGeo, materials.whiteMLI);
  csBox.position.y = 0.28;
  csBox.castShadow = true;
  centralStation.add(csBox);

  // Directional Helical S-Band Antenna (aimed towards Earth)
  const antennaMastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
  const antennaMast = new THREE.Mesh(antennaMastGeo, materials.silverMetal);
  antennaMast.position.set(0, 0.9, 0);
  antennaMast.rotation.z = -Math.PI * 0.15; // Pointed towards Earth
  centralStation.add(antennaMast);

  const helixGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.35, 12);
  const helix = new THREE.Mesh(helixGeo, materials.silverMetal);
  helix.position.set(-0.15, 1.35, 0);
  helix.rotation.z = -Math.PI * 0.15;
  centralStation.add(helix);

  station.add(centralStation);

  // 3. Flat Mylar Ribbon Cable connecting Seismometer to Central Station
  const cableCurve = new THREE.LineCurve3(
    new THREE.Vector3(0.2, 0.02, 0),
    new THREE.Vector3(2.3, 0.02, -0.9)
  );
  const cableGeo = new THREE.TubeGeometry(cableCurve, 16, 0.02, 6, false);
  const cable = new THREE.Mesh(cableGeo, materials.darkChassis);
  station.add(cable);

  // 4. SNAP-27 RTG Power Cask
  const rtgGroup = new THREE.Group();
  rtgGroup.position.set(3.8, 0, 0.5);
  const rtgGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12);
  const rtg = new THREE.Mesh(rtgGeo, materials.silverMetal);
  rtg.position.y = 0.25;
  rtgGroup.add(rtg);

  // RTG cooling fins
  for (let i = 0; i < 8; i++) {
    const finGeo = new THREE.BoxGeometry(0.01, 0.4, 0.1);
    const fin = new THREE.Mesh(finGeo, materials.darkChassis);
    fin.position.y = 0.25;
    fin.rotation.y = (i * Math.PI) / 4;
    rtgGroup.add(fin);
  }
  station.add(rtgGroup);

  return station;
}
