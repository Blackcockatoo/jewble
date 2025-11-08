export type VimanaField = 'calm' | 'neuro' | 'quantum' | 'earth';

export interface VimanaCell {
  id: string;
  label: string;
  field: VimanaField;
  discovered: boolean;
  anomaly: boolean;
  energy: number; // 0-100
  reward: 'mood' | 'energy' | 'hygiene' | 'mystery';
  visitedAt?: number;
}

export interface VimanaState {
  cells: VimanaCell[];
  activeCellId: string;
  anomaliesFound: number;
  anomaliesResolved: number;
  scansPerformed: number;
  lastScanAt: number | null;
}

export interface BattleStats {
  wins: number;
  losses: number;
  streak: number;
  lastResult: 'win' | 'loss' | null;
  lastOpponent: string | null;
  energyShield: number; // 0-100 buffer applied during exploration battles
}

export interface MiniGameProgress {
  memoryHighScore: number;
  rhythmHighScore: number;
  focusStreak: number;
  lastPlayedAt: number | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt?: number;
}

export interface BreedingRecord {
  offspringId: string;
  partnerId: string;
  mode: 'DOMINANT' | 'BALANCED' | 'MUTATION';
  createdAt: number;
}

export const ACHIEVEMENT_CATALOG: Achievement[] = [
  {
    id: 'explorer-first-step',
    title: 'First Step',
    description: 'Discover your first Vimana field cell.',
  },
  {
    id: 'explorer-anomaly-hunter',
    title: 'Anomaly Hunter',
    description: 'Resolve three anomalies on the Vimana grid.',
  },
  {
    id: 'battle-first-win',
    title: 'First Victory',
    description: 'Win your first consciousness duel.',
  },
  {
    id: 'battle-streak',
    title: 'Momentum Rising',
    description: 'Achieve a win streak of three battles.',
  },
  {
    id: 'minigame-memory',
    title: 'Pattern Master',
    description: 'Score 10 or more in the memory mini-game.',
  },
  {
    id: 'minigame-rhythm',
    title: 'Rhythm Weaver',
    description: 'Hit a rhythm score of 12 or higher.',
  },
  {
    id: 'breeding-first',
    title: 'New Lineage',
    description: 'Breed two pets to create a new companion.',
  },
];

export function createDefaultVimanaState(): VimanaState {
  const baseCells: VimanaCell[] = [
    { id: 'calm-1', label: 'Calm Glade', field: 'calm', discovered: true, anomaly: false, energy: 60, reward: 'mood', visitedAt: Date.now() },
    { id: 'calm-2', label: 'Harmonic Springs', field: 'calm', discovered: false, anomaly: false, energy: 55, reward: 'hygiene' },
    { id: 'neuro-1', label: 'Neuro Bloom', field: 'neuro', discovered: false, anomaly: true, energy: 65, reward: 'mystery' },
    { id: 'neuro-2', label: 'Synapse Ridge', field: 'neuro', discovered: false, anomaly: false, energy: 70, reward: 'energy' },
    { id: 'quantum-1', label: 'Quantum Pool', field: 'quantum', discovered: false, anomaly: true, energy: 80, reward: 'mood' },
    { id: 'quantum-2', label: 'Phase Garden', field: 'quantum', discovered: false, anomaly: false, energy: 75, reward: 'mystery' },
    { id: 'earth-1', label: 'Earth Anchor', field: 'earth', discovered: false, anomaly: false, energy: 50, reward: 'energy' },
    { id: 'earth-2', label: 'Crystal Vale', field: 'earth', discovered: false, anomaly: true, energy: 85, reward: 'hygiene' },
  ];

  return {
    cells: baseCells,
    activeCellId: baseCells[0].id,
    anomaliesFound: baseCells.filter(cell => cell.anomaly && cell.discovered).length,
    anomaliesResolved: 0,
    scansPerformed: 0,
    lastScanAt: Date.now(),
  };
}

export function createDefaultBattleStats(): BattleStats {
  return {
    wins: 0,
    losses: 0,
    streak: 0,
    lastResult: null,
    lastOpponent: null,
    energyShield: 25,
  };
}

export function createDefaultMiniGameProgress(): MiniGameProgress {
  return {
    memoryHighScore: 0,
    rhythmHighScore: 0,
    focusStreak: 0,
    lastPlayedAt: null,
  };
}
