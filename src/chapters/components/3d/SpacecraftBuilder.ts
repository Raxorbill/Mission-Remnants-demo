import * as THREE from 'three';
import {
  generateFoilTexture,
  generateFoilNormalMap,
  generatePanelNormalMap,
  generateBetaClothTexture,
  generateSolarTexture,
} from './SpaceTextures';

/**
 * Displaces vertices of a subdivided geometry along their normals using deterministic
 * multi-frequency trigonometric interference to produce realistic 3D crinkled Kapton / Beta-cloth
 * thermal blanket folds instead of flat cartoon primitives.
 */
function crinkleGeometry(geom: THREE.BufferGeometry, amplitude = 0.018, frequency = 11.0): THREE.BufferGeometry {
  const pos = geom.attributes.position;
  geom.computeVertexNormals();
  const norm = geom.attributes.normal;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const wave1 = Math.sin(vx * frequency + vy * (frequency * 1.3) + vz * (frequency * 0.9));
    const wave2 = Math.cos(vx * (frequency * 2.4) - vz * (frequency * 2.1) + vy * 4.7) * 0.5;
    const ridge = (1.0 - Math.abs(wave1)) * 0.7 + wave2 * 0.3;
    const disp = (ridge - 0.35) * amplitude;

    pos.setXYZ(
      i,
      vx + norm.getX(i) * disp,
      vy + norm.getY(i) * disp,
      vz + norm.getZ(i) * disp
    );
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

function createCrinkledBox(w: number, h: number, d: number, amp = 0.014): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(w, h, d, 14, 10, 14);
  return crinkleGeometry(geom, amp, 12.0);
}

function createCrinkledCylinder(
  rTop: number,
  rBottom: number,
  h: number,
  radialSegs = 36,
  heightSegs = 12,
  amp = 0.012
): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(rTop, rBottom, h, radialSegs, heightSegs);
  return crinkleGeometry(geom, amp, 10.5);
}

export function createAerospaceMaterials() {
  const foilTexture = generateFoilTexture();
  const foilNormal = generateFoilNormalMap();
  const panelNormal = generatePanelNormalMap();
  const betaClothTex = generateBetaClothTexture();
  const solarTexture = generateSolarTexture();

  return {
    mylar: new THREE.MeshPhysicalMaterial({
      color: 0xffcf54,
      map: foilTexture,
      normalMap: foilNormal,
      normalScale: new THREE.Vector2(1.45, 1.45),
      metalness: 0.92,
      roughness: 0.24,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
      reflectivity: 1.0,
      envMapIntensity: 1.95,
    }),
    silver: new THREE.MeshPhysicalMaterial({
      color: 0xd8dee6,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      metalness: 0.94,
      roughness: 0.2,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.65,
    }),
    darkMetal: new THREE.MeshPhysicalMaterial({
      color: 0x22262c,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      metalness: 0.86,
      roughness: 0.34,
      clearcoat: 0.2,
      envMapIntensity: 1.35,
    }),
    whitePaint: new THREE.MeshPhysicalMaterial({
      color: 0xe8eaef,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.35, 0.35),
      metalness: 0.12,
      roughness: 0.42,
      clearcoat: 0.45,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1.25,
    }),
    whiteCloth: new THREE.MeshPhysicalMaterial({
      color: 0xdedfe4,
      map: betaClothTex,
      normalMap: foilNormal,
      normalScale: new THREE.Vector2(0.65, 0.65),
      roughness: 0.78,
      metalness: 0.04,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffffff),
    }),
    solar: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: solarTexture,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.2, 0.2),
      metalness: 0.65,
      roughness: 0.14,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.85,
    }),
    prism: new THREE.MeshPhysicalMaterial({
      color: 0xd8f3ff,
      metalness: 0.15,
      roughness: 0.04,
      transmission: 0.92,
      ior: 1.46,
      thickness: 0.35,
      clearcoat: 1.0,
      envMapIntensity: 2.2,
    }),
    carbon: new THREE.MeshPhysicalMaterial({
      color: 0x141619,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      metalness: 0.45,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.22,
    }),
    copper: new THREE.MeshPhysicalMaterial({
      color: 0xc86d42,
      normalMap: foilNormal,
      normalScale: new THREE.Vector2(0.4, 0.4),
      metalness: 0.92,
      roughness: 0.22,
      clearcoat: 0.5,
      envMapIntensity: 1.75,
    }),
    lensGlass: new THREE.MeshPhysicalMaterial({
      color: 0x102542,
      emissive: 0x06152d,
      emissiveIntensity: 0.35,
      metalness: 0.2,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
    }),
    rtgFin: new THREE.MeshPhysicalMaterial({
      color: 0x1d1f24,
      normalMap: panelNormal,
      normalScale: new THREE.Vector2(0.6, 0.6),
      metalness: 0.78,
      roughness: 0.48,
    }),
  };
}

