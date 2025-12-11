/**
 * MOSS60 Engine - Core MossPrimeSeed Algorithm
 *
 * Platform-agnostic implementation of the MossPrimeSeed PRNG and field initialization.
 * Extracted from AuraliaMetaPet.tsx for cross-platform use.
 */

import { RED, BLACK, BLUE, toDigits, interleave3, base10ToHex } from './sequences';

type Bigish = bigint | number;

/**
 * 64-bit mixing function using xorshift-like operations
 * Provides high-quality hash mixing for seed generation
 */
export const mix64 = (x0: Bigish): bigint => {
  let x = BigInt(x0) ^ 0x9E3779B97F4A7C15n;
  x ^= x >> 30n; x *= 0xBF58476D1CE4E5B9n;
  x ^= x >> 27n; x *= 0x94D049BB133111EBn;
  x ^= x >> 31n;
  return x & ((1n << 64n) - 1n);
};

/**
 * Fast Fibonacci calculation using doubling method
 * Returns [F(n), F(n+1)] for efficient computation
 */
export const fibFast = (n: Bigish): [bigint, bigint] => {
  const fn = (k: bigint): [bigint, bigint] => {
    if (k === 0n) return [0n, 1n];
    const [a, b] = fn(k >> 1n);
    const c = a * ((b << 1n) - a);
    const d = a * a + b * b;
    if ((k & 1n) === 0n) return [c, d];
    return [d, c + d];
  };
  const index = typeof n === "bigint"
    ? (n < 0n ? 0n : n)
    : BigInt(Math.max(0, Math.floor(n)));
  return fn(index);
};

/**
 * Lucas number calculation using Fibonacci relation
 * L(n) = F(n-1) + F(n+1)
 */
export const lucasNumber = (n: Bigish): bigint => {
  if (n === 0n || n === 0) return 2n;
  if (n === 1n || n === 1) return 1n;
  const [fPrev, fCurr] = fibFast(n);
  const [_, fNext] = fibFast(typeof n === 'bigint' ? n + 1n : n + 1);
  return fPrev + fNext;
};

/**
 * Field State Interface
 */
export interface MossField {
  pulse: number[];      // 60-element XOR-based pulse array
  ring: number[];       // 60-element sum-based ring array
  seedBI: bigint;       // Seed as bigint
  hash: bigint;         // Mixed hash value
  fib60: bigint;        // Fibonacci(60)
  lucas12: bigint;      // Lucas(12)
  sigils: Array<{ x: number; y: number; }>; // Sigil points
}

/**
 * Initialize MOSS60 field with seed name
 * Creates deterministic field state for visualization and crypto
 */
export const initField = (seedName: string = "AURALIA"): MossField => {
  const red = RED, black = BLACK, blue = BLUE;
  const r = toDigits(red), k = toDigits(black), b = toDigits(blue);

  // Generate pulse and ring arrays
  const pulse = r.map((rv, i) => (rv ^ k[(i * 7) % 60] ^ b[(i * 13) % 60]) % 10);
  const ring = Array.from({ length: 60 }, (_, i) => (r[i] + k[i] + b[i]) % 10);

  // Create seed from interleaved sequences
  const seedStr = interleave3(red, black, blue);
  const seedBI = BigInt("0x" + base10ToHex(seedStr + seedName));
  const hash = mix64(seedBI);

  // Calculate key Fibonacci and Lucas numbers
  const fib60 = fibFast(60n)[0];
  const lucas12 = lucasNumber(12n);

  // Generate sigil points (12 points for Seed of Life pattern)
  const sigils: Array<{ x: number; y: number; }> = [];
  const numSigils = 12;
  for (let i = 0; i < numSigils; i++) {
    const h = mix64(hash + BigInt(i));
    const angle = (Number(h % 360n) * Math.PI) / 180;
    const radius = 0.3 + (Number(h % 40n) / 100);
    sigils.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    });
  }

  return {
    pulse,
    ring,
    seedBI,
    hash,
    fib60,
    lucas12,
    sigils
  };
};

/**
 * Generate deterministic hash from field state
 */
export const fieldHash = (field: MossField): string => {
  return field.hash.toString(16).padStart(16, '0');
};

/**
 * Xorshift128+ PRNG state
 */
export interface XorshiftState {
  s0: bigint;
  s1: bigint;
}

/**
 * Initialize Xorshift128+ state from seed
 */
export const initXorshift = (seed: bigint): XorshiftState => {
  return {
    s0: mix64(seed),
    s1: mix64(seed + 1n)
  };
};

/**
 * Generate next random value using Xorshift128+
 */
export const nextXorshift = (state: XorshiftState): { value: bigint; state: XorshiftState } => {
  let { s0, s1 } = state;
  s1 ^= s1 << 23n;
  s1 ^= s1 >> 18n;
  s1 ^= s0 ^ (s0 >> 5n);
  const value = (s0 + s1) & ((1n << 64n) - 1n);
  return {
    value,
    state: { s0: s1, s1 }
  };
};

/**
 * Generate deterministic random float [0, 1) from field and index
 */
export const randomFloat = (field: MossField, index: number): number => {
  const h = mix64(field.hash + BigInt(index));
  return Number(h % 10000n) / 10000;
};

/**
 * Generate deterministic random integer in range [min, max]
 */
export const randomInt = (field: MossField, index: number, min: number, max: number): number => {
  const f = randomFloat(field, index);
  return Math.floor(f * (max - min + 1)) + min;
};
