export { eccEncode, eccDecode, getEccInfo } from './ecc';
export { packPayload, unpackPayload } from './codec';

export const HEPTA_SYMBOLS = '♈♉♊♋♌♍♎' as const;

export function digitsToSymbols(digits: number[]): string {
  return digits.map(d => HEPTA_SYMBOLS[d % 7]).join('');
}

export function symbolsToDigits(symbols: string): number[] | null {
  const digits: number[] = [];
  for (const char of symbols) {
    const index = HEPTA_SYMBOLS.indexOf(char);
    if (index === -1) return null;
    digits.push(index);
  }
  return digits;
}

export function formatHeptaCode(symbols: string): string {
  const blocks: string[] = [];
  for (let i = 0; i < symbols.length; i += 7) {
    blocks.push(symbols.slice(i, i + 7));
  }
  return blocks.join(' · ');
}
