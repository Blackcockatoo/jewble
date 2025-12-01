import { describe, it, expect } from 'vitest';
import { toBase, fromBase, toSexagesimal, fromSexagesimal, BASE_SYSTEMS } from '../baseConversion';

describe('Base Conversion', () => {
  it('should convert to binary', () => {
    expect(toBase(10, BASE_SYSTEMS.BINARY)).toBe('1010');
    expect(toBase(255, BASE_SYSTEMS.BINARY)).toBe('11111111');
  });

  it('should convert to hexadecimal', () => {
    expect(toBase(255, BASE_SYSTEMS.HEXADECIMAL)).toBe('FF');
    expect(toBase(16, BASE_SYSTEMS.HEXADECIMAL)).toBe('10');
  });

  it('should convert to sexagesimal (base-60)', () => {
    expect(toBase(60, BASE_SYSTEMS.SEXAGESIMAL)).toBe('10');
    expect(toBase(61, BASE_SYSTEMS.SEXAGESIMAL)).toBe('11');
    expect(toBase(120, BASE_SYSTEMS.SEXAGESIMAL)).toBe('20');
  });

  it('should convert from base back to decimal', () => {
    expect(fromBase('1010', BASE_SYSTEMS.BINARY)).toBe(10);
    expect(fromBase('FF', BASE_SYSTEMS.HEXADECIMAL)).toBe(255);
    expect(fromBase('10', BASE_SYSTEMS.SEXAGESIMAL)).toBe(60);
  });

  it('should handle zero', () => {
    expect(toBase(0, 10)).toBe('0');
    expect(fromBase('0', 10)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(toBase(-10, 10)).toBe('-10');
    expect(fromBase('-10', 10)).toBe(-10);
  });

  it('should use sexagesimal helpers', () => {
    expect(toSexagesimal(103)).toBe('1h'); // lowercase h for base-60
    expect(fromSexagesimal('1h')).toBe(103);
  });

  it('should throw on invalid base', () => {
    expect(() => toBase(10, 1)).toThrow();
    expect(() => toBase(10, 63)).toThrow();
  });
});
