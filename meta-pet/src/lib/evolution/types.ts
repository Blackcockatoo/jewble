/**
 * Evolution System Types
 *
 * 4-state evolution machine:
 * 1. GENETICS (0-24h): Basic genome, learning vitals
 * 2. NEURO (24h-7d): Develops personality, unlocks abilities
 * 3. QUANTUM (7d-30d): Advanced consciousness, rare traits emerge
 * 4. SPECIATION (30d+): Final form, breeding unlocked
 */

export type EvolutionState = 'GENETICS' | 'NEURO' | 'QUANTUM' | 'SPECIATION';

export interface EvolutionData {
  state: EvolutionState;
  birthTime: number; // timestamp
  lastEvolutionTime: number; // timestamp
  experience: number; // 0-100 per state
  totalInteractions: number;
  canEvolve: boolean;
}

export interface EvolutionRequirement {
  minAge: number; // milliseconds
  minInteractions: number;
  minVitalsAverage: number; // 0-100
  specialCondition?: () => boolean;
}

export const EVOLUTION_REQUIREMENTS: Record<EvolutionState, EvolutionRequirement> = {
  GENETICS: {
    minAge: 0,
    minInteractions: 0,
    minVitalsAverage: 0,
  },
  NEURO: {
    minAge: 24 * 60 * 60 * 1000, // 24 hours
    minInteractions: 50,
    minVitalsAverage: 40,
  },
  QUANTUM: {
    minAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    minInteractions: 500,
    minVitalsAverage: 60,
  },
  SPECIATION: {
    minAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    minInteractions: 2000,
    minVitalsAverage: 75,
  },
};

export const EVOLUTION_ORDER: EvolutionState[] = ['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'];

export interface EvolutionVisuals {
  colors: string[];
  glowIntensity: number;
  particleCount: number;
  auraRadius: number;
}

export const EVOLUTION_VISUALS: Record<EvolutionState, EvolutionVisuals> = {
  GENETICS: {
    colors: ['#4ECDC4', '#45B7D1'],
    glowIntensity: 0.3,
    particleCount: 5,
    auraRadius: 0,
  },
  NEURO: {
    colors: ['#9B59B6', '#8E44AD'],
    glowIntensity: 0.5,
    particleCount: 10,
    auraRadius: 20,
  },
  QUANTUM: {
    colors: ['#F39C12', '#E67E22'],
    glowIntensity: 0.8,
    particleCount: 20,
    auraRadius: 40,
  },
  SPECIATION: {
    colors: ['#E74C3C', '#C0392B', '#FFD700'],
    glowIntensity: 1.0,
    particleCount: 30,
    auraRadius: 60,
  },
};
