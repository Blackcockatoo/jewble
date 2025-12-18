import { describe, it, expect } from 'vitest';
import { generateGenome } from '../breeding';
import {
  generatePetVisual,
  getAttributeColor,
  getDominantAttribute,
} from '../phenotype';

describe('Phenotype Visualization', () => {
  it('should generate visual attributes from phenotype', () => {
    const genome = generateGenome([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const visual = generatePetVisual(genome.phenotype);

    expect(visual.bodyType).toMatch(/^(angular|ethereal|balanced)$/);
    expect(visual.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(visual.size).toBeGreaterThanOrEqual(60);
    expect(visual.auraIntensity).toBeGreaterThanOrEqual(0);
    expect(visual.auraIntensity).toBeLessThanOrEqual(1);
  });

  it('should determine body type from attributes', () => {
    const powerGenome = generateGenome([5, 5, 5, 5, 5, 5, 5, 5, 5]); // All Power
    const visual = generatePetVisual(powerGenome.phenotype);

    // Power attribute should influence body type
    expect(['angular', 'ethereal', 'balanced']).toContain(visual.bodyType);
  });

  it('should get correct attribute colors', () => {
    expect(getAttributeColor('consciousness')).toBe('#818cf8');
    expect(getAttributeColor('energy')).toBe('#f472b6');
    expect(getAttributeColor('wisdom')).toBe('#60a5fa');
    expect(getAttributeColor('beauty')).toBe('#a78bfa');
    expect(getAttributeColor('power')).toBe('#f59e0b');
  });

  it('should identify dominant attribute', () => {
    const genome = generateGenome([1, 1, 1, 1, 1, 1, 1, 1, 1]); // All Consciousness
    const dominant = getDominantAttribute(genome.phenotype);

    expect(dominant).toBe('consciousness');
  });
});
