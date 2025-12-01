import { describe, it, expect } from 'vitest';
import {
  getGeneticTrait,
  generateGenome,
  breedGenomes,
  mutateGene,
  evolveGenome,
} from '../breeding';

describe('Genetic Breeding', () => {
  it('should generate genetic trait from verse', () => {
    const trait = getGeneticTrait(1);
    expect(trait.verse).toBe(1);
    expect(trait.category).toBe('Consciousness');
    expect(trait.dominance).toBe('Recessive'); // 1 mod 60 is not prime
  });

  it('should generate trait with correct dominance', () => {
    const prime = getGeneticTrait(2);
    expect(prime.dominance).toBe('Dominant'); // 2 is prime

    const composite = getGeneticTrait(4);
    expect(composite.dominance).toBe('Recessive'); // 4 is not prime
  });

  it('should generate genome from verses', () => {
    const genome = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(genome.genes.length).toBe(9);
    expect(genome.geneCount).toBe(9);
    expect(genome.phenotype).toBeDefined();
  });

  it('should calculate phenotype attributes', () => {
    const genome = generateGenome([1, 10, 19, 28, 37, 46, 55, 64, 73]);
    // Genes are assigned by (verse - 1) % 9:
    // 1 -> 0 (Consciousness), 10 -> 0 (Consciousness), 19 -> 0 (Consciousness), etc.
    // All 9 verses map to the same category (Consciousness)
    expect(genome.phenotype.consciousness).toBe(90); // Nine Consciousness genes * 10
    expect(genome.phenotype.energy).toBe(0); // No Energy genes
    expect(genome.phenotype.appearance).toMatch(/^(Radiant|Subtle)$/);
  });

  it('should breed two genomes', () => {
    const parent1 = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const parent2 = generateGenome([10, 11, 12, 13, 14, 15, 16, 17, 18]);

    const offspring = breedGenomes(parent1, parent2, 'P1', 'P2', 9, 0); // No mutation
    expect(offspring.genes.length).toBe(9);
    expect(offspring.inheritance).toBeDefined();
    expect(offspring.inheritance?.length).toBe(9);
  });

  it('should track inheritance', () => {
    const parent1 = generateGenome([1, 2, 3]);
    const parent2 = generateGenome([10, 11, 12]);

    const offspring = breedGenomes(parent1, parent2, 'Parent A', 'Parent B', 3, 0);

    offspring.inheritance?.forEach(info => {
      expect(info.source).toMatch(/^(Parent A|Parent B)$/);
      expect(typeof info.mutated).toBe('boolean');
    });
  });

  it('should mutate genes using RED-60 sequence', () => {
    const original = 1;
    const mutated = mutateGene(original, 1, 103);

    expect(mutated).toBeGreaterThanOrEqual(1);
    expect(mutated).toBeLessThanOrEqual(103);
  });

  it('should evolve genome toward higher concurrency', () => {
    const genome = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const evolved = evolveGenome(genome, 103);

    expect(evolved.genes.length).toBe(genome.genes.length);
  });
});