export function buildSpacecraft(
  id: string,
  mats: ReturnType<typeof createAerospaceMaterials>
): { group: THREE.Group; animators: ((t: number) => void)[] } {
  const group = new THREE.Group();
  const animators: ((t: number) => void)[] = [];

  if (id === 'apollo-11-lrrr') {
    const base = new THREE.Mesh(createCrinkledBox(2.2, 0.2, 2.2, 0.011), mats.mylar);
    base.position.y = 0.1;
    base.userData = { partName: 'Thermal Base Cradle', partDesc: 'Crinkled Kapton gold thermal blanket insulating the machined aluminum pallet against ±140°C lunar swings.' };
    group.add(base);

    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.25, 1.88), mats.darkMetal);
    tray.position.y = 0.28;
    tray.rotation.x = Math.PI / 8;
    tray.userData = { partName: 'Retroreflector Array Tray', partDesc: 'Precision CNC-machined 6061-T6 aluminum array housing 100 fused-silica corner-cube prisms.' };
    group.add(tray);

    // Machined perimeter frame & alignment sun-compass gnomon
    const frameRim = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.06, 1.94), mats.silver);
    frameRim.position.set(0, 0.38, 0);
    frameRim.rotation.x = Math.PI / 8;
    group.add(frameRim);

    const gridGroup = new THREE.Group();
    gridGroup.position.set(0, 0.34, 0);
    gridGroup.rotation.x = Math.PI / 8;

    const cavityGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.06, 16);
    const prismGeo = new THREE.CylinderGeometry(0.056, 0.01, 0.05, 6);
    const tabGeo = new THREE.TorusGeometry(0.058, 0.006, 8, 12);

    for (let x = 0; x < 10; x++) {
      for (let z = 0; z < 10; z++) {
        const px = -0.765 + x * 0.17;
        const pz = -0.765 + z * 0.17;

        const cavity = new THREE.Mesh(cavityGeo, mats.silver);
        cavity.position.set(px, 0.06, pz);
        gridGroup.add(cavity);

        const p = new THREE.Mesh(prismGeo, mats.prism);
        p.position.set(px, 0.08, pz);
        p.userData = { partName: 'Fused Silica Corner-Cube Prism', partDesc: 'Suprasil-1 high-purity quartz triple-mirror prism reflecting incoming Earth laser photons back along the exact incident vector.' };
        gridGroup.add(p);

        const retainer = new THREE.Mesh(tabGeo, mats.whitePaint);
        retainer.rotation.x = Math.PI / 2;
        retainer.position.set(px, 0.092, pz);
        gridGroup.add(retainer);
      }
    }
    group.add(gridGroup);

    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.04, 1.9), mats.whitePaint);
    cover.position.set(0, 1.05, -0.88);
    cover.rotation.x = -Math.PI / 2.8;
    cover.userData = { partName: 'Protective Dust Cover', partDesc: 'Teflon-coated protective lid popped open via lanyard after Lunar Module Ascent Stage liftoff.' };
    group.add(cover);

    // Elevation jack crank + bubble level + sun compass
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.85, 16), mats.silver);
    handle.position.set(1.12, 0.4, 0);
    handle.rotation.z = Math.PI / 4;
    handle.userData = { partName: 'Astronaut Deployment Handle', partDesc: 'EVA universal handling tool socket used by Neil Armstrong to level and align the pallet toward Earth.' };
    group.add(handle);

    const gnomonBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 20), mats.silver);
    gnomonBase.position.set(-0.95, 0.25, 0.85);
    group.add(gnomonBase);
    const gnomonPin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 12), mats.copper);
    gnomonPin.position.set(-0.95, 0.37, 0.85);
    gnomonPin.userData = { partName: 'Solar Alignment Gnomon', partDesc: 'Shadow-casting pin allowing precise azimuthal alignment during EVA deployment.' };
    group.add(gnomonPin);
  } else if (id === 'apollo-pse') {
    const skirt = new THREE.Mesh(
      createCrinkledCylinder(1.25, 1.85, 0.38, 48, 12, 0.022),
      mats.mylar
    );
    skirt.position.y = 0.19;
    skirt.userData = { partName: '20-Layer Aluminized Mylar Skirt', partDesc: 'Crinkled multi-layer thermal shroud draped over the lunar regolith to damp ±150°C day-night ground temperature spikes.' };
    group.add(skirt);

    // Concentric stitched Mylar rings
    for (let r = 1.38; r <= 1.78; r += 0.18) {
      const seamRing = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 48), mats.copper);
      seamRing.rotation.x = Math.PI / 2;
      seamRing.position.y = 0.12 + (1.85 - r) * 0.25;
      group.add(seamRing);
    }

    const body = new THREE.Mesh(
      createCrinkledCylinder(0.62, 0.62, 0.92, 36, 14, 0.014),
      mats.mylar
    );
    body.position.y = 0.66;
    body.userData = { partName: 'Beryllium Seismometer Cylinder', partDesc: 'Gold Kapton-wrapped beryllium pressure vessel containing 3 long-period and 1 short-period vertical seismic sensors.' };
    group.add(body);

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.08, 32), mats.silver);
    topCap.position.y = 1.14;
    topCap.userData = { partName: 'Top Thermal Mirror Plate', partDesc: 'Polished specular radiator disc rejecting direct solar flux at lunar noon.' };
    group.add(topCap);

    // Three leveling legs with footpads
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 12), mats.silver);
      leg.position.set(Math.cos(angle) * 0.72, 0.32, Math.sin(angle) * 0.72);
      leg.rotation.z = -Math.cos(angle) * 0.25;
      leg.rotation.x = Math.sin(angle) * 0.25;
      group.add(leg);
    }

    // Ribbon cable to ALSEP Central Station
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, 0.35, 0),
      new THREE.Vector3(1.1, 0.12, 0.25),
      new THREE.Vector3(1.75, 0.05, 0.55),
      new THREE.Vector3(2.3, 0.04, 0.3),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 24, 0.025, 10, false), mats.copper);
    cable.userData = { partName: 'ALSEP Flat-Conductor Ribbon Cable', partDesc: 'Kapton-insulated multi-conductor telemetry harness connecting the seismometer to the ALSEP Central Station.' };
    group.add(cable);

    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 12), mats.silver);
    boom.position.set(0, 1.75, 0);
    boom.userData = { partName: 'S-Band Telemetry Mast', partDesc: 'Vertical sensor alignment mast and thermal sensor rod.' };
    group.add(boom);
  } else if (id === 'viking-lander') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.65, 6), mats.whitePaint);
    body.position.y = 0.92;
    body.userData = { partName: 'Hexagonal Lander Bus', partDesc: 'Six-sided machined aluminum & titanium thermally insulated equipment bay housing GCMS, biology ovens, and guidance computers.' };
    group.add(body);

    // Gold Kapton side thermal blankets on alternating hex faces
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Math.PI / 6;
      const panel = new THREE.Mesh(
        createCrinkledBox(1.18, 0.52, 0.06, 0.012),
        i % 2 === 0 ? mats.mylar : mats.whiteCloth
      );
      panel.position.set(Math.cos(angle) * 1.24, 0.92, Math.sin(angle) * 1.24);
      panel.rotation.y = -angle + Math.PI / 2;
      panel.userData = { partName: 'Multi-Layer Thermal Blanket', partDesc: 'Hand-stitched Dacron and aluminized Kapton insulation blanket protecting internal laboratories.' };
      group.add(panel);
    }

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGroup = new THREE.Group();

      const strutMain = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 1.45, 16), mats.silver);
      strutMain.position.set(1.42, 0.48, 0);
      strutMain.rotation.z = Math.PI / 5.5;
      strutMain.userData = { partName: 'Honeycomb Shock-Absorbing Leg', partDesc: 'Crushable aluminum honeycomb attenuator strut absorbing Chryse Planitia touchdown kinetic energy.' };
      legGroup.add(strutMain);

      // Secondary A-frame struts
      const strutLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.2, 12), mats.darkMetal);
      strutLeft.position.set(1.38, 0.55, 0.28);
      strutLeft.rotation.z = Math.PI / 5;
      strutLeft.rotation.x = -0.22;
      legGroup.add(strutLeft);

      const strutRight = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.2, 12), mats.darkMetal);
      strutRight.position.set(1.38, 0.55, -0.28);
      strutRight.rotation.z = Math.PI / 5;
      strutRight.rotation.x = 0.22;
      legGroup.add(strutRight);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.1, 24), mats.darkMetal);
      pad.position.set(1.82, 0.05, 0);
      pad.userData = { partName: 'Circular Landing Footpad', partDesc: 'Broad aluminum footpad preventing sinkage into fine Martian drift material.' };
      legGroup.add(pad);

      // Terminal descent hydrazine thruster cluster
      const engineShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.24, 18), mats.silver);
      engineShroud.position.set(1.32, 0.85, 0);
      engineShroud.userData = { partName: '18-Nozzle Terminal Descent Engine', partDesc: 'throttlable monopropellant hydrazine engine cluster with 18 small nozzles to minimize soil erosion during landing.' };
      legGroup.add(engineShroud);

      legGroup.rotation.y = angle;
      group.add(legGroup);
    }

    // Two SNAP-19 RTG Windscreen Covers (Beta cloth + finned domes)
    for (const side of [-0.55, 0.55]) {
      const rtgCover = new THREE.Mesh(
        createCrinkledCylinder(0.26, 0.3, 0.68, 24, 10, 0.01),
        mats.whiteCloth
      );
      rtgCover.position.set(-0.2, 1.56, side);
      rtgCover.userData = { partName: 'SNAP-19 RTG Windscreen Shroud', partDesc: 'Insulated windscreen enclosing the plutonium-238 radioisotope thermoelectric generators and waste-heat plumbing.' };
      group.add(rtgCover);
    }

    // Twin Facsimile Camera Turrets
    for (const camZ of [-0.42, 0.42]) {
      const camCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.52, 24), mats.whitePaint);
      camCyl.position.set(0.75, 1.5, camZ);
      camCyl.userData = { partName: 'Viking Facsimile Camera', partDesc: 'Mechanical scanning-mirror photodiode camera that captured humanity’s first high-resolution surface panoramas of Mars.' };
      group.add(camCyl);

      const camWindow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.24, 0.08), mats.lensGlass);
      camWindow.position.set(0.86, 1.54, camZ);
      group.add(camWindow);
    }

    const dishGroup = new THREE.Group();
    dishGroup.position.set(-0.52, 1.65, 0);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.76, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2.4),
      mats.whitePaint
    );
    dish.material.side = THREE.DoubleSide;
    dish.rotation.x = Math.PI - 0.5;
    dish.userData = { partName: 'Parabolic S-Band High-Gain Dish', partDesc: 'Computer-steered parabolic antenna for direct Earth-to-Mars S-band communication and X-band Doppler tracking.' };
    dishGroup.add(dish);

    const feedHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.07, 0.45, 16), mats.silver);
    feedHorn.position.set(0, 0.22, 0.14);
    feedHorn.rotation.x = -0.5;
    dishGroup.add(feedHorn);
    group.add(dishGroup);

    // Extendable Surface Sampler Collector Arm
    const armBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.85, 16), mats.mylar);
    armBoom.rotation.z = Math.PI / 2.45;
    armBoom.position.set(1.55, 0.65, 0.12);
    armBoom.userData = { partName: 'Retractable Surface Sampler Boom', partDesc: 'Furlable stainless-steel ribbon tube boom with backhoe collector head for trenching Martian regolith.' };
    group.add(armBoom);

    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.18), mats.silver);
    scoop.position.set(2.4, 0.22, 0.12);
    scoop.userData = { partName: 'Collector Head & Sieve', partDesc: 'Articulated scoop with vibrating screen that delivered Martian soil into the three biological experiment ovens.' };
    group.add(scoop);

    // Meteorology boom
    const metBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 1.1, 12), mats.silver);
    metBoom.position.set(0.3, 1.5, -1.15);
    metBoom.rotation.x = -0.35;
    metBoom.userData = { partName: 'Viking Meteorology Mast', partDesc: 'Hot-film anemometer and thermocouple array measuring Martian wind speed, direction, and ambient temperature.' };
    group.add(metBoom);

    animators.push((t) => {
      dishGroup.rotation.y = Math.sin(t * 0.5) * 0.3;
    });
  } else if (id === 'spirit-opportunity') {
    const body = new THREE.Mesh(createCrinkledBox(1.22, 0.52, 1.44, 0.015), mats.mylar);
    body.position.y = 0.82;
    body.userData = { partName: 'Warm Electronics Box (WEB)', partDesc: 'Aerogel-insulated carbon-composite chassis clad in crinkled gold Kapton film to keep batteries and RAD6000 CPU above -40°C.' };
    group.add(body);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.05, 1.62), mats.solar);
    deck.position.y = 1.1;
    deck.userData = { partName: 'Core Deck Solar Array', partDesc: 'Triple-junction Gallium Arsenide solar cells mounted on the rover equipment deck.' };
    group.add(deck);

    // Winged solar panels (characteristic triangular MER gull-wings + rear panel)
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.04, 1.38), mats.solar);
      wing.position.set(side * 1.24, 1.08, -0.05);
      wing.rotation.z = -side * 0.05;
      wing.userData = { partName: 'Deployable Gull-Wing Solar Array', partDesc: 'Fold-out photovoltaic wing generating up to 900 Watt-hours per Martian sol prior to dust accumulation.' };
      group.add(wing);

      const wingTrim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.045, 0.04), mats.silver);
      wingTrim.position.set(side * 1.24, 1.08, 0.64);
      group.add(wingTrim);
    }

    const rearWing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.85), mats.solar);
    rearWing.position.set(0, 1.08, -1.15);
    rearWing.userData = { partName: 'Aft Solar Array Flap', partDesc: 'Rear solar deck extension completing the classic Mars Exploration Rover delta silhouette.' };
    group.add(rearWing);

    // Pancam Mast Assembly (PMA) + Head with stereo Pancam & Navcam lenses
    const mastGroup = new THREE.Group();
    mastGroup.position.set(0.32, 1.1, 0.52);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 1.12, 20), mats.whitePaint);
    mast.position.y = 0.56;
    mast.userData = { partName: 'Pancam Mast Assembly (PMA)', partDesc: 'Carbon-composite periscope mast elevating the stereo cameras and Mini-TES infrared spectrometer 1.5 meters above the surface.' };
    mastGroup.add(mast);

    const headGroup = new THREE.Group();
    headGroup.position.y = 1.14;
    const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.28), mats.whitePaint);
    headBox.userData = { partName: 'Pancam & Navcam Stereo Camera Bar', partDesc: '30 cm stereo baseline camera bar housing twin 1024×1024 CCD Panoramic Cameras with 8-position filter wheels and wide-angle Navigation Cameras.' };
    headGroup.add(headBox);

    for (const lx of [-0.2, -0.09, 0.09, 0.2]) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.08, 16), mats.silver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(lx, 0.02, 0.15);
      headGroup.add(barrel);

      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16), mats.lensGlass);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(lx, 0.02, 0.19);
      lens.userData = { partName: 'Coated Optical Camera Lens', partDesc: 'Sapphire-windowed stereo optics for multispectral mineralogical imaging and hazard navigation.' };
      headGroup.add(lens);
    }
    mastGroup.add(headGroup);
    group.add(mastGroup);

    // High-gain & low-gain antennas + Sundial calibration target
    const hgaDish = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24), mats.whitePaint);
    hgaDish.position.set(-0.35, 1.28, -0.35);
    hgaDish.rotation.x = 0.45;
    hgaDish.userData = { partName: 'X-Band High-Gain Flat-Plate Antenna', partDesc: 'Gimbaled phased-array antenna providing direct Earth communication at up to 28 kbps.' };
    group.add(hgaDish);

    const lgaMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 12), mats.silver);
    lgaMast.position.set(-0.48, 1.42, -0.58);
    lgaMast.userData = { partName: 'Omnidirectional Low-Gain Antenna', partDesc: 'UHF & X-band mast relaying telemetry through Mars Odyssey and Mars Reconnaissance Orbiter.' };
    group.add(lgaMast);

    // 5-DOF Instrument Deployment Device (IDD / Robotic Arm) with RAT turret
    const armGroup = new THREE.Group();
    armGroup.position.set(0.15, 0.68, 0.72);
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), mats.darkMetal);
    upperArm.position.set(0, -0.08, 0.25);
    upperArm.rotation.x = 0.35;
    armGroup.add(upperArm);

    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 18), mats.silver);
    turret.position.set(0, -0.22, 0.55);
    turret.userData = { partName: 'IDD Instrument Turret (RAT, MB, APXS, MI)', partDesc: 'Four-tool rotary turret carrying the Rock Abrasion Tool, Mössbauer Spectrometer, Alpha Particle X-Ray Spectrometer, and Microscopic Imager.' };
    armGroup.add(turret);
    group.add(armGroup);

    // Articulated Rocker-Bogie Suspension + Cleated CNC Aluminum Wheels
    for (const side of [-1, 1]) {
      const bogieTube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.5, 12), mats.silver);
      bogieTube.rotation.x = Math.PI / 2;
      bogieTube.position.set(side * 0.78, 0.58, 0);
      bogieTube.userData = { partName: 'Titanium Rocker-Bogie Suspension', partDesc: 'Springless differential linkage keeping all six wheels on the ground while climbing rocks twice the wheel diameter.' };
      group.add(bogieTube);

      for (const zPos of [-0.88, 0, 0.88]) {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.45, 12), mats.silver);
        strut.position.set(side * 0.82, 0.42, zPos);
        group.add(strut);

        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(side * 0.92, 0.26, zPos);

        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.22, 28), mats.darkMetal);
        tire.rotation.z = Math.PI / 2;
        tire.userData = { partName: 'Machined Aluminum Wheel with Spiral Flexure', partDesc: '25 cm CNC-machined aluminum wheel with internal Solimide foam and machined cleats; Spirit drove right rear backwards after actuator failure.' };
        wheelGroup.add(tire);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.23, 18), mats.mylar);
        hub.rotation.z = Math.PI / 2;
        wheelGroup.add(hub);

        group.add(wheelGroup);
      }
    }

    animators.push((t) => {
      headGroup.rotation.y = Math.sin(t * 0.7) * 0.45;
    });
  } else if (id === 'ingenuity') {
    const fuselage = new THREE.Mesh(createCrinkledBox(0.46, 0.42, 0.46, 0.011), mats.mylar);
    fuselage.position.y = 0.78;
    fuselage.userData = { partName: 'CO2-Insulated Avionics Box', partDesc: 'Ultralight Kapton-clad fuselage trapping a thin layer of Martian CO2 gas around the Snapdragon 801 flight computer and 6 Li-ion cells.' };
    group.add(fuselage);

    // Downward Navigation Camera + Laser Altimeter window on belly
    const bellyCam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 18), mats.lensGlass);
    bellyCam.position.set(0, 0.55, 0.08);
    bellyCam.userData = { partName: 'Garmin LIDAR & 30 Hz Navcam', partDesc: 'Downward-facing black-and-white navigation camera tracking surface rock features at 30 frames per second.' };
    group.add(bellyCam);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.88, 24), mats.carbon);
    mast.position.y = 1.24;
    mast.userData = { partName: 'Coaxial Rotor Drive Shaft & Swashplate', partDesc: 'Dual counter-rotating brushless motor drive mast with titanium swashplate linkages for collective and cyclic pitch.' };
    group.add(mast);

    // Upper & Lower Swashplate rings + pitch links
    for (const sy of [1.14, 1.38]) {
      const swash = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 10, 24), mats.copper);
      swash.rotation.x = Math.PI / 2;
      swash.position.y = sy;
      swash.userData = { partName: 'Cyclic/Collective Swashplate Ring', partDesc: 'Servo-actuated pitch control ring adjusting blade angle of attack during 2,537 RPM flight.' };
      group.add(swash);
    }

    // Airfoil-contoured sculpted carbon-fiber rotor blades
    const createAirfoilRotor = (yPos: number, dir: number, brokenTip: boolean) => {
      const rGroup = new THREE.Group();
      rGroup.position.y = yPos;

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20), mats.silver);
      rGroup.add(hub);

      for (const side of [-1, 1]) {
        const span = brokenTip && side === 1 ? 1.02 : 1.25;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(span, 0.018, 0.22), mats.carbon);
        blade.position.set(side * (span / 2 + 0.06), 0, 0);
        blade.rotation.x = side * dir * 0.16;
        blade.userData = {
          partName: brokenTip && side === 1 ? 'Flight 72 Damaged Rotor Blade Tip' : 'Foam-Core Carbon Fiber Rotor Blade',
          partDesc: brokenTip && side === 1
            ? 'Outer carbon-fiber tip fractured on January 18, 2024 during a high-speed emergency landing in bland sand ripples—ending flight capability while leaving telemetry alive.'
            : '1.2-meter custom airfoil blade spinning at ~2,537 RPM (Mach 0.7 at tips) to generate lift in 1% Earth-density CO2 atmosphere.',
        };
        rGroup.add(blade);
      }
      group.add(rGroup);
      return rGroup;
    };

    const r1 = createAirfoilRotor(1.26, 1, false);
    const r2 = createAirfoilRotor(1.52, -1, true);

    const solar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.025, 0.26), mats.solar);
    solar.position.y = 1.68;
    solar.userData = { partName: 'Top-Mounted Solar Array & UHF Antenna', partDesc: 'High-efficiency solar panel trickle-charging the six Sony Li-ion batteries and supporting the 900 MHz Zigbee monopole antenna.' };
    group.add(solar);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const legGroup = new THREE.Group();
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 1.18, 12), mats.carbon);
      leg.position.set(0.55, 0.42, 0);
      leg.rotation.z = Math.PI / 3.8;
      leg.userData = { partName: 'Ultra-Light Carbon Composite Landing Leg', partDesc: 'Flexible tubular carbon-fiber landing strut with titanium fold hinges.' };
      legGroup.add(leg);

      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), mats.silver);
      foot.position.set(0.98, 0.035, 0);
      legGroup.add(foot);

      legGroup.rotation.y = angle;
      group.add(legGroup);
    }

    animators.push((t) => {
      r1.rotation.y = t * 1.8;
      r2.rotation.y = -t * 1.8;
    });
  } else if (id === 'voyager-1') {
    const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.48, 10), mats.darkMetal);
    bus.position.y = 0.8;
    bus.userData = { partName: '10-Sided Decagonal Avionics Bus', partDesc: 'Ten-bay machined aluminum ring structure housing flight data subsystems, attitude propulsion tanks, and golden record.' };
    group.add(bus);

    // Golden Record Cover Plate + Stylus Cartridge diagram on Bay 3
    const recordGroup = new THREE.Group();
    recordGroup.position.set(0, 0.8, 0.93);
    const record = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 36), mats.mylar);
    record.rotation.x = Math.PI / 2;
    record.userData = { partName: 'The Voyager Golden Record', partDesc: '12-inch gold-plated copper phonograph disc carrying 115 images, greetings in 55 languages, and sounds of Earth etched with ultra-pure Uranium-238.' };
    recordGroup.add(record);
    group.add(recordGroup);

    // 3.7-Meter High-Gain Parabolic Dish with structural back-ribs & subreflector tripod
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.95),
      mats.whitePaint
    );
    dish.material.side = THREE.DoubleSide;
    dish.position.y = 2.68;
    dish.rotation.x = Math.PI;
    dish.userData = { partName: '3.7-Meter High-Gain Parabolic Dish', partDesc: 'Graphite-epoxy honeycomb reflector beaming 22-watt S-band and X-band signals across 24+ billion kilometers of interstellar space.' };
    group.add(dish);

    // Tripod struts + subreflector cupola
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const tripodStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.35, 10), mats.silver);
      tripodStrut.position.set(Math.cos(a) * 0.48, 1.85, Math.sin(a) * 0.48);
      tripodStrut.rotation.z = Math.cos(a) * 0.36;
      tripodStrut.rotation.x = -Math.sin(a) * 0.36;
      group.add(tripodStrut);
    }

    const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.18, 24), mats.mylar);
    feed.position.y = 2.42;
    feed.userData = { partName: 'X/S-Band Subreflector & Feed Horn', partDesc: 'Frequency-selective subreflector focusing faint Deep Space Network commands.' };
    group.add(feed);

    // Tandem 3-unit MHW-RTG Boom with finned plutonium-238 cylinders
    const rtgBoom = new THREE.Group();
    rtgBoom.position.set(-1.6, 0.72, 0);
    for (let r = 0; r < 3; r++) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.48, 20), mats.rtgFin);
      can.rotation.z = Math.PI / 2;
      can.position.x = -r * 0.56;
      can.userData = { partName: 'MHW-RTG Plutonium-238 Generator', partDesc: 'Multi-Hundred-Watt Radioisotope Thermoelectric Generator converting Pu-238 decay heat into electrical power.' };
      rtgBoom.add(can);

      // Cooling fins
      for (let f = 0; f < 6; f++) {
        const fa = (f * Math.PI) / 3;
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.015, 0.08), mats.rtgFin);
        fin.position.set(-r * 0.56, Math.cos(fa) * 0.17, Math.sin(fa) * 0.17);
        fin.rotation.x = fa;
        rtgBoom.add(fin);
      }
    }
    group.add(rtgBoom);

    // Science Scan Platform Boom (Cosmic Ray, Plasma Wave, LECP, ISS)
    const sciBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 2.2, 16), mats.carbon);
    sciBoom.position.set(1.55, 0.85, 0);
    sciBoom.rotation.z = -Math.PI / 2.2;
    sciBoom.userData = { partName: 'Science Scan Platform Boom', partDesc: '2.5-meter carbon-epoxy boom carrying the Cosmic Ray Subsystem, Low-Energy Charged Particle detector, and Plasma Wave Subsystem.' };
    group.add(sciBoom);

    const scanPlatform = new THREE.Mesh(createCrinkledBox(0.45, 0.34, 0.42, 0.012), mats.mylar);
    scanPlatform.position.set(2.58, 0.98, 0);
    scanPlatform.userData = { partName: 'Steerable Science Scan Platform', partDesc: 'Thermal-blanketed instrument platform that imaged Jupiter, Saturn, Titan, and the Pale Blue Dot portrait before being powered down to save RTG wattage.' };
    group.add(scanPlatform);

    // Astromast fiberglass magnetometer boom
    const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, 2.8, 12), mats.mylar);
    magBoom.position.set(0, 0.65, -1.8);
    magBoom.rotation.x = -Math.PI / 2.1;
    magBoom.userData = { partName: '13-Meter Astromast Magnetometer Boom', partDesc: 'Helical fiberglass lattice boom isolating ultra-sensitive triaxial fluxgate magnetometers from spacecraft magnetic fields.' };
    group.add(magBoom);
  }

  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return { group, animators };
}
