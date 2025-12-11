/**
 * MOSS60 Cryptography
 *
 * Enhanced cryptographic functions using MOSS60 sequences as entropy sources.
 * Combines MOSS60 deterministic hashing with standard crypto primitives.
 */

import { RED, BLACK, BLUE, toDigits } from './sequences';
import { mix64, initField, fieldHash } from './engine';
import type { Genome } from '../genome/types';
import type { GenomeCryptoAdapter } from '../genome/encoder';

/**
 * MOSS60 Hash - Deterministic hash using MOSS60 sequences
 * Combines genome data with RED, BLACK, BLUE sequences for enhanced entropy
 */
export async function moss60Hash(
  genome: Genome,
  crypto: GenomeCryptoAdapter
): Promise<string> {
  // Extract red60, black60, blue60 indices from genome
  const redIndex = genome.red60[0] % 60;
  const blackIndex = genome.black60[0] % 60;
  const blueIndex = genome.blue60[0] % 60;

  // Get MOSS60 sequence digits at indices
  const redDigits = toDigits(RED);
  const blackDigits = toDigits(BLACK);
  const blueDigits = toDigits(BLUE);

  // Create composite seed from genome and MOSS60 sequences
  const genomeSeed = genome.red60.join('') + genome.black60.join('') + genome.blue60.join('');
  const moss60Seed = `${redDigits[redIndex]}${blackDigits[blackIndex]}${blueDigits[blueIndex]}`;

  // Combine with standard SHA-256
  const composite = genomeSeed + moss60Seed + RED.substring(redIndex, redIndex + 10);
  return await crypto.sha256(composite);
}

/**
 * MOSS60 Sign - Create HMAC signature using MOSS60 sequence as key
 */
export async function moss60Sign(
  data: string,
  sequence: 'red' | 'black' | 'blue',
  crypto: GenomeCryptoAdapter
): Promise<string> {
  const key = sequence === 'red' ? RED : sequence === 'black' ? BLACK : BLUE;
  return await crypto.hmacSHA256(data, key);
}

/**
 * MOSS60 Mix - Create mixed value from red60, black60, blue60 positions
 * Returns hex string of mixed value
 */
export function moss60Mix(red60: number, black60: number, blue60: number): string {
  const redDigits = toDigits(RED);
  const blackDigits = toDigits(BLACK);
  const blueDigits = toDigits(BLUE);

  const r = redDigits[red60 % 60];
  const k = blackDigits[black60 % 60];
  const b = blueDigits[blue60 % 60];

  // Mix using XOR and addition
  const mixed = (r ^ k ^ b) + (r + k + b);
  const mixedBig = mix64(BigInt(mixed));

  return mixedBig.toString(16).padStart(16, '0');
}

/**
 * Create MOSS60 genome signature
 * Combines all three MOSS60 sequence signatures
 */
export async function createMoss60GenomeSignature(
  genome: Genome,
  crypto: GenomeCryptoAdapter
): Promise<string> {
  const genomeString = JSON.stringify(genome);

  // Sign with all three sequences
  const redSig = await moss60Sign(genomeString, 'red', crypto);
  const blackSig = await moss60Sign(genomeString, 'black', crypto);
  const blueSig = await moss60Sign(genomeString, 'blue', crypto);

  // Combine signatures
  const combined = redSig + blackSig + blueSig;
  return await crypto.sha256(combined);
}

/**
 * Verify MOSS60 genome signature
 */
export async function verifyMoss60GenomeSignature(
  genome: Genome,
  signature: string,
  crypto: GenomeCryptoAdapter
): Promise<boolean> {
  const expected = await createMoss60GenomeSignature(genome, crypto);
  return expected === signature;
}

/**
 * Generate deterministic seed from genome using MOSS60 field
 */
export function genomeToMoss60Seed(genome: Genome): bigint {
  const red = genome.red60[0];
  const black = genome.black60[0];
  const blue = genome.blue60[0];

  const composite = `${red}_${black}_${blue}`;
  const field = initField(composite);

  return field.hash;
}

/**
 * Create breeding proof using MOSS60 signatures
 */
export async function createBreedingProof(
  parent1Genome: Genome,
  parent2Genome: Genome,
  crypto: GenomeCryptoAdapter
): Promise<{
  parent1Signature: string;
  parent2Signature: string;
  combinedHash: string;
  timestamp: number;
}> {
  const parent1Sig = await createMoss60GenomeSignature(parent1Genome, crypto);
  const parent2Sig = await createMoss60GenomeSignature(parent2Genome, crypto);

  const combined = parent1Sig + parent2Sig;
  const combinedHash = await crypto.sha256(combined);

  return {
    parent1Signature: parent1Sig,
    parent2Signature: parent2Sig,
    combinedHash,
    timestamp: Date.now()
  };
}

/**
 * Verify breeding proof
 */
export async function verifyBreedingProof(
  parent1Genome: Genome,
  parent2Genome: Genome,
  proof: {
    parent1Signature: string;
    parent2Signature: string;
    combinedHash: string;
  },
  crypto: GenomeCryptoAdapter
): Promise<boolean> {
  const parent1Valid = await verifyMoss60GenomeSignature(
    parent1Genome,
    proof.parent1Signature,
    crypto
  );
  const parent2Valid = await verifyMoss60GenomeSignature(
    parent2Genome,
    proof.parent2Signature,
    crypto
  );

  if (!parent1Valid || !parent2Valid) return false;

  const combined = proof.parent1Signature + proof.parent2Signature;
  const expectedHash = await crypto.sha256(combined);

  return expectedHash === proof.combinedHash;
}

/**
 * Field-based hash for visualization synchronization
 * Uses MOSS60 field to generate deterministic hex color
 */
export function fieldToColor(seedName: string, index: number = 0): string {
  const field = initField(seedName);
  const h = mix64(field.hash + BigInt(index));
  const r = Number((h >> 16n) & 0xFFn);
  const g = Number((h >> 8n) & 0xFFn);
  const b = Number(h & 0xFFn);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
