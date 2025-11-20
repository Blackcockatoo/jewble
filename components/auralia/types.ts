/**
 * Auralia Guardian Type Definitions
 *
 * Core types for the virtual companion system
 */

// ===== PRIMITIVE TYPES =====

export type Bigish = bigint | number;

export type FormKey = 'radiant' | 'meditation' | 'sage' | 'vigilant' | 'celestial' | 'wild';

export type ScaleName = 'harmonic' | 'pentatonic' | 'dorian' | 'phrygian';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export type AIMode = 'idle' | 'observing' | 'focusing' | 'playing' | 'dreaming';

export type MiniGameType = 'sigilPattern' | 'fibonacciTrivia' | null;

// ===== CORE STRUCTURES =====

export interface Form {
  name: string;
  baseColor: string;
  primaryGold: string;
  secondaryGold: string;
  tealAccent: string;
  eyeColor: string;
  glowColor: string;
  description: string;
}

export interface Stats {
  energy: number;
  curiosity: number;
  bond: number;
}

export interface SigilPoint {
  x: number;
  y: number;
  hash: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export interface Crackle {
  id: number;
  x: number;
  y: number;
  life: number;
}

export interface SigilPulse {
  id: number;
  x: number;
  y: number;
  life: number;
  color: string;
}

// ===== AI & BEHAVIOR =====

export interface AIState {
  mode: AIMode;
  target: number | null;
  since: number;
}

export interface BondHistoryEntry {
  timestamp: number;
  bond: number;
  event: string;
}

// ===== MINI-GAMES =====

export interface PatternChallenge {
  sequence: number[];
  userSequence: number[];
  active: boolean;
}

export interface TriviaQuestion {
  question: string;
  answer: number;
  options: number[];
}

// ===== PERSISTENCE =====

export interface GuardianSaveData {
  seedName: string;
  energy: number;
  curiosity: number;
  bond: number;
  health: number;
  bondHistory: BondHistoryEntry[];
  activatedPoints: number[];
  createdAt: number;
  lastSaved: number;
  totalInteractions: number;
  dreamCount: number;
  gamesWon: number;
  highContrast: boolean;
}

// ===== MOSSPRIMESEED =====

export interface Field {
  seed: string;
  red: string;
  black: string;
  blue: string;
  ring: number[];
  pulse: number[];
  hash: (msg: string) => bigint;
  prng: () => number;
  fib: (n: number) => bigint;
  lucas: (n: number) => bigint;
}

// ===== AUDIO =====

export interface AudioOscillator {
  gain: GainNode;
}

export interface AudioContextRef {
  ctx: AudioContext;
  noteOscs: AudioOscillator[];
  droneOscs: AudioOscillator[];
}

export interface AudioScale {
  name: string;
  ratios: number[];
  description: string;
}

// ===== THEMES =====

export interface TimeTheme {
  bg: string;
  accent: string;
  glow: string;
}

// ===== GENOME =====

export interface GenomeData {
  red60: number;
  blue60: number;
  black60: number;
}

// ===== COMPONENT PROPS =====

export interface AuraliaMetaPetProps {
  initialSeed?: string;
  onFormChange?: (form: FormKey) => void;
  onBondChange?: (bond: number) => void;
  onDreamComplete?: (insight: string) => void;
}
