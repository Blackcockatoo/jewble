/**
 * Mode 1: Quantum Field
 *
 * Phyllotaxis-based prime visualization with particle orbits.
 * Uses golden angle spiral pattern modulated by MOSS60 sequences.
 */

import { initField, randomFloat, mix64 } from '../moss60/engine';
import { RED, BLACK, BLUE, toDigits } from '../moss60/sequences';
import type { QuantumFieldParams, Particle, ModeResult } from './types';

/**
 * Fibonacci 60-digit cycle (mod 10)
 */
function buildFib60(): number[] {
  const digits: number[] = [];
  let a = 0, b = 1;
  for (let i = 0; i < 60; i++) {
    digits.push(a % 10);
    const next = (a + b) % 10;
    a = b;
    b = next;
  }
  return digits;
}

const FIB60 = buildFib60();

/**
 * Lukas 12 sectors (sum = 60)
 */
const LUKAS = [2, 1, 3, 4, 7, 1, 8, 9, 7, 6, 3, 9];

/**
 * Get sector index for position in 60-cycle
 */
function sectorForIndex(k: number): number {
  const bounds = [0];
  let s = 0;
  for (const d of LUKAS) {
    s += d;
    bounds.push(s);
  }

  const idx = ((k % 60) + 60) % 60;
  for (let sector = 0; sector < 12; sector++) {
    if (idx >= bounds[sector] && idx < bounds[sector + 1]) return sector;
  }
  return 11;
}

/**
 * Color palette (10 colors for FIB60 digits 0-9)
 */
const PALETTE = [
  '#0b3c5d', // 0 - Deep blue
  '#ff7f0e', // 1 - Orange
  '#2ca02c', // 2 - Green
  '#d62728', // 3 - Red
  '#9467bd', // 4 - Purple
  '#8c564b', // 5 - Brown
  '#e377c2', // 6 - Pink
  '#7f7f7f', // 7 - Gray
  '#bcbd22', // 8 - Yellow-green
  '#17becf'  // 9 - Cyan
];

/**
 * Hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  const n = parseInt(hex, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255
  };
}

/**
 * Calculate Quantum Field particles using phyllotaxis pattern
 */
export function calculateQuantumField(params: QuantumFieldParams): ModeResult {
  const {
    width,
    height,
    time,
    energy,
    curiosity,
    bond,
    intensity,
    particleCount,
    phyllotaxisAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle
  } = params;

  const particles: Particle[] = [];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.47;
  const N = particleCount;

  for (let n = 0; n < N; n++) {
    // Base phyllotaxis position
    const baseR = maxR * Math.sqrt(n / N);
    const baseAng = n * phyllotaxisAngle + 0.25 * time;

    // MOSS60 modulation
    const k = n % 60;
    const fib = FIB60[k];
    const sector = sectorForIndex(k);
    const L = LUKAS[sector];

    // Scale and rotation based on sector and LUKAS number
    const rScale = 0.7 + 0.3 * (L / 9);
    const angOffset = sector * (Math.PI / 6) * 0.15;
    const r = baseR * rScale * (1 + (energy / 100) * 0.2);
    const ang = baseAng + angOffset;

    // Position
    const x = cx + r * Math.cos(ang);
    const y = cy + r * Math.sin(ang);

    // Color from palette based on Fibonacci digit
    const col = PALETTE[fib];
    const rgb = hexToRgb(col);

    // Pulsation based on time and curiosity
    const pulseSpeed = 2 + (curiosity / 100) * 2;
    const pulse = 0.5 + 0.4 * Math.sin(time * pulseSpeed + n * 0.03);

    // Apply intensity
    const R = Math.floor(rgb.r * pulse * intensity);
    const G = Math.floor(rgb.g * pulse * intensity);
    const B = Math.floor(rgb.b * pulse * intensity);

    // Size based on bond and pulse
    const baseSize = 1.5 + (bond / 100) * 1.5;
    const size = baseSize + 1.3 * pulse;

    particles.push({
      id: n,
      x,
      y,
      size,
      color: `rgb(${R},${G},${B})`,
      opacity: 0.8 * intensity,
      rotation: ang
    });
  }

  return { particles };
}

/**
 * Calculate velocity vectors for animated quantum field
 * Useful for trail effects
 */
export function calculateQuantumFieldVelocities(
  params: QuantumFieldParams,
  deltaTime: number
): Particle[] {
  const result1 = calculateQuantumField(params);
  const result2 = calculateQuantumField({
    ...params,
    time: params.time + deltaTime
  });

  return result1.particles.map((p, i) => {
    const p2 = result2.particles[i];
    return {
      ...p,
      vx: (p2.x - p.x) / deltaTime,
      vy: (p2.y - p.y) / deltaTime
    };
  });
}
