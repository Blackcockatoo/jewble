/**
 * Mode 5: Yantra Bloom
 *
 * Sacred geometry with Sri Yantra patterns.
 * Concentric layers of triangular patterns with MOSS60 color modulation.
 */

import { RED, BLACK, BLUE } from '../moss60/sequences';
import type { YantraBloomParams, Polygon, Line, ModeResult, Point } from './types';

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
 * Lukas 12 sectors
 */
const LUKAS = [2, 1, 3, 4, 7, 1, 8, 9, 7, 6, 3, 9];

/**
 * Color palette for FIB60 digits
 */
const PALETTE = [
  '#0b3c5d', // 0
  '#ff7f0e', // 1
  '#2ca02c', // 2
  '#d62728', // 3
  '#9467bd', // 4
  '#8c564b', // 5
  '#e377c2', // 6
  '#7f7f7f', // 7
  '#bcbd22', // 8
  '#17becf'  // 9
];

/**
 * Create rotation matrix
 */
function rotatePoint(p: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  };
}

/**
 * Calculate Yantra Bloom - Sacred geometry petals and layers
 */
export function calculateYantraBloom(params: YantraBloomParams): ModeResult {
  const {
    width,
    height,
    time,
    intensity,
    petalCount,
    layers
  } = params;

  const polygons: Polygon[] = [];
  const lines: Line[] = [];

  const cx = width / 2;
  const cy = height / 2;
  const baseR = Math.min(width, height) * 0.42;

  // Concentric circles (background)
  for (let i = 1; i <= 6; i++) {
    const r = baseR * (i / 6);
    const points: Point[] = [];
    const segments = 60;

    for (let j = 0; j <= segments; j++) {
      const angle = (Math.PI * 2 * j) / segments;
      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    }

    // Draw as line loop rather than filled polygon
    for (let j = 0; j < segments; j++) {
      lines.push({
        start: points[j],
        end: points[j + 1],
        color: 'rgba(255,255,255,0.2)',
        width: 0.7,
        opacity: 0.2 * intensity
      });
    }
  }

  // Triangular layers (Sri Yantra style)
  const triangleLevels = layers;

  for (let k = 0; k < triangleLevels; k++) {
    const r = baseR * (0.22 + 0.74 * k / (triangleLevels - 1));
    const fib = FIB60[(k * 7) % 60];
    const col = PALETTE[fib];

    const spin = time * 0.2 + k * 0.11;

    // Create upward-pointing triangle
    const triangle: Point[] = [];
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
      const rotated = rotatePoint(
        { x: r * Math.cos(a), y: r * Math.sin(a) },
        spin
      );
      triangle.push({
        x: cx + rotated.x,
        y: cy + rotated.y
      });
    }

    // Draw triangle
    for (let i = 0; i < 3; i++) {
      lines.push({
        start: triangle[i],
        end: triangle[(i + 1) % 3],
        color: col + 'AA',
        width: 1.5,
        opacity: 0.7 * intensity
      });
    }
  }

  // Radial spokes (12 directions using LUKAS)
  for (let i = 0; i < 12; i++) {
    const L = LUKAS[i];
    const lenFactor = 0.4 + 0.5 * (L / 9);
    const r = baseR * lenFactor;
    const angle = (Math.PI * 2 * i / 12) + 0.15 * Math.sin(time + i);

    const x1 = cx;
    const y1 = cy;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);

    lines.push({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      color: 'rgba(255,255,255,0.35)',
      width: 1,
      opacity: 0.35 * intensity
    });
  }

  // Outer petals (flower pattern)
  const petalAngleStep = (Math.PI * 2) / petalCount;
  for (let i = 0; i < petalCount; i++) {
    const angle = i * petalAngleStep + time * 0.3;
    const petalR = baseR * 0.8;
    const petalWidth = baseR * 0.2;

    // Petal shape (ellipse segment)
    const points: Point[] = [];
    const segments = 20;

    for (let j = 0; j <= segments; j++) {
      const t = (j / segments) * Math.PI;
      const localX = Math.cos(t) * petalWidth;
      const localY = Math.sin(t) * petalR * 0.4;

      const rotated = rotatePoint({ x: localX, y: localY }, angle);

      points.push({
        x: cx + rotated.x,
        y: cy + rotated.y + petalR * 0.4
      });
    }

    // Draw petal outline
    const fib = FIB60[i % 60];
    const color = PALETTE[fib];

    for (let j = 0; j < segments; j++) {
      lines.push({
        start: points[j],
        end: points[j + 1],
        color: color + '99',
        width: 1.5,
        opacity: 0.6 * intensity
      });
    }
  }

  return { particles: [], lines, polygons };
}

/**
 * Calculate simplified Seed of Life pattern (7 circles)
 */
export function calculateSeedOfLife(
  centerX: number,
  centerY: number,
  radius: number,
  time: number
): Line[] {
  const lines: Line[] = [];
  const circles = 7; // 1 center + 6 surrounding

  const positions: Point[] = [
    { x: centerX, y: centerY } // Center
  ];

  // 6 surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i + time * 0.1;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  // Draw each circle
  positions.forEach(pos => {
    const segments = 36;
    for (let i = 0; i < segments; i++) {
      const a1 = (Math.PI * 2 / segments) * i;
      const a2 = (Math.PI * 2 / segments) * (i + 1);

      lines.push({
        start: {
          x: pos.x + radius * Math.cos(a1),
          y: pos.y + radius * Math.sin(a1)
        },
        end: {
          x: pos.x + radius * Math.cos(a2),
          y: pos.y + radius * Math.sin(a2)
        },
        color: 'rgba(212, 175, 55, 0.6)', // Gold
        width: 1.5,
        opacity: 0.6
      });
    }
  });

  return lines;
}
