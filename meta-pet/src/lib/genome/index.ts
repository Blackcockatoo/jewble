export {
  decodeGenome,
  getTraitSummary,
  generateRandomGenome,
  type Genome,
  type GenomeHash,
  type DerivedTraits,
  type ElementTraits,
  type PhysicalTraits,
  type PersonalityTraits,
  type LatentTraits,
  type GenomeCryptoAdapter,
  type GenomeHasher,
} from '@metapet/core/genome';

export { encodeGenome, hashGenome, verifyGenome } from './encoder';
