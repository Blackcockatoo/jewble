import { describe, it, expect } from 'vitest';
import { decodeGenome } from './decoder';
import type { Genome } from './types';

describe('Genome Decoder', () => {
  const createTestGenome = (seed: number): Genome => ({
    red60: Array(60).fill(0).map((_, i) => (seed + i) % 7),
    blue60: Array(60).fill(0).map((_, i) => (seed + i + 1) % 7),
    black60: Array(60).fill(0).map((_, i) => (seed + i + 2) % 7),
  });

  describe('decodeGenome', () => {
    it('should return traits with all required sections', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(traits.physical).toBeDefined();
      expect(traits.personality).toBeDefined();
      expect(traits.latent).toBeDefined();
    });

    it('should be deterministic - same genome produces same traits', () => {
      const genome = createTestGenome(3);

      const traits1 = decodeGenome(genome);
      const traits2 = decodeGenome(genome);

      expect(traits1).toEqual(traits2);
    });

    it('should produce different traits for different genomes', () => {
      const genome1 = createTestGenome(0);
      const genome2 = createTestGenome(6);

      const traits1 = decodeGenome(genome1);
      const traits2 = decodeGenome(genome2);

      // At least one trait should be different
      const same = JSON.stringify(traits1) === JSON.stringify(traits2);
      expect(same).toBe(false);
    });
  });

  describe('Physical Traits', () => {
    it('should decode valid body type', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validBodyTypes = [
        'Spherical', 'Cubic', 'Pyramidal', 'Cylindrical',
        'Toroidal', 'Crystalline', 'Amorphous'
      ];

      expect(validBodyTypes).toContain(traits.physical.bodyType);
    });

    it('should decode valid colors', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      // Should be valid hex colors
      expect(traits.physical.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(traits.physical.secondaryColor).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should decode valid pattern', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validPatterns = [
        'Solid', 'Striped', 'Spotted', 'Gradient',
        'Tessellated', 'Fractal', 'Iridescent'
      ];

      expect(validPatterns).toContain(traits.physical.pattern);
    });

    it('should decode valid texture', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validTextures = [
        'Smooth', 'Fuzzy', 'Scaly', 'Crystalline',
        'Cloudy', 'Metallic', 'Glowing'
      ];

      expect(validTextures).toContain(traits.physical.texture);
    });

    it('should decode size in valid range', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(traits.physical.size).toBeGreaterThanOrEqual(0.5);
      expect(traits.physical.size).toBeLessThanOrEqual(2.0);
    });

    it('should decode proportions that sum to 1', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const sum = traits.physical.proportions.head +
                  traits.physical.proportions.limbs +
                  traits.physical.proportions.tail;

      expect(sum).toBeCloseTo(1, 2);
    });

    it('should decode features as array of strings', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(Array.isArray(traits.physical.features)).toBe(true);
      for (const feature of traits.physical.features) {
        expect(typeof feature).toBe('string');
      }
    });
  });

  describe('Personality Traits', () => {
    it('should decode valid temperament', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validTemperaments = [
        'Playful', 'Calm', 'Energetic', 'Shy',
        'Bold', 'Gentle', 'Mischievous'
      ];

      expect(validTemperaments).toContain(traits.personality.temperament);
    });

    it('should decode stats in 0-100 range', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(traits.personality.energy).toBeGreaterThanOrEqual(0);
      expect(traits.personality.energy).toBeLessThanOrEqual(100);

      expect(traits.personality.social).toBeGreaterThanOrEqual(0);
      expect(traits.personality.social).toBeLessThanOrEqual(100);

      expect(traits.personality.curiosity).toBeGreaterThanOrEqual(0);
      expect(traits.personality.curiosity).toBeLessThanOrEqual(100);

      expect(traits.personality.patience).toBeGreaterThanOrEqual(0);
      expect(traits.personality.patience).toBeLessThanOrEqual(100);

      expect(traits.personality.bravery).toBeGreaterThanOrEqual(0);
      expect(traits.personality.bravery).toBeLessThanOrEqual(100);
    });

    it('should decode valid quirks array', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(Array.isArray(traits.personality.quirks)).toBe(true);
      for (const quirk of traits.personality.quirks) {
        expect(typeof quirk).toBe('string');
      }
    });
  });

  describe('Latent Traits', () => {
    it('should decode valid evolution path', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validPaths = [
        'Harmony Guardian', 'Chaos Trickster', 'Void Walker',
        'Light Bringer', 'Earth Shaper', 'Storm Caller', 'Dream Weaver'
      ];

      expect(validPaths).toContain(traits.latent.evolutionPath);
    });

    it('should decode rare abilities as array', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(Array.isArray(traits.latent.rareAbilities)).toBe(true);
      for (const ability of traits.latent.rareAbilities) {
        expect(typeof ability).toBe('string');
      }
    });

    it('should decode potential in 0-100 range', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      expect(traits.latent.potential).toBeGreaterThanOrEqual(0);
      expect(traits.latent.potential).toBeLessThanOrEqual(100);
    });

    it('should decode valid affinity', () => {
      const genome = createTestGenome(0);
      const traits = decodeGenome(genome);

      const validAffinities = [
        'Fire', 'Water', 'Earth', 'Air',
        'Light', 'Shadow', 'Void'
      ];

      expect(validAffinities).toContain(traits.latent.affinity);
    });
  });

  describe('Determinism Across Multiple Genomes', () => {
    it('should consistently decode same genome across multiple calls', () => {
      const genome = createTestGenome(42);

      const results = Array(10).fill(null).map(() => decodeGenome(genome));

      // All results should be identical
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toEqual(results[0]);
      }
    });

    it('should produce varied traits across different genomes', () => {
      const genomes = Array(20).fill(null).map((_, i) => createTestGenome(i));
      const allTraits = genomes.map(g => decodeGenome(g));

      // Should have diversity in body types
      const bodyTypes = new Set(allTraits.map(t => t.physical.bodyType));
      expect(bodyTypes.size).toBeGreaterThan(1);

      // Should have diversity in temperaments
      const temperaments = new Set(allTraits.map(t => t.personality.temperament));
      expect(temperaments.size).toBeGreaterThan(1);

      // Should have diversity in evolution paths
      const paths = new Set(allTraits.map(t => t.latent.evolutionPath));
      expect(paths.size).toBeGreaterThan(1);
    });
  });
});
