/**
 * Genome Core Types
 *
 * The genome is encoded in three 60-digit arrays:
 * - Red60: Physical traits (body, color, texture, patterns)
 * - Blue60: Personality traits (behavior, preferences, tendencies)
 * - Black60: Hidden/latent traits (potential, rare abilities, evolution paths)
 */

export interface Genome {
  red60: number[];   // 60 digits, range 0-6 (base-7)
  blue60: number[];  // 60 digits, range 0-6 (base-7)
  black60: number[]; // 60 digits, range 0-6 (base-7)
}

export interface GenomeHash {
  redHash: string;   // SHA-256 of red60
  blueHash: string;  // SHA-256 of blue60
  blackHash: string; // SHA-256 of black60
}

// Physical trait categories derived from Red60
export interface PhysicalTraits {
  bodyType: string;        // digits 0-4: core body structure
  primaryColor: string;    // digits 5-9: main coloration
  secondaryColor: string;  // digits 10-14: accent colors
  pattern: string;         // digits 15-19: skin/fur patterns
  texture: string;         // digits 20-24: surface texture
  size: number;            // digits 25-29: relative size (0.5-2.0)
  proportions: {           // digits 30-44: body ratios
    headRatio: number;
    limbRatio: number;
    tailRatio: number;
  };
  features: string[];      // digits 45-59: special features (horns, wings, etc)
}

// Personality trait categories derived from Blue60
export interface PersonalityTraits {
  temperament: string;     // digits 0-4: base personality type
  energy: number;          // digits 5-9: activity level (0-100)
  social: number;          // digits 10-14: sociability (0-100)
  curiosity: number;       // digits 15-19: exploration drive (0-100)
  discipline: number;      // digits 20-24: trainability (0-100)
  affection: number;       // digits 25-29: bonding tendency (0-100)
  independence: number;    // digits 30-34: self-sufficiency (0-100)
  playfulness: number;     // digits 35-39: play drive (0-100)
  loyalty: number;         // digits 40-44: attachment strength (0-100)
  quirks: string[];        // digits 45-59: unique behaviors
}

// Hidden/latent traits derived from Black60
export interface LatentTraits {
  evolutionPath: string;   // digits 0-9: primary evolution destiny
  rareAbilities: string[]; // digits 10-29: unlockable special abilities
  potential: {             // digits 30-44: growth ceilings
    physical: number;
    mental: number;
    social: number;
  };
  hiddenGenes: number[];   // digits 45-59: recessive traits for breeding
}

export interface DerivedTraits {
  physical: PhysicalTraits;
  personality: PersonalityTraits;
  latent: LatentTraits;
}

// Trait derivation configuration
export interface TraitDerivation {
  path: string;            // JSON path to trait
  digitRange: [number, number]; // [start, end) indices in array
  decoder: (digits: number[]) => string | number | string[] | Record<string, number>; // Function to decode digits to trait value
}
