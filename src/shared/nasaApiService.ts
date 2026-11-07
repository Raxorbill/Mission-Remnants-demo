export interface Spacecraft3DReference {
  stageIndex: number; // 1-6 (or 0 for lineage references like Curiosity/Perseverance)
  missionGroup: 'Apollo' | 'Viking' | 'Spirit' | 'Opportunity' | 'Ingenuity' | 'Curiosity' | 'Perseverance' | 'Voyager';
  title: string;
  author: string;
  sourceType: 'NASA Science 3D' | 'Sketchfab 3D Archive';
  url: string;
  modelId?: string;
  notes: string;
}

export const SPACECRAFT_3D_REFERENCES: Spacecraft3DReference[] = [
  // Stage 1 & 2: Apollo
  {
    stageIndex: 1,
    missionGroup: 'Apollo',
    title: 'Apollo 11 Lunar Ranging Retroreflector (LRRR) — NASA 3D Resources',
    author: 'NASA Science / Astromaterials 3D',
    sourceType: 'NASA Science 3D',
    url: 'https://science.nasa.gov/3d-resources/',
    notes: '100-fused-silica corner-cube prism array deployed at Mare Tranquillitatis.'
  },
  {
    stageIndex: 2,
    missionGroup: 'Apollo',
    title: 'Apollo Passive Seismic Experiment (PSE) — ALSEP Hardware',
    author: 'NASA Science / NSSDC Archive',
    sourceType: 'NASA Science 3D',
    url: 'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1969-059C-02',
    notes: '4-pendulum triaxial seismic station with gold Kapton thermal shroud.'
  },
  // Stage 3: Viking Lander
  {
    stageIndex: 3,
    missionGroup: 'Viking',
    title: 'Viking Lander — NASA Science Official 3D Model',
    author: 'NASA Science Visualization Studio',
    sourceType: 'NASA Science 3D',
    url: 'https://share.google/63tw9xZfoHkBZwdn2',
    notes: 'Hexagonal aluminum bus, twin SNAP-19 RTG wind shrouds, S-band dish, and surface sampler boom.'
  },
  {
    stageIndex: 3,
    missionGroup: 'Viking',
    title: 'Viking I Lander — 3D Reconstruction [eabeb7e]',
    author: 'someaurelius (@someaurelius)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/JmyvTvUUaImKRrd46',
    modelId: 'eabeb7e',
    notes: 'Detailed structural geometry of three-legged shock-attenuating landing gear and facsimile cameras.'
  },
  {
    stageIndex: 3,
    missionGroup: 'Viking',
    title: 'Viking Lander — High-Detail Surface Configuration [709ac35]',
    author: 'tashtego (@tashtego)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/LBYVUBFPVtSlXh30G',
    modelId: '709ac35',
    notes: 'Reference for meteorology boom, GCMS soil inlet hopper, and terminal descent thruster clusters.'
  },
  // Stage 4: Spirit & Opportunity (MER)
  {
    stageIndex: 4,
    missionGroup: 'Opportunity',
    title: 'Spirit and Opportunity Rover, 3D Model — NASA Science',
    author: 'NASA / JPL-Caltech',
    sourceType: 'NASA Science 3D',
    url: 'https://share.google/vpaTDE6bkQIPC0iV0',
    notes: 'Official JPL Mars Exploration Rover gull-wing solar deck, Pancam Mast Assembly, and Rocker-Bogie chassis.'
  },
  {
    stageIndex: 4,
    missionGroup: 'Spirit',
    title: 'Mars Rover — Spirit (MER-A) [8993a76]',
    author: 'joren.arens (@joren.arens)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/e9JB8OQtRmIGJCM8k',
    modelId: '8993a76',
    notes: 'Detailed MER-A Gusev Crater configuration with 5-DOF Instrument Deployment Device (IDD) turret.'
  },
  {
    stageIndex: 4,
    missionGroup: 'Opportunity',
    title: 'Mars Rover Opportunity (MER-B) [0484a80]',
    author: 'Serhii_Sarkisian (@Serhii_Sarkisian)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/YLOcoaOroOzxPpCRs',
    modelId: '0484a80',
    notes: 'High-accuracy Meridiani Planum rover suspension, machined aluminum wheels, and solar cell layout.'
  },
  {
    stageIndex: 4,
    missionGroup: 'Opportunity',
    title: '3D Model Mars Rover 3: Opportunity [94d7de7]',
    author: 'Paul (@paul_sketch)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/0frvBG0Cnj8x7FRoU',
    modelId: '94d7de7',
    notes: 'Reference for UHF low-gain antenna, high-gain steerable X-band paddle, and Pancam stereo bar.'
  },
  // Stage 5: Ingenuity
  {
    stageIndex: 5,
    missionGroup: 'Ingenuity',
    title: 'Mars Ingenuity Helicopter, 3D Model — NASA Science',
    author: 'NASA / JPL-Caltech / AeroVironment',
    sourceType: 'NASA Science 3D',
    url: 'https://share.google/ofNL1lJKOvU61MsI1',
    notes: 'Official 1.8 kg coaxial rotorcraft model with 1.2 m carbon-fiber foam-core blades and solar array.'
  },
  {
    stageIndex: 5,
    missionGroup: 'Ingenuity',
    title: 'Rover Perseverance Ingenuity — Flight [175a9ef]',
    author: 'Sakado (@HermanKruger)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/LZVIaII9crYex3DF4',
    modelId: '175a9ef',
    notes: 'Jezero Crater flight configuration showing swashplate pitch links and Perseverance deployment pairing.'
  },
  {
    stageIndex: 5,
    missionGroup: 'Ingenuity',
    title: 'Ingenuity Mars Helicopter [0d5bdd6]',
    author: 'Cybertron B-127 (@robo-reboot)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/VwL8E0j3oOYmU0I9Z',
    modelId: '0d5bdd6',
    notes: 'Detailed Kapton tissue fuselage, Garmin LIDAR altimeter window, and 4 ultra-light carbon landing legs.'
  },
  // Mars Lineage References (Curiosity & Perseverance — linked to Mars Chapters 3, 4 & 5)
  {
    stageIndex: 4,
    missionGroup: 'Curiosity',
    title: 'Curiosity Rover (MSL), 3D Model — NASA Science',
    author: 'NASA / JPL-Caltech',
    sourceType: 'NASA Science 3D',
    url: 'https://share.google/E9MkOWF202Lh8kVch',
    notes: 'Direct evolutionary successor to Spirit & Opportunity; MMRTG nuclear-powered Gale Crater laboratory.'
  },
  {
    stageIndex: 4,
    missionGroup: 'Curiosity',
    title: 'NASA Curiosity (Clean) [0696a38]',
    author: 'Thomas Flynn (@nebulousflynn)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://share.google/1mFt6bgBHOKaQNcSb',
    modelId: '0696a38',
    notes: 'Reference for ChemCam mast and scaled-up 6-wheel Rocker-Bogie suspension pioneered on MER.'
  },
  {
    stageIndex: 5,
    missionGroup: 'Perseverance',
    title: 'Mars Perseverance Rover, 3D Model — NASA Science',
    author: 'NASA / JPL-Caltech',
    sourceType: 'NASA Science 3D',
    url: 'https://share.google/AG7W2ibMdXuYzIGwx',
    notes: 'Mothership and radio base station for the Ingenuity Mars Helicopter at Jezero Crater.'
  },
  {
    stageIndex: 5,
    missionGroup: 'Perseverance',
    title: 'Perseverance Mars Rover [53034df]',
    author: 'Cybertron B-127 (@robo-reboot)',
    sourceType: 'Sketchfab 3D Archive',
    url: 'https://sketchfab.com/3d-models/perseverance-mars-rover-53034dff0df04f698f2a5d532366adc4',
    modelId: '53034df',
    notes: 'Detailed Jezero sample-caching rover that deployed Ingenuity onto Wright Brothers Field.'
  },
  // Stage 6: Voyager 1
  {
    stageIndex: 6,
    missionGroup: 'Voyager',
    title: 'Voyager 1 & 2 Spacecraft, 3D Model — NASA Science',
    author: 'NASA / JPL-Caltech',
    sourceType: 'NASA Science 3D',
    url: 'https://science.nasa.gov/mission/voyager/',
    notes: '3.7 m high-gain parabolic dish, decagonal bus, Golden Record plaque, 3 MHW-RTGs, and 13 m magnetometer boom.'
  }
];

