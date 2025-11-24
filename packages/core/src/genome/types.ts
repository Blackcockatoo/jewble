export interface Genome {
  red60: number[];
  blue60: number[];
  black60: number[];
}

export type SequenceColor = 'RED' | 'BLACK' | 'BLUE';

export interface ElementInfo {
  atomicNumber: number;
  symbol: string;
  name: string;
  sequences?: SequenceColor[];
}

export interface ResidueMeta {
  residue: number; // 0–59
  elements: ElementInfo[];
  hasBridge60: boolean;
  hasFrontier: boolean;
  isVoid: boolean;
}

export type ElementResidue = ResidueMeta;

export interface ElementWebSummary {
  usedResidues: number[];
  pairSlots: number[];
  frontierSlots: number[];
  voidSlotsHit: number[];
  coverage: number;
  frontierAffinity: number;
  bridgeCount: number;
  voidDrift: number;
}

export interface GenomeHash {
  redHash: string;
  blueHash: string;
  blackHash: string;
}

export interface PhysicalTraits {
  bodyType: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  texture: string;
  size: number;
  proportions: {
    headRatio: number;
    limbRatio: number;
    tailRatio: number;
  };
  features: string[];
}

export interface PersonalityTraits {
  temperament: string;
  energy: number;
  social: number;
  curiosity: number;
  discipline: number;
  affection: number;
  independence: number;
  playfulness: number;
  loyalty: number;
  quirks: string[];
}

export interface LatentTraits {
  evolutionPath: string;
  rareAbilities: string[];
  potential: {
    physical: number;
    mental: number;
    social: number;
  };
  hiddenGenes: number[];
}

export interface DerivedTraits {
  physical: PhysicalTraits;
  personality: PersonalityTraits;
  latent: LatentTraits;
  elementWeb: ElementWebSummary;
}
