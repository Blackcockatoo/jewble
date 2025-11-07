/**
 * Genome Core - Public API
 *
 * Deterministic genome encoding and trait derivation for Meta-Pets.
 */

export * from './types';
export * from './encoder';
export * from './decoder';

export { encodeGenome, hashGenome, verifyGenome } from './encoder';
export { decodeGenome, getTraitSummary } from './decoder';
