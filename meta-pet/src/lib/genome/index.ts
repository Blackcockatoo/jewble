export {
  decodeGenome,
  getTraitSummary,
  generateRandomGenome,
  ELEMENTS,
  ELEMENT_RESIDUES,
  getResidue,
  getResidueMeta,
  summarizeElementWeb,
  type ElementInfo,
  type ResidueMeta,
  type SequenceColor,
  type Genome,
  type GenomeHash,
  type DerivedTraits,
  type PhysicalTraits,
  type PersonalityTraits,
  type LatentTraits,
  type ElementWebSummary,
  type GenomeCryptoAdapter,
  type GenomeHasher,
} from '@metapet/core/genome';

export { encodeGenome, hashGenome, verifyGenome } from './encoder';
