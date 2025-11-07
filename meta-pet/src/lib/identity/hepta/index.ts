import type { HeptaPayload, HeptaDigits } from '../types';
import { packPayload, unpackPayload } from './codec';
import { eccEncode, eccDecode } from './ecc';

/**
 * Encode HeptaPayload → 42 base-7 digits (with ECC)
 */
export async function heptaEncode42(
  payload: HeptaPayload,
  hmacKey: CryptoKey
): Promise<HeptaDigits> {
  const data30 = await packPayload(payload, hmacKey);
  const digits42 = eccEncode(data30);
  return Object.freeze(digits42);
}

/**
 * Decode 42 digits → HeptaPayload (with error correction)
 */
export async function heptaDecode42(
  digits: HeptaDigits,
  hmacKey: CryptoKey
): Promise<HeptaPayload | null> {
  const data30 = eccDecode([...digits]);
  if (!data30) return null;
  return await unpackPayload(data30, hmacKey);
}

// Re-export for convenience
export { packPayload, unpackPayload } from './codec';
export { eccEncode, eccDecode } from './ecc';
export { playHepta, stopHepta, heptaDigitsToFrequencies } from './audio';
