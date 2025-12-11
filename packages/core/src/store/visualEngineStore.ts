/**
 * Visual Engine Store
 *
 * Zustand store for managing MOSS60 visual engine state across platforms.
 */

import { create } from 'zustand';
import type { ModeNumber } from '../visualEngines/types';

/**
 * Visual Engine Settings
 */
export interface VisualEngineSettings {
  intensity: number;          // 0-1, overall visual intensity
  rotationSpeed: number;      // 0-3, rotation speed multiplier
  primeSensitivity: number;   // 1-5, prime highlighting sensitivity
  harmonicDepth: number;      // 3-16, harmonic overtone depth
  redWeight: number;          // 0-2, RED sequence influence
  blackWeight: number;        // 0-2, BLACK sequence influence
  blueWeight: number;         // 0-2, BLUE sequence influence
  primePulse: number;         // 0-1, decays over time
  inverted: boolean;          // Invert RED ↔ BLUE
  particleCount: number;      // Base particle count (multiplied by mode)
  enableBloom: boolean;       // Enable bloom/glow effects
  enableTrails: boolean;      // Enable particle trails
}

/**
 * Visual Engine State
 */
export interface VisualEngineState {
  backgroundMode: ModeNumber;
  settings: VisualEngineSettings;
  isActive: boolean;          // Whether visualization is running
  lastModeChange: number;     // Timestamp of last mode change

  // Actions
  setBackgroundMode: (mode: ModeNumber) => void;
  setIntensity: (intensity: number) => void;
  setRotationSpeed: (speed: number) => void;
  setPrimeSensitivity: (sensitivity: number) => void;
  setHarmonicDepth: (depth: number) => void;
  setRedWeight: (weight: number) => void;
  setBlackWeight: (weight: number) => void;
  setBlueWeight: (weight: number) => void;
  triggerPrimePulse: () => void;
  decayPrimePulse: () => void;
  toggleInvert: () => void;
  setParticleCount: (count: number) => void;
  toggleBloom: () => void;
  toggleTrails: () => void;
  setActive: (active: boolean) => void;
  resetSettings: () => void;
}

/**
 * Default visual engine settings
 */
const DEFAULT_SETTINGS: VisualEngineSettings = {
  intensity: 0.8,
  rotationSpeed: 1.0,
  primeSensitivity: 2.0,
  harmonicDepth: 8,
  redWeight: 1.0,
  blackWeight: 1.0,
  blueWeight: 1.0,
  primePulse: 0,
  inverted: false,
  particleCount: 150,
  enableBloom: true,
  enableTrails: false
};

/**
 * Visual Engine Zustand Store
 */
export const useVisualEngineStore = create<VisualEngineState>((set, get) => ({
  backgroundMode: 1,
  settings: { ...DEFAULT_SETTINGS },
  isActive: true,
  lastModeChange: Date.now(),

  setBackgroundMode: (mode) => set({
    backgroundMode: mode,
    lastModeChange: Date.now()
  }),

  setIntensity: (intensity) => set((state) => ({
    settings: { ...state.settings, intensity: Math.max(0, Math.min(1, intensity)) }
  })),

  setRotationSpeed: (speed) => set((state) => ({
    settings: { ...state.settings, rotationSpeed: Math.max(0, Math.min(3, speed)) }
  })),

  setPrimeSensitivity: (sensitivity) => set((state) => ({
    settings: { ...state.settings, primeSensitivity: Math.max(1, Math.min(5, sensitivity)) }
  })),

  setHarmonicDepth: (depth) => set((state) => ({
    settings: { ...state.settings, harmonicDepth: Math.max(3, Math.min(16, Math.floor(depth))) }
  })),

  setRedWeight: (weight) => set((state) => ({
    settings: { ...state.settings, redWeight: Math.max(0, Math.min(2, weight)) }
  })),

  setBlackWeight: (weight) => set((state) => ({
    settings: { ...state.settings, blackWeight: Math.max(0, Math.min(2, weight)) }
  })),

  setBlueWeight: (weight) => set((state) => ({
    settings: { ...state.settings, blueWeight: Math.max(0, Math.min(2, weight)) }
  })),

  triggerPrimePulse: () => set((state) => ({
    settings: { ...state.settings, primePulse: 1.0 }
  })),

  decayPrimePulse: () => set((state) => ({
    settings: { ...state.settings, primePulse: Math.max(0, state.settings.primePulse - 0.02) }
  })),

  toggleInvert: () => set((state) => ({
    settings: { ...state.settings, inverted: !state.settings.inverted }
  })),

  setParticleCount: (count) => set((state) => ({
    settings: { ...state.settings, particleCount: Math.max(50, Math.min(500, count)) }
  })),

  toggleBloom: () => set((state) => ({
    settings: { ...state.settings, enableBloom: !state.settings.enableBloom }
  })),

  toggleTrails: () => set((state) => ({
    settings: { ...state.settings, enableTrails: !state.settings.enableTrails }
  })),

  setActive: (active) => set({ isActive: active }),

  resetSettings: () => set({
    settings: { ...DEFAULT_SETTINGS }
  })
}));

/**
 * Get mode-specific particle count multiplier
 */
export function getModeParticleMultiplier(mode: ModeNumber): number {
  switch (mode) {
    case 1: return 1.0;    // Quantum Field - base count
    case 2: return 0.5;    // Prime Lattice - fewer particles
    case 3: return 0.6;    // Harmonic Web - medium
    case 4: return 0;      // CA Evolution - no particles (grid-based)
    case 5: return 0.4;    // Yantra Bloom - few accent particles
    case 6: return 1.2;    // Cryptic Dance - more particles
    case 7: return 0.3;    // Hepta-Sync - few particles
    case 8: return 0.7;    // 4D Tesseract - medium particles
    default: return 1.0;
  }
}

/**
 * Get computed particle count for current mode and settings
 */
export function getComputedParticleCount(
  baseCount: number,
  mode: ModeNumber,
  intensity: number
): number {
  const multiplier = getModeParticleMultiplier(mode);
  return Math.floor(baseCount * multiplier * intensity);
}
