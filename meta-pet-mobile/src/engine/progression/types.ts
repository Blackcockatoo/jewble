/**
 * Progression System Types
 * Achievements, Battle Stats, Mini-Games, and Vimana exploration
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
  category: 'vitals' | 'evolution' | 'battle' | 'exploration' | 'social';
}

export interface BattleStats {
  wins: number;
  losses: number;
  streak: number;
  energyShield: number; // 0-100
  lastResult?: 'win' | 'loss';
  lastOpponent?: string;
}

export interface MiniGameProgress {
  memoryHighScore: number;
  rhythmHighScore: number;
  lastPlayedAt?: number;
}

export interface VimanaCell {
  id: string;
  coordinates: { x: number; y: number; z: number };
  discovered: boolean;
  anomaly: boolean;
  reward: 'mood' | 'energy' | 'hygiene' | 'mystery';
  visitedAt?: number;
}

export interface VimanaState {
  cells: VimanaCell[];
  activeCellId?: string;
  scansPerformed: number;
  anomaliesFound: number;
  lastScanAt?: number;
}

export function createDefaultBattleStats(): BattleStats {
  return {
    wins: 0,
    losses: 0,
    streak: 0,
    energyShield: 50,
  };
}

export function createDefaultMiniGameProgress(): MiniGameProgress {
  return {
    memoryHighScore: 0,
    rhythmHighScore: 0,
  };
}

export function createDefaultVimanaState(): VimanaState {
  const cells: VimanaCell[] = [];

  // Create a 3x3x3 cube of cells
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const rewards: VimanaCell['reward'][] = ['mood', 'energy', 'hygiene', 'mystery'];
        cells.push({
          id: `${x},${y},${z}`,
          coordinates: { x, y, z },
          discovered: x === 0 && y === 0 && z === 0, // Center cell starts discovered
          anomaly: Math.random() < 0.15, // 15% chance of anomaly
          reward: rewards[Math.floor(Math.random() * rewards.length)],
        });
      }
    }
  }

  return {
    cells,
    scansPerformed: 0,
    anomaliesFound: 0,
  };
}
