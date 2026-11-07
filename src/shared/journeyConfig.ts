import { MissionId } from '../missionLab/types/game';

export type EnvTheme = 'moon' | 'mars' | 'void';
export type EnvSubTheme =
  | 'moon-tranquillitatis'
  | 'moon-procellarum'
  | 'mars-viking'
  | 'mars-rover'
  | 'mars-ingenuity'
  | 'void-interstellar';

export interface JourneyStageSpec {
  index: number; // 0 to 5
  stageNumber: string; // '01' to '06'
  chapterId: string;
  missionId: MissionId;
  chapterTitle: string;
  missionName: string;
  envTheme: EnvTheme;
  envSubTheme: EnvSubTheme;
  envTitle: string;
  envLocation: string;
  centralQuestion: string;
  chapterToMissionHeadline: string;
  chapterToMissionBody: string;
  howItWorkedSteps: {
    step: string;
    detail: string;
    label: 'MISSION FACT' | 'SIMPLIFIED SIMULATION' | 'EDUCATIONAL ILLUSTRATION';
  }[];
  missionToNextHeadline: string;
  missionToNextQuestion: string;
  nextChapterTitle: string;
}

export const JOURNEY_STAGES: JourneyStageSpec[] = [
  {
    index: 0,
    stageNumber: '01',
    chapterId: 'ch1-retroreflector',
    missionId: 'apollo-reflector',
    chapterTitle: 'Apollo Laser Reflectors',
    missionName: 'Apollo Laser Reflector Mission',
    envTheme: 'moon',
    envSubTheme: 'moon-tranquillitatis',
    envTitle: 'THEME 1 · THE MOON',
    envLocation: 'Mare Tranquillitatis (0.67408° N, 23.47297° E)',
    centralQuestion: 'How far away is the Moon, exactly?',
    chapterToMissionHeadline:
      "You've discovered how we measure the distance to the Moon. Now, experience the mission that made it possible.",
    chapterToMissionBody:
      'Step onto the dusty grey regolith of Mare Tranquillitatis as an Apollo astronaut. Retrieve the passive corner-cube quartz prism array from the Lunar Module, align its sun gnomon toward Earth, and observe how Earth observatories time a 2.56-second laser echo.',
    howItWorkedSteps: [
      {
        step: '1. Passive Corner-Cube Array on the Moon',
        detail:
          'Apollo 11, 14, and 15 astronauts placed trays of fused-silica corner-cube prisms on the lunar surface. They require zero batteries or power.',
        label: 'MISSION FACT',
      },
      {
        step: '2. Laser Pulse Fired from Earth Observatory',
        detail:
          'The laser beam originates from telescopes on Earth (such as Apache Point or McDonald Observatory)—never from the Moon.',
        label: 'MISSION FACT',
      },
      {
        step: '3. 2.56-Second Round-Trip Photon Timing',
        detail:
          'By timing the exact round trip of reflected photons with atomic clocks, scientists measure the Earth–Moon distance to millimeter precision.',
        label: 'SIMPLIFIED SIMULATION',
      },
    ],
    missionToNextHeadline:
      "We've learned how far away the Moon is. But what lies beneath its silent surface?",
    missionToNextQuestion: 'What is the Moon like on the inside?',
    nextChapterTitle: 'Chapter 02: Apollo Seismometers',
  },
  {
    index: 1,
    stageNumber: '02',
    chapterId: 'ch2-seismometer',
    missionId: 'apollo-seismometer',
    chapterTitle: 'Apollo Seismometers',
    missionName: 'Apollo Seismometer Mission',
    envTheme: 'moon',
    envSubTheme: 'moon-procellarum',
    envTitle: 'THEME 1 · THE MOON',
    envLocation: 'Oceanus Procellarum (Apollo 12 ALSEP Site)',
    centralQuestion: 'What is the Moon like on the inside?',
    chapterToMissionHeadline:
      "You've learned how seismic waves revealed the Moon's interior. Now, deploy the listening station on the Ocean of Storms.",
    chapterToMissionBody:
      'Traverse the cratered lunar surface from the Apollo 12 Lunar Module, level the gold-shrouded Passive Seismic Experiment sensor, connect the SNAP-27 nuclear generator and helical telemetry antenna, and analyze a real lunar tremor.',
    howItWorkedSteps: [
      {
        step: '1. High-Sensitivity Seismic Pendulums',
        detail:
          'Protected under a Mylar thermal shroud, suspended masses detected ground motions smaller than an atomic diameter.',
        label: 'MISSION FACT',
      },
      {
        step: '2. SNAP-27 Radioisotope Power & S-Band Relay',
        detail:
          'Plutonium-238 thermoelectric power kept the ALSEP central station transmitting continuously through 14-day freezing lunar nights until 1977.',
        label: 'MISSION FACT',
      },
      {
        step: '3. Waveform Crust & Core Inversion',
        detail:
          'Analyzing over 12,000 moonquakes and meteorite impacts proved the Moon has a crust, mantle, and small metallic core.',
        label: 'EDUCATIONAL ILLUSTRATION',
      },
    ],
    missionToNextHeadline:
      'The Moon turned out to be quiet, layered rock. What about the rust-red world next door?',
    missionToNextQuestion: 'Is there life on Mars?',
    nextChapterTitle: 'Chapter 03: Viking Landers',
  },
  {
    index: 2,
    stageNumber: '03',
    chapterId: 'ch3-viking',
    missionId: 'viking',
    chapterTitle: 'Viking Landers',
    missionName: 'Viking Lander Mission',
    envTheme: 'mars',
    envSubTheme: 'mars-viking',
    envTitle: 'THEME 2 · MARS',
    envLocation: 'Chryse Planitia & Utopia Planitia',
    centralQuestion: 'Is there life on Mars?',
    chapterToMissionHeadline:
      "You've explored Viking's search for Martian biology. Now, operate the stationary lander on Chryse Planitia.",
    chapterToMissionBody:
      'Command the stationary Viking Lander on the boulder-strewn Martian plains. Sweep the twin facsimile cameras across the reddish-orange horizon, extend the 3-meter retractable scoop to trench Martian regolith, and run the onboard biological chamber analysis.',
    howItWorkedSteps: [
      {
        step: '1. Stationary Touchdown Platform',
        detail:
          'Viking 1 and 2 were stationary landers bolted to three shock-absorbing leg struts—they never drove or roved from their landing sites.',
        label: 'MISSION FACT',
      },
      {
        step: '2. 3-Meter Retractable Collector Boom',
        detail:
          'A motorized backhoe scoop trenched shallow Martian surface soil and sieved particles into the miniature laboratory inlet funnels.',
        label: 'MISSION FACT',
      },
      {
        step: '3. Labeled Release & GCMS Chemical Analysis',
        detail:
          'Nutrients released reactive oxygen gas from superoxides in the soil, while the mass spectrometer detected zero organic carbon.',
        label: 'SIMPLIFIED SIMULATION',
      },
    ],
    missionToNextHeadline:
      "Viking's chemical puzzle gave scientists a new strategy: before searching for life, follow the water.",
    missionToNextQuestion: 'Was Mars once wet?',
    nextChapterTitle: 'Chapter 04: Spirit & Opportunity',
  },
  {
    index: 3,
    stageNumber: '04',
    chapterId: 'ch4-mer',
    missionId: 'spirit-opportunity',
    chapterTitle: 'Spirit & Opportunity',
    missionName: 'Spirit & Opportunity Mission',
    envTheme: 'mars',
    envSubTheme: 'mars-rover',
    envTitle: 'THEME 2 · MARS',
    envLocation: 'Gusev Crater (Spirit) & Meridiani Planum (Opportunity)',
    centralQuestion: 'Was Mars once wet?',
    chapterToMissionHeadline:
      "You've seen how twin robotic geologists read Martian bedrock. Now, drive Spirit or Opportunity across the Red Planet.",
    chapterToMissionBody:
      'Take the helm of a solar-powered Mars Exploration Rover. Drive its 6-wheel rocker-bogie suspension across rocky Martian outcrops, frame Pancam spectral images, and deploy the diamond-tipped Rock Abrasion Tool (RAT) to grind away weathered crust.',
    howItWorkedSteps: [
      {
        step: '1. Rocker-Bogie Mobility & Pancam Mast',
        detail:
          'Twin rovers traversed kilometers of crater plains using stereo cameras to identify layered sedimentary outcrops and ancient hydrothermal soils.',
        label: 'MISSION FACT',
      },
      {
        step: '2. Surface Grinding via Rock Abrasion Tool (RAT)',
        detail:
          'Unlike later sample-caching rovers, Spirit and Opportunity used a revolving diamond grinding wheel to shave 5 mm off rock surfaces—not a core drill.',
        label: 'MISSION FACT',
      },
      {
        step: '3. Hematite "Blueberries" & Sulfate Proof',
        detail:
          'Inspecting freshly ground rock revealed mineral concretions and jarosite salts that only form in liquid water.',
        label: 'SIMPLIFIED SIMULATION',
      },
    ],
    missionToNextHeadline:
      'Spirit and Opportunity proved ancient Mars was once wet. Could a machine ever fly in its whisper-thin air?',
    missionToNextQuestion: 'Could anything fly on Mars?',
    nextChapterTitle: 'Chapter 05: Ingenuity Helicopter',
  },
  {
    index: 4,
    stageNumber: '05',
    chapterId: 'ch5-ingenuity',
    missionId: 'ingenuity',
    chapterTitle: 'Ingenuity Helicopter',
    missionName: 'Ingenuity Mission',
    envTheme: 'mars',
    envSubTheme: 'mars-ingenuity',
    envTitle: 'THEME 2 · MARS',
    envLocation: 'Jezero Crater ("Wright Brothers Field")',
    centralQuestion: 'Could anything fly on Mars?',
    chapterToMissionHeadline:
      "You've learned how Ingenuity conquered Mars's 1% atmosphere. Now, pilot the first aircraft on another world.",
    chapterToMissionBody:
      'Deploy Ingenuity in Jezero Crater after its arrival aboard the Perseverance rover. Spin its counter-rotating carbon-fiber blades past 2,400 RPM, lift off into the thin Martian air, navigate the aerial survey route, capture a recon photo, and land safely.',
    howItWorkedSteps: [
      {
        step: '1. Deployed from Perseverance in Jezero Crater',
        detail:
          'Carried to Mars tucked beneath the Perseverance rover belly, Ingenuity unfolded its four carbon-fiber legs onto Wright Brothers Field in April 2021.',
        label: 'MISSION FACT',
      },
      {
        step: '2. Counter-Rotating Blades at 2,400+ RPM',
        detail:
          'In an atmosphere less than 1% as dense as Earth’s, dual 1.2-meter coaxial rotors spun in opposite directions to generate lift in 0.38g gravity.',
        label: 'MISSION FACT',
      },
      {
        step: '3. Autonomous Visual Scouting Flight',
        detail:
          'Guided by a 30 fps downward navigation camera and laser altimeter, Ingenuity completed 72 historic flights before retiring in January 2024.',
        label: 'SIMPLIFIED SIMULATION',
      },
    ],
    missionToNextHeadline:
      'A helicopter proved machines can fly in alien skies. How far into the cosmic dark can human curiosity reach?',
    missionToNextQuestion: 'Where does the Sun’s reach end?',
    nextChapterTitle: 'Chapter 06: Voyager 1',
  },
  {
    index: 5,
    stageNumber: '06',
    chapterId: 'ch6-voyager',
    missionId: 'voyager1',
    chapterTitle: 'Voyager 1',
    missionName: 'Voyager 1 Mission',
    envTheme: 'void',
    envSubTheme: 'void-interstellar',
    envTitle: 'THEME 3 · THE VOID / DEEP SPACE',
    envLocation: 'Heliopause & Interstellar Medium (~25.9 Billion km)',
    centralQuestion: 'Where does the Sun’s reach end?',
    chapterToMissionHeadline:
      "You've traced Voyager 1's journey to the edge of the solar system. Now, command the probe across the heliopause into the Void.",
    chapterToMissionBody:
      'Enter the vast silence of deep space. Orient Voyager 1’s narrow-angle camera during its planetary flybys, look back to capture the Pale Blue Dot suspended in a sunbeam, detect the 40-fold plasma density surge at the heliopause, and inspect the Golden Record.',
    howItWorkedSteps: [
      {
        step: '1. RTG Nuclear Power in the Outer Dark',
        detail:
          'Three plutonium-238 Radioisotope Thermoelectric Generators power Voyager 1 billions of kilometers where sunlight is too faint for solar arrays.',
        label: 'MISSION FACT',
      },
      {
        step: '2. Crossing the Heliopause Plasma Boundary',
        detail:
          'In August 2012, the Plasma Wave Subsystem measured a 40x jump in electron density—confirming Voyager left the solar wind bubble (not a physical wall).',
        label: 'MISSION FACT',
      },
      {
        step: '3. 23+ Hour Deep Space Network Radio Link & Golden Record',
        detail:
          'Its 3.7-meter high-gain dish beams 160 bps X-band radio signals to Earth while carrying the Golden Record time capsule into the Milky Way.',
        label: 'EDUCATIONAL ILLUSTRATION',
      },
    ],
    missionToNextHeadline:
      'Voyager 1 continues its silent voyage between the stars. Now the relay of curiosity passes to you.',
    missionToNextQuestion: 'What question will you ask for the next machine?',
    nextChapterTitle: 'Finale: Your Question for the Next Machine',
  },
];

