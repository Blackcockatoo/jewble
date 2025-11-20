import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { PrimeTailId, Vault, Rotation } from './types';

const HMAC_KEY_STORAGE = 'metapet-hmac-key';

// Crypto helpers
function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function b64url(u8: Uint8Array): string {
  const base64 = u8.reduce((data, byte) => data + String.fromCharCode(byte), '');
  return btoa(base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Simple HMAC implementation using expo-crypto
async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const blockSize = 64;
  const outputSize = 32;

  let keyPrime = new Uint8Array(blockSize);
  if (key.length > blockSize) {
    const hashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, key as BufferSource);
    keyPrime.set(new Uint8Array(hashed as ArrayBuffer));
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

/**
 * Get or create device HMAC key (stored in secure keystore)
 */
export async function getDeviceHmacKey(): Promise<Uint8Array> {
  try {
    const stored = await SecureStore.getItemAsync(HMAC_KEY_STORAGE);
    if (stored) {
      return new Uint8Array(base64ToArrayBuffer(stored));
    }
  } catch (error) {
    console.warn('Failed to load HMAC key from secure store:', error);
  }

  // Generate new 256-bit key
  const key = await Crypto.getRandomBytesAsync(32);

  try {
    await SecureStore.setItemAsync(HMAC_KEY_STORAGE, arrayBufferToBase64(key.buffer as ArrayBuffer));
  } catch (error) {
    console.warn('Failed to persist HMAC key:', error);
  }

  return key;
}

/**
 * Mint a PrimeTailId crest from DNA string
 * DNA stays private; only hashes + tail are exposed
 */
export async function mintPrimeTailId(opts: {
  dna: string;
  vault: Vault;
  rotation: Rotation;
  tail: [number, number, number, number];
  hmacKey: Uint8Array;
}): Promise<PrimeTailId> {
  const enc = new TextEncoder();

  // Hash DNA (forward)
  const dnaHashBuf = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    enc.encode(opts.dna)
  );
  const dnaHash = bufToHex(dnaHashBuf);

  // Hash reversed DNA (mirror)
  const mirrorHashBuf = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    enc.encode([...opts.dna].reverse().join(''))
  );
  const mirrorHash = bufToHex(mirrorHashBuf);

  const coronatedAt = Date.now();

  // Sign {hashes, tail, vault, rotation, timestamp}
  const payload = JSON.stringify({
    dnaHash,
    mirrorHash,
    tail: opts.tail,
    vault: opts.vault,
    rotation: opts.rotation,
    coronatedAt,
  });

  const mac = await hmacSha256(opts.hmacKey, enc.encode(payload));
  const signature = b64url(mac.slice(0, 32)); // 256-bit

  return {
    vault: opts.vault,
    rotation: opts.rotation,
    tail: opts.tail,
    coronatedAt,
    dnaHash,
    mirrorHash,
    signature,
  };
}

/**
 * Verify a crest signature
 */
export async function verifyCrest(
  crest: PrimeTailId,
  hmacKey: Uint8Array
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const payload = JSON.stringify({
      dnaHash: crest.dnaHash,
      mirrorHash: crest.mirrorHash,
      tail: crest.tail,
      vault: crest.vault,
      rotation: crest.rotation,
      coronatedAt: crest.coronatedAt,
    });

    const expectedMac = await hmacSha256(hmacKey, enc.encode(payload));
    const expectedSig = b64url(expectedMac.slice(0, 32));

    return expectedSig === crest.signature;
  } catch {
    return false;
  }
}

/**
 * Generate random DNA (for testing/demo)
 */
export function generateRandomDNA(length: number = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random tail
 */
export function generateRandomTail(): [number, number, number, number] {
  return [
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
  ];
}
