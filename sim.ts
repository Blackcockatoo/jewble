import { PetVitals } from "./state";
import { PetGenome } from "./genome";
import { nextRandom } from "./rng";

// The tick interval in milliseconds for the simulation.
// This should ideally be linked to FEATURES.LOW_POWER_TICK_MS from config.ts
const SIMULATION_TICK_MS = 1000; 

/**
 * The core deterministic vitals tick function.
 * It calculates the new vitals state based on the time elapsed since the last tick.
 * @param currentVitals The current state of the pet's vitals.
 * @param genome The pet's unique genome.
 * @param timeElapsedMs The time elapsed since the last tick (or since the app was backgrounded).
 * @returns The new PetVitals state.
 */
export function deterministicVitalsTick(
  currentVitals: PetVitals,
  genome: PetGenome,
  timeElapsedMs: number
): PetVitals {
  let newVitals = { ...currentVitals };
  
  // 1. Accumulate time
  newVitals.tickAccumulator += timeElapsedMs;
  
  // 2. Process full simulation ticks
  while (newVitals.tickAccumulator >= SIMULATION_TICK_MS) {
    newVitals.tickAccumulator -= SIMULATION_TICK_MS;
    
    // Convert tick time to a fraction of a day or other relevant unit
    const tickUnit = SIMULATION_TICK_MS / (24 * 60 * 60 * 1000); // Example: fraction of a day
    
    // Energy depletion (Metabolism)
    const energyLoss = genome.metabolismRate * tickUnit * (1 + nextRandom() * 0.1);
    newVitals.energy = Math.max(0, newVitals.energy - energyLoss);
    
    // Health regeneration/loss
    const healthChange = genome.baseHealthRegen * tickUnit;
    newVitals.health = Math.min(100, newVitals.health + healthChange);
    
    // Mood drift
    const moodDrift = (nextRandom() - 0.5) * genome.moodSensitivity * tickUnit;
    newVitals.mood = Math.min(100, Math.max(0, newVitals.mood + moodDrift));
    
    // Enforce bounds
    newVitals.health = Math.min(100, Math.max(0, newVitals.health));
    newVitals.energy = Math.min(100, Math.max(0, newVitals.energy));
    newVitals.mood = Math.min(100, Math.max(0, newVitals.mood));
  }
  
  // 3. Update last tick time
  newVitals.lastTickTime = Date.now();
  
  return newVitals;
}
