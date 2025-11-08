import * as Crypto from 'expo-crypto';
import type { HeptaPayload, PrivacyPreset, Vault } from '../types';

const PRESET_MAP = { stealth: 0, standard: 1, radiant: 2 } as const;
const VAULT_MAP = { red: 0, blue: 1, black: 2 } as const;

// Simple HMAC implementation for payload MAC
async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const blockSize = 64;
  const outputSize = 32;

  let keyPrime = new Uint8Array(blockSize);
  if (key.length > blockSize) {
    const hashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, key);
    keyPrime.set(new Uint8Array(hashed));
  } else {
    keyPrime.set(key);
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyPrime[i] ^ 0x36;
    opad[i] = keyPrime[i] ^ 0x5c;
  }

  const innerConcat = new Uint8Array(blockSize + message.length);
  innerConcat.set(ipad);
  innerConcat.set(message, blockSize);
  const innerHash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, innerConcat);

  const outerConcat = new Uint8Array(blockSize + outputSize);
  outerConcat.set(opad);
  outerConcat.set(new Uint8Array(innerHash), blockSize);
  const mac = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, outerConcat);

  return new Uint8Array(mac);
}

export async function packPayload(
  payload: HeptaPayload,
  hmacKey: Uint8Array
): Promise<number[]> {
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
  payload.tail.forEach(t => writeBits(t & 0x3f, 6));
  writeBits(payload.epoch13 & 0x1fff, 13);
  writeBits(payload.nonce14 & 0x3fff, 14);

  const dataBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    dataBytes[i] = Number((bits >> BigInt(i * 8)) & 0xffn);
  }

  const mac = await hmacSha256(hmacKey, dataBytes);
  const mac28 = (mac[0] | (mac[1] << 8) | (mac[2] << 16) | (mac[3] << 24)) & 0x0fffffff;

  writeBits(mac28, 28);

  const digits: number[] = [];
  let remaining = bits;

  for (let i = 0; i < 30; i++) {
    digits.push(Number(remaining % 7n));
    remaining /= 7n;
  }

  return digits;
}

export async function unpackPayload(
  digits: number[],
  hmacKey: Uint8Array
): Promise<HeptaPayload | null> {
  if (digits.length !== 30) return null;

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

  const mac = await hmacSha256(hmacKey, dataBytes);
  const computedMac28 = (mac[0] | (mac[1] << 8) | (mac[2] << 16) | (mac[3] << 24)) & 0x0fffffff;

  if (mac28 !== computedMac28) return null;

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
