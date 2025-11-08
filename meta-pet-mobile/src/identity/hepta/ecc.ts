const BASE = 7;

export function eccEncode(data: number[]): number[] {
  if (data.length !== 30) throw new Error('ECC expects 30 data digits');

  const padded = [...data, 0, 0, 0, 0, 0, 0];
  const encoded: number[] = [];

  for (let block = 0; block < 6; block++) {
    const chunk = padded.slice(block * 6, block * 6 + 6);
    const parity = computeParity(chunk);
    encoded.push(...chunk, parity);
  }

  return encoded;
}

export function eccDecode(encoded: number[]): number[] | null {
  if (encoded.length !== 42) return null;

  const data: number[] = [];

  for (let block = 0; block < 6; block++) {
    const chunk = encoded.slice(block * 7, block * 7 + 7);
    const corrected = correctBlock(chunk);
    if (!corrected) return null;
    data.push(...corrected.slice(0, 6));
  }

  return data.slice(0, 30);
}

function computeParity(chunk: number[]): number {
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    sum += chunk[i] * (i + 1);
  }
  return sum % BASE;
}

function correctBlock(block: number[]): number[] | null {
  if (block.length !== 7) return null;

  const data = block.slice(0, 6);
  const receivedParity = block[6];
  const computedParity = computeParity(data);

  if (receivedParity === computedParity) {
    return block;
  }

  for (let i = 0; i < 7; i++) {
    for (let val = 0; val < BASE; val++) {
      if (val === block[i]) continue;

      const candidate = [...block];
      candidate[i] = val;

      const testData = candidate.slice(0, 6);
      const testParity = computeParity(testData);

      if (testParity === candidate[6]) {
        return candidate;
      }
    }
  }

  return null;
}

export function getEccInfo(encoded: number[]): {
  hasErrors: boolean;
  correctedBlocks: number;
  totalBlocks: number;
} {
  if (encoded.length !== 42) {
    return { hasErrors: true, correctedBlocks: 0, totalBlocks: 6 };
  }

  let correctedBlocks = 0;

  for (let block = 0; block < 6; block++) {
    const chunk = encoded.slice(block * 7, block * 7 + 7);
    const data = chunk.slice(0, 6);
    const receivedParity = chunk[6];
    const computedParity = computeParity(data);

    if (receivedParity !== computedParity) {
      correctedBlocks++;
    }
  }

  return {
    hasErrors: correctedBlocks > 0,
    correctedBlocks,
    totalBlocks: 6,
  };
}
