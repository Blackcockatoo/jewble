/**
 * Genome Encoder
 *
 * Generates deterministic genome arrays (Red60/Blue60/Black60) from DNA hashes.
 * Uses HMAC-SHA256 with domain separation to ensure privacy and determinism.
 */

import type { Genome, GenomeHash } from './types';

/**
 * Generate a deterministic genome from prime and tail DNA hashes
 */
export async function encodeGenome(
  primeDNA: string,
  tailDNA: string
): Promise<Genome> {
  // Generate three domain-separated HMAC keys for Red, Blue, Black
  const redSeed = await hmacSHA256(primeDNA, 'RED_GENOME_V1');
  const blueSeed = await hmacSHA256(tailDNA, 'BLUE_GENOME_V1');
  const blackSeed = await hmacSHA256(primeDNA + tailDNA, 'BLACK_GENOME_V1');

  // Expand each seed into 60 base-7 digits
  const red60 = await expandToBase7Array(redSeed, 60);
  const blue60 = await expandToBase7Array(blueSeed, 60);
  const black60 = await expandToBase7Array(blackSeed, 60);

  return { red60, blue60, black60 };
}

/**
 * Generate genome hashes for privacy (only hashes stored, never raw genome)
 */
export async function hashGenome(genome: Genome): Promise<GenomeHash> {
  const redHash = await sha256(genome.red60.join(''));
  const blueHash = await sha256(genome.blue60.join(''));
  const blackHash = await sha256(genome.black60.join(''));

  return { redHash, blueHash, blackHash };
}

/**
 * HMAC-SHA256 helper
 */
async function hmacSHA256(data: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    keyData,
    enc.encode(data)
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256 helper
 */
async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Expand a hex seed into an array of base-7 digits
 * Uses a deterministic PRNG seeded by the input
 */
async function expandToBase7Array(seed: string, length: number): Promise<number[]> {
  const result: number[] = [];
  let currentSeed = seed;

  // Generate digits in chunks, re-hashing as needed
  while (result.length < length) {
    // Hash the current seed to get next chunk of entropy
    const hash = await sha256(currentSeed);

    // Convert hex to bytes and map to base-7
    for (let i = 0; i < hash.length && result.length < length; i += 2) {
      const byte = parseInt(hash.substr(i, 2), 16);
      // Map byte (0-255) to base-7 (0-6) using modulo
      result.push(byte % 7);
    }

    // Update seed for next iteration
    currentSeed = hash;
  }

  return result.slice(0, length);
}

/**
 * Verify genome integrity (check if genome matches its hashes)
 */
export async function verifyGenome(
  genome: Genome,
  hashes: GenomeHash
): Promise<boolean> {
  const computed = await hashGenome(genome);
  return (
    computed.redHash === hashes.redHash &&
    computed.blueHash === hashes.blueHash &&
    computed.blackHash === hashes.blackHash
  );
}
