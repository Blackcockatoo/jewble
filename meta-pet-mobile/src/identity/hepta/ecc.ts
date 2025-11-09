const BASE = 7;
const DATA_PER_BLOCK = 5;
const SYMBOLS_PER_BLOCK = 7;
const TOTAL_BLOCKS = 6;

export function eccEncode(data: number[]): number[] {
  if (data.length !== DATA_PER_BLOCK * TOTAL_BLOCKS) {
    throw new Error('ECC expects 30 data digits');
  }

  const encoded: number[] = [];

  for (let block = 0; block < TOTAL_BLOCKS; block++) {
    const start = block * DATA_PER_BLOCK;
    const chunk = data.slice(start, start + DATA_PER_BLOCK);
    const parityA = computeParitySum(chunk);
    const parityB = computeParitySquares(chunk);
    encoded.push(...chunk, parityA, parityB);
  }

  return encoded;
}

export function eccDecode(encoded: number[]): number[] | null {
  if (encoded.length !== SYMBOLS_PER_BLOCK * TOTAL_BLOCKS) return null;

  const decoded: number[] = [];

  for (let block = 0; block < TOTAL_BLOCKS; block++) {
    const chunk = encoded.slice(block * SYMBOLS_PER_BLOCK, block * SYMBOLS_PER_BLOCK + SYMBOLS_PER_BLOCK);
    const corrected = correctBlock(chunk);
    if (!corrected) return null;
    decoded.push(...corrected.slice(0, DATA_PER_BLOCK));
  }

  return decoded;
}

function computeParitySum(chunk: number[]): number {
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    sum = (sum + chunk[i]) % BASE;
  }
  return sum;
}

function computeParitySquares(chunk: number[]): number {
  let sum = 0;
  for (let i = 0; i < chunk.length; i++) {
    sum = (sum + (chunk[i] * chunk[i]) % BASE) % BASE;
  }
  return sum;
}

function modInverse(value: number, modulus: number): number | null {
  const normalized = ((value % modulus) + modulus) % modulus;
  if (normalized === 0) return null;
  for (let candidate = 1; candidate < modulus; candidate++) {
    if ((normalized * candidate) % modulus === 1) {
      return candidate;
    }
  }
  return null;
}

function correctBlock(block: number[]): number[] | null {
  if (block.length !== SYMBOLS_PER_BLOCK) return null;

  const data = block.slice(0, DATA_PER_BLOCK);
  const parityA = block[DATA_PER_BLOCK];
  const parityB = block[DATA_PER_BLOCK + 1];

  const sum = computeParitySum(data);
  const sumSquares = computeParitySquares(data);

  const diffA = (parityA - sum + BASE) % BASE;
  const diffB = (parityB - sumSquares + BASE) % BASE;

  if (diffA === 0 && diffB === 0) {
    return [...data, parityA, parityB];
  }

  const parityMismatchA = diffA !== 0;
  const parityMismatchB = diffB !== 0;

  const correction = tryCorrectData({
    data,
    parityA,
    parityB,
    sum,
    diffA,
    diffB,
  });

  if (correction?.type === 'success') {
    return correction.block;
  }

  if (!parityMismatchA || !parityMismatchB || correction?.type === 'ambiguous') {
    const correctedParityA = computeParitySum(data);
    const correctedParityB = computeParitySquares(data);
    return [...data, correctedParityA, correctedParityB];
  }

  return null;
}

type DataCorrectionResult =
  | { type: 'success'; block: number[] }
  | { type: 'ambiguous' }
  | null;

function tryCorrectData({
  data,
  parityA,
  parityB,
  sum,
  diffA,
  diffB,
}: {
  data: number[];
  parityA: number;
  parityB: number;
  sum: number;
  diffA: number;
  diffB: number;
}): DataCorrectionResult {
  const errorMagnitude = (BASE - diffA) % BASE;
  if (errorMagnitude === 0) {
    return null;
  }

  const twoE = (2 * errorMagnitude) % BASE;
  const inverseTwoE = modInverse(twoE, BASE);
  if (inverseTwoE === null) {
    return null;
  }

  const rhs = (BASE - diffB + BASE) % BASE;
  const errorSquare = (errorMagnitude * errorMagnitude) % BASE;
  const originalValue = ((rhs - errorSquare + BASE) % BASE * inverseTwoE) % BASE;

  let correctedIndex = -1;
  let firstMatchIndex = -1;
  let matches = 0;

  for (let i = 0; i < DATA_PER_BLOCK; i++) {
    const sumExcluding = (sum - data[i] + BASE) % BASE;
    const candidate = (parityA - sumExcluding + BASE) % BASE;

    if (candidate === originalValue) {
      const delta = (data[i] - originalValue + BASE) % BASE;
      if (delta === errorMagnitude) {
        if (firstMatchIndex === -1) {
          firstMatchIndex = i;
        }
        correctedIndex = i;
        matches++;
      }
    }
  }

  if (matches === 0) {
    return null;
  }

  if (matches > 1) {
    if (diffB === 0) {
      return { type: 'ambiguous' };
    }

    correctedIndex = firstMatchIndex;
  }

  const correctedData = [...data];
  correctedData[correctedIndex] = originalValue;

  const correctedParityA = computeParitySum(correctedData);
  const correctedParityB = computeParitySquares(correctedData);

  return {
    type: 'success',
    block: [...correctedData, correctedParityA, correctedParityB],
  };
}

export function getEccInfo(encoded: number[]): {
  hasErrors: boolean;
  correctedBlocks: number;
  totalBlocks: number;
} {
  if (encoded.length !== SYMBOLS_PER_BLOCK * TOTAL_BLOCKS) {
    return { hasErrors: true, correctedBlocks: 0, totalBlocks: TOTAL_BLOCKS };
  }

  let correctedBlocks = 0;

  for (let block = 0; block < TOTAL_BLOCKS; block++) {
    const start = block * SYMBOLS_PER_BLOCK;
    const chunk = encoded.slice(start, start + SYMBOLS_PER_BLOCK);
    const corrected = correctBlock(chunk);

    if (!corrected) {
      return { hasErrors: true, correctedBlocks, totalBlocks: TOTAL_BLOCKS };
    }

    let differs = false;
    for (let i = 0; i < SYMBOLS_PER_BLOCK; i++) {
      if (chunk[i] !== corrected[i]) {
        differs = true;
        break;
      }
    }

    if (differs) {
      correctedBlocks++;
    }
  }

  return {
    hasErrors: correctedBlocks > 0,
    correctedBlocks,
    totalBlocks: TOTAL_BLOCKS,
  };
}
