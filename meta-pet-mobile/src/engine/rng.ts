/**
 * Seeded Random Number Generator
 * Uses xorshift128+ algorithm for deterministic randomness based on genome
 */

export class SeededRNG {
  private state: [number, number, number, number];

  constructor(seed: number) {
    // Initialize state using seed
    this.state = [
      seed,
      seed * 0x9e3779b9,
      seed * 0x85ebca6b,
      seed * 0xc2b2ae35,
    ];

    // Warm up the generator
    for (let i = 0; i < 10; i++) {
      this.next();
    }
  }

  /**
   * Generate next random number (0-1)
   */
  next(): number {
    let t = this.state[3];
    const s = this.state[0];
    this.state[3] = this.state[2];
    this.state[2] = this.state[1];
    this.state[1] = s;

    t ^= t << 11;
    t ^= t >>> 8;
    this.state[0] = t ^ s ^ (s >>> 19);

    return Math.abs(this.state[0]) / 0x7fffffff;
  }

  /**
   * Generate random integer in range [min, max)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Generate random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Choose random element from array
   */
  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate boolean with given probability
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

/**
 * Create RNG from genome hash
 */
export function createGenomeRNG(genomeHash: string): SeededRNG {
  // Convert hash to seed number
  let seed = 0;
  for (let i = 0; i < Math.min(genomeHash.length, 8); i++) {
    seed = (seed << 8) | genomeHash.charCodeAt(i);
  }
  return new SeededRNG(seed);
}
