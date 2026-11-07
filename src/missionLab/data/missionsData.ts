import { MissionData, RoverChoice } from '../types/game';

export const ROVER_CHOICES: RoverChoice[] = [
  {
    roverId: 'spirit',
    name: 'Spirit (MER-A)',
    location: 'Gusev Crater, Mars',
    objectiveHint: 'Explore volcanic rocks and clues of past water inside an ancient impact crater.',
    description: 'Arrived on Mars in January 2004. Overcame rough terrain to uncover silica-rich deposits indicating ancient hot springs or steam vents.'
  },
  {
    roverId: 'opportunity',
    name: 'Opportunity (MER-B)',
    location: 'Meridiani Planum, Mars',
    objectiveHint: 'Explore layered sedimentary rocks and hematite spherules ("blueberries") formed in ancient acidic water.',
    description: 'Operated for nearly 15 years and covered over 45 kilometers, providing definitive proof of liquid water in Mars’ ancient past.'
  }
];

export const MISSIONS_DATA: Record<string, MissionData> = {
  'apollo-reflector': {
    id: 'apollo-reflector',
    number: '01',
    name: 'Apollo Laser Reflectors',
    subtitle: 'PLACE THE MIRROR THAT SENDS LIGHT HOME',
    destination: 'Moon',
    locationDetails: 'Mare Tranquillitatis / Fra Mauro / Hadley Rille',
    dateOrEra: 'Apollo 11, 14, 15 (1969–1971)',
    spacecraftType: 'Lunar Retroreflector Array (LRRR)',
    summary: 'Deploy a passive corner-cube prism array on the lunar regolith and observe how Earth-based observatories measure distance via round-trip laser photon timing.',
    historicalContext: 'During the Apollo lunar landings, astronauts deployed passive corner-cube retroreflector arrays on the lunar surface. Because corner-cube prisms reflect light directly back toward its source regardless of incoming angle, ground stations on Earth could fire high-power laser pulses at the Moon and calculate the Earth–Moon distance with millimeter precision by timing the light’s round trip.',
    mainGameplayDescription: 'Astronaut surface mobility, equipment retrieval from Lunar Module equipment bay, precision deployment, and Earth-observatory laser ranging demonstration.',
    keyComponents: [
      { name: 'Corner-Cube Quartz Prisms', description: 'Precision glass corner reflectors designed to bounce incoming light back precisely 180° towards the Earth transmitter.' },
      { name: 'Thermal Insulation Pallet', description: 'Passive shielding structure designed to keep quartz prisms at stable temperatures during extreme lunar day/night transitions.' },
      { name: 'Alignment Handle & Gnomon', description: 'Sun-angle shadow dial used by astronauts to orient the array directly facing Earth.' }
    ],
    objectives: [
      { id: 'reach_deployment', title: 'Reach deployment area', description: 'Step onto the lunar surface and proceed to the designated stable experiment zone.' },
      { id: 'deploy_reflector', title: 'Deploy the reflector array', description: 'Retrieve the LRRR pallet from the Lunar Module equipment bay and set it firmly on the regolith.' },
      { id: 'return_laser', title: 'Complete laser demonstration', description: 'Trigger a calibrated laser pulse from the Earth observatory and measure the return reflection.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'The lunar laser reflector is completely passive and contains no batteries, electronics, or transmitter. It is still in active scientific use today.' },
      { type: 'SIMPLIFIED SIMULATION', text: 'Laser beam visualization and round-trip timing (~2.56 seconds) are simplified demonstrations for educational clarity.' }
    ],
    completionTitle: 'LUNAR LASER REFLECTOR DEPLOYED',
    learningCard: 'The reflector has no power supply. Its corner cubes return laser light toward the source. Scientists use the travel time of the light to measure the Earth–Moon distance down to millimeter precision, discovering the Moon drifts away by 3.8 cm per year.',
    historicalFact: 'The Lunar Laser Ranging Experiment is the only Apollo scientific equipment that continues to generate real-time science data more than 50 years after deployment.',
    accuracyNote: 'The laser source is situated on Earth, never the Moon. The lunar reflector only bounces back the Earth-sent photons.',
    sources: [
      { title: 'International Laser Ranging Service (ILRS) - Apollo Retroreflectors' },
      { title: 'NASA / U.S. Government Lunar Historic Sites Report (2023)' }
    ]
  },

  'apollo-seismometer': {
    id: 'apollo-seismometer',
    number: '02',
    name: 'Apollo Seismometers',
    subtitle: 'LISTEN TO THE MOON',
    destination: 'Moon',
    locationDetails: 'Oceanus Procellarum (Apollo 12 ALSEP Site)',
    dateOrEra: 'Apollo 12 (November 1969)',
    spacecraftType: 'Passive Seismic Experiment (PSE) / ALSEP',
    summary: 'Deploy an Apollo 12-style lunar seismic station, connect its central data transmitter and antenna, and interpret deep-lunar vibration wave patterns.',
    historicalContext: 'To discover whether the Moon possesses a core, mantle, and crust like Earth, Apollo 12 astronauts installed a sensitive seismometer as part of the Apollo Lunar Surface Experiments Package (ALSEP). It recorded deep moonquakes, thermal quakes, and meteorite impacts over several years.',
    mainGameplayDescription: 'Surface navigation, ALSEP station layout, cable interconnection, radio antenna deployment, and lunar seismogram trace detection.',
    keyComponents: [
      { name: 'Passive Seismometer Sensor', description: 'High-sensitivity instrument with beryllium copper springs capable of sensing vibrations one-millionth of a millimeter.' },
      { name: 'Mylar Thermal Shroud', description: 'Multi-layer insulation blanket protecting sensitive sensors from the 250°F to -250°F lunar temperature swings.' },
      { name: 'Central Station & Helical Antenna', description: 'Power distribution and telemetry hub transmitting seismic waveform data directly back to Earth stations.' },
      { name: 'SNAP-27 Radioisotope Power (RTG)', description: 'Plutonium-238 thermoelectric generator providing steady 70 watts of continuous electrical power.' }
    ],
    objectives: [
      { id: 'deploy_seismometer', title: 'Deploy the seismometer', description: 'Move from the Lunar Module to the deployment site and level the seismic sensor unit.' },
      { id: 'prepare_station', title: 'Prepare the station', description: 'Route the cable to the ALSEP Central Station and unfurl the directional transmitter antenna.' },
      { id: 'detect_signal', title: 'Detect a vibration signal', description: 'Begin passive listening and inspect the incoming seismic waveform from a lunar event.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'Apollo seismometers revealed that the Moon has a solid inner core and deep moonquakes triggered by Earth gravitational tidal stresses.' },
      { type: 'SIMPLIFIED SIMULATION', text: 'The displayed seismic waveform is an illustrative representation of real Apollo passive seismic recordings.' }
    ],
    completionTitle: 'LUNAR SIGNAL DETECTED',
    learningCard: 'A seismometer measures ground vibrations. Apollo instruments detected deep moonquakes, shallow shocks, and meteorite impacts. Scientists used the wave patterns to reveal the Moon’s crust, mantle, and small metallic core.',
    historicalFact: 'When the spent Apollo 12 Lunar Module ascent stage was deliberately crashed into the Moon after the astronauts returned, the seismometers registered vibrations for more than an hour, showing the dry lunar crust rings like a bell.',
    accuracyNote: 'Apollo 12 ALSEP station hardware is featured; Apollo 11 carried an earlier prototype known as the Early Apollo Scientific Experiments Package (EASEP).',
    sources: [
      { title: 'NASA Planetary Data System - Apollo 12 PSE' },
      { title: 'JAXA / DARTS - Apollo Passive Seismic Data' }
    ]
  },

  'viking': {
    id: 'viking',
    number: '03',
    name: 'Viking Landers',
    subtitle: 'SEARCH FOR SIGNS OF LIFE',
    destination: 'Mars',
    locationDetails: 'Chryse Planitia / Utopia Planitia',
    dateOrEra: 'Viking 1 & Viking 2 (1976)',
    spacecraftType: 'Stationary Planetary Lander & Science Laboratory',
    summary: 'Conduct Mars descent and touchdown, capture the first panoramic views of the Martian surface, scoop regolith with a robotic sampler arm, and test for biological activity.',
    historicalContext: 'In the summer of 1976, NASA’s Viking 1 and Viking 2 successfully achieved the first operational touchdowns on Mars. As stationary platforms, each lander carried two facsimile cameras, a 3-meter retractable robotic arm, and an automated onboard biochemistry laboratory to search for Martian microorganisms.',
    mainGameplayDescription: 'Stationary lander operations: landing site confirmation, panoramic camera sweep, robotic scoop articulation, sample inlet delivery, and biological experiment execution.',
    keyComponents: [
      { name: 'Retractable Collector Arm & Scoop', description: '3-meter extendable boom with a motorized backhoe scoop and sieve for excavating Martian soil samples.' },
      { name: 'Biological Instrument Inlet', description: 'Funnel hatch leading to the Gas Exchange, Labeled Release, and Pyrolytic Release automated test chambers.' },
      { name: 'Facsimile Cameras (Pancam)', description: 'Twin scanning optical sensor heads providing 360-degree stereoscopic color panoramas.' },
      { name: 'Meteorology Boom', description: 'Sensor mast measuring wind velocity, temperature, and atmospheric pressure at the Martian surface.' }
    ],
    objectives: [
      { id: 'photograph_site', title: 'Photograph the landing site', description: 'Orient the facsimile camera and capture a crisp 360° panorama of the Chryse Planitia rocky plain.' },
      { id: 'collect_soil', title: 'Collect a soil sample', description: 'Extend the robotic scoop to trench the regolith and deposit the sample into the biological inlet funnel.' },
      { id: 'analyze_sample', title: 'Analyze the sample & transmit', description: 'Run the Pyrolytic and Labeled Release chemistry cycle and transmit experimental telemetry to Earth.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'Viking was a stationary lander, NOT a rover. It never moved from its landing site after touchdown.' },
      { type: 'MISSION FACT', text: 'Viking experiments produced intriguing chemical reactions caused by reactive superoxides, but found no conclusive evidence of living microbes.' }
    ],
    completionTitle: 'SOIL EXPERIMENT COMPLETE',
    learningCard: 'Viking tested Martian soil for possible signs of life. The results were scientifically fascinating: while oxygen and gases were released when soil was moistened with nutrients, scientists concluded this was caused by highly reactive oxidizing minerals in the soil rather than living microorganisms.',
    historicalFact: 'Viking 1 transmitted data from Mars for over six years until November 1982, providing humanity’s first weather reports from another world.',
    accuracyNote: 'Do not claim Viking proved Mars is sterile. It showed no detectable living microbes at the specific shallow surface sites sampled.',
    sources: [
      { title: 'NASA Science - Viking Project & Spacecraft Science' },
      { title: 'NASA JPL - Viking 1 and 2 Mission Archives' }
    ]
  },

  'spirit-opportunity': {
    id: 'spirit-opportunity',
    number: '04',
    name: 'Spirit & Opportunity',
    subtitle: 'EXPLORE THE RED PLANET',
    destination: 'Mars',
    locationDetails: 'Gusev Crater (Spirit) & Meridiani Planum (Opportunity)',
    dateOrEra: 'Mars Exploration Rovers (2004–2018)',
    spacecraftType: 'Solar-Powered Mars Exploration Rover (MER)',
    summary: 'Traverse the red landscape, frame high-resolution geological panoramic targets with the Pancam, and deploy the Rock Abrasion Tool (RAT) to expose pristine rock layers.',
    historicalContext: 'In 2004, the twin Mars Exploration Rovers Spirit and Opportunity landed on opposite sides of Mars. Equipped with a rocker-bogie mobility system, solar arrays, Pancam mast, and an Instrument Deployment Device (IDD) arm carrying a diamond-tipped grinding wheel (RAT), their mission was to read the rocks for clues of ancient Martian water.',
    mainGameplayDescription: 'Rover selection, rocker-bogie driving, Pancam target framing, rock proximity approach, and Rock Abrasion Tool surface grinding.',
    keyComponents: [
      { name: 'Rocker-Bogie Suspension', description: 'Six-wheel mechanical linkage allowing the rover to climb over rocks larger than its own wheels without tipping.' },
      { name: 'Rock Abrasion Tool (RAT)', description: 'Diamond-tipped grinding bit that abrades the top layers of weathered rock to expose unweathered mineral interiors.' },
      { name: 'Panoramic Camera (Pancam)', description: 'High-mounted stereoscopic camera system equipped with multiple spectral filters to identify iron minerals.' },
      { name: 'Microscopic Imager (MI)', description: 'Close-up camera revealing millimeter-scale mineral textures and "blueberries" (hematite concretions).' }
    ],
    objectives: [
      { id: 'target_a', title: 'Reach and photograph Target A', description: 'Drive the rover to the first geological outcrop and capture a Pancam multi-filter image.' },
      { id: 'target_b', title: 'Reach and photograph Target B', description: 'Navigate across the terrain to Target B and align the camera optics.' },
      { id: 'inspect_rat', title: 'Inspect rock surface with RAT', description: 'Approach the rock target and spin the Rock Abrasion Tool to grind away dusty coating and inspect the fresh matrix.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'The Rock Abrasion Tool (RAT) was a surface grinder (removing 5mm of weathered crust), NOT a deep coring drill or sample return system.' },
      { type: 'SIMPLIFIED SIMULATION', text: 'Rover driving mechanics and Pancam frame captures are simplified for educational exploration.' }
    ],
    completionTitle: 'MARTIAN TERRAIN EXPLORED',
    learningCard: 'Spirit and Opportunity used cameras and scientific tools to study Martian rocks and soil. The RAT ground away dusty, weathered rock surfaces so instruments could inspect fresher material, discovering hematite spherules and silica deposits proving liquid water once flowed on Mars.',
    historicalFact: 'Originally planned for a 90-day mission, Spirit operated for 6 years and Opportunity survived for an astonishing 14 years and 138 days!',
    accuracyNote: 'Do not depict Spirit or Opportunity drilling deep cores or storing samples; their job was in-situ surface contact spectroscopy.',
    sources: [
      { title: 'NASA Science - MER Spirit & Opportunity Science Instruments' },
      { title: 'NASA JPL - Mars Exploration Rover Mission Highlights' }
    ]
  },

  'ingenuity': {
    id: 'ingenuity',
    number: '05',
    name: 'Ingenuity',
    subtitle: 'THE FIRST POWERED FLIGHT ON ANOTHER WORLD',
    destination: 'Mars',
    locationDetails: 'Jezero Crater ("Wright Brothers Field")',
    dateOrEra: '2021–2024 (72 Historic Flights)',
    spacecraftType: 'Autonomous Aerial Scout & Technology Demonstrator',
    summary: 'Deploy Ingenuity on the Martian surface, spin carbon-fiber rotors to 2,400+ RPM in Mars’ ultra-thin atmosphere, navigate an aerial flightpath, and land safely.',
    historicalContext: 'Mars has an atmospheric density less than 1% of Earth’s at sea level. Ingenuity proved that aerodynamic flight is possible on another world by utilizing ultra-lightweight composite materials, dual counter-rotating carbon fiber blades spinning over 2,400 RPM, and autonomous real-time visual navigation. Ingenuity completed 72 flights over 3 years before retiring.',
    mainGameplayDescription: 'Helicopter deployment, pre-flight telemetry diagnostics, rotor spin-up, vertical liftoff, 3D aerial navigation through waypoints, aerial photo capture, and touchdown.',
    keyComponents: [
      { name: 'Dual Coaxial Counter-Rotating Blades', description: '1.2-meter diameter carbon-fiber foam-core blades spinning at ~2,500 RPM to generate lift in 1% atmosphere.' },
      { name: 'Solar Array & Lithium-Ion Batteries', description: 'Top-mounted solar panel charging Sony lithium-ion cells engineered to survive -130°F Martian nights.' },
      { name: 'Downward Navigation Camera', description: 'Black-and-white camera tracking surface features at 30 frames per second for real-time autonomous flight drift correction.' },
      { name: 'Fuselage Avionics Cube', description: 'Lightweight core housing smartphone-grade processors, laser altimeter, and dual-axis inclinometer.' }
    ],
    objectives: [
      { id: 'deploy_ingenuity', title: 'Deploy and prepare Ingenuity', description: 'Release the helicopter, unfold landing legs, and run pre-flight diagnostics.' },
      { id: 'fly_route', title: 'Complete the aerial route', description: 'Spin rotors to flight speed, take off to 5 meters altitude, and pilot through designated aerial waypoints.' },
      { id: 'capture_and_land', title: 'Capture image and land safely', description: 'Snap a high-resolution aerial scout photograph of the crater and execute a soft touchdown in the landing zone.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'Ingenuity was carried to Mars as a technology demonstration; it did not fly to Mars independently from Earth.' },
      { type: 'MISSION FACT', text: 'Ingenuity completed 72 flights between 2021 and 2024. Rotor-blade damage on Flight 72 ended its flight mission on January 18, 2024.' }
    ],
    completionTitle: 'FLIGHT DEMONSTRATION COMPLETE',
    learningCard: 'Ingenuity proved that powered, controlled aerodynamic flight is possible in the ultra-thin air of another planet. Originally designed as a 30-day technology demonstration with up to five flights, it flew 72 times across 1,004 days, proving that future Mars missions can explore from the air.',
    historicalFact: 'Ingenuity carried a small piece of fabric from the wing of the 1903 Wright Flyer attached under its solar panel, honoring humanity’s first powered flight on Earth.',
    accuracyNote: 'This is a historical recreation. Ingenuity concluded its mission on January 25, 2024, after sustaining damage to its rotor blade tips on Flight 72.',
    sources: [
      { title: 'NASA Science - Ingenuity Mars Helicopter Mission Overview' },
      { title: 'NASA News Release - After Three Years on Mars, NASA’s Ingenuity Ends Mission' }
    ]
  },

  'voyager1': {
    id: 'voyager1',
    number: '06',
    name: 'Voyager 1',
    subtitle: 'BEYOND THE SUN\'S REACH',
    destination: 'Deep space',
    locationDetails: 'Outer Solar System & Interstellar Space',
    dateOrEra: 'Launched September 5, 1977 (Active Interstellar Mission)',
    spacecraftType: 'Deep-Space Interstellar Probe',
    summary: 'Navigate past Jupiter and Saturn, capture the iconic "Pale Blue Dot" photograph, detect the sharp plasma density rise of the Heliopause crossing, and inspect the Golden Record.',
    historicalContext: 'Launched in 1977, Voyager 1 transformed our understanding of the outer solar system, discovering volcanic activity on Jupiter’s moon Io and the dense atmosphere of Saturn’s moon Titan. In August 2012, at a distance of over 18 billion kilometers from the Sun, its instruments recorded a dramatic 40-fold spike in plasma density, confirming it had crossed the heliopause into interstellar space—the first human-made object to do so.',
    mainGameplayDescription: 'Spacecraft component diagnostics, planetary flyby camera aiming at Io and Saturn, gravity assist acceleration, Pale Blue Dot camera re-orientation, Heliopause plasma wave detection, Deep Space Network antenna alignment, and Golden Record inspection.',
    keyComponents: [
      { name: '3.7m High-Gain Parabolic Reflector', description: 'Large dish antenna focusing narrow 8 GHz radio signals across tens of billions of kilometers back to Earth.' },
      { name: 'Radioisotope Thermoelectric Generators (RTGs)', description: 'Three SNAP-19 RTGs generating power from the radioactive decay of plutonium-238 oxide pellets.' },
      { name: 'Plasma Wave Subsystem (PWS)', description: 'Dual 10-meter V-shaped antennas measuring the electron density of interstellar and solar wind plasma.' },
      { name: 'The Golden Record', description: 'Gold-plated copper phonograph record containing sounds, music, 115 images, and greetings in 55 languages (including Bengali).' },
      { name: '13m Magnetometer Boom', description: 'Extendable fiberglass boom isolating delicate magnetic sensors away from the spacecraft electronics.' }
    ],
    objectives: [
      { id: 'flyby_target', title: 'Capture a flyby image', description: 'Aim the Voyager narrow-angle camera crosshairs at the volcanic plume on Io as you swing past Jupiter.' },
      { id: 'pale_blue_dot', title: 'Capture the view of Earth', description: 'Re-orient the spacecraft camera toward the inner solar system and capture the historic "Pale Blue Dot" (1990).' },
      { id: 'detect_interstellar', title: 'Detect interstellar space', description: 'Monitor the Plasma Wave Subsystem instrument to confirm the density surge as Voyager crosses the Heliopause.' }
    ],
    truthLabels: [
      { type: 'MISSION FACT', text: 'Voyager 1 is a flyby probe that never lands, orbits, or returns. Its cameras were permanently shut down after 1990 to conserve power.' },
      { type: 'MISSION FACT', text: 'Crossing the heliopause means leaving the solar wind bubble, but Voyager 1 will take another 300 years to reach the inner edge of the Oort Cloud.' }
    ],
    completionTitle: 'INTERSTELLAR SPACE REACHED',
    learningCard: 'Voyager 1 was launched in 1977 to explore Jupiter and Saturn. Powered by long-lasting radioisotope generators, it continued outward and in August 2012 became the first human craft to enter interstellar space. It carries the Golden Record, a cosmic greeting card to any intelligence that might one day find it.',
    historicalFact: 'Radio signals traveling at the speed of light take more than 22.5 hours to travel from Voyager 1 back to NASA’s Deep Space Network dishes on Earth!',
    accuracyNote: 'The Golden Record is a cultural message, not an active scientific transmitter. The heliopause is a dynamic plasma boundary, not a solid barrier.',
    sources: [
      { title: 'NASA Science - Voyager 1 The Farthest Traveler' },
      { title: 'NASA JPL - Voyager Interstellar Mission & Golden Record' }
    ]
  }
};
