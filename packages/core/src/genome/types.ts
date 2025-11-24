export interface Genome {
  red60: number[];
  blue60: number[];
  black60: number[];
}

export interface GenomeHash {
  redHash: string;
  blueHash: string;
  blackHash: string;
}

export interface ElementTraits {
  bridgeScore: number;
  frontierWeight: number;
  chargeVector: {
    c2: number;
    c3: number;
    c5: number;
  };
  heptaSignature: {
    total: readonly [number, number, number];
    mod7: readonly [number, number, number];
  };
  elementWave: {
    real: number;
    imag: number;
    magnitude: number;
    angle: number;
  };
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
  elements: ElementTraits;
}