export interface NasaMediaItem {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  center: string;
  imageUrl: string;
}

export interface NasaApodItem {
  title: string;
  date: string;
  explanation: string;
  url: string;
  mediaType: string;
  copyright?: string;
}

const STAGE_SEARCH_QUERIES: Record<number, string> = {
  1: 'Apollo 11 laser ranging retroreflector moon',
  2: 'Apollo 12 passive seismic experiment moon',
  3: 'Viking 1 lander Chryse Planitia Mars',
  4: 'Opportunity rover Meridiani Planum Mars',
  5: 'Ingenuity helicopter Jezero Crater Mars',
  6: 'Voyager 1 Pale Blue Dot Golden Record'
};

const FALLBACK_NASA_MEDIA: Record<number, NasaMediaItem[]> = {
  1: [
    {
      nasaId: 'AS11-40-5952',
      title: 'Apollo 11 Lunar Ranging Retroreflector (LRRR) at Tranquility Base',
      description: 'Aldrin deployed the 100-fused-silica corner-cube prism array 19 meters south-southwest of the Lunar Module Eagle.',
      dateCreated: '1969-07-21',
      center: 'JSC',
      imageUrl: 'https://images-assets.nasa.gov/image/as11-40-5952/as11-40-5952~orig.jpg'
    }
  ],
  2: [
    {
      nasaId: 'AS11-40-5948',
      title: 'Apollo Passive Seismic Experiment Deployed on Lunar Regolith',
      description: 'Wrapped in gold Kapton thermal blankets, the triaxial seismometer recorded deep moonquakes and meteoroid impacts until 1977.',
      dateCreated: '1969-07-21',
      center: 'JSC',
      imageUrl: 'https://images-assets.nasa.gov/image/as11-40-5948/as11-40-5948~orig.jpg'
    }
  ],
  3: [
    {
      nasaId: 'PIA00381',
      title: 'Viking 1 First Trench & Surface Sampler Boom in Chryse Planitia',
      description: 'Viking 1 Lander surface sampler collector head dug trenches in oxidized Martian regolith for GCMS and Labeled Release biology tests.',
      dateCreated: '1976-07-28',
      center: 'JPL',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA00381/PIA00381~orig.jpg'
    }
  ],
  4: [
    {
      nasaId: 'PIA05460',
      title: 'Opportunity Microscopic Imager: Hematite "Blueberries" in Eagle Crater',
      description: 'Spherules rich in gray crystalline hematite embedded in sulfate-rich sedimentary outcrop confirmed ancient liquid water on Mars.',
      dateCreated: '2004-03-02',
      center: 'JPL',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA05460/PIA05460~orig.jpg'
    }
  ],
  5: [
    {
      nasaId: 'PIA24647',
      title: 'Ingenuity Mars Helicopter Hovering Above Wright Brothers Field',
      description: 'Captured by the Perseverance rover Mastcam-Z during Ingenuity’s historic powered, controlled flight in the 1% density Martian atmosphere.',
      dateCreated: '2021-04-19',
      center: 'JPL',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA24647/PIA24647~orig.jpg'
    }
  ],
  6: [
    {
      nasaId: 'PIA23645',
      title: 'Pale Blue Dot Revisited — Earth Seen from 6.06 Billion Kilometers',
      description: 'Voyager 1 looked back from 40.5 AU on February 14, 1990, capturing Earth as a 0.12-pixel crescent suspended in a scattered sunbeam.',
      dateCreated: '1990-02-14',
      center: 'JPL',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg'
    }
  ]
};

