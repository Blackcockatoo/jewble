/**
 * Mode 2: Prime Lattice
 *
 * 16x16 grid highlighting prime positions with connections to adjacent primes.
 * Uses MOSS60 sequences to determine prime values at each grid position.
 */

import { RED, BLACK, BLUE } from '../moss60/sequences';
import type { PrimeLatticeParams, Particle, Line, ModeResult } from './types';

/**
 * Prime sieve up to 10,000
 */
const PRIMES = new Set<number>();
(function generatePrimes() {
  const limit = 10000;
  const is = new Array(limit).fill(true);
  is[0] = is[1] = false;
  for (let i = 2; i * i < limit; i++) {
    if (is[i]) {
      for (let j = i * i; j < limit; j += i) {
        is[j] = false;
      }
    }
  }
  for (let i = 0; i < limit; i++) {
    if (is[i]) PRIMES.add(i);
  }
})();

function isPrime(n: number): boolean {
  return PRIMES.has(n);
}

/**
 * Lineage assignment: which sequence dominates at each index
 */
const LINEAGE: Array<'red' | 'black' | 'blue'> = [];
for (let i = 0; i < 60; i++) {
  const r = parseInt(RED[i]);
  const k = parseInt(BLACK[i]);
  const b = parseInt(BLUE[i]);

  if (r >= k && r >= b) LINEAGE[i] = 'red';
  else if (b >= k) LINEAGE[i] = 'blue';
  else LINEAGE[i] = 'black';
}

/**
 * Get color for lineage
 */
function getColor(lineage: 'red' | 'black' | 'blue', alpha: number = 1): string {
  const colors = {
    red: `rgba(255, 52, 85, ${alpha})`,
    blue: `rgba(68, 170, 255, ${alpha})`,
    black: `rgba(255, 215, 0, ${alpha})`
  };
  return colors[lineage];
}

/**
 * Get sequence for lineage
 */
function getSequence(lineage: 'red' | 'black' | 'blue', inverted: boolean = false): string {
  if (lineage === 'red') return inverted ? BLUE : RED;
  if (lineage === 'blue') return inverted ? RED : BLUE;
  return BLACK;
}

/**
 * Calculate Prime Lattice grid and connections
 */
export function calculatePrimeLattice(params: PrimeLatticeParams): ModeResult {
  const {
    width,
    height,
    time,
    intensity,
    gridSize,
    primeSensitivity
  } = params;

  const particles: Particle[] = [];
  const lines: Line[] = [];

  const cellSize = Math.min(width, height) * 0.8 / gridSize;
  const startX = width / 2 - (gridSize * cellSize) / 2;
  const startY = height / 2 - (gridSize * cellSize) / 2;

  // Track prime positions for connection drawing
  const primePositions: Array<{ x: number; y: number; row: number; col: number; lineage: string }> = [];

  // Draw grid cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const idx = (row * gridSize + col) % 60;
      const lineage = LINEAGE[idx];
      const seq = getSequence(lineage);
      const digit = parseInt(seq[idx]);

      if (!isPrime(digit)) continue;

      const x = startX + col * cellSize + cellSize / 2;
      const y = startY + row * cellSize + cellSize / 2;

      // Pulsation
      const pulse = 0.6 + 0.4 * Math.sin(time * 3 + row * 0.3 + col * 0.3);
      const size = cellSize * 0.4 * pulse * intensity * primeSensitivity;

      particles.push({
        id: row * gridSize + col,
        x,
        y,
        size,
        color: getColor(lineage, pulse * 0.9),
        opacity: pulse * 0.9,
        rotation: 0
      });

      primePositions.push({ x, y, row, col, lineage });
    }
  }

  // Draw connections between adjacent primes
  for (const prime of primePositions) {
    const { x, y, row, col, lineage } = prime;

    // Check 8 adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const nr = row + dr;
        const nc = col + dc;

        if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;

        const nidx = (nr * gridSize + nc) % 60;
        const nlineage = LINEAGE[nidx];
        const nseq = getSequence(nlineage);
        const ndigit = parseInt(nseq[nidx]);

        if (isPrime(ndigit)) {
          const nx = startX + nc * cellSize + cellSize / 2;
          const ny = startY + nr * cellSize + cellSize / 2;

          // Only draw each connection once (avoid duplicates)
          if (row < nr || (row === nr && col < nc)) {
            lines.push({
              start: { x, y },
              end: { x: nx, y: ny },
              color: getColor(lineage as 'red' | 'black' | 'blue', 0.15 * intensity),
              width: 1,
              opacity: 0.15 * intensity
            });
          }
        }
      }
    }
  }

  return { particles, lines };
}

/**
 * Get prime statistics for the lattice
 */
export function getPrimeLatticeStats(gridSize: number): {
  activePrimes: number;
  primeDensity: number;
} {
  let primeCount = 0;
  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    const idx = i % 60;
    const lineage = LINEAGE[idx];
    const seq = getSequence(lineage);
    const digit = parseInt(seq[idx]);

    if (isPrime(digit)) primeCount++;
  }

  return {
    activePrimes: primeCount,
    primeDensity: (primeCount / totalCells) * 100
  };
}
