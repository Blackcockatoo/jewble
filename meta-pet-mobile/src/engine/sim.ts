/**
 * Engine Simulation
 * Tick logic and state updates for Meta-Pet vitals
 */

import type { Vitals } from './state';
import { applyDecay, clamp } from './state';
import type { EvolutionData } from './evolution';
import { checkEvolutionEligibility } from './evolution';

export interface TickResult {
  vitals: Vitals;
  evolution: EvolutionData;
}

/**
 * Process one simulation tick
 * Updates vitals with natural decay and checks evolution eligibility
 */
export function tick(vitals: Vitals, evolution: EvolutionData): TickResult {
  // Apply natural decay to vitals
  const nextVitals = applyDecay(vitals);

  // Calculate average vitals
  const vitalsAvg = (nextVitals.hunger + nextVitals.hygiene + nextVitals.mood + nextVitals.energy) / 4;

  // Check if pet can evolve
  const canEvolve = checkEvolutionEligibility(evolution, vitalsAvg);

  return {
    vitals: nextVitals,
    evolution: {
      ...evolution,
      canEvolve,
    },
  };
}

/**
 * Simulate multiple ticks at once (for fast-forward or recovery from background)
 */
export function multiTick(
  vitals: Vitals,
  evolution: EvolutionData,
  tickCount: number
): TickResult {
  let currentVitals = vitals;
  let currentEvolution = evolution;

  for (let i = 0; i < tickCount; i++) {
    const result = tick(currentVitals, currentEvolution);
    currentVitals = result.vitals;
    currentEvolution = result.evolution;
  }

  return {
    vitals: currentVitals,
    evolution: currentEvolution,
  };
}

/**
 * Calculate ticks elapsed since last update
 */
export function calculateElapsedTicks(lastUpdateTime: number, tickMs: number): number {
  const now = Date.now();
  const elapsed = now - lastUpdateTime;
  return Math.floor(elapsed / tickMs);
}
