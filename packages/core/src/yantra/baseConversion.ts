/**
 * Base Conversion Utilities
 * Convert numbers between different base systems (2-62)
 */

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Convert a number to any base system (2-62)
 */
export function toBase(num: number, base: number): string {
  if (base < 2 || base > 62) {
    throw new Error('Base must be between 2 and 62');
  }

  if (num === 0) return '0';

  let result = '';
  let n = Math.abs(num);

  while (n > 0) {
    result = DIGITS[n % base] + result;
    n = Math.floor(n / base);
  }

  return num < 0 ? '-' + result : result;
}

/**
 * Convert from any base to decimal
 */
export function fromBase(str: string, base: number): number {
  if (base < 2 || base > 62) {
    throw new Error('Base must be between 2 and 62');
  }

  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;

  let result = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const digit = DIGITS.indexOf(cleanStr[i]);
    if (digit === -1 || digit >= base) {
      throw new Error(`Invalid digit "${cleanStr[i]}" for base ${base}`);
    }
    result = result * base + digit;
  }

  return isNegative ? -result : result;
}

/**
 * Common base systems
 */
export const BASE_SYSTEMS = {
  BINARY: 2,
  OCTAL: 8,
  DECIMAL: 10,
  DOZENAL: 12,
  HEXADECIMAL: 16,
  SEXAGESIMAL: 60,
} as const;

/**
 * Convert to sexagesimal (base-60) - traditional for astrology/astronomy
 */
export function toSexagesimal(num: number): string {
  return toBase(num, BASE_SYSTEMS.SEXAGESIMAL);
}

/**
 * Convert from sexagesimal to decimal
 */
export function fromSexagesimal(str: string): number {
  return fromBase(str, BASE_SYSTEMS.SEXAGESIMAL);
}
