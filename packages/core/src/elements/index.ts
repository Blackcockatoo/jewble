/**
 * Element Number Theory Module
 *
 * Fuses chemical elements into Jewble's mathematical engine:
 * - 60-adic coordinates (a,b): position on circle + tier
 * - Factorization relative to 60: Z = 2^α × 3^β × 5^γ × u
 * - HeptaMath: base-7 triples for rhythmic encoding
 * - Element waves: complex-valued functions on the 60-circle
 * - Charge vectors and Hepta signatures for Jewble genomes
 *
 * Elements are not decorative labels - they ARE the number theory.
 */

// Types
export type {
  SixtyAdicCoord,
  SixtyRelativeFactors,
  UnitCode,
  HeptaTriple,
  ElementProfile,
  ResidueNode,
  BridgeType,
  ChargeVector,
  HeptaSignature,
  ElementWave,
  JewbleElementAnalysis,
  ElementData,
  UnitMod60,
} from './types';

export { UNITS_MOD_60 } from './types';

// Data
export { ELEMENT_DATA, ELEMENT_BY_Z, ELEMENT_BY_SYMBOL } from './data';

// Core engine functions
export {
  to60Adic,
  from60Adic,
  factorRelativeTo60,
  encodeUnit,
  decodeUnit,
  toHeptaTriple,
  fromHeptaTriple,
  generateElementProfile,
  generateAllElementProfiles,
  buildResidueNodes,
  bridgeScore,
  calculateChargeVector,
  calculateHeptaSignature,
  calculateElementWave,
  analyzeJewbleElements,
  sampleElementWave,
  formatElementProfile,
} from './engine';

// Examples and demonstrations
export {
  workedExampleResidue1,
  exampleJewbleAnalysis,
  runAllExamples,
} from './examples';
