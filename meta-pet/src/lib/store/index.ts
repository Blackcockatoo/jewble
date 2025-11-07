import { create } from 'zustand';
import type { Genome, DerivedTraits } from '@/lib/genome';
import type { EvolutionData } from '@/lib/evolution';
import {
  initializeEvolution,
  gainExperience,
  checkEvolutionEligibility,
  evolvePet,
} from '@/lib/evolution';
import {
  ACHIEVEMENT_CATALOG,
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
  type Achievement,
  type BattleStats,
  type BreedingRecord,
  type MiniGameProgress,
  type VimanaState,
} from '@/lib/progression/types';

export interface Vitals {
  hunger: number;    // 0-100 (100 = full)
  hygiene: number;   // 0-100 (100 = clean)
  mood: number;      // 0-100 (100 = happy)
  energy: number;    // 0-100 (100 = energized)
}

interface State {
  vitals: Vitals;
  genome: Genome | null;
  traits: DerivedTraits | null;
  evolution: EvolutionData;
  vimana: VimanaState;
  battle: BattleStats;
  miniGames: MiniGameProgress;
  achievements: Achievement[];
  breedingHistory: BreedingRecord[];
  tickId?: number;
  setGenome: (genome: Genome, traits: DerivedTraits) => void;
  hydrate: (data: {
    vitals: Vitals;
    genome: Genome;
    traits: DerivedTraits;
    evolution: EvolutionData;
    vimana: VimanaState;
    battle: BattleStats;
    miniGames: MiniGameProgress;
    achievements: Achievement[];
    breedingHistory: BreedingRecord[];
  }) => void;
  startTick: () => void;
  stopTick: () => void;
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;
  tryEvolve: () => boolean;
  exploreCell: (cellId: string) => void;
  resolveAnomaly: (cellId: string) => void;
  recordBattle: (result: 'win' | 'loss', opponent: string) => void;
  updateMiniGameScore: (game: 'memory' | 'rhythm', score: number) => void;
  unlockAchievement: (id: string) => void;
  addBreedingRecord: (record: BreedingRecord) => void;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const useStore = create<State>((set, get) => ({
  vitals: {
    hunger: 30,
    hygiene: 70,
    mood: 60,
    energy: 80,
  },
  genome: null,
  traits: null,
  evolution: initializeEvolution(),
  vimana: createDefaultVimanaState(),
  battle: createDefaultBattleStats(),
  miniGames: createDefaultMiniGameProgress(),
  achievements: [],
  breedingHistory: [],

  setGenome(genome: Genome, traits: DerivedTraits) {
    set({ genome, traits });
  },

  hydrate({ vitals, genome, traits, evolution, vimana, battle, miniGames, achievements, breedingHistory }) {
    set(state => ({
      vitals: { ...vitals },
      genome,
      traits,
      evolution: { ...evolution },
      vimana: { ...vimana, cells: vimana.cells.map(cell => ({ ...cell })) },
      battle: { ...battle },
      miniGames: { ...miniGames },
      achievements: achievements.map(item => ({ ...item })),
      breedingHistory: breedingHistory.map(record => ({ ...record })),
      tickId: state.tickId,
    }));
  },

  tryEvolve() {
    const { evolution, vitals } = get();
    const vitalsAvg = (vitals.hunger + vitals.hygiene + vitals.mood + vitals.energy) / 4;

    if (checkEvolutionEligibility(evolution, vitalsAvg)) {
      const newEvolution = evolvePet(evolution);
      set({ evolution: newEvolution });
      return true;
    }
    return false;
  },

  startTick() {
    if (get().tickId) return;

    const TICK_MS = 1000;
    const id = window.setInterval(() => {
      const { vitals, evolution } = get();

      // Natural decay (gets hungrier, dirtier, tired)
      const next: Vitals = {
        hunger: clamp(vitals.hunger + 0.25),  // hunger increases
        hygiene: clamp(vitals.hygiene - 0.15), // hygiene decreases
        energy: clamp(vitals.energy - 0.20),   // energy decreases
        mood: clamp(vitals.mood + (vitals.energy > 50 ? 0.05 : -0.05)),
      };

      // Check evolution eligibility
      const vitalsAvg = (next.hunger + next.hygiene + next.mood + next.energy) / 4;
      const canEvolve = checkEvolutionEligibility(evolution, vitalsAvg);

      set({
        vitals: next,
        evolution: { ...evolution, canEvolve },
      });
    }, TICK_MS) as unknown as number;

    set({ tickId: id });
  },

  stopTick() {
    const id = get().tickId;
    if (id) {
      clearInterval(id);
      set({ tickId: undefined });
    }
  },

  feed() {
    set(state => ({
      vitals: {
        ...state.vitals,
        hunger: clamp(state.vitals.hunger - 20), // reduce hunger
        energy: clamp(state.vitals.energy + 5),
        mood: clamp(state.vitals.mood + 3),
      },
      evolution: gainExperience(state.evolution, 2),
    }));
  },

  clean() {
    set(state => ({
      vitals: {
        ...state.vitals,
        hygiene: clamp(state.vitals.hygiene + 25),
        mood: clamp(state.vitals.mood + 5),
      },
      evolution: gainExperience(state.evolution, 2),
    }));
  },

  play() {
    set(state => ({
      vitals: {
        ...state.vitals,
        mood: clamp(state.vitals.mood + 15),
        energy: clamp(state.vitals.energy - 10),
        hygiene: clamp(state.vitals.hygiene - 5),
      },
      evolution: gainExperience(state.evolution, 3),
    }));
  },

  sleep() {
    set(state => ({
      vitals: {
        ...state.vitals,
        energy: clamp(state.vitals.energy + 30),
        mood: clamp(state.vitals.mood + 5),
      },
      evolution: gainExperience(state.evolution, 1),
    }));
  },

  exploreCell(cellId) {
    const { vimana, vitals } = get();
    const target = vimana.cells.find(cell => cell.id === cellId);
    if (!target) return;

    const now = Date.now();
    const updatedCells = vimana.cells.map(cell =>
      cell.id === cellId
        ? {
            ...cell,
            discovered: true,
            visitedAt: now,
          }
        : cell
    );

    const updatedVitals = { ...vitals };
    switch (target.reward) {
      case 'mood':
        updatedVitals.mood = clamp(updatedVitals.mood + 8);
        break;
      case 'energy':
        updatedVitals.energy = clamp(updatedVitals.energy + 6);
        break;
      case 'hygiene':
        updatedVitals.hygiene = clamp(updatedVitals.hygiene + 10);
        break;
      case 'mystery':
        updatedVitals.mood = clamp(updatedVitals.mood + 4);
        updatedVitals.energy = clamp(updatedVitals.energy + 4);
        break;
    }

    const alreadyEarned = get().achievements.some(a => a.id === 'explorer-first-step');

    set(state => ({
      vitals: updatedVitals,
      vimana: {
        ...state.vimana,
        cells: updatedCells,
        activeCellId: cellId,
        scansPerformed: state.vimana.scansPerformed + 1,
        lastScanAt: now,
      },
    }));

    if (!alreadyEarned) {
      get().unlockAchievement('explorer-first-step');
    }
  },

  resolveAnomaly(cellId) {
    const { vimana } = get();
    const cell = vimana.cells.find(c => c.id === cellId);
    if (!cell || !cell.anomaly) return;

    const updatedCells = vimana.cells.map(c =>
      c.id === cellId
        ? {
            ...c,
            anomaly: false,
            visitedAt: Date.now(),
          }
        : c
    );

    const anomaliesFound = vimana.anomaliesFound + 1;

    set(state => ({
      vimana: {
        ...state.vimana,
        cells: updatedCells,
        anomaliesFound,
      },
    }));

    if (anomaliesFound >= 3) {
      get().unlockAchievement('explorer-anomaly-hunter');
    }
  },

  recordBattle(result, opponent) {
    const { battle } = get();
    const win = result === 'win';

    const wins = battle.wins + (win ? 1 : 0);
    const losses = battle.losses + (win ? 0 : 1);
    const streak = win ? battle.streak + 1 : 0;
    const energyShield = clamp(
      battle.energyShield + (win ? 10 : -8),
      0,
      100
    );

    set(state => ({
      battle: {
        wins,
        losses,
        streak,
        lastResult: result,
        lastOpponent: opponent,
        energyShield,
      },
      vitals: win
        ? {
            ...state.vitals,
            mood: clamp(state.vitals.mood + 6),
          }
        : {
            ...state.vitals,
            energy: clamp(state.vitals.energy - 5),
          },
    }));

    if (win) {
      const hasFirst = get().achievements.some(a => a.id === 'battle-first-win');
      if (!hasFirst) {
        get().unlockAchievement('battle-first-win');
      }
    }

    if (streak >= 3) {
      get().unlockAchievement('battle-streak');
    }
  },

  updateMiniGameScore(game, score) {
    set(state => {
      const nextMiniGames: MiniGameProgress = { ...state.miniGames };
      const focusStreak = nextMiniGames.focusStreak + 1;
      if (game === 'memory') {
        nextMiniGames.memoryHighScore = Math.max(nextMiniGames.memoryHighScore, score);
        if (score >= 10) {
          get().unlockAchievement('minigame-memory');
        }
      } else {
        nextMiniGames.rhythmHighScore = Math.max(nextMiniGames.rhythmHighScore, score);
        if (score >= 12) {
          get().unlockAchievement('minigame-rhythm');
        }
      }

      nextMiniGames.focusStreak = focusStreak;
      nextMiniGames.lastPlayedAt = Date.now();

      return {
        miniGames: nextMiniGames,
        vitals: {
          ...state.vitals,
          mood: clamp(state.vitals.mood + 3),
        },
      };
    });
  },

  unlockAchievement(id) {
    const existing = get().achievements;
    if (existing.some(item => item.id === id)) return;

    const template = ACHIEVEMENT_CATALOG.find(item => item.id === id);
    const earned: Achievement = template
      ? { ...template, earnedAt: Date.now() }
      : { id, title: id, description: 'Secret milestone unlocked.', earnedAt: Date.now() };

    set(state => ({
      achievements: [...state.achievements, earned],
    }));
  },

  addBreedingRecord(record) {
    set(state => ({
      breedingHistory: [...state.breedingHistory, { ...record }],
    }));
    get().unlockAchievement('breeding-first');
  },
}));

// Auto-pause when tab hidden (battery-safe)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const store = useStore.getState();
    if (document.hidden) {
      store.stopTick();
    } else {
      store.startTick();
    }
  });
}
