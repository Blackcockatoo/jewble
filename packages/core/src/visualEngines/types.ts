/**
 * Visual Engines Types
 *
 * Common types for all 8 MOSS60 visualization modes.
 * These define the data structures for platform-agnostic calculations.
 */

/**
 * 2D Point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 3D Point (for 4D projections)
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Particle - Core visualization element
 */
export interface Particle {
  id: number;
  x: number;          // Position x (-1 to 1 normalized, or pixel coords)
  y: number;          // Position y (-1 to 1 normalized, or pixel coords)
  vx?: number;        // Velocity x (optional, for animated particles)
  vy?: number;        // Velocity y (optional, for animated particles)
  size: number;       // Particle radius
  color: string;      // Hex color (#RRGGBB)
  opacity: number;    // 0-1
  rotation?: number;  // Rotation in radians (optional)
  life?: number;      // Lifetime 0-1 (optional, for decay)
}

/**
 * Line segment for web/lattice visualizations
 */
export interface Line {
  start: Point;
  end: Point;
  color: string;
  width: number;
  opacity: number;
}

/**
 * Polygon for geometric visualizations
 */
export interface Polygon {
  points: Point[];
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

/**
 * Common parameters for all modes
 */
export interface BaseModeParams {
  width: number;       // Canvas/viewport width in pixels
  height: number;      // Canvas/viewport height in pixels
  time: number;        // Time in seconds for animation
  energy: number;      // Energy level 0-100
  curiosity: number;   // Curiosity level 0-100
  bond: number;        // Bond level 0-100
  intensity: number;   // User intensity setting 0-1
}

/**
 * Mode 1: Quantum Field Parameters
 */
export interface QuantumFieldParams extends BaseModeParams {
  particleCount: number;  // Number of particles (100-300)
  phyllotaxisAngle: number; // Golden angle or custom
}

/**
 * Mode 2: Prime Lattice Parameters
 */
export interface PrimeLatticeParams extends BaseModeParams {
  gridSize: number;        // Grid dimensions (e.g., 16x16)
  primeSensitivity: number; // 1-5, affects highlighting
}

/**
 * Mode 3: Harmonic Web Parameters
 */
export interface HarmonicWebParams extends BaseModeParams {
  nodeCount: number;       // Number of nodes (20-60)
  harmonicDepth: number;   // Harmonic overtones depth (3-16)
}

/**
 * Mode 4: CA Evolution Parameters
 */
export interface CAEvolutionParams extends BaseModeParams {
  gridWidth: number;       // CA grid width
  gridHeight: number;      // CA grid height
  rule: number;            // CA rule number (0-255)
}

/**
 * Mode 5: Yantra Bloom Parameters
 */
export interface YantraBloomParams extends BaseModeParams {
  petalCount: number;      // Number of petals (6, 9, 12)
  layers: number;          // Number of concentric layers
}

/**
 * Mode 6: Cryptic Dance Parameters
 */
export interface CrypticDanceParams extends BaseModeParams {
  particleCount: number;   // Number of XOR particles
  xorPattern: number;      // XOR pattern seed
}

/**
 * Mode 7: Hepta-Sync Parameters
 */
export interface HeptaSyncParams extends BaseModeParams {
  heptagonCount: number;   // Number of nested heptagons (7)
  rotationSpeed: number;   // Rotation speed multiplier (0-3)
}

/**
 * Mode 8: 4D Tesseract Parameters
 */
export interface Tesseract4DParams extends BaseModeParams {
  rotationW: number;       // Rotation in 4th dimension
  projectionDistance: number; // Camera distance for projection
}

/**
 * Union of all mode parameter types
 */
export type ModeParams =
  | QuantumFieldParams
  | PrimeLatticeParams
  | HarmonicWebParams
  | CAEvolutionParams
  | YantraBloomParams
  | CrypticDanceParams
  | HeptaSyncParams
  | Tesseract4DParams;

/**
 * Mode calculation result
 */
export interface ModeResult {
  particles: Particle[];
  lines?: Line[];
  polygons?: Polygon[];
}

/**
 * Mode number type (1-8)
 */
export type ModeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Mode metadata
 */
export interface ModeInfo {
  id: ModeNumber;
  name: string;
  description: string;
  category: 'particle' | 'geometric' | 'hybrid';
}

/**
 * All mode information
 */
export const MODES: Record<ModeNumber, ModeInfo> = {
  1: {
    id: 1,
    name: 'Quantum Field',
    description: 'Phyllotaxis-based prime visualization with particle orbits',
    category: 'particle'
  },
  2: {
    id: 2,
    name: 'Prime Lattice',
    description: '16x16 grid highlighting prime positions',
    category: 'hybrid'
  },
  3: {
    id: 3,
    name: 'Harmonic Web',
    description: 'Resonance visualization with interconnected nodes',
    category: 'geometric'
  },
  4: {
    id: 4,
    name: 'CA Evolution',
    description: 'Cellular automaton with MOSS60 rule derivation',
    category: 'hybrid'
  },
  5: {
    id: 5,
    name: 'Yantra Bloom',
    description: 'Sacred geometry with Sri Yantra patterns',
    category: 'geometric'
  },
  6: {
    id: 6,
    name: 'Cryptic Dance',
    description: 'XOR-based bitwise operation visualization',
    category: 'particle'
  },
  7: {
    id: 7,
    name: 'Hepta-Sync',
    description: '7 nested heptagons with golden ratio spacing',
    category: 'geometric'
  },
  8: {
    id: 8,
    name: '4D Tesseract',
    description: '4D hypercube projected to 2D with rotation',
    category: 'geometric'
  }
};
