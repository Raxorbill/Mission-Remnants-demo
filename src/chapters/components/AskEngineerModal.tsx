import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Compass, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { ChapterData } from '../data/types';
import { chaptersData } from '../data/chapters';
import { JOURNEY_STAGES } from '../../shared/journeyConfig';
import { audioService } from '../utils/audio';

interface QAItem {
  q: string;
  a: string;
  keywords: string[];
}

interface ChapterSection {
  id: string; // 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ch6'
  chapterNum: string;
  shortTitle: string;
  fullTitle: string;
  location: string;
  items: QAItem[];
}

export const MIRA_CHAPTER_ARCHIVE: ChapterSection[] = [
  {
    id: 'ch1',
    chapterNum: 'CH 01',
    shortTitle: 'Reflectors',
    fullTitle: 'Apollo 11 Lunar Laser Retroreflector (LRRR)',
    location: 'Mare Tranquillitatis · Moon',
    items: [
      {
        q: 'How does the Apollo 11 reflector work with zero electrical power?',
        a: 'The Lunar Laser Ranging Retroreflector (LRRR) uses 100 fused-silica corner-cube prisms recessed into a machined aluminum pallet. By the geometry of three mutually perpendicular quartz surfaces, any photon striking a corner cube undergoes three total internal reflections and exits parallel to its exact incoming vector—requiring zero batteries, motors, or electronics.',
        keywords: ['power', 'battery', 'passive', 'prism', 'work', 'fused', 'silica', 'corner', 'cube', 'electricity'],
      },
      {
        q: 'What has 55+ years of laser ranging revealed about the Moon’s interior and orbit?',
        a: 'By timing laser return pulses to picosecond accuracy (~2.56 seconds round-trip), astronomers proved the Moon is spiraling away from Earth at 3.8 centimeters per year due to tidal dissipation, confirmed Einstein’s Strong Equivalence Principle, and detected a fluid lunar core beneath its solid mantle.',
        keywords: ['orbit', 'receding', '3.8', 'core', 'einstein', 'science', 'discovery', 'distance', 'laser', 'learned', 'away'],
      },
      {
        q: 'Why do only a few photons return out of 10¹⁷ fired from Earth?',
        a: 'Earth’s atmosphere diverges the outgoing laser beam to a ~6.5 km spot on the Moon, and diffraction from the 3.8 cm corner cubes spreads the returning beam across ~20 km on Earth. Out of 300 quadrillion photons per pulse, observatory single-photon avalanche diodes catch only 1 to 5 returning photons.',
        keywords: ['photon', 'beam', 'diffraction', 'atmosphere', 'weak', 'return', 'pulse', 'few'],
      },
      {
        q: 'How did engineers prevent lunar noon heat from warping the quartz prisms?',
        a: 'Thermal gradients across a prism bend light and ruin retroreflection. Perkin-Elmer recessed each 3.8 cm Suprasil-1 quartz prism inside a precision cylindrical aluminum cavity and insulated the pallet in crinkled Kapton MLI so solar rays at extreme angles cannot heat the quartz unevenly.',
        keywords: ['thermal', 'heat', 'temperature', 'noon', 'night', 'cavity', 'suprasil', 'warp'],
      },
      {
        q: 'Has electrostatic lunar dust degraded the reflector over five decades?',
        a: 'Yes—return signal efficiency has dropped by roughly a factor of 10 since 1969, likely due to micrometeorite-levitated electrostatic dust settling on the recessed prism faces and UV solarization of dust grains, yet the array remains 100% operational today.',
        keywords: ['dust', 'degrade', 'efficiency', 'micrometeorite', 'still', 'working', 'status'],
      },
    ],
  },
  {
    id: 'ch2',
    chapterNum: 'CH 02',
    shortTitle: 'Seismometers',
    fullTitle: 'Apollo Passive Seismic Experiment (PSE)',
    location: 'ALSEP Network · Moon',
    items: [
      {
        q: 'Why did the Moon "ring like a bell" for over an hour during Apollo seismic tests?',
        a: 'Unlike Earth, where water and volatiles in rock pores rapidly attenuate seismic energy, the Moon’s upper crust is bone-dry, cold, and fractured into a deep megaregolith breccia. Seismic waves scatter endlessly across dry fractures with near-zero damping, sustaining vibrations for over 60 minutes.',
        keywords: ['ring', 'bell', 'hour', 'dry', 'water', 'attenuation', 'scatter', 'moonquake', 'quake'],
      },
      {
        q: 'Why is the seismometer draped in a wide 20-layer gold Mylar skirt?',
        a: 'The Passive Seismic Experiment resolves sub-nanometer displacements (0.05 nm). Without its 20-layer aluminized Mylar and Kapton thermal skirt draped across the surrounding regolith, ±150°C day-night ground expansion would cause the soil itself to pop, tilt, and drown out deep moonquakes.',
        keywords: ['skirt', 'mylar', 'gold', 'thermal', 'blanket', 'temperature', 'tilt', 'shroud', 'foil'],
      },
      {
        q: 'What four distinct types of seismic events did the Apollo network discover?',
        a: 'Between 1969 and 1977, the four-station ALSEP network cataloged over 12,000 events: (1) deep tidal moonquakes 700–1,200 km down triggered by Earth’s gravity every 27 days, (2) meteoroid impacts, (3) thermal sunrise crust-popping quakes, and (4) 28 shallow tectonic moonquakes up to magnitude 5.5.',
        keywords: ['types', 'four', 'shallow', 'deep', 'tidal', 'meteoroid', '12000', 'events', 'discover'],
      },
      {
        q: 'How did NASA deliberately crash S-IVB stages and Lunar Modules for science?',
        a: 'Once astronauts returned to the Command Module, Mission Control commanded expended Saturn S-IVB third stages and Lunar Module ascent stages to impact the Moon at known coordinates and kinetic energies—giving geophysicists calibrated seismic sources to map lunar crustal thickness (~30–40 km).',
        keywords: ['crash', 's-ivb', 'impact', 'artificial', 'crust', 'calibration', 'ascent', 'rocket'],
      },
      {
        q: 'Why were the Apollo ALSEP stations turned off on September 30, 1977?',
        a: 'Although their Plutonium-238 SNAP-27 radioisotope generators still produced ample wattage, budgetary constraints forced NASA to decommission the Apollo Lunar Surface Experiments Package ground tracking network in September 1977. The titanium-and-beryllium instruments remain intact on the surface.',
        keywords: ['1977', 'shut', 'off', 'terminated', 'budget', 'rtg', 'snap-27', 'why', 'silent'],
      },
    ],
  },
  {
    id: 'ch3',
    chapterNum: 'CH 03',
    shortTitle: 'Viking',
    fullTitle: 'Viking 1 & 2 Mars Landers',
    location: 'Chryse & Utopia Planitia · Mars',
    items: [
      {
        q: 'Why did Viking’s Labeled Release life experiment test positive while GCMS found no organics?',
        a: 'When Viking’s Labeled Release experiment added carbon-14 nutrients to Martian soil, radioactive CO₂ gas spiked—and control soil heated to 160°C did not react. However, the Gas Chromatograph Mass Spectrometer found zero organic molecules, leading scientists to suspect reactive perchlorate salts—later confirmed by Phoenix in 2008.',
        keywords: ['life', 'labeled', 'release', 'biology', 'gcms', 'perchlorate', 'organics', 'viking', 'soil'],
      },
      {
        q: 'How were the entire Viking Landers baked inside a giant oven before launch?',
        a: 'To comply with strict COSPAR planetary protection rules and avoid contaminating Mars with Earth microbes, each assembled Viking lander was sealed inside an aerodynamic bioshield and dry-heat sterilized at 111.7°C (233°F) for over 40 hours prior to launch.',
        keywords: ['bake', 'oven', 'sterilize', 'microbes', 'planetary', 'protection', 'bioshield', 'clean'],
      },
      {
        q: 'Why did Viking’s terminal descent engines use 18 small shower-head nozzles?',
        a: 'A single high-thrust rocket plume would have excavated a deep crater in Chryse Planitia and coated the biology scoop in hydrazine byproducts. Engineers designed each of the three throttlable engines with 18 miniature nozzles to spread exhaust pressure wide and gentle across the soil.',
        keywords: ['nozzle', '18', 'engine', 'thruster', 'hydrazine', 'plume', 'landing', 'descent'],
      },
      {
        q: 'How are the Viking 1, Spirit, Opportunity, and Ingenuity 3D models referenced?',
        a: 'Our 3D spacecraft meshes and PBR material shaders directly reference the NASA Science 3D archives and community photogrammetry reconstructions: Viking I Lander (@someaurelius [eabeb7e], @tashtego [709ac35]), Spirit (@joren.arens [8993a76]), Opportunity (@Serhii_Sarkisian [0484a80], @paul_sketch [94d7de7]), Ingenuity (@HermanKruger [175a9ef], @robo-reboot [0d5bdd6]), plus Curiosity (@nebulousflynn [0696a38]) and Perseverance (@robo-reboot [53034df]).',
        keywords: ['3d', 'model', 'sketchfab', 'nasa', 'curiosity', 'perseverance', 'reference', 'source', 'cad'],
      },
      {
        q: 'What ended Viking 1’s 6-year, 116-day record on the Martian surface?',
        a: 'Powered by two Plutonium-238 SNAP-19 RTGs, Viking 1 operated until November 11, 1982 (Sol 2,245), when a routine battery-charging software update accidentally overwrote the memory table controlling its high-gain S-band antenna pointing, severing contact with Earth.',
        keywords: ['end', '1982', 'software', 'antenna', 'overwrite', 'battery', 'contact', 'died', 'stop'],
      },
    ],
  },
  {
    id: 'ch4',
    chapterNum: 'CH 04',
    shortTitle: 'Rovers',
    fullTitle: 'Spirit & Opportunity (MER-A / MER-B)',
    location: 'Gusev Crater & Meridiani Planum · Mars',
    items: [
      {
        q: 'How did rovers designed for 90 sols survive for up to 15 years on Mars?',
        a: 'Mission planners expected Martian dust fallout to coat the triple-junction Gallium Arsenide solar wings within 90 sols. Instead, seasonal wind gusts and convective dust devils repeatedly swept the panels clean ("cleaning events"), restoring solar output and enabling Opportunity to drive 45.16 km over 5,352 sols.',
        keywords: ['90', 'sols', 'dust', 'devil', 'wind', 'cleaning', 'solar', 'survive', '15', 'years', 'long'],
      },
      {
        q: 'What happens inside the gold Kapton Warm Electronics Box (WEB)?',
        a: 'Martian nights plunge to -105°C. The rover’s core chassis—the Warm Electronics Box—is lined with 1-inch silica aerogel tiles (99.8% trapped gas by volume) and clad in specular gold Kapton film, supplemented by eight 1-watt plutonium-238 Radioisotope Heater Units (RHUs) to keep batteries above -20°C.',
        keywords: ['warm', 'electronics', 'box', 'web', 'aerogel', 'kapton', 'gold', 'heater', 'rhu', 'cold'],
      },
      {
        q: 'What were the "blueberries" Opportunity discovered at Eagle Crater?',
        a: 'Using its Mössbauer Spectrometer and Microscopic Imager, Opportunity identified millions of millimeter-sized gray spherical concretions rich in crystalline hematite (Fe₂O₃) embedded in sulfate-rich sandstone—conclusive geological proof that liquid water once soaked Meridiani Planum.',
        keywords: ['blueberries', 'hematite', 'water', 'meridiani', 'sulfate', 'mossbauer', 'concretions', 'eagle'],
      },
      {
        q: 'How did Spirit discover hydrothermal silica because of a broken wheel?',
        a: 'After Spirit’s right-front wheel actuator failed in 2006, rover drivers drove Spirit backwards across the Columbia Hills, dragging the seized wheel like an anchor. At "Home Plate," the trenching wheel scraped away surface dust to expose 90% pure opaline silica—evidence of an ancient volcanic hot spring.',
        keywords: ['wheel', 'broken', 'silica', 'home', 'plate', 'trench', 'hydrothermal', 'spirit', 'drag'],
      },
      {
        q: 'How did the 2018 global dust storm end Opportunity’s mission at Perseverance Valley?',
        a: 'In June 2018, a planet-encircling dust storm pushed atmospheric optical depth (tau) above 10.8, blocking 99.99% of sunlight. Unable to recharge its batteries, Opportunity tripped its low-power fault and lost power to its master mission clock heater.',
        keywords: ['2018', 'storm', 'tau', 'dark', 'battery', 'clock', 'opportunity', 'final', 'end'],
      },
    ],
  },
  {
    id: 'ch5',
    chapterNum: 'CH 05',
    shortTitle: 'Ingenuity',
    fullTitle: 'Ingenuity Mars Helicopter (Ginny)',
    location: 'Valinor Hills · Jezero Crater · Mars',
    items: [
      {
        q: 'How could a helicopter fly in a Martian atmosphere with only 1% of Earth’s density?',
        a: 'Surface air density at Jezero Crater equals Earth’s stratosphere at 30 km altitude. Ingenuity solved this with a total mass of just 1.8 kg (680 grams under Mars gravity) and twin 1.2-meter foam-core carbon-fiber coaxial rotors spinning at 2,400–2,900 RPM—just below Mach 0.75 at the blade tips.',
        keywords: ['atmosphere', '1%', 'thin', 'rpm', 'rotor', 'carbon', 'mach', 'lift', 'fly', 'blades'],
      },
      {
        q: 'Why couldn’t Ingenuity use a compass or Earth joystick control?',
        a: 'Mars has no global dipole magnetic field for a compass, and radio light-time delay between Earth and Mars ranges from 5 to 22 minutes. Ingenuity flew 100% autonomously using a 500 Hz inertial measurement unit, Garmin laser altimeter, and 30 fps downward visual-inertial odometry.',
        keywords: ['compass', 'autonomous', 'delay', 'camera', 'lidar', 'snapdragon', 'navigation', 'control'],
      },
      {
        q: 'What caused the rotor blade tip fracture on Flight 72 (January 18, 2024)?',
        a: 'During Flight 71 and 72 over steep, featureless sand ripples in Neretva Vallis, Ingenuity’s downward navigation camera lacked high-contrast rock textures to track horizontal velocity. The helicopter contacted the sloped dune at lateral speed, snapping the outer carbon-fiber rotor blade tip.',
        keywords: ['flight', '72', 'crash', 'blade', 'tip', 'sand', 'ripple', 'neretva', 'damage', 'broken'],
      },
      {
        q: 'How will Ingenuity continue operating for up to 20 years after Perseverance leaves?',
        a: 'Before driving out of UHF radio range, Perseverance uploaded a final software patch to Ingenuity. Every Martian morning when sunlight hits its top solar panel, Ingenuity wakes up, tests its actuators, photographs the sand beneath its skids, and logs temperature data to onboard flash memory for up to two decades.',
        keywords: ['20', 'years', 'weather', 'station', 'wake', 'patch', 'perseverance', 'future', 'alive'],
      },
      {
        q: 'Why was a swatch of the 1903 Wright Flyer fabric attached to Ingenuity?',
        a: 'To honor humanity’s first powered aircraft flight on another world on April 19, 2021, NASA engineers wrapped a postage-stamp-sized swatch of unbleached muslin from the 1903 Wright Flyer’s left wing around a cable beneath Ingenuity’s solar panel.',
        keywords: ['wright', 'flyer', '1903', 'fabric', 'muslin', 'kitty', 'hawk', 'first', 'wing'],
      },
    ],
  },
  {
    id: 'ch6',
    chapterNum: 'CH 06',
    shortTitle: 'Voyager',
    fullTitle: 'Voyager 1 Interstellar Probe',
    location: '24.6 Billion km · Ophiuchus · Interstellar Space',
    items: [
      {
        q: 'How does Earth detect Voyager 1’s 22-watt radio signal across 24.6 billion kilometers?',
        a: 'Voyager 1’s X-band transmitter radiates 22 watts—roughly a refrigerator bulb. By the time that wavefront reaches Earth 22 hours and 48 minutes later, its received power is a billionth of a billionth of a watt (10⁻¹⁹ W), requiring 70-meter Deep Space Network dishes and cryogenic maser amplifiers.',
        keywords: ['22', 'watt', 'radio', 'dsn', 'signal', 'distance', 'antenna', 'faint', 'talk'],
      },
      {
        q: 'How did JPL engineers fix Voyager 1’s Flight Data Subsystem memory chip in 2024?',
        a: 'In November 2023, Voyager 1 began beaming an alternating 1s-and-0s binary loop. Diagnostics revealed a single CMOS memory chip in the 1970s Flight Data Subsystem had failed (likely struck by a galactic cosmic ray). Engineers partitioned the flight code across healthy memory blocks and restored telemetry across 24 billion km.',
        keywords: ['2023', '2024', 'fds', 'memory', 'chip', 'glitch', 'fix', 'repair', 'code', 'computer'],
      },
      {
        q: 'What is etched onto the Voyager Golden Record and how is its age measured?',
        a: 'Curated by Carl Sagan’s committee, the 12-inch gold-plated copper phonograph record carries 115 analog-encoded images, greetings in 55 human languages, whale songs, and 90 minutes of music. Its aluminum cover is electroplated with ultra-pure Uranium-238 (4.468-billion-year half-life) as a radiometric clock.',
        keywords: ['golden', 'record', 'sagan', 'uranium', 'music', 'cover', 'copper', 'instructions', 'disc'],
      },
      {
        q: 'How did Voyager 1 prove it crossed the heliopause into interstellar space in 2012?',
        a: 'On August 25, 2012, at 121.6 AU from the Sun, Voyager 1 recorded a sharp drop in solar wind protons, a spike in galactic cosmic rays, and plasma wave oscillations measured at 40× higher density than the outer heliosphere—confirming entry into the interstellar medium.',
        keywords: ['heliopause', '2012', 'interstellar', 'plasma', 'cosmic', 'ray', 'sun', 'boundary', 'crossed'],
      },
      {
        q: 'What happens after Voyager 1’s Plutonium-238 RTGs fall below minimum power in the 2030s?',
        a: 'Voyager 1’s three MHW-RTGs lose ~4 watts of electrical output per year due to Pu-238 decay and thermocouple degradation. Once the last instrument is shut down in the 2030s, Voyager 1 will become a silent time capsule orbiting the Milky Way center every 225 million years.',
        keywords: ['2030', 'rtg', 'plutonium', 'power', 'silent', 'milky', 'way', 'forever', 'die'],
      },
    ],
  },
];

