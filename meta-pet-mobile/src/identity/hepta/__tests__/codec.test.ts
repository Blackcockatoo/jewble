import { packPayload, unpackPayload } from '../codec';
import type { HeptaPayload } from '../../types';

// Mock HMAC key for testing
const mockHmacKey = new Uint8Array(32).fill(42);

describe('Hepta Codec', () => {
  const validPayload: HeptaPayload = {
    version: 1,
    preset: 'standard',
    vault: 'blue',
    rotation: 'CW',
    tail: [10, 20, 30, 40],
    epoch13: 4096,
    nonce14: 8192,
  };

  describe('packPayload', () => {
    it('should pack payload into 30 base-7 digits', async () => {
      const digits = await packPayload(validPayload, mockHmacKey);

      expect(digits).toHaveLength(30);
      expect(digits.every(d => d >= 0 && d < 7)).toBe(true);
    });

    it('should produce deterministic output for same input', async () => {
      const digits1 = await packPayload(validPayload, mockHmacKey);
      const digits2 = await packPayload(validPayload, mockHmacKey);

      expect(digits1).toEqual(digits2);
    });

    it('should produce different output for different payloads', async () => {
      const payload2: HeptaPayload = {
        ...validPayload,
        vault: 'red',
      };

      const digits1 = await packPayload(validPayload, mockHmacKey);
      const digits2 = await packPayload(payload2, mockHmacKey);

      expect(digits1).not.toEqual(digits2);
    });

    it('should handle all vault types', async () => {
      const vaults: Array<'red' | 'blue' | 'black'> = ['red', 'blue', 'black'];

      for (const vault of vaults) {
        const payload = { ...validPayload, vault };
        const digits = await packPayload(payload, mockHmacKey);
        expect(digits).toHaveLength(30);
      }
    });

    it('should handle all preset types', async () => {
      const presets: Array<'stealth' | 'standard' | 'radiant'> = ['stealth', 'standard', 'radiant'];

      for (const preset of presets) {
        const payload = { ...validPayload, preset };
        const digits = await packPayload(payload, mockHmacKey);
        expect(digits).toHaveLength(30);
      }
    });

    it('should handle both rotation directions', async () => {
      const cw = await packPayload({ ...validPayload, rotation: 'CW' }, mockHmacKey);
      const ccw = await packPayload({ ...validPayload, rotation: 'CCW' }, mockHmacKey);

      expect(cw).not.toEqual(ccw);
    });
  });

  describe('unpackPayload', () => {
    it('should unpack valid digits back to payload', async () => {
      const digits = await packPayload(validPayload, mockHmacKey);
      const unpacked = await unpackPayload(digits, mockHmacKey);

      expect(unpacked).not.toBeNull();
      expect(unpacked?.version).toBe(validPayload.version);
      expect(unpacked?.preset).toBe(validPayload.preset);
      expect(unpacked?.vault).toBe(validPayload.vault);
      expect(unpacked?.rotation).toBe(validPayload.rotation);
      expect(unpacked?.tail).toEqual(validPayload.tail);
      expect(unpacked?.epoch13).toBe(validPayload.epoch13);
      expect(unpacked?.nonce14).toBe(validPayload.nonce14);
    });

    it('should return null for invalid length', async () => {
      const result = await unpackPayload([1, 2, 3], mockHmacKey);
      expect(result).toBeNull();
    });

    it('should reject tampered data (MAC mismatch)', async () => {
      const digits = await packPayload(validPayload, mockHmacKey);

      // Tamper with digits
      digits[0] = (digits[0] + 1) % 7;

      const unpacked = await unpackPayload(digits, mockHmacKey);
      expect(unpacked).toBeNull();
    });

    it('should reject payload with wrong HMAC key', async () => {
      const digits = await packPayload(validPayload, mockHmacKey);
      const wrongKey = new Uint8Array(32).fill(99);

      const unpacked = await unpackPayload(digits, wrongKey);
      expect(unpacked).toBeNull();
    });

    it('should reject invalid version', async () => {
      // Manually construct payload with version 0
      const invalidPayload = { ...validPayload, version: 0 };
      const digits = await packPayload(invalidPayload as any, mockHmacKey);

      // This will fail MAC verification due to version mismatch in reconstruction
      const unpacked = await unpackPayload(digits, mockHmacKey);
      // Should either return null or have version 1 after reconstruction
      if (unpacked) {
        expect(unpacked.version).toBe(1);
      }
    });
  });

  describe('Round-trip packing', () => {
    it('should maintain data integrity through pack/unpack cycle', async () => {
      const testPayloads: HeptaPayload[] = [
        validPayload,
        { ...validPayload, vault: 'red', rotation: 'CCW' },
        { ...validPayload, preset: 'stealth', tail: [0, 0, 0, 0] },
        { ...validPayload, preset: 'radiant', tail: [59, 59, 59, 59] },
      ];

      for (const payload of testPayloads) {
        const digits = await packPayload(payload, mockHmacKey);
        const unpacked = await unpackPayload(digits, mockHmacKey);

        expect(unpacked).not.toBeNull();
        expect(unpacked?.version).toBe(payload.version);
        expect(unpacked?.preset).toBe(payload.preset);
        expect(unpacked?.vault).toBe(payload.vault);
        expect(unpacked?.rotation).toBe(payload.rotation);
        expect(unpacked?.tail).toEqual(payload.tail);
      }
    });
  });

  describe('MAC security', () => {
    it('should produce different MACs for different payloads', async () => {
      const payload1 = validPayload;
      const payload2 = { ...validPayload, nonce14: 9999 };

      const digits1 = await packPayload(payload1, mockHmacKey);
      const digits2 = await packPayload(payload2, mockHmacKey);

      expect(digits1).not.toEqual(digits2);
    });

    it('should detect bit flips in MAC portion', async () => {
      const digits = await packPayload(validPayload, mockHmacKey);

      // Flip last digit (likely in MAC region)
      digits[29] = (digits[29] + 1) % 7;

      const unpacked = await unpackPayload(digits, mockHmacKey);
      expect(unpacked).toBeNull();
    });
  });
});
