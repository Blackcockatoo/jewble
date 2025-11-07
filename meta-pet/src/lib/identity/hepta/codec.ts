import type { HeptaPayload } from '../types';

/**
 * Pack HeptaPayload into 30 base-7 digits + MAC-28 → total 30 data digits
 *
 * Bit layout:
 * - version: 3 bits (always 1)
 * - preset: 2 bits (stealth=0, standard=1, radiant=2)
 * - vault: 2 bits (red=0, blue=1, black=2)
 * - rotation: 1 bit (CW=0, CCW=1)
 * - tail[0..3]: 6 bits each = 24 bits (0..59)
 * - epoch13: 13 bits
 * - nonce14: 14 bits
 * - mac: 28 bits (from HMAC-SHA256, truncated)
 * Total: 3+2+2+1+24+13+14+28 = 87 bits → pack into base-7
 */

const PRESET_MAP = { stealth: 0, standard: 1, radiant: 2 } as const;
const VAULT_MAP = { red: 0, blue: 1, black: 2 } as const;

/**
 * Pack payload + compute MAC-28 → 30 base-7 digits
 */
export async function packPayload(
  payload: HeptaPayload,
  hmacKey: CryptoKey
): Promise<number[]> {
  // Encode payload to bits
  let bits = 0n;
  let pos = 0;

  const writeBits = (val: number, width: number) => {
    bits |= BigInt(val) << BigInt(pos);
    pos += width;
  };

  writeBits(payload.version, 3);
  writeBits(PRESET_MAP[payload.preset], 2);
  writeBits(VAULT_MAP[payload.vault], 2);
  writeBits(payload.rotation === 'CW' ? 0 : 1, 1);
  payload.tail.forEach(t => writeBits(t & 0x3f, 6)); // 6 bits each
  writeBits(payload.epoch13 & 0x1fff, 13);
  writeBits(payload.nonce14 & 0x3fff, 14);

  // Now pos = 59 bits of data

  // Compute MAC-28 from first 59 bits
  const dataBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    dataBytes[i] = Number((bits >> BigInt(i * 8)) & 0xffn);
  }

  const mac = await crypto.subtle.sign('HMAC', hmacKey, dataBytes);
  const macU8 = new Uint8Array(mac);
  const mac28 = (macU8[0] | (macU8[1] << 8) | (macU8[2] << 16) | (macU8[3] << 24)) & 0x0fffffff;

  writeBits(mac28, 28);

  // Now bits = 87 bits total
  // Convert to base-7: 87 bits / log2(7) ≈ 30.9 → need 31 digits, but we target 30
  // So pack into exactly 30 base-7 digits (7^30 > 2^87)

  const digits: number[] = [];
  let remaining = bits;

  for (let i = 0; i < 30; i++) {
    digits.push(Number(remaining % 7n));
    remaining /= 7n;
  }

  return digits;
}

/**
 * Unpack 30 base-7 digits → payload (verify MAC)
 */
export async function unpackPayload(
  digits: number[],
  hmacKey: CryptoKey
): Promise<HeptaPayload | null> {
  if (digits.length !== 30) return null;

  // Reconstruct bits from base-7
  let bits = 0n;
  for (let i = 29; i >= 0; i--) {
    bits = bits * 7n + BigInt(digits[i]);
  }

  const readBits = (width: number): number => {
    const val = Number(bits & ((1n << BigInt(width)) - 1n));
    bits >>= BigInt(width);
    return val;
  };

  const version = readBits(3);
  if (version !== 1) return null;

  const presetIdx = readBits(2);
  const vaultIdx = readBits(2);
  const rotBit = readBits(1);
  const tail: [number, number, number, number] = [
    readBits(6),
    readBits(6),
    readBits(6),
    readBits(6),
  ];
  const epoch13 = readBits(13);
  const nonce14 = readBits(14);
  const mac28 = readBits(28);

  // Verify MAC
  const dataBytes = new Uint8Array(8);
  let dataBits = 0n;
  let pos = 0;
  const writeBits = (val: number, width: number) => {
    dataBits |= BigInt(val) << BigInt(pos);
    pos += width;
  };
  writeBits(version, 3);
  writeBits(presetIdx, 2);
  writeBits(vaultIdx, 2);
  writeBits(rotBit, 1);
  tail.forEach(t => writeBits(t, 6));
  writeBits(epoch13, 13);
  writeBits(nonce14, 14);

  for (let i = 0; i < 8; i++) {
    dataBytes[i] = Number((dataBits >> BigInt(i * 8)) & 0xffn);
  }

  const mac = await crypto.subtle.sign('HMAC', hmacKey, dataBytes);
  const macU8 = new Uint8Array(mac);
  const computedMac28 = (macU8[0] | (macU8[1] << 8) | (macU8[2] << 16) | (macU8[3] << 24)) & 0x0fffffff;

  if (mac28 !== computedMac28) return null; // MAC mismatch

  const presets: PrivacyPreset[] = ['stealth', 'standard', 'radiant'];
  const vaults: Vault[] = ['red', 'blue', 'black'];

  return {
    version: 1,
    preset: presets[presetIdx],
    vault: vaults[vaultIdx],
    rotation: rotBit === 0 ? 'CW' : 'CCW',
    tail,
    epoch13,
    nonce14,
  };
}

type PrivacyPreset = 'stealth' | 'standard' | 'radiant';
type Vault = 'red' | 'blue' | 'black';
