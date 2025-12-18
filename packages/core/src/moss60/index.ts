/**
 * MOSS60 Core Module
 *
 * Cryptographic and mathematical foundation using three 60-digit sequences.
 * Provides deterministic hashing, field initialization, and visualization entropy.
 */

// Export sequences
export {
  RED,
  BLACK,
  BLUE,
  toDigits,
  interleave3,
  base10ToHex,
  getPulse,
  getRing
} from './sequences';

// Export engine
export {
  mix64,
  fibFast,
  lucasNumber,
  initField,
  fieldHash,
  initXorshift,
  nextXorshift,
  randomFloat,
  randomInt,
  type MossField,
  type XorshiftState
} from './engine';

// Export crypto
export {
  moss60Hash,
  moss60Sign,
  moss60Mix,
  createMoss60GenomeSignature,
  verifyMoss60GenomeSignature,
  genomeToMoss60Seed,
  createBreedingProof,
  verifyBreedingProof,
  fieldToColor
} from './crypto';