export interface PersistedJourneyState {
  prologueSeen: boolean;
  activeView: 'prologue' | 'chapter' | 'mission' | 'finale';
  currentStageIndex: number;
  visitedChapters: number[];
  completedChapters: number[];
  completedMissions: MissionId[];
  skippedMissions: MissionId[];
  roverChoice: 'spirit' | 'opportunity';
  reducedMotion: boolean;
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
  soundEnabled: boolean;
}

const STORAGE_KEY = 'mission_remnants_journey_v1';

export function loadJourneyState(): PersistedJourneyState {
  const defaultState: PersistedJourneyState = {
    prologueSeen: false,
    activeView: 'prologue',
    currentStageIndex: 0,
    visitedChapters: [0],
    completedChapters: [],
    completedMissions: [],
    skippedMissions: [],
    roverChoice: 'opportunity',
    reducedMotion:
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: false,
    textSize: 'normal',
    soundEnabled: false,
  };

  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      visitedChapters: Array.isArray(parsed.visitedChapters) ? parsed.visitedChapters : [0],
      completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
      completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
      skippedMissions: Array.isArray(parsed.skippedMissions) ? parsed.skippedMissions : [],
    };
  } catch {
    return defaultState;
  }
}

export function saveJourneyState(state: PersistedJourneyState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}
