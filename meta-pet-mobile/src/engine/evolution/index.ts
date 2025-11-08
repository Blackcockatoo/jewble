/**
 * Evolution System - State Machine
 */

import type { EvolutionData, EvolutionState, EvolutionRequirement } from './types';
import { EVOLUTION_REQUIREMENTS, EVOLUTION_ORDER } from './types';

export * from './types';

export interface RequirementSnapshot {
  state: EvolutionState;
  requirements: EvolutionRequirement;
}

export interface RequirementProgress {
  nextState: EvolutionState;
  ageProgress: number;
  interactionsProgress: number;
  vitalsProgress: number;
  specialMet: boolean;
  specialDescription?: string;
}

const getElapsedSinceLastEvolution = (evolution: EvolutionData): number =>
  Date.now() - evolution.lastEvolutionTime;

const getNextState = (state: EvolutionState): EvolutionState | null => {
  const currentIndex = EVOLUTION_ORDER.indexOf(state);
  if (currentIndex === -1 || currentIndex === EVOLUTION_ORDER.length - 1) {
    return null;
  }
  return EVOLUTION_ORDER[currentIndex + 1];
};

const normalizeProgress = (value: number, maximum: number): number => {
  if (maximum <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, value / maximum));
};

/**
 * Initialize evolution data for a new pet
 */
export function initializeEvolution(): EvolutionData {
  const now = Date.now();
  return {
    state: 'GENETICS',
    birthTime: now,
    lastEvolutionTime: now,
    experience: 0,
    totalInteractions: 0,
    canEvolve: false,
  };
}

/**
 * Check if pet can evolve to next state
 */
export function checkEvolutionEligibility(
  evolution: EvolutionData,
  vitalsAverage: number
): boolean {
  const nextState = getNextState(evolution.state);
  if (!nextState) {
    return false;
  }

  const requirements = EVOLUTION_REQUIREMENTS[nextState];

  const ageElapsed = getElapsedSinceLastEvolution(evolution);
  const meetsAge = ageElapsed >= requirements.minAge;
  const meetsInteractions = evolution.totalInteractions >= requirements.minInteractions;
  const meetsVitals = vitalsAverage >= requirements.minVitalsAverage;
  const meetsSpecial = requirements.specialCondition ? requirements.specialCondition() : true;

  return meetsAge && meetsInteractions && meetsVitals && meetsSpecial;
}

/**
 * Evolve pet to next state
 */
export function evolvePet(evolution: EvolutionData): EvolutionData {
  const nextState = getNextState(evolution.state);

  if (!nextState) {
    return evolution; // Already at max
  }

  return {
    ...evolution,
    state: nextState,
    lastEvolutionTime: Date.now(),
    experience: 0,
    canEvolve: false,
  };
}

/**
 * Add experience from interactions
 */
export function gainExperience(
  evolution: EvolutionData,
  amount: number
): EvolutionData {
  return {
    ...evolution,
    experience: Math.min(100, evolution.experience + amount),
    totalInteractions: evolution.totalInteractions + 1,
  };
}

/**
 * Get time until next evolution is possible (in ms)
 */
export function getTimeUntilNextEvolution(evolution: EvolutionData): number {
  const nextState = getNextState(evolution.state);

  if (!nextState) {
    return -1; // Already at max
  }

  const requirements = EVOLUTION_REQUIREMENTS[nextState];
  const ageElapsed = getElapsedSinceLastEvolution(evolution);

  return Math.max(0, requirements.minAge - ageElapsed);
}

/**
 * Get progress towards next evolution (0-100)
 */
export function getEvolutionProgress(
  evolution: EvolutionData,
  vitalsAverage: number
): number {
  const nextState = getNextState(evolution.state);

  if (!nextState) {
    return 100; // Already at max
  }

  const requirements = EVOLUTION_REQUIREMENTS[nextState];
  const ageElapsed = getElapsedSinceLastEvolution(evolution);

  const ageProgress = normalizeProgress(ageElapsed, requirements.minAge);
  const interactionProgress = normalizeProgress(evolution.totalInteractions, requirements.minInteractions);
  const vitalsProgress = normalizeProgress(vitalsAverage, requirements.minVitalsAverage);

  // Average of all progress metrics
  return (ageProgress + interactionProgress + vitalsProgress) / 3 * 100;
}

export function getNextEvolutionRequirement(evolution: EvolutionData): RequirementSnapshot | null {
  const nextState = getNextState(evolution.state);

  if (!nextState) {
    return null;
  }

  return {
    state: nextState,
    requirements: EVOLUTION_REQUIREMENTS[nextState],
  };
}

export function getRequirementProgress(
  evolution: EvolutionData,
  vitalsAverage: number,
  snapshot: RequirementSnapshot | null = getNextEvolutionRequirement(evolution)
): RequirementProgress | null {
  if (!snapshot) {
    return null;
  }

  const { requirements, state } = snapshot;
  const ageElapsed = getElapsedSinceLastEvolution(evolution);
  const ageProgress = normalizeProgress(ageElapsed, requirements.minAge);
  const interactionsProgress = normalizeProgress(evolution.totalInteractions, requirements.minInteractions);
  const vitalsProgress = normalizeProgress(vitalsAverage, requirements.minVitalsAverage);
  const specialMet = requirements.specialCondition ? requirements.specialCondition() : true;

  return {
    nextState: state,
    ageProgress,
    interactionsProgress,
    vitalsProgress,
    specialMet,
    specialDescription: requirements.specialDescription,
  };
}
