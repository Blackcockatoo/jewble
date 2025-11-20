/**
 * Battle System - Consciousness-based non-violent duels
 * Victory depends on vitals, mood, and energy shield
 */

export interface BattleState {
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  energyShield: number; // 0-100, built through vitals
  totalBattles: number;
  opponents: string[];
}

export interface BattleResult {
  outcome: 'win' | 'loss';
  opponent: string;
  shieldChange: number;
  streakBonus: number;
  message: string;
}

export const OPPONENTS = [
  'Echo Wisp',
  'Prism Lurker',
  'Dream Stag',
  'Aurora Fox',
  'Nebula Serpent',
  'Crystal Phoenix',
  'Void Walker',
  'Starlight Owl',
];

/**
 * Calculate battle outcome based on vitals and shield
 */
export function simulateBattle(
  vitals: { energy: number; mood: number; hygiene: number },
  energyShield: number,
  opponent?: string
): BattleResult {
  const selectedOpponent = opponent || OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
  
  // Calculate win probability based on vitals
  const vitalityFactor = (vitals.energy + vitals.mood) / 200;
  const hygieneFactor = vitals.hygiene / 200;
  const shieldFactor = energyShield / 100;
  
  const baseWinChance = 0.35;
  const winChance = Math.min(
    0.95,
    baseWinChance + vitalityFactor * 0.3 + hygieneFactor * 0.1 + shieldFactor * 0.25
  );
  
  const outcome: 'win' | 'loss' = Math.random() < winChance ? 'win' : 'loss';
  
  // Shield changes
  const shieldChange = outcome === 'win' ? 5 : -8;
  const streakBonus = outcome === 'win' ? 2 : 0;
  
  // Generate message
  const messages = {
    win: [
      `Victory! ${selectedOpponent} yielded to your pet's calm aura.`,
      `Success! Your pet's consciousness resonated perfectly with ${selectedOpponent}.`,
      `${selectedOpponent} was overwhelmed by your pet's harmonious energy!`,
    ],
    loss: [
      `Defeat. ${selectedOpponent} overpowered the resonance—rest and try again.`,
      `${selectedOpponent}'s frequency was too strong. Recharge and return.`,
      `The consciousness link broke. ${selectedOpponent} prevailed this time.`,
    ],
  };
  
  const message = messages[outcome][Math.floor(Math.random() * messages[outcome].length)];
  
  return {
    outcome,
    opponent: selectedOpponent,
    shieldChange,
    streakBonus,
    message,
  };
}

/**
 * Build energy shield through consistent care
 */
export function buildEnergyShield(currentShield: number, vitalsAverage: number): number {
  if (vitalsAverage > 70) {
    return Math.min(100, currentShield + 1);
  } else if (vitalsAverage < 30) {
    return Math.max(0, currentShield - 2);
  }
  return currentShield;
}

/**
 * Get battle difficulty tier based on win count
 */
export function getDifficultyTier(wins: number): {
  tier: string;
  description: string;
  bonusMultiplier: number;
} {
  if (wins < 5) {
    return {
      tier: 'Novice',
      description: 'Learning the resonance patterns',
      bonusMultiplier: 1.0,
    };
  } else if (wins < 15) {
    return {
      tier: 'Adept',
      description: 'Mastering consciousness links',
      bonusMultiplier: 1.2,
    };
  } else if (wins < 30) {
    return {
      tier: 'Expert',
      description: 'Channeling quantum harmonics',
      bonusMultiplier: 1.5,
    };
  } else {
    return {
      tier: 'Master',
      description: 'Transcending dimensional boundaries',
      bonusMultiplier: 2.0,
    };
  }
}
