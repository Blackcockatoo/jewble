import { describe, it, expect } from 'vitest';
import { analyzeVerse, calculateRarity, getVerseColor } from '../index';

describe('Yantra Analysis', () => {
  it('should analyze verse 1 correctly', () => {
    const analysis = analyzeVerse(1);
    expect(analysis.mod60).toBe(1);
    expect(analysis.wheel).toBe(0);
    expect(analysis.trianglePhase).toBe(1);
  });

  it('should identify prime numbers', () => {
    const prime = analyzeVerse(2);
    expect(prime.isPrime).toBe(true);
    expect(prime.geometricTension).toBe('⬡ Prime-favorable');

    const composite = analyzeVerse(4);
    expect(composite.isPrime).toBe(false);
    expect(composite.geometricTension).toBe('⬢ Composite');
  });

  it('should calculate golden ratio resonance', () => {
    const analysis = analyzeVerse(41);
    expect(analysis.phiResonance).toBeDefined();
    expect(parseFloat(analysis.phiResonance)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(analysis.phiResonance)).toBeLessThanOrEqual(100);
  });

  it('should calculate Sri Yantra concurrency', () => {
    const analysis = analyzeVerse(5); // Triangle 5 = center
    expect(analysis.trianglePhase).toBe(5);
    expect(parseFloat(analysis.concurrency)).toBe(1); // Perfect concurrency at center
  });

  it('should identify mythic verses', () => {
    expect(calculateRarity(analyzeVerse(1), 1)).toBe('Mythic');
    expect(calculateRarity(analyzeVerse(41), 41)).toBe('Mythic');
    expect(calculateRarity(analyzeVerse(100), 100)).toBe('Mythic');
  });

  it('should generate colors for base-60 wheel', () => {
    const color0 = getVerseColor(0);
    const color30 = getVerseColor(30);
    const color60 = getVerseColor(60);

    expect(color0).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    expect(color30).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    expect(color60).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});
