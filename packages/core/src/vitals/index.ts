import type { EvolutionData } from '../evolution/index';
import { checkEvolutionEligibility } from '../evolution/index';

export interface Vitals {
  hunger: number;
  hygiene: number;
  mood: number;
  energy: number;
}

export const DEFAULT_VITALS: Vitals = {
  hunger: 30,
  hygiene: 70,
  mood: 60,
  energy: 80,
};

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function getVitalsAverage(vitals: Vitals): number {
  return (vitals.hunger + vitals.hygiene + vitals.mood + vitals.energy) / 4;
}

export function getVitalsStatus(vitals: Vitals): 'critical' | 'low' | 'good' | 'excellent' {
  const avg = getVitalsAverage(vitals);
  if (avg < 25) return 'critical';
  if (avg < 50) return 'low';
  if (avg < 75) return 'good';
  return 'excellent';
}

export function getVitalStatus(value: number): 'critical' | 'low' | 'good' | 'excellent' {
  if (value < 25) return 'critical';
  if (value < 50) return 'low';
  if (value < 75) return 'good';
  return 'excellent';
}

export const DECAY_RATES = {
  hunger: 0.25,
  hygiene: -0.15,
  energy: -0.2,
  mood: 0.05,
} as const;

export function applyDecay(vitals: Vitals): Vitals {
  return {
    hunger: clamp(vitals.hunger + DECAY_RATES.hunger),
    hygiene: clamp(vitals.hygiene + DECAY_RATES.hygiene),
    energy: clamp(vitals.energy + DECAY_RATES.energy),
    mood: clamp(vitals.mood + (vitals.energy > 50 ? DECAY_RATES.mood : -DECAY_RATES.mood)),
  };
}

export const INTERACTION_EFFECTS = {
  feed: {
    hunger: 20,
    energy: 5,
    mood: 3,
  },
  clean: {
    hygiene: 25,
    mood: 5,
  },
  play: {
    mood: 15,
    energy: -10,
    hygiene: -5,
  },
  sleep: {
    energy: 30,
    mood: 5,
  },
} as const;

export type Interaction = keyof typeof INTERACTION_EFFECTS;

export function applyInteraction(vitals: Vitals, interaction: Interaction): Vitals {
  const effects = INTERACTION_EFFECTS[interaction];
  const result: Vitals = { ...vitals };

  for (const [key, value] of Object.entries(effects)) {
    const field = key as keyof Vitals;
    result[field] = clamp(result[field] + value);
  }

  return result;
}

export interface TickResult {
  vitals: Vitals;
  evolution: EvolutionData;
}

export function tick(vitals: Vitals, evolution: EvolutionData): TickResult {
  const nextVitals = applyDecay(vitals);
  const vitalsAvg = getVitalsAverage(nextVitals);
  const canEvolve = checkEvolutionEligibility(evolution, vitalsAvg);

  return {
    vitals: nextVitals,
    evolution: {
      ...evolution,
      canEvolve,
    },
  };
}

export function multiTick(vitals: Vitals, evolution: EvolutionData, tickCount: number): TickResult {
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

export function calculateElapsedTicks(lastUpdateTime: number, tickMs: number): number {
  const now = Date.now();
  const elapsed = now - lastUpdateTime;
  return Math.floor(elapsed / tickMs);
}
