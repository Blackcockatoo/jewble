/**
 * MOSS60 Base Sequences
 *
 * Three 60-digit prime-derived sequences forming the foundation
 * of the MOSS60 cryptographic and visualization system.
 */

/**
 * RED sequence - First 60-digit prime-based sequence
 */
export const RED = "113031491493585389543778774590997079619617525721567332336510";

/**
 * BLACK sequence - Second 60-digit Fibonacci-derived sequence
 */
export const BLACK = "011235831459437077415617853819099875279651673033695493257291";

/**
 * BLUE sequence - Third 60-digit Lucas-derived sequence
 */
export const BLUE = "012776329785893036118967145479098334781325217074992143965631";

/**
 * Convert string to array of digit values
 */
export const toDigits = (s: string): number[] => s.split('').map(ch => {
  const d = ch.charCodeAt(0) - 48;
  if (d < 0 || d > 9) throw new Error(`non-digit: ${ch}`);
  return d;
});

/**
 * Interleave three strings character by character
 * Example: interleave3("abc", "123", "xyz") => "a1xb2yc3z"
 */
export const interleave3 = (a: string, b: string, c: string): string => {
  const n = Math.min(a.length, b.length, c.length);
  let out = "";
  for (let i = 0; i < n; i++) out += a[i] + b[i] + c[i];
  return out;
};

/**
 * Convert base-10 digit string to hex using custom table mixing
 */
export const base10ToHex = (digitStr: string): string => {
  const table = "0123456789abcdef".split("");
  let h = "", acc = 0;
  for (let i = 0; i < digitStr.length; i++) {
    acc = (acc * 17 + (digitStr.charCodeAt(i) - 48)) >>> 0;
    h += table[(acc ^ (i * 7)) & 15];
  }
  return h;
};

/**
 * Get pulse array by XORing RED, BLACK, BLUE sequences
 */
export const getPulse = (): number[] => {
  const r = toDigits(RED);
  const k = toDigits(BLACK);
  const b = toDigits(BLUE);
  return r.map((rv, i) => (rv ^ k[(i * 7) % 60] ^ b[(i * 13) % 60]) % 10);
};

/**
 * Get ring array by adding RED, BLACK, BLUE sequences
 */
export const getRing = (): number[] => {
  const r = toDigits(RED);
  const k = toDigits(BLACK);
  const b = toDigits(BLUE);
  return Array.from({ length: 60 }, (_, i) => (r[i] + k[i] + b[i]) % 10);
};
