/**
 * Engine State Types
 * Core vitals and state management for Meta-Pet
 */

export interface Vitals {
  hunger: number;    // 0-100 (100 = full)
  hygiene: number;   // 0-100 (100 = clean)
  mood: number;      // 0-100 (100 = happy)
  energy: number;    // 0-100 (100 = energized)
}

export const DEFAULT_VITALS: Vitals = {
  hunger: 30,
  hygiene: 70,
  mood: 60,
  energy: 80,
};

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate average of vitals
 */
export function getVitalsAverage(vitals: Vitals): number {
  return (vitals.hunger + vitals.hygiene + vitals.mood + vitals.energy) / 4;
}

/**
 * Get vitals health status
 */
export function getVitalsStatus(vitals: Vitals): 'critical' | 'low' | 'good' | 'excellent' {
  const avg = getVitalsAverage(vitals);
  if (avg < 25) return 'critical';
  if (avg < 50) return 'low';
  if (avg < 75) return 'good';
  return 'excellent';
}

/**
 * Get individual vital status
 */
export function getVitalStatus(value: number): 'critical' | 'low' | 'good' | 'excellent' {
  if (value < 25) return 'critical';
  if (value < 50) return 'low';
  if (value < 75) return 'good';
  return 'excellent';
}

/**
 * Natural decay rates (per second)
 */
export const DECAY_RATES = {
  hunger: 0.25,     // Hunger increases (gets hungrier)
  hygiene: -0.15,   // Hygiene decreases (gets dirtier)
  energy: -0.20,    // Energy decreases (gets tired)
  mood: 0.05,       // Mood varies based on energy
};

/**
 * Apply natural decay to vitals
 */
export function applyDecay(vitals: Vitals): Vitals {
  return {
    hunger: clamp(vitals.hunger + DECAY_RATES.hunger),
    hygiene: clamp(vitals.hygiene + DECAY_RATES.hygiene),
    energy: clamp(vitals.energy + DECAY_RATES.energy),
    mood: clamp(vitals.mood + (vitals.energy > 50 ? DECAY_RATES.mood : -DECAY_RATES.mood)),
  };
}

/**
 * Interaction effects on vitals
 */
export const INTERACTION_EFFECTS = {
  feed: {
    hunger: -20,
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
};

/**
 * Apply interaction effect to vitals
 */
export function applyInteraction(
  vitals: Vitals,
  interaction: keyof typeof INTERACTION_EFFECTS
): Vitals {
  const effects = INTERACTION_EFFECTS[interaction];
  const result = { ...vitals };

  for (const [key, value] of Object.entries(effects)) {
    result[key as keyof Vitals] = clamp(result[key as keyof Vitals] + value);
  }

  return result;
}
