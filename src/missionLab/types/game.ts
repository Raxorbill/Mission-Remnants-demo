export type MissionId =
  | 'apollo-reflector'
  | 'apollo-seismometer'
  | 'viking'
  | 'spirit-opportunity'
  | 'ingenuity'
  | 'voyager1';

export type Destination = 'Moon' | 'Mars' | 'Deep space';

export type GameScreen =
  | 'title'
  | 'select'
  | 'briefing'
  | 'playing'
  | 'complete';

export interface Objective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface TruthLabel {
  type: 'MISSION FACT' | 'SIMPLIFIED SIMULATION' | 'EDUCATIONAL ILLUSTRATION';
  text: string;
}

export interface MissionData {
  id: MissionId;
  number: string;
  name: string;
  subtitle: string;
  destination: Destination;
  locationDetails: string;
  dateOrEra: string;
  spacecraftType: string;
  summary: string;
  historicalContext: string;
  mainGameplayDescription: string;
  keyComponents: {
    name: string;
    description: string;
  }[];
  objectives: {
    id: string;
    title: string;
    description: string;
  }[];
  truthLabels: TruthLabel[];
  completionTitle: string;
  learningCard: string;
  historicalFact: string;
  accuracyNote: string;
  sources: { title: string; url?: string }[];
}

export interface RoverChoice {
  roverId: 'spirit' | 'opportunity';
  name: string;
  location: string;
  objectiveHint: string;
  description: string;
}

export interface MissionTelemetry {
  altitude?: number;
  speed?: number;
  heading?: number;
  distanceToTarget?: number;
  signalLatency?: string;
  batteryStatus?: number;
  rotorRPM?: number;
  lightTravelTime?: number;
  plasmaDensity?: number;
}
