/**
 * Breeding System
 *
 * Combines two parent genomes to create offspring with inherited traits
 */

import type { Genome, DerivedTraits } from '@/lib/genome';
import { decodeGenome } from '@/lib/genome';

export interface BreedingResult {
  offspring: Genome;
  traits: DerivedTraits;
  inheritanceMap: {
    red: 'parent1' | 'parent2' | 'mixed';
    blue: 'parent1' | 'parent2' | 'mixed';
    black: 'parent1' | 'parent2' | 'mixed';
  };
}

/**
 * Breed two pets to create offspring
 *
 * Breeding modes:
 * - DOMINANT: 70% from one parent, 30% from other (random selection)
 * - BALANCED: 50/50 mix from both parents
 * - MUTATION: Random mutations in 5-10% of genes
 */
export function breedPets(
  parent1: Genome,
  parent2: Genome,
  mode: 'DOMINANT' | 'BALANCED' | 'MUTATION' = 'BALANCED'
): BreedingResult {
  let offspring: Genome;
  let inheritanceMap: BreedingResult['inheritanceMap'];

  switch (mode) {
    case 'DOMINANT':
      offspring = breedDominant(parent1, parent2);
      inheritanceMap = { red: 'mixed', blue: 'mixed', black: 'mixed' };
      break;

    case 'MUTATION':
      offspring = breedWithMutation(parent1, parent2);
      inheritanceMap = { red: 'mixed', blue: 'mixed', black: 'mixed' };
      break;

    case 'BALANCED':
    default:
      offspring = breedBalanced(parent1, parent2);
      inheritanceMap = { red: 'mixed', blue: 'mixed', black: 'mixed' };
      break;
  }

  const traits = decodeGenome(offspring);

  return { offspring, traits, inheritanceMap };
}

/**
 * Balanced breeding - 50/50 split of genes
 */
function breedBalanced(parent1: Genome, parent2: Genome): Genome {
  const red60: number[] = [];
  const blue60: number[] = [];
  const black60: number[] = [];

  // Mix genes evenly from both parents
  for (let i = 0; i < 60; i++) {
    // Alternate genes or use random selection
    if (i % 2 === 0) {
      red60.push(parent1.red60[i]);
      blue60.push(parent1.blue60[i]);
      black60.push(parent1.black60[i]);
    } else {
      red60.push(parent2.red60[i]);
      blue60.push(parent2.blue60[i]);
      black60.push(parent2.black60[i]);
    }
  }

  return { red60, blue60, black60 };
}

/**
 * Dominant breeding - one parent contributes more
 */
function breedDominant(parent1: Genome, parent2: Genome): Genome {
  const red60: number[] = [];
  const blue60: number[] = [];
  const black60: number[] = [];

  // Randomly select dominant parent
  const dominantIsParent1 = Math.random() > 0.5;
  const dominant = dominantIsParent1 ? parent1 : parent2;
  const recessive = dominantIsParent1 ? parent2 : parent1;

  for (let i = 0; i < 60; i++) {
    // 70% chance from dominant parent
    const useDominant = Math.random() < 0.7;

    if (useDominant) {
      red60.push(dominant.red60[i]);
      blue60.push(dominant.blue60[i]);
      black60.push(dominant.black60[i]);
    } else {
      red60.push(recessive.red60[i]);
      blue60.push(recessive.blue60[i]);
      black60.push(recessive.black60[i]);
    }
  }

  return { red60, blue60, black60 };
}

/**
 * Mutation breeding - random mutations in some genes
 */
function breedWithMutation(parent1: Genome, parent2: Genome): Genome {
  // Start with balanced breeding
  const offspring = breedBalanced(parent1, parent2);

  // Apply random mutations (5-10% of genes)
  const mutationRate = 0.05 + Math.random() * 0.05;
  const genesToMutate = Math.floor(60 * mutationRate);

  for (let i = 0; i < genesToMutate; i++) {
    const position = Math.floor(Math.random() * 60);
    const newValue = Math.floor(Math.random() * 7); // base-7

    // Randomly mutate one of the three arrays
    const arrayChoice = Math.floor(Math.random() * 3);
    if (arrayChoice === 0) {
      offspring.red60[position] = newValue;
    } else if (arrayChoice === 1) {
      offspring.blue60[position] = newValue;
    } else {
      offspring.black60[position] = newValue;
    }
  }

  return offspring;
}

/**
 * Calculate genetic similarity between two genomes (0-100%)
 */
export function calculateSimilarity(genome1: Genome, genome2: Genome): number {
  let matches = 0;
  let total = 0;

  for (let i = 0; i < 60; i++) {
    if (genome1.red60[i] === genome2.red60[i]) matches++;
    if (genome1.blue60[i] === genome2.blue60[i]) matches++;
    if (genome1.black60[i] === genome2.black60[i]) matches++;
    total += 3;
  }

  return (matches / total) * 100;
}

/**
 * Check if two pets can breed
 */
export function canBreed(
  evolution1State: string,
  evolution2State: string
): boolean {
  // Both pets must be at SPECIATION stage to breed
  return evolution1State === 'SPECIATION' && evolution2State === 'SPECIATION';
}

/**
 * Predict offspring traits (preview before breeding)
 */
export function predictOffspring(
  parent1: Genome,
  parent2: Genome
): { possibleTraits: string[]; confidence: number } {
  // Sample a few potential offspring
  const samples = [
    breedBalanced(parent1, parent2),
    breedDominant(parent1, parent2),
    breedWithMutation(parent1, parent2),
  ];

  const traits = samples.map(s => decodeGenome(s));

  const possibleTraits = [
    ...new Set([
      ...traits.map(t => t.physical.bodyType),
      ...traits.map(t => t.personality.temperament),
      ...traits.map(t => t.latent.evolutionPath),
    ])
  ];

  // Confidence based on parent similarity
  const similarity = calculateSimilarity(parent1, parent2);
  const confidence = 100 - (similarity / 2); // More similar = more predictable

  return { possibleTraits, confidence };
}