/**
 * Detailed Component & Subsystem Encyclopedia so asking about any spacecraft component
 * ("how does the prism work", "tell me about the wheels", "what is the golden record", etc.)
 * returns an immediate, thorough engineering explanation.
 */
const COMPONENT_ENCYCLOPEDIA: Array<{
  triggers: string[];
  title: string;
  chapterTag: string;
  explanation: string;
}> = [
  {
    triggers: ['prism', 'corner cube', 'corner-cube', 'silica', 'quartz', 'suprasil', 'mirror', 'retroreflector'],
    title: 'Fused-Silica Corner-Cube Prisms (Apollo LRRR)',
    chapterTag: 'CH 01 · APOLLO 11 REFLECTOR',
    explanation:
      'Each of the 100 prisms on the Apollo 11 pallet is ground from high-purity Suprasil-1 fused quartz into a three-sided "corner cube." Unlike a flat mirror—which only reflects light back if aimed dead-on—a corner cube bounces an incoming photon off three mutually perpendicular 90° surfaces via total internal reflection. The light beam exits parallel to the exact angle it arrived from, sending Earth observatory laser pulses straight back across 384,400 km with zero electrical power.',
  },
  {
    triggers: ['dust cover', 'gnomon', 'leveling', 'handle', 'pallet', 'tray'],
    title: 'Machined Aluminum Pallet, Gnomon & Dust Cover (Apollo LRRR)',
    chapterTag: 'CH 01 · APOLLO 11 REFLECTOR',
    explanation:
      'Astronauts carried the LRRR using a universal EVA handling socket, leveled it with a spherical bubble level, and aimed it toward Earth using a shadow-casting solar gnomon pin. A Teflon-coated protective dust cover shielded the quartz prisms until the Lunar Module Ascent Stage blasted off.',
  },
  {
    triggers: ['skirt', 'mylar', 'thermal shroud', 'blanket', 'kapton', 'foil', 'mli'],
    title: 'Multi-Layer Aluminized Mylar & Kapton Thermal Blanket',
    chapterTag: 'AEROSPACE THERMAL SUBSYSTEM',
    explanation:
      'Spacecraft on the Moon and Mars face extreme temperature swings (from +120°C in sunlight to -150°C at night). Multi-Layer Insulation (MLI)—made of ultra-thin polyimide Kapton coated in vapor-deposited gold or aluminum and separated by Dacron mesh—reflects 98% of radiant heat. On the Apollo Seismometer, a 20-layer Mylar skirt was draped across the lunar soil itself to stop thermal ground-popping from drowning out 0.05-nanometer moonquakes.',
  },
  {
    triggers: ['beryllium', 'pendulum', 'seismometer', 'seismic sensor', 'alsep', 'ribbon cable'],
    title: 'Beryllium Seismometer & 3-Axis Pendulum (Apollo PSE)',
    chapterTag: 'CH 02 · APOLLO SEISMOMETER',
    explanation:
      'Inside the gold Kapton cylinder sits a machined beryllium pressure vessel housing three long-period horizontal/vertical pendulums and one short-period vertical sensor. Capacitive displacement transducers detect ground motion as small as 0.5 angstroms (smaller than a single atom) and send signals via flat Kapton ribbon cables to the ALSEP Central Station.',
  },
  {
    triggers: ['rtg', 'plutonium', 'snap-27', 'snap-19', 'mhw-rtg', 'nuclear', 'thermoelectric', 'rhu'],
    title: 'Radioisotope Thermoelectric Generators (RTG)',
    chapterTag: 'NUCLEAR POWER SUBSYSTEM',
    explanation:
      'Apollo ALSEP (SNAP-27), Viking 1 & 2 (twin SNAP-19s), and Voyager 1 (three MHW-RTGs) used the natural alpha-decay heat of Plutonium-238 (~87.7-year half-life). Thermocouples convert the 1,000°C core heat directly into electricity with no moving parts—allowing missions to operate through 14-day lunar nights, Martian dust storms, and interstellar darkness.',
  },
  {
    triggers: ['scoop', 'sampler', 'collector', 'arm', 'trench', 'biology', 'labeled release', 'gcms', 'oven'],
    title: 'Surface Sampler Boom & Biology Lab (Viking Lander)',
    chapterTag: 'CH 03 · VIKING LANDER',
    explanation:
      'Viking’s 3-meter retractable sampler boom was made of two welded stainless-steel ribbons that unrolled into a rigid tube. Its backhoe scoop dug trenches in Chryse Planitia, sieved soil grains under 2 mm, and delivered samples into the Gas Chromatograph Mass Spectrometer (GCMS) and three biological incubation ovens (including the Labeled Release carbon-14 experiment).',
  },
  {
    triggers: ['nozzle', '18-nozzle', 'thruster', 'hydrazine', 'descent engine', 'footpad', 'leg'],
    title: '18-Nozzle Hydrazine Descent Engines & Honeycomb Legs (Viking)',
    chapterTag: 'CH 03 · VIKING LANDER',
    explanation:
      'Each of Viking’s three terminal descent engines split its monopropellant hydrazine exhaust across 18 small "shower-head" nozzles so the rocket plumes wouldn’t dig a crater or contaminate the soil samples. Three aluminum-honeycomb crushable legs absorbed the final touchdown impact.',
  },
  {
    triggers: ['wheel', 'rocker', 'bogie', 'rocker-bogie', 'suspension', 'cleat'],
    title: 'Titanium Rocker-Bogie Suspension & Cleated Wheels (Spirit & Opportunity)',
    chapterTag: 'CH 04 · MARS ROVERS',
    explanation:
      'The six-wheel Rocker-Bogie suspension uses a springless differential linkage so all six 25-cm CNC-machined aluminum wheels stay pressed against the ground even while climbing boulders twice the wheel diameter. When Spirit’s right-front wheel actuator failed in 2006, drivers drove Spirit backwards—and the dragging wheel exposed bright 90% pure hydrothermal silica at Home Plate.',
  },
  {
    triggers: ['rat', 'rock abrasion', 'mossbauer', 'apxs', 'turret', 'idd', 'microscopic'],
    title: 'Instrument Deployment Device & Rock Abrasion Tool (RAT)',
    chapterTag: 'CH 04 · MARS ROVERS',
    explanation:
      'Mounted on the rover’s 5-jointed robotic arm, the Rock Abrasion Tool spins diamond-impregnated resin teeth at 3,000 RPM to grind a 45-mm circle 5 mm deep into weathered Martian rock. Once fresh interior stone is exposed, the turret rotates to place the Microscopic Imager, Mössbauer Spectrometer, and Alpha Particle X-Ray Spectrometer onto the spot.',
  },
  {
    triggers: ['pancam', 'navcam', 'camera', 'mast', 'stereo', 'facsimile'],
    title: 'Stereo Pancam, Navcam & Imaging Systems',
    chapterTag: 'OPTICAL IMAGING SUBSYSTEM',
    explanation:
      'Spirit and Opportunity carried twin Panoramic Cameras (Pancam) atop a 1.5-meter carbon-composite mast with 8-position mineralogical filter wheels, paired with wide-angle Navigation Cameras. Earlier in 1976, Viking used twin mechanical scanning-mirror photodiode Facsimile Cameras; in 2021, Ingenuity used a 30 fps downward black-and-white navigation camera.',
  },
  {
    triggers: ['web', 'warm electronics', 'aerogel', 'solar', 'gallium', 'panel', 'wing'],
    title: 'Warm Electronics Box (WEB) & Triple-Junction Solar Arrays',
    chapterTag: 'ROVER POWER & THERMAL SUBSYSTEM',
    explanation:
      'Triple-junction Gallium Arsenide solar wings generated up to 900 Watt-hours per sol (repeatedly refreshed by Martian wind gusts). Power is stored inside the gold-coated Warm Electronics Box, which uses 1-inch silica aerogel insulation (99.8% air/gas by volume) to trap heat during -105°C Martian nights.',
  },
  {
    triggers: ['rotor', 'blade', 'propeller', 'coaxial', 'swashplate', 'rpm', 'carbon', 'lidar', 'snapdragon', 'wright'],
    title: 'Coaxial Carbon-Fiber Rotors & Autonomous Avionics (Ingenuity)',
    chapterTag: 'CH 05 · INGENUITY HELICOPTER',
    explanation:
      'To fly in Mars’s 1%-density CO₂ atmosphere, Ingenuity spins two counter-rotating 1.2-meter foam-core carbon-fiber rotors at ~2,537 RPM via dualtitanium swashplates. A Qualcomm Snapdragon 801 processor fuses 500 Hz IMU data, Garmin laser altimeter readings, and 30 Hz downward camera frames to fly autonomously. Flight 72 fractured a rotor blade tip on Jan 18, 2024, converting Ingenuity into a stationary Valinor Hills weather station.',
  },
  {
    triggers: ['dish', 'antenna', 'high-gain', 's-band', 'x-band', 'dsn', 'radio', 'transmitter'],
    title: '3.7-Meter High-Gain Parabolic Dish (Voyager 1)',
    chapterTag: 'CH 06 · VOYAGER 1',
    explanation:
      'Voyager 1’s 3.7-meter graphite-epoxy parabolic dish beams a 22-watt X-band and S-band signal toward Earth. Across 24.6+ billion kilometers (22h 48m one-way light time), NASA’s 70-meter Deep Space Network antennas capture the signal at roughly 10⁻¹⁹ watts.',
  },
  {
    triggers: ['golden record', 'record', 'phonograph', 'sagan', 'uranium', 'stylus', 'music'],
    title: 'The Voyager Golden Record & Uranium-238 Clock',
    chapterTag: 'CH 06 · VOYAGER 1',
    explanation:
      'Bolted to Voyager’s 10-sided aluminum bus is a 12-inch gold-plated copper phonograph disc containing 115 analog images, greetings in 55 languages, sounds of Earth, and 90 minutes of music. Its protective aluminum cover is electroplated with a spot of ultra-pure Uranium-238 (4.468-billion-year half-life) so any future finder can calculate when the ship left Earth.',
  },
  {
    triggers: ['magnetometer', 'boom', 'cosmic ray', 'plasma', 'fds', 'memory', 'chip'],
    title: 'Science Scan Platform, Magnetometer Boom & Flight Data Subsystem (Voyager 1)',
    chapterTag: 'CH 06 · VOYAGER 1',
    explanation:
      'Voyager 1 extends a 13-meter fiberglass Astromast magnetometer boom and a science boom carrying Cosmic Ray, Low-Energy Charged Particle, and Plasma Wave detectors that proved it crossed the heliopause in 2012. In 2024, JPL engineers remotely patched its 1970s Flight Data Subsystem (FDS) after a cosmic ray damaged a single CMOS memory chip.',
  },
];

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/(ing|ed|es|s)$/, ''));
}

