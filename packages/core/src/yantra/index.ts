/**
 * Prime Yantra Analysis System
 * Mathematical analysis for verse-based trait systems
 */

export interface YantraAnalysis {
  mod60: number;
  wheel: number;
  isPrime: boolean;
  hexDistance: number;
  pentDistance: number;
  trianglePhase: number;
  concurrency: string;
  phiResonance: string;
  redSequence: string;
  geometricTension: string;
  yantraCircuit: string;
}

const PRIMES_MOD_60 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
const PHI = 1.618033988749895;

/**
 * Analyze a number using Prime Yantra principles
 */
export function analyzeVerse(num: number): YantraAnalysis {
  const mod60 = num % 60;
  const wheel = Math.floor((num - 1) / 60);
  const isPrime = PRIMES_MOD_60.includes(mod60);

  // Hexagonal-pentagonal tension analysis
  const hexDistance = Math.abs(mod60 - 30);
  const pentDistance = Math.min(
    Math.abs(mod60 - 12),
    Math.abs(mod60 - 24),
    Math.abs(mod60 - 36),
    Math.abs(mod60 - 48),
    Math.abs(mod60)
  );

  // Sri Yantra concurrency mapping (9 triangles)
  const trianglePhase = ((num - 1) % 9) + 1;
  const concurrency = 1 - Math.abs(trianglePhase - 5) / 9;

  // Golden ratio resonance
  const phiResonance = Math.abs(Math.sin((num / PHI) * Math.PI)) * 100;

  return {
    mod60,
    wheel,
    isPrime,
    hexDistance,
    pentDistance,
    trianglePhase,
    concurrency: concurrency.toFixed(3),
    phiResonance: phiResonance.toFixed(1),
    redSequence: `W${wheel}:P${mod60}`,
    geometricTension: isPrime ? '⬡ Prime-favorable' : '⬢ Composite',
    yantraCircuit:
      trianglePhase <= 5
        ? `Triangle ${trianglePhase}`
        : `Outer Circuit ${trianglePhase - 5}`,
  };
}

/**
 * Calculate rarity tier based on Prime Yantra properties
 */
export function calculateRarity(analysis: YantraAnalysis, verseNum: number): string {
  const concurrency = parseFloat(analysis.concurrency);

  // Mythic: Special sacred numbers
  if (verseNum === 1 || verseNum === 41 || verseNum === 100 || verseNum === 108) {
    return 'Mythic';
  }

  // Legendary: Prime + High Concurrency
  if (analysis.isPrime && concurrency > 0.7) {
    return 'Legendary';
  }

  // Epic: High Concurrency
  if (concurrency > 0.7) {
    return 'Epic';
  }

  // Rare: Prime numbers
  if (analysis.isPrime) {
    return 'Rare';
  }

  return 'Common';
}

/**
 * Get dynamic color based on base-60 position
 */
export function getVerseColor(num: number, saturation = 85, lightness = 65): string {
  const mod60 = num % 60;
  const hue = (mod60 * 6) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'Mythic':
      return '#f472b6'; // pink
    case 'Legendary':
      return '#fbbf24'; // yellow
    case 'Epic':
      return '#a78bfa'; // purple
    case 'Rare':
      return '#60a5fa'; // blue
    case 'Common':
    default:
      return '#9ca3af'; // gray
  }
}
