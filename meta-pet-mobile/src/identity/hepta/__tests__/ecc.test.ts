import { eccEncode, eccDecode, getEccInfo } from '../ecc';

describe('ECC (Error Correction Code)', () => {
  describe('eccEncode', () => {
    it('should encode 30 data digits to 42 digits', () => {
      const data = Array(30).fill(0).map((_, i) => i % 7);
      const encoded = eccEncode(data);

      expect(encoded).toHaveLength(42);
      expect(encoded.every(d => d >= 0 && d < 7)).toBe(true);
    });

    it('should throw error for invalid input length', () => {
      expect(() => eccEncode([1, 2, 3])).toThrow('ECC expects 30 data digits');
    });

    it('should add 6 parity digits', () => {
      const data = Array(30).fill(0);
      const encoded = eccEncode(data);

      // Last digit of each 7-symbol block is parity
      expect(encoded[6]).toBeDefined(); // Block 1 parity
      expect(encoded[13]).toBeDefined(); // Block 2 parity
      expect(encoded[20]).toBeDefined(); // Block 3 parity
      expect(encoded[27]).toBeDefined(); // Block 4 parity
      expect(encoded[34]).toBeDefined(); // Block 5 parity
      expect(encoded[41]).toBeDefined(); // Block 6 parity
    });
  });

  describe('eccDecode', () => {
    it('should decode clean data without errors', () => {
      const original = Array(30).fill(0).map((_, i) => i % 7);
      const encoded = eccEncode(original);
      const decoded = eccDecode(encoded);

      expect(decoded).toEqual(original);
    });

    it('should return null for invalid length', () => {
      expect(eccDecode([1, 2, 3])).toBeNull();
    });

    it('should correct single-digit error per block', () => {
      const original = Array(30).fill(3);
      const encoded = eccEncode(original);

      // Introduce single error in first block
      encoded[2] = (encoded[2] + 1) % 7;

      const decoded = eccDecode(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correct errors in multiple blocks', () => {
      const original = [1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6, 0, 1, 2];
      const encoded = eccEncode(original);

      // Introduce errors in different blocks
      encoded[1] = (encoded[1] + 2) % 7;  // Block 1 error
      encoded[15] = (encoded[15] + 3) % 7; // Block 3 error
      encoded[30] = (encoded[30] + 1) % 7; // Block 5 error

      const decoded = eccDecode(encoded);
      expect(decoded).toEqual(original);
    });

    it('should return null for uncorrectable errors (>1 per block)', () => {
      const original = Array(30).fill(2);
      const encoded = eccEncode(original);

      // Introduce 2 errors in same block
      encoded[0] = (encoded[0] + 1) % 7;
      encoded[1] = (encoded[1] + 1) % 7;

      const decoded = eccDecode(encoded);
      expect(decoded).toBeNull();
    });
  });

  describe('getEccInfo', () => {
    it('should report no errors for clean data', () => {
      const data = Array(30).fill(1);
      const encoded = eccEncode(data);
      const info = getEccInfo(encoded);

      expect(info.hasErrors).toBe(false);
      expect(info.correctedBlocks).toBe(0);
      expect(info.totalBlocks).toBe(6);
    });

    it('should detect errors', () => {
      const data = Array(30).fill(4);
      const encoded = eccEncode(data);

      // Introduce error
      encoded[5] = (encoded[5] + 1) % 7;

      const info = getEccInfo(encoded);

      expect(info.hasErrors).toBe(true);
      expect(info.correctedBlocks).toBeGreaterThan(0);
      expect(info.totalBlocks).toBe(6);
    });

    it('should handle invalid input', () => {
      const info = getEccInfo([1, 2, 3]);

      expect(info.hasErrors).toBe(true);
      expect(info.totalBlocks).toBe(6);
    });
  });

  describe('Round-trip encoding', () => {
    it('should maintain data integrity through encode/decode cycle', () => {
      const testCases = [
        Array(30).fill(0),
        Array(30).fill(6),
        Array(30).fill(0).map((_, i) => i % 7),
        Array(30).fill(0).map(() => Math.floor(Math.random() * 7)),
      ];

      testCases.forEach((original) => {
        const encoded = eccEncode(original);
        const decoded = eccDecode(encoded);
        expect(decoded).toEqual(original);
      });
    });
  });
});
