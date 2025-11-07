import { create } from 'zustand';
import type { Genome, DerivedTraits } from '@/lib/genome';
import type { EvolutionData } from '@/lib/evolution';
import { initializeEvolution, gainExperience, checkEvolutionEligibility, evolvePet } from '@/lib/evolution';
import {
  type Achievement,
  type BattleStats,
  type MiniGameProgress,
  type VimanaState,
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
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
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;
  tickId?: number;
  setGenome: (genome: Genome, traits: DerivedTraits) => void;
  hydrate: (data: { vitals: Vitals; genome: Genome; traits: DerivedTraits; evolution: EvolutionData }) => void;
  startTick: () => void;
  stopTick: () => void;
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;
  tryEvolve: () => boolean;
  recordBattle: (result: 'win' | 'loss', opponent: string) => void;
  updateMiniGameScore: (game: 'memory' | 'rhythm', score: number) => void;
  exploreCell: (cellId: string) => void;
  resolveAnomaly: (cellId: string) => void;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

type VimanaReward = VimanaState['cells'][number]['reward'];

function applyVimanaReward(reward: VimanaReward, vitals: Vitals): Vitals {
  switch (reward) {
    case 'mood':
      return { ...vitals, mood: clamp(vitals.mood + 10) };
    case 'energy':
      return { ...vitals, energy: clamp(vitals.energy + 10) };
    case 'hygiene':
      return { ...vitals, hygiene: clamp(vitals.hygiene + 12) };
    case 'mystery':
      return {
        ...vitals,
        mood: clamp(vitals.mood + 5),
        energy: clamp(vitals.energy + 5),
      };
    default:
      return vitals;
  }
}

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
  achievements: [],
  battle: createDefaultBattleStats(),
  miniGames: createDefaultMiniGameProgress(),
  vimana: createDefaultVimanaState(),

  setGenome(genome: Genome, traits: DerivedTraits) {
    set({ genome, traits });
  },

  hydrate({ vitals, genome, traits, evolution }) {
    set(state => ({
      vitals: { ...vitals },
      genome,
      traits,
      evolution: { ...evolution },
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

  recordBattle(result, opponent) {
    set(state => {
      const next: BattleStats = {
        ...state.battle,
        lastResult: result,
        lastOpponent: opponent,
      };

      if (result === 'win') {
        next.wins += 1;
        next.streak += 1;
        next.energyShield = clamp(next.energyShield + 5, 0, 100);
      } else {
        next.losses += 1;
        next.streak = 0;
        next.energyShield = clamp(next.energyShield - 10, 0, 100);
      }

      return { battle: next };
    });
  },

  updateMiniGameScore(game, score) {
    set(state => {
      const next: MiniGameProgress = { ...state.miniGames, lastPlayedAt: Date.now() };

      if (game === 'memory') {
        next.memoryHighScore = Math.max(next.memoryHighScore, score);
      } else {
        next.rhythmHighScore = Math.max(next.rhythmHighScore, score);
      }

      return { miniGames: next };
    });
  },

  exploreCell(cellId) {
    set(state => {
      const { vimana, vitals } = state;
      const cells = vimana.cells.map(cell => {
        if (cell.id !== cellId) return cell;
        return {
          ...cell,
          discovered: true,
          visitedAt: Date.now(),
        };
      });

      const target = cells.find(cell => cell.id === cellId);
      let updatedVitals = vitals;
      if (target) {
        updatedVitals = applyVimanaReward(target.reward, vitals);
      }

      const anomaliesFound = cells.filter(cell => cell.anomaly && cell.discovered).length;

      return {
        vitals: updatedVitals,
        vimana: {
          ...vimana,
          cells,
          activeCellId: cellId,
          scansPerformed: vimana.scansPerformed + 1,
          anomaliesFound,
          lastScanAt: Date.now(),
        },
      };
    });
  },

  resolveAnomaly(cellId) {
    set(state => {
      const { vimana, vitals } = state;
      const cells = vimana.cells.map(cell => {
        if (cell.id !== cellId) return cell;
        if (!cell.anomaly) return cell;
        return {
          ...cell,
          anomaly: false,
          discovered: true,
          visitedAt: Date.now(),
        };
      });

      const target = cells.find(cell => cell.id === cellId);
      let updatedVitals = vitals;
      if (target) {
        updatedVitals = applyVimanaReward('mood', vitals);
      }

      const anomaliesFound = cells.filter(cell => cell.anomaly && cell.discovered).length;

      return {
        vitals: updatedVitals,
        vimana: {
          ...vimana,
          cells,
          anomaliesFound,
        },
      };
    });
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
        evolution: { ...evolution, canEvolve }
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
