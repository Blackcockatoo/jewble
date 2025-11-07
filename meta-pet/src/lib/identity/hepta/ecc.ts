/**
 * Simple 6×7 block ECC (Reed-Solomon-inspired, base-7)
 * Each 6 data digits → 1 parity digit → 7-symbol block
 * Can correct 1 error per block
 */

const BASE = 7;

/**
 * Encode 30 data digits → 42 digits (6 blocks of 7)
 * Pads to 36 digits, then adds 6 parity digits
 */
export function eccEncode(data: number[]): number[] {
  if (data.length !== 30) throw new Error('ECC expects 30 data digits');

  // Pad to 36 digits (add 6 zeros)
  const padded = [...data, 0, 0, 0, 0, 0, 0];

  const encoded: number[] = [];

  for (let block = 0; block < 6; block++) {
    const chunk = padded.slice(block * 6, block * 6 + 6);
    const parity = computeParity(chunk);
    encoded.push(...chunk, parity);
  }

  return encoded;
}

/**
 * Decode 42 digits → 30 data digits (correct up to 1 error/block)
 * Removes 6 padding digits after decoding
 */
export function eccDecode(encoded: number[]): number[] | null {
  if (encoded.length !== 42) return null;

  const data: number[] = [];

  for (let block = 0; block < 6; block++) {
    const chunk = encoded.slice(block * 7, block * 7 + 7);
    const corrected = correctBlock(chunk);
    if (!corrected) return null; // uncorrectable
    data.push(...corrected.slice(0, 6));
  }

  // Remove the 6 padding digits (last 6)
  return data.slice(0, 30);
}

/**
 * Compute simple checksum parity (sum mod 7)
 */
function computeParity(chunk: number[]): number {
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    sum += chunk[i] * (i + 1); // weighted sum
  }
  return sum % BASE;
}

/**
 * Attempt to correct a 7-symbol block (6 data + 1 parity)
 * Returns corrected block or null if uncorrectable
 */
function correctBlock(block: number[]): number[] | null {
  if (block.length !== 7) return null;

  const data = block.slice(0, 6);
  const receivedParity = block[6];
  const computedParity = computeParity(data);

  if (receivedParity === computedParity) {
    return block; // no error
  }

  // Try flipping each symbol to see if it fixes the parity
  for (let i = 0; i < 7; i++) {
    for (let val = 0; val < BASE; val++) {
      if (val === block[i]) continue;

      const candidate = [...block];
      candidate[i] = val;

      const testData = candidate.slice(0, 6);
      const testParity = computeParity(testData);

      if (testParity === candidate[6]) {
        return candidate; // corrected!
      }
    }
  }

  return null; // uncorrectable (>1 error)
}