/**
 * Intelligent multi-intent conversational & technical response engine for MIRA.
 * Handles:
 *  1. Greetings & small talk ("hey", "hello", "how are you", "thanks", "bye")
 *  2. MIRA identity & help ("who are you", "what is mira", "help")
 *  3. Website, Team NovoSriti & NASA Space Apps Challenge ("website", "team", "challenge", "novosriti")
 *  4. 3D Mission Lab simulation controls & help ("how to play", "controls", "mission lab")
 *  5. Specific spacecraft components & hotspots ("how does the prism/rotor/wheel/dish work", "components")
 *  6. Chapter-specific questions ("how does it work", "what did it discover", "where is it now", "status")
 *  7. Fuzzy token matching across all 30 curated Q&As and all 6 chapters' facts
 */
export function resolveMiraResponse(
  rawQuery: string,
  activeChapterId: string
): { answer: string; chapterLabel: string } {
  const qClean = rawQuery.trim();
  const qLower = qClean.toLowerCase();
  const words = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  const activeChapter =
    MIRA_CHAPTER_ARCHIVE.find((c) => c.id === activeChapterId) || MIRA_CHAPTER_ARCHIVE[0];
  const chapterObj =
    chaptersData.find((c) => c.id === activeChapter.id) || chaptersData[0];
  const stageSpec =
    JOURNEY_STAGES.find((s) => s.chapterId === activeChapter.id) || JOURNEY_STAGES[0];

  // 1. GREETINGS & SMALL TALK
  const greetingWords = ['hi', 'hey', 'hello', 'hola', 'greetings', 'yo', 'sup', 'howdy'];
  const isPureGreeting =
    (words.length <= 4 && words.some((w) => greetingWords.includes(w))) ||
    /^(good\s+(morning|afternoon|evening|night)|how\s+are\s+you|how\s+is\s+it\s+going|what'?s\s+up)/i.test(qLower);

  if (isPureGreeting) {
    return {
      chapterLabel: `MIRA CONSOLE · ${activeChapter.chapterNum}`,
      answer: `Hello! I am MIRA (Mission Information & Remnant Archive), built by Team NovoSriti for Mission Remnants. Right now we are in ${activeChapter.chapterNum}: ${chapterObj.machine} (${chapterObj.whereItIs}). You can ask me how any component of ${chapterObj.machine} works, what it discovered, its current status, how to play the 3D Mission Lab, or anything about this website and the NASA Space Apps Challenge!`,
    };
  }

  if (/^(thank|thanks|thx|appreciate|awesome|great|cool|nice)/i.test(qLower) && words.length <= 5) {
    return {
      chapterLabel: `MIRA CONSOLE · ${activeChapter.chapterNum}`,
      answer: `You're very welcome! Feel free to ask about any spacecraft component on ${chapterObj.machine}, its scientific discoveries, or launch Mission ${stageSpec.stageNumber} (${stageSpec.missionName}) below whenever you're ready.`,
    };
  }

  // 2. WEBSITE / PROJECT / TEAM NOVOSRITI / NASA SPACE APPS CHALLENGE
  if (
    /\b(website|site|web\s*app|project|novosriti|novo\s*sriti|team|space\s*apps|challenge|abandoned|not\s*forgotten|who\s+made|who\s+built|who\s+created|creator|developer|about\s+this|mission\s+remnants)\b/i.test(
      qLower
    )
  ) {
    return {
      chapterLabel: 'PROJECT MISSION REMNANTS · TEAM NOVOSRITI',
      answer: `"Mission Remnants — Built for a Question" is an interactive documentary and 3D space hardware museum created by Team NovoSriti for the NASA Space Apps Challenge under the challenge "Abandoned, But Not Forgotten." It explores six real NASA machines left behind across the Moon, Mars, and interstellar space (01: Apollo 11 Laser Reflector, 02: Apollo Seismometer, 03: Viking Landers, 04: Spirit & Opportunity Rovers, 05: Ingenuity Helicopter, and 06: Voyager 1). Each chapter pairs a 4-slide documentary story and interactive 3D spacecraft model with a playable 3D Mission Lab simulation.`,
    };
  }

  // 3. MIRA IDENTITY / HELP
  if (
    /\b(who\s+are\s+you|what\s+are\s+you|what\s+is\s+mira|your\s+name|what\s+can\s+you\s+do|can\s+you\s+help|help\s+me)\b/i.test(
      qLower
    ) ||
    qLower === 'mira' ||
    qLower === 'help'
  ) {
    const hotspotNames = chapterObj.hotspots.map((h) => h.label).join(', ');
    return {
      chapterLabel: 'MIRA ARCHIVE GUIDE',
      answer: `I am MIRA (Mission Information & Remnant Archive)—your interactive aerospace guide for Mission Remnants. You can ask me: (1) How any component works—for ${chapterObj.machine}, try asking about: ${hotspotNames}; (2) What this mission discovered and whether it is still active; (3) How to play the 3D Mission Lab simulation; or (4) About Team NovoSriti and the NASA Space Apps Challenge.`,
    };
  }

  // 4. HOW TO PLAY / 3D MISSION LAB SIMULATION
  if (
    /\b(how\s+to\s+play|mission\s+lab|simulation|simulator|controls|wasd|how\s+do\s+i\s+play|play\s+the\s+game|objective)\b/i.test(
      qLower
    )
  ) {
    const stepsText = stageSpec.howItWorkedSteps
      .map((s, i) => `(${i + 1}) ${s.step}: ${s.detail}`)
      .join(' ');
    return {
      chapterLabel: `3D MISSION LAB · STAGE ${stageSpec.stageNumber}`,
      answer: `In Mission ${stageSpec.stageNumber} (${stageSpec.missionName}), ${stageSpec.chapterToMissionBody} Use WASD or Arrow keys (or the on-screen joystick) to move/aim, drag to orbit the camera, and click the action button when prompted to complete each objective. Real-world operation: ${stepsText}`,
    };
  }

  // 5. CHECK IF USER ASKED FOR ALL COMPONENTS / PARTS OF CURRENT SPACECRAFT
  if (
    /\b(components|subsystems|parts|anatomy|what\s+is\s+it\s+made\s+of|all\s+parts|list\s+components)\b/i.test(
      qLower
    )
  ) {
    const breakdown = chapterObj.hotspots
      .map((h, i) => `0${i + 1}. ${h.label}: ${h.job}`)
      .join(' • ');
    return {
      chapterLabel: `${activeChapter.chapterNum} · SUBSYSTEM BREAKDOWN`,
      answer: `${chapterObj.machine} consists of ${chapterObj.hotspots.length} primary subsystems: ${breakdown}. Ask me about any of these components by name to learn what scientists discovered with it!`,
    };
  }

  // 6. CHECK CURRENT CHAPTER'S HOTSPOTS DIRECTLY
  for (const hs of chapterObj.hotspots) {
    const labelTokens = hs.label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (
      qLower.includes(hs.label.toLowerCase()) ||
      labelTokens.some((tok) => words.includes(tok))
    ) {
      return {
        chapterLabel: `${activeChapter.chapterNum} COMPONENT · ${hs.label.toUpperCase()}`,
        answer: `${hs.label} (${chapterObj.machine}): ${hs.job} Scientific impact: ${hs.learned}`,
      };
    }
  }

  // 7. CHECK ALL OTHER CHAPTERS' HOTSPOTS
  for (const ch of chaptersData) {
    for (const hs of ch.hotspots) {
      if (qLower.includes(hs.label.toLowerCase())) {
        return {
          chapterLabel: `CH 0${ch.chapter} COMPONENT · ${hs.label.toUpperCase()}`,
          answer: `${hs.label} (${ch.machine}): ${hs.job} Scientific impact: ${hs.learned}`,
        };
      }
    }
  }

  // 8. CHECK COMPONENT ENCYCLOPEDIA (25+ Engineering Subsystems)
  let bestComp: (typeof COMPONENT_ENCYCLOPEDIA)[0] | null = null;
  let bestCompScore = 0;
  for (const comp of COMPONENT_ENCYCLOPEDIA) {
    let score = 0;
    for (const trig of comp.triggers) {
      if (qLower.includes(trig)) {
        score += trig.includes(' ') ? 5 : 3;
      }
    }
    if (score > bestCompScore) {
      bestCompScore = score;
      bestComp = comp;
    }
  }
  if (bestComp && bestCompScore >= 3) {
    return {
      chapterLabel: bestComp.chapterTag,
      answer: `${bestComp.title}: ${bestComp.explanation}`,
    };
  }

  // 9. WEIGHTED TOKEN & KEYWORD SEARCH ACROSS ALL 30 CURATED Q&As
  const queryNormTokens = normalizeTokens(qLower);
  let bestQA: { item: QAItem; chapter: ChapterSection; score: number } | null = null;

  for (const ch of MIRA_CHAPTER_ARCHIVE) {
    const isCurrentChapter = ch.id === activeChapter.id;
    for (const item of ch.items) {
      let score = isCurrentChapter ? 1.0 : 0;
      for (const kw of item.keywords) {
        if (qLower.includes(kw)) score += 3.5;
      }
      const qTokens = normalizeTokens(item.q);
      for (const qt of queryNormTokens) {
        if (qTokens.includes(qt)) score += 1.8;
      }
      if (!bestQA || score > bestQA.score) {
        bestQA = { item, chapter: ch, score };
      }
    }
  }

  if (bestQA && bestQA.score >= 4.2) {
    return {
      chapterLabel: `${bestQA.chapter.chapterNum} · ${bestQA.chapter.shortTitle}`,
      answer: bestQA.item.a,
    };
  }

  // 10. GENERAL CHAPTER INTENTS ("How does it work?", "What did we learn?", "Where is it?", "Status?")
  if (/\b(how\s+does\s+(it|this)\s+work|how\s+it\s+works|mechanism|operate|function)\b/i.test(qLower)) {
    const howStep = chapterObj.steps.find((s) => s.name === 'How it works') || chapterObj.steps[1];
    return {
      chapterLabel: `${activeChapter.chapterNum} · HOW IT WORKS`,
      answer: `${chapterObj.machine}: ${howStep?.text || chapterObj.shortAnswer} ${
        howStep?.subtext || ''
      }`,
    };
  }

  if (
    /\b(discover|discovery|learned|finding|find\s+out|prove|result|key\s+number|science)\b/i.test(
      qLower
    )
  ) {
    return {
      chapterLabel: `${activeChapter.chapterNum} · SCIENTIFIC DISCOVERY`,
      answer: `${chapterObj.discovery.title} (${chapterObj.discovery.numberLabel}: ${chapterObj.discovery.keyNumber}): ${chapterObj.discovery.finding}`,
    };
  }

  if (/\b(where\s+is\s+it|location|coordinates|resting\s+place|how\s+far|distance)\b/i.test(qLower)) {
    const whereStep =
      chapterObj.steps.find((s) => s.name === 'Where it is now') || chapterObj.steps[3];
    return {
      chapterLabel: `${activeChapter.chapterNum} · LOCATION & STATUS`,
      answer: `${chapterObj.machine} is located at ${chapterObj.whereItIs} (${chapterObj.distanceLabel}). ${
        whereStep?.text || ''
      } Status: ${chapterObj.status.chip} — ${chapterObj.status.note}`,
    };
  }

  if (/\b(status|still\s+working|still\s+alive|still\s+active|silent|retired|dead|talking)\b/i.test(qLower)) {
    return {
      chapterLabel: `${activeChapter.chapterNum} · TELEMETRY STATUS`,
      answer: `Current status of ${chapterObj.machine}: ${chapterObj.status.chip}. ${chapterObj.status.note}`,
    };
  }

  // 11. SMART CONTEXTUAL SUMMARY FALLBACK (Never dumps an unrelated static answer!)
  const componentList = chapterObj.hotspots.map((h) => h.label).join(', ');
  return {
    chapterLabel: `${activeChapter.chapterNum} · ${activeChapter.shortTitle.toUpperCase()} OVERVIEW`,
    answer: `Here is what our archive holds for ${chapterObj.machine} (${chapterObj.whereItIs}): ${chapterObj.shortAnswer} Key discovery: ${chapterObj.discovery.keyNumber} (${chapterObj.discovery.numberLabel}). You can ask me specifically about its components (${componentList}), how it works, or about Team NovoSriti and this NASA Space Apps Challenge project!`,
  };
}

interface MiraChapterSectionProps {
  chapter: ChapterData;
  onOpenModal?: () => void;
}

/**
 * Interactive MIRA Console inside Slide 04 ("MIRA & Lab") of every chapter.
 * Displays only the current chapter's curated mission questions + quick conversational chips
 * + live interactive Q&A response console with voice narration.
 */
export const MiraChapterSection: React.FC<MiraChapterSectionProps> = ({ chapter }) => {
  const activeChapter =
    MIRA_CHAPTER_ARCHIVE.find((c) => c.id === chapter.id) || MIRA_CHAPTER_ARCHIVE[0];

  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(0);
  const [customInput, setCustomInput] = useState('');
  const [consoleDisplay, setConsoleDisplay] = useState<{
    q: string;
    a: string;
    tag: string;
  }>({
    q: activeChapter.items[0].q,
    a: activeChapter.items[0].a,
    tag: `${activeChapter.chapterNum} · ${activeChapter.fullTitle}`,
  });
  const [speakingAnswer, setSpeakingAnswer] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const prevChapterIdRef = useRef(chapter.id);

  // Reset console when user switches chapters
  useEffect(() => {
    const ch = MIRA_CHAPTER_ARCHIVE.find((c) => c.id === chapter.id) || MIRA_CHAPTER_ARCHIVE[0];
    setSelectedQuestionIdx(0);
    setConsoleDisplay({
      q: ch.items[0].q,
      a: ch.items[0].a,
      tag: `${ch.chapterNum} · ${ch.fullTitle}`,
    });
    if (prevChapterIdRef.current !== chapter.id) {
      prevChapterIdRef.current = chapter.id;
      audioService.stopNarration();
      setSpeakingAnswer(false);
    }
  }, [chapter.id]);

  const handleVoiceRead = (text: string) => {
    audioService.playClick();
    if (speakingAnswer) {
      audioService.stopNarration();
      setSpeakingAnswer(false);
    } else {
      setSpeakingAnswer(true);
      audioService.narrateText(text, (speaking) => setSpeakingAnswer(speaking));
    }
  };

  const triggerQuery = (queryText: string, explicitItemIdx?: number) => {
    audioService.playClick();

    let nextQ = queryText;
    let nextA = '';
    let nextTag = '';

    if (explicitItemIdx !== undefined) {
      const qa = activeChapter.items[explicitItemIdx];
      setSelectedQuestionIdx(explicitItemIdx);
      nextQ = qa.q;
      nextA = qa.a;
      nextTag = `${activeChapter.chapterNum} · ${activeChapter.fullTitle}`;
    } else {
      setSelectedQuestionIdx(null);
      const res = resolveMiraResponse(queryText, chapter.id);
      nextQ = queryText;
      nextA = res.answer;
      nextTag = res.chapterLabel;
    }

    setConsoleDisplay({
      q: nextQ,
      a: nextA,
      tag: nextTag,
    });

    if (autoSpeak) {
      setSpeakingAnswer(true);
      audioService.narrateText(nextA, (speaking) => setSpeakingAnswer(speaking));
    } else if (speakingAnswer) {
      audioService.stopNarration();
      setSpeakingAnswer(false);
    }
  };

  const handleAskCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const q = customInput.trim();
    setCustomInput('');
    triggerQuery(q);
  };

  const quickPrompts = [
    { label: 'Say Hello', query: 'Hey MIRA, who are you?' },
    { label: 'How It Works', query: `How does ${chapter.machine} work?` },
    { label: 'Explain Components', query: `What are the main components of ${chapter.machine}?` },
    { label: 'Key Discovery', query: `What did ${chapter.machine} discover?` },
    { label: 'About This Website', query: 'Tell me about this website and Team NovoSriti' },
  ];

  return (
    <div className="space-y-5" aria-label="MIRA Chapter Q&A">
      {/* Header + Quick Conversational Prompts */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Slide 04 / 04 · Ask MIRA · {activeChapter.chapterNum}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-white tracking-tight">
            {activeChapter.fullTitle} — Mission Q&A
          </h2>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {quickPrompts.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => triggerQuery(p.query)}
              className="px-2.5 py-1.5 rounded-md bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-xs font-mono text-slate-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Question List + Live Interactive MIRA Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#050811] border border-white/15 rounded-xl p-5 sm:p-7">
        {/* Left Column: 5 Curated Questions for Current Chapter + Custom Input */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
              <span>{activeChapter.chapterNum} · {activeChapter.shortTitle} Questions</span>
              <span className="text-[11px] text-slate-500">Click or Ask Below</span>
            </div>
            <div className="space-y-2">
              {activeChapter.items.map((item, idx) => {
                const isSelected = selectedQuestionIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => triggerQuery(item.q, idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white font-medium'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="font-mono text-[11px] text-amber-400 mt-0.5 shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm leading-snug">{item.q}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Question Input */}
          <form onSubmit={handleAskCustom} className="pt-2 flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={`Say "hey", ask about a component, or ask about ${activeChapter.shortTitle}...`}
              className="flex-1 bg-[#03060C] border border-white/15 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-mono text-xs uppercase font-semibold transition-colors cursor-pointer shrink-0"
            >
              Ask MIRA
            </button>
          </form>
        </div>

        {/* Right Column: MIRA Archival Response Console */}
        <div className="lg:col-span-7 bg-[#03060C] border border-white/10 rounded-lg p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs text-amber-400">
                  {consoleDisplay.tag}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoSpeak;
                    setAutoSpeak(next);
                    if (next && !speakingAnswer) {
                      setSpeakingAnswer(true);
                      audioService.narrateText(consoleDisplay.a, (speaking) =>
                        setSpeakingAnswer(speaking)
                      );
                    } else if (!next && speakingAnswer) {
                      audioService.stopNarration();
                      setSpeakingAnswer(false);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded border font-mono text-[11px] transition-colors cursor-pointer ${
                    autoSpeak
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-white/[0.02] text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Automatically speak MIRA responses when selecting questions"
                >
                  {autoSpeak ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleVoiceRead(consoleDisplay.a)}
                  className={`px-3 py-1.5 rounded border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    speakingAnswer
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold'
                      : 'bg-white/[0.03] text-slate-300 border-white/15 hover:text-white'
                  }`}
                >
                  {speakingAnswer ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Listen to MIRA
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              Question / Topic
            </div>
            <h3 className="font-head font-bold text-lg sm:text-xl text-white mb-4 leading-snug">
              “{consoleDisplay.q}”
            </h3>

            <div className="text-xs font-mono text-amber-400/90 uppercase tracking-wider mb-1.5">
              MIRA Response
            </div>
            <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed">
              {consoleDisplay.a}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-500">
            <span>Coordinates: {activeChapter.location}</span>
            <span>Team NovoSriti · Mission Remnants Archive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AskEngineerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChapterId: string;
}

export const AskEngineerModal: React.FC<AskEngineerModalProps> = ({
  isOpen,
  onClose,
  activeChapterId,
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; tag?: string }[]>([]);
  const [input, setInput] = useState('');
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [autoVoice, setAutoVoice] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChapter =
    MIRA_CHAPTER_ARCHIVE.find((c) => c.id === activeChapterId) || MIRA_CHAPTER_ARCHIVE[0];
  const chapterObj =
    chaptersData.find((c) => c.id === activeChapter.id) || chaptersData[0];

  const resetChat = () => {
    audioService.stopNarration();
    setSpeakingMsgIdx(null);
    const currentCh =
      MIRA_CHAPTER_ARCHIVE.find((c) => c.id === activeChapterId) || MIRA_CHAPTER_ARCHIVE[0];
    const chData = chaptersData.find((c) => c.id === currentCh.id) || chaptersData[0];
    const compNames = chData.hotspots.map((h) => h.label).join(', ');
    setMessages([
      {
        role: 'model',
        tag: `MIRA ARCHIVE · ${currentCh.chapterNum}`,
        text: `Hello! I am MIRA (Mission Information & Remnant Archive) for ${currentCh.fullTitle}. Ask me "hey", ask how any component works (${compNames}), ask about this website & Team NovoSriti, or tap any question above!`,
      },
    ]);
  };

  useEffect(() => {
    resetChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const toggleSpeakMessage = (idx: number, text: string) => {
    audioService.playClick();
    if (speakingMsgIdx === idx) {
      audioService.stopNarration();
      setSpeakingMsgIdx(null);
    } else {
      setSpeakingMsgIdx(idx);
      audioService.narrateText(text, (speaking) => {
        if (!speaking) setSpeakingMsgIdx(null);
      });
    }
  };

  const handleAskQuestion = (questionText: string, explicitAnswer?: string, chapterLabel?: string) => {
    if (!questionText.trim()) return;
    audioService.playClick();

    const userMsg = questionText.trim();
    setInput('');

    const resolved = explicitAnswer
      ? { answer: explicitAnswer, chapterLabel: chapterLabel || `${activeChapter.chapterNum} · ${activeChapter.shortTitle}` }
      : resolveMiraResponse(userMsg, activeChapter.id);

    setMessages((prev) => {
      const next = [
        ...prev,
        { role: 'user' as const, text: userMsg },
        {
          role: 'model' as const,
          tag: resolved.chapterLabel,
          text: resolved.answer,
        },
      ];
      const newModelIdx = next.length - 1;
      if (autoVoice) {
        setSpeakingMsgIdx(newModelIdx);
        audioService.narrateText(resolved.answer, (speaking) => {
          if (!speaking) setSpeakingMsgIdx(null);
        });
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#07090F] border border-amber-500/35 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0E17]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-head font-bold text-base sm:text-lg flex items-center gap-2">
                <span>MIRA · {activeChapter.chapterNum}: {activeChapter.fullTitle}</span>
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {activeChapter.location} · Team NovoSriti Mission Archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !autoVoice;
                setAutoVoice(next);
                if (!next && speakingMsgIdx !== null) {
                  audioService.stopNarration();
                  setSpeakingMsgIdx(null);
                } else if (next && messages.length > 0) {
                  const lastIdx = messages.length - 1;
                  setSpeakingMsgIdx(lastIdx);
                  audioService.narrateText(messages[lastIdx].text, (speaking) => {
                    if (!speaking) setSpeakingMsgIdx(null);
                  });
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                autoVoice
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
              }`}
              title="Toggle automatic voice readout for MIRA answers"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{autoVoice ? 'Auto-Voice: ON' : 'Auto-Voice: OFF'}</span>
            </button>
            <button
              onClick={() => {
                audioService.playClick();
                resetChat();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                audioService.playClick();
                audioService.stopNarration();
                setSpeakingMsgIdx(null);
                onClose();
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close MIRA"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Chapter's Curated Questions + Component & Website Quick Chips */}
        <div className="px-6 py-3.5 bg-[#090D16] border-b border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{activeChapter.chapterNum} · {activeChapter.shortTitle} Questions & Subsystems</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAskQuestion(`What are the components of ${chapterObj.machine}?`)}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer"
              >
                Explain Components
              </button>
              <button
                type="button"
                onClick={() => handleAskQuestion('Tell me about this website and Team NovoSriti')}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-white/5 text-slate-300 border border-white/15 hover:text-white cursor-pointer"
              >
                About Website
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeChapter.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  handleAskQuestion(
                    item.q,
                    item.a,
                    `${activeChapter.chapterNum} · ${activeChapter.shortTitle}`
                  )
                }
                className="text-left text-xs px-3 py-1.5 rounded bg-white/[0.04] hover:bg-amber-500/15 text-slate-200 hover:text-amber-200 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer"
              >
                {item.q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-4 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : 'bg-white/[0.04] text-slate-200 border border-white/10'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-400">
                      {msg.tag || 'MIRA ARCHIVE'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSpeakMessage(i, msg.text)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                        speakingMsgIdx === i
                          ? 'bg-amber-500 text-slate-950 font-semibold'
                          : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {speakingMsgIdx === i ? (
                        <>
                          <VolumeX className="w-3 h-3" /> Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-400" /> Listen
                        </>
                      )}
                    </button>
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(input);
          }}
          className="p-4 border-t border-white/10 bg-[#0A0E17] flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Say "hey", ask how a component works, or ask about ${activeChapter.shortTitle}...`}
            className="flex-1 bg-[#05070D] border border-white/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono text-xs tracking-widest uppercase font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Ask MIRA</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
