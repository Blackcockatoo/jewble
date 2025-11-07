/**
 * Evolution System - State Machine
 */

import type { EvolutionData, EvolutionState } from './types';
import { EVOLUTION_REQUIREMENTS, EVOLUTION_ORDER } from './types';

export * from './types';

/**
 * Initialize evolution data for a new pet
 */
export function initializeEvolution(): EvolutionData {
  return {
    state: 'GENETICS',
    birthTime: Date.now(),
    lastEvolutionTime: Date.now(),
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
  const currentStateIndex = EVOLUTION_ORDER.indexOf(evolution.state);

  // Already at final state
  if (currentStateIndex === EVOLUTION_ORDER.length - 1) {
    return false;
  }

  const nextState = EVOLUTION_ORDER[currentStateIndex + 1];
  const requirements = EVOLUTION_REQUIREMENTS[nextState];

  const age = Date.now() - evolution.birthTime;
  const meetsAge = age >= requirements.minAge;
  const meetsInteractions = evolution.totalInteractions >= requirements.minInteractions;
  const meetsVitals = vitalsAverage >= requirements.minVitalsAverage;
  const meetsSpecial = requirements.specialCondition ? requirements.specialCondition() : true;

  return meetsAge && meetsInteractions && meetsVitals && meetsSpecial;
}

/**
 * Evolve pet to next state
 */
export function evolvePet(evolution: EvolutionData): EvolutionData {
  const currentStateIndex = EVOLUTION_ORDER.indexOf(evolution.state);

  if (currentStateIndex === EVOLUTION_ORDER.length - 1) {
    return evolution; // Already at max
  }

  const nextState = EVOLUTION_ORDER[currentStateIndex + 1];

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
  const currentStateIndex = EVOLUTION_ORDER.indexOf(evolution.state);

  if (currentStateIndex === EVOLUTION_ORDER.length - 1) {
    return -1; // Already at max
  }

  const nextState = EVOLUTION_ORDER[currentStateIndex + 1];
  const requirements = EVOLUTION_REQUIREMENTS[nextState];

  const age = Date.now() - evolution.birthTime;
  const timeRemaining = Math.max(0, requirements.minAge - age);

  return timeRemaining;
}

/**
 * Get progress towards next evolution (0-100)
 */
export function getEvolutionProgress(
  evolution: EvolutionData,
  vitalsAverage: number
): number {
  const currentStateIndex = EVOLUTION_ORDER.indexOf(evolution.state);

  if (currentStateIndex === EVOLUTION_ORDER.length - 1) {
    return 100; // Already at max
  }

  const nextState = EVOLUTION_ORDER[currentStateIndex + 1];
  const requirements = EVOLUTION_REQUIREMENTS[nextState];

  const age = Date.now() - evolution.birthTime;
  const ageProgress = Math.min(100, (age / requirements.minAge) * 100);
  const interactionProgress = Math.min(100, (evolution.totalInteractions / requirements.minInteractions) * 100);
  const vitalsProgress = Math.min(100, (vitalsAverage / requirements.minVitalsAverage) * 100);

  // Average of all progress metrics
  return (ageProgress + interactionProgress + vitalsProgress) / 3;
}