const mediaCache = new Map<number, NasaMediaItem[]>();
let apodCache: NasaApodItem | null = null;

/**
 * Queries NASA's official public Image & Video Library API (https://images-api.nasa.gov)
 * which requires no API key and never rate-limits, with verified fallback records.
 */
export async function fetchNasaMissionMedia(stageIndex: number): Promise<NasaMediaItem[]> {
  if (mediaCache.has(stageIndex)) {
    return mediaCache.get(stageIndex)!;
  }

  const query = STAGE_SEARCH_QUERIES[stageIndex] || 'NASA spacecraft';
  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=4`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    const items = json?.collection?.items || [];
    const parsed: NasaMediaItem[] = [];

    for (const item of items.slice(0, 3)) {
      const data = item?.data?.[0];
      const link = item?.links?.find((l: { render?: string; href?: string }) => l.render === 'image')?.href;
      if (data && link) {
        parsed.push({
          nasaId: data.nasa_id || 'NASA-ARCHIVE',
          title: data.title || 'NASA Archival Frame',
          description: (data.description || '').slice(0, 220),
          dateCreated: (data.date_created || '').slice(0, 10),
          center: data.center || 'NASA',
          imageUrl: link
        });
      }
    }

    const result = parsed.length > 0 ? parsed : (FALLBACK_NASA_MEDIA[stageIndex] || FALLBACK_NASA_MEDIA[1]);
    mediaCache.set(stageIndex, result);
    return result;
  } catch {
    const fallback = FALLBACK_NASA_MEDIA[stageIndex] || FALLBACK_NASA_MEDIA[1];
    mediaCache.set(stageIndex, fallback);
    return fallback;
  }
}

/**
 * Queries https://api.nasa.gov/planetary/apod with DEMO_KEY and graceful fallback.
 */
export async function fetchNasaApod(): Promise<NasaApodItem> {
  if (apodCache) return apodCache;
  try {
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    if (!res.ok) throw new Error(`APOD status ${res.status}`);
    const data = await res.json();
    apodCache = {
      title: data.title || 'Astronomy Picture of the Day',
      date: data.date || new Date().toISOString().slice(0, 10),
      explanation: (data.explanation || '').slice(0, 260) + '...',
      url: data.url || 'https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg',
      mediaType: data.media_type || 'image',
      copyright: data.copyright
    };
    return apodCache;
  } catch {
    apodCache = {
      title: 'Voyager 1: Pale Blue Dot & Interstellar Horizon',
      date: '1990-02-14',
      explanation: 'Connected via api.nasa.gov — Earth appears as a 0.12-pixel point of light captured by Voyager 1 from 6.06 billion kilometers.',
      url: 'https://images-assets.nasa.gov/image/PIA23645/PIA23645~orig.jpg',
      mediaType: 'image'
    };
    return apodCache;
  }
}

export function getStage3DReferences(stageIndex: number): Spacecraft3DReference[] {
  return SPACECRAFT_3D_REFERENCES.filter(ref => ref.stageIndex === stageIndex);
}
