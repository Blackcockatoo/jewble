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

/**
 * Decode digits to temperament
 */
function decodeTemperament(digits: number[]): string {
  const sum = digits.reduce((a, b) => a + b, 0) % 7;
  const temperaments = ['Calm', 'Energetic', 'Shy', 'Bold', 'Playful', 'Serious', 'Curious'];
  return temperaments[sum];
}

/**
 * Decode digits to body type
 */
function decodeBodyType(digits: number[]): string {
  const sum = digits.reduce((a, b) => a + b, 0) % 7;
  const bodyTypes = ['Compact', 'Slender', 'Muscular', 'Round', 'Tall', 'Squat', 'Fluid'];
  return bodyTypes[sum];
}

/**
 * Decode digits to color
 */
function decodeColor(digits: number[]): string {
  const sum = digits.reduce((a, b) => a + b, 0) % 12;
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE',
    '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894'
  ];
  return colors[sum];
}

/**
 * Decode digits to pattern
 */
function decodePattern(digits: number[]): string {
  const sum = digits.reduce((a, b) => a + b, 0) % 7;
  const patterns = ['Solid', 'Striped', 'Spotted', 'Gradient', 'Marbled', 'Metallic', 'Crystalline'];
  return patterns[sum];
}

/**
 * Decode digits to texture
 */
function decodeTexture(digits: number[]): string {
  const sum = digits.reduce((a, b) => a + b, 0) % 7;
  const textures = ['Smooth', 'Fuzzy', 'Scaly', 'Feathered', 'Crystalline', 'Ethereal', 'Metallic'];
  return textures[sum];
}

/**
 * Decode digits to number in range
 */
function decodeNumber(digits: number[], min: number, max: number): number {
  const sum = digits.reduce((a, b) => a + b, 0);
  const normalized = sum / (digits.length * 6); // Max value is 6 per digit
  return min + normalized * (max - min);
}

/**
 * Decode physical traits from Red60
 */
export function decodePhysicalTraits(red60: number[]): PhysicalTraits {
  return {
    bodyType: decodeBodyType(red60.slice(0, 5)),
    primaryColor: decodeColor(red60.slice(5, 10)),
    secondaryColor: decodeColor(red60.slice(10, 15)),
    pattern: decodePattern(red60.slice(15, 20)),
    texture: decodeTexture(red60.slice(20, 25)),
    size: decodeNumber(red60.slice(25, 30), 0.5, 2.0),
    proportions: {
      headRatio: decodeNumber(red60.slice(30, 35), 0.8, 1.5),
      limbRatio: decodeNumber(red60.slice(35, 40), 0.7, 1.3),
      tailRatio: decodeNumber(red60.slice(40, 45), 0.5, 1.5),
    },
    features: [], // Could decode features from digits 45-59
  };
}

/**
 * Decode personality traits from Blue60
 */
export function decodePersonalityTraits(blue60: number[]): PersonalityTraits {
  return {
    temperament: decodeTemperament(blue60.slice(0, 5)),
    energy: decodeNumber(blue60.slice(5, 10), 0, 100),
    social: decodeNumber(blue60.slice(10, 15), 0, 100),
    curiosity: decodeNumber(blue60.slice(15, 20), 0, 100),
    discipline: decodeNumber(blue60.slice(20, 25), 0, 100),
    affection: decodeNumber(blue60.slice(25, 30), 0, 100),
    independence: decodeNumber(blue60.slice(30, 35), 0, 100),
    playfulness: decodeNumber(blue60.slice(35, 40), 0, 100),
    loyalty: decodeNumber(blue60.slice(40, 45), 0, 100),
    quirks: [],
  };
}

/**
 * Decode latent traits from Black60
 */
export function decodeLatentTraits(black60: number[]): LatentTraits {
  const pathSum = black60.slice(0, 10).reduce((a, b) => a + b, 0) % 5;
  const paths = ['Sentinel', 'Explorer', 'Mystic', 'Titan', 'Trickster'];

  return {
    evolutionPath: paths[pathSum],
    rareAbilities: [],
    potential: {
      physical: decodeNumber(black60.slice(30, 35), 0, 100),
      mental: decodeNumber(black60.slice(35, 40), 0, 100),
      social: decodeNumber(black60.slice(40, 45), 0, 100),
    },
    hiddenGenes: black60.slice(45, 60),
  };
}

/**
 * Decode full genome to traits
 */
export function decodeGenome(genome: Genome): DerivedTraits {
  return {
    physical: decodePhysicalTraits(genome.red60),
    personality: decodePersonalityTraits(genome.blue60),
    latent: decodeLatentTraits(genome.black60),
  };
}

/**
 * Generate a random genome for testing
 */
export function generateRandomGenome(): Genome {
  const randomArray = () => Array.from({ length: 60 }, () => Math.floor(Math.random() * 7));

  return {
    red60: randomArray(),
    blue60: randomArray(),
    black60: randomArray(),
  };
}

/**
 * Get trait summary string
 */
export function getTraitSummary(traits: DerivedTraits): string {
  const { physical, personality, latent } = traits;
  return `${personality.temperament} ${physical.bodyType} - ${latent.evolutionPath} Path`;
}
