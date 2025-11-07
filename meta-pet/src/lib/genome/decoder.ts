/**
 * Genome Decoder - Trait Derivation
 *
 * Deterministically derives all pet traits from Red60/Blue60/Black60 arrays.
 * Each trait is mapped to specific digit ranges for reproducibility.
 */

import type {
  Genome,
  DerivedTraits,
  PhysicalTraits,
  PersonalityTraits,
  LatentTraits
} from './types';

/**
 * Decode genome into all derived traits
 */
export function decodeGenome(genome: Genome): DerivedTraits {
  return {
    physical: decodePhysicalTraits(genome.red60),
    personality: decodePersonalityTraits(genome.blue60),
    latent: decodeLatentTraits(genome.black60)
  };
}

/**
 * Decode physical traits from Red60
 */
function decodePhysicalTraits(red60: number[]): PhysicalTraits {
  // Body types based on first 5 digits
  const bodyTypes = [
    'Spherical', 'Cubic', 'Pyramidal', 'Cylindrical',
    'Toroidal', 'Crystalline', 'Amorphous'
  ];
  const bodyIndex = digitSum(red60.slice(0, 5)) % bodyTypes.length;

  // Colors from digit sequences
  const primaryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE'
  ];
  const secondaryColors = [
    '#C44569', '#3B3B98', '#58B19F', '#FD7272',
    '#82589F', '#F8B500', '#63C2C9'
  ];

  const primaryIndex = digitSum(red60.slice(5, 10)) % primaryColors.length;
  const secondaryIndex = digitSum(red60.slice(10, 15)) % secondaryColors.length;

  // Patterns from digit sequences
  const patterns = [
    'Solid', 'Striped', 'Spotted', 'Gradient',
    'Tessellated', 'Fractal', 'Iridescent'
  ];
  const patternIndex = digitSum(red60.slice(15, 20)) % patterns.length;

  // Textures
  const textures = [
    'Smooth', 'Fuzzy', 'Scaly', 'Crystalline',
    'Cloudy', 'Metallic', 'Glowing'
  ];
  const textureIndex = digitSum(red60.slice(20, 25)) % textures.length;

  // Size: map to 0.5 - 2.0 range
  const sizeValue = digitSum(red60.slice(25, 30)) % 100;
  const size = 0.5 + (sizeValue / 100) * 1.5;

  // Proportions: normalized ratios
  const headSum = digitSum(red60.slice(30, 35));
  const limbSum = digitSum(red60.slice(35, 40));
  const tailSum = digitSum(red60.slice(40, 45));
  const total = headSum + limbSum + tailSum || 1;

  // Special features
  const featureOptions = [
    'Horns', 'Wings', 'Antennae', 'Tail Flame',
    'Aura', 'Third Eye', 'Crown', 'Tentacles'
  ];
  const features: string[] = [];
  for (let i = 45; i < 60; i += 3) {
    if (red60[i] >= 5) { // Only show feature if digit is high
      const featIndex = digitSum(red60.slice(i, i + 3)) % featureOptions.length;
      features.push(featureOptions[featIndex]);
    }
  }

  return {
    bodyType: bodyTypes[bodyIndex],
    primaryColor: primaryColors[primaryIndex],
    secondaryColor: secondaryColors[secondaryIndex],
    pattern: patterns[patternIndex],
    texture: textures[textureIndex],
    size,
    proportions: {
      headRatio: headSum / total,
      limbRatio: limbSum / total,
      tailRatio: tailSum / total
    },
    features
  };
}

/**
 * Decode personality traits from Blue60
 */
function decodePersonalityTraits(blue60: number[]): PersonalityTraits {
  // Temperament types
  const temperaments = [
    'Gentle', 'Energetic', 'Curious', 'Calm',
    'Mischievous', 'Protective', 'Adventurous'
  ];
  const tempIndex = digitSum(blue60.slice(0, 5)) % temperaments.length;

  // Map digit ranges to 0-100 scales
  const mapToPercent = (digits: number[]) => {
    const sum = digitSum(digits);
    return Math.min(100, Math.round((sum / (digits.length * 6)) * 100));
  };

  // Quirks based on high-value digits
  const quirkOptions = [
    'Loves to spin', 'Hums melodies', 'Collects shiny things',
    'Naps in odd places', 'Mimics sounds', 'Dances when happy',
    'Scared of shadows', 'Obsessed with cleanliness'
  ];
  const quirks: string[] = [];
  for (let i = 45; i < 60; i += 5) {
    if (digitSum(blue60.slice(i, i + 5)) > 20) {
      const quirkIndex = digitSum(blue60.slice(i, i + 5)) % quirkOptions.length;
      quirks.push(quirkOptions[quirkIndex]);
    }
  }

  return {
    temperament: temperaments[tempIndex],
    energy: mapToPercent(blue60.slice(5, 10)),
    social: mapToPercent(blue60.slice(10, 15)),
    curiosity: mapToPercent(blue60.slice(15, 20)),
    discipline: mapToPercent(blue60.slice(20, 25)),
    affection: mapToPercent(blue60.slice(25, 30)),
    independence: mapToPercent(blue60.slice(30, 35)),
    playfulness: mapToPercent(blue60.slice(35, 40)),
    loyalty: mapToPercent(blue60.slice(40, 45)),
    quirks
  };
}

/**
 * Decode latent/hidden traits from Black60
 */
function decodeLatentTraits(black60: number[]): LatentTraits {
  // Evolution paths (determined by first 10 digits)
  const evolutionPaths = [
    'Celestial Ascendant', 'Primal Beast', 'Mystic Sage',
    'Guardian Sentinel', 'Chaos Trickster', 'Harmonic Healer',
    'Void Walker'
  ];
  const evoIndex = digitSum(black60.slice(0, 10)) % evolutionPaths.length;

  // Rare abilities (unlocked at certain conditions)
  const abilityPool = [
    'Telepathy', 'Telekinesis', 'Time Dilation', 'Phase Shift',
    'Energy Burst', 'Healing Aura', 'Shield Projection',
    'Element Control', 'Dream Walking', 'Probability Shift'
  ];
  const rareAbilities: string[] = [];
  for (let i = 10; i < 30; i += 4) {
    const abilityValue = digitSum(black60.slice(i, i + 4));
    if (abilityValue > 18) { // High threshold for rare abilities
      const abilIndex = abilityValue % abilityPool.length;
      if (!rareAbilities.includes(abilityPool[abilIndex])) {
        rareAbilities.push(abilityPool[abilIndex]);
      }
    }
  }

  // Potential ceilings (growth limits)
  const mapToPotential = (digits: number[]) => {
    return Math.round((digitSum(digits) / (digits.length * 6)) * 100);
  };

  return {
    evolutionPath: evolutionPaths[evoIndex],
    rareAbilities,
    potential: {
      physical: mapToPotential(black60.slice(30, 35)),
      mental: mapToPotential(black60.slice(35, 40)),
      social: mapToPotential(black60.slice(40, 45))
    },
    hiddenGenes: black60.slice(45, 60)
  };
}

/**
 * Helper: sum of digits (used for deterministic mapping)
 */
function digitSum(digits: number[]): number {
  return digits.reduce((sum, d) => sum + d, 0);
}

/**
 * Get a human-readable summary of all traits
 */
export function getTraitSummary(traits: DerivedTraits): string {
  const { physical, personality, latent } = traits;

  return `
🎨 Physical: ${physical.bodyType} | ${physical.pattern} ${physical.texture}
🎭 Personality: ${personality.temperament} | Energy ${personality.energy}%
✨ Evolution: ${latent.evolutionPath}
  `.trim();
}
