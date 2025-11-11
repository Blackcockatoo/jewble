import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';

import type { Genome, DerivedTraits } from '../genome/types';
import type { EvolutionData } from '../evolution/types';
import {
  initializeEvolution,
  gainExperience,
  checkEvolutionEligibility,
  evolvePet,
} from '../evolution/index';
import type {
  Achievement,
  BattleStats,
  MiniGameProgress,
  VimanaState,
} from '../progression/types';
import {
  ACHIEVEMENT_CATALOG,
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
} from '../progression/types';
import type { Vitals } from '../vitals/index';
import {
  DEFAULT_VITALS,
  applyInteraction,
  clamp,
  getVitalsAverage,
  tick as runTick,
} from '../vitals/index';

export interface MetaPetState {
  vitals: Vitals;
  genome: Genome | null;
  traits: DerivedTraits | null;
  evolution: EvolutionData;
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;
  tickId?: ReturnType<typeof setInterval>;
  setGenome: (genome: Genome, traits: DerivedTraits) => void;
  hydrate: (data: {
    vitals: Vitals;
    genome: Genome;
    traits: DerivedTraits;
    evolution: EvolutionData;
    achievements?: Achievement[];
    battle?: BattleStats;
    miniGames?: MiniGameProgress;
    vimana?: VimanaState;
  }) => void;
  startTick: () => void;
  stopTick: () => void;
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;
  tryEvolve: () => boolean;
  recordBattle: (result: 'win' | 'loss', opponent: string) => void;
  updateMiniGameScore: (game: 'memory' | 'rhythm', score: number) => void;
  recordVimanaRun: (score: number, lines: number, level: number) => void;
  exploreCell: (cellId: string) => void;
  resolveAnomaly: (cellId: string) => void;
}

export interface CreateMetaPetWebStoreOptions {
  tickMs?: number;
  scheduleInterval?: typeof setInterval;
  cancelInterval?: typeof clearInterval;
  autoPauseOnVisibilityChange?: boolean;
}

type MetaPetStore = UseBoundStore<StoreApi<MetaPetState>>;

type VimanaReward = VimanaState['cells'][number]['reward'];

type AchievementMap = Map<Achievement['id'], Achievement>;

const achievementDefinitions: AchievementMap = new Map(
  ACHIEVEMENT_CATALOG.map(item => [item.id, item])
);

function unlockAchievement(list: Achievement[], id: Achievement['id']): Achievement[] {
  if (list.some(entry => entry.id === id)) {
    return list;
  }

  const definition = achievementDefinitions.get(id);
  if (!definition) {
    return list;
  }

  return [...list, { ...definition, earnedAt: Date.now() }];
}

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

export function createMetaPetWebStore(
  options: CreateMetaPetWebStoreOptions = {}
): MetaPetStore {
  const tickMs = options.tickMs ?? 1000;
  const scheduleInterval = options.scheduleInterval ?? setInterval;
  const cancelInterval = options.cancelInterval ?? clearInterval;
  const autoPause = options.autoPauseOnVisibilityChange ?? true;

  const useStore = create<MetaPetState>((set, get) => ({
    vitals: DEFAULT_VITALS,
    genome: null,
    traits: null,
    evolution: initializeEvolution(),
    achievements: [],
    battle: createDefaultBattleStats(),
    miniGames: createDefaultMiniGameProgress(),
    vimana: createDefaultVimanaState(),

    setGenome(genome, traits) {
      set({ genome, traits });
    },

    hydrate({ vitals, genome, traits, evolution, achievements, battle, miniGames, vimana }) {
      set(state => ({
        vitals: { ...vitals },
        genome,
        traits,
        evolution: { ...evolution },
        achievements: achievements ? achievements.map(entry => ({ ...entry })) : state.achievements,
        battle: battle ? { ...battle } : state.battle,
        miniGames: miniGames ? { ...miniGames } : state.miniGames,
        vimana: vimana ? cloneVimanaState(vimana) : state.vimana,
        tickId: state.tickId,
      }));
    },

    startTick() {
      if (get().tickId) return;

      const id = scheduleInterval(() => {
        const { vitals, evolution } = get();
        const result = runTick(vitals, evolution);
        set({ vitals: result.vitals, evolution: result.evolution });
      }, tickMs);

      set({ tickId: id as ReturnType<typeof setInterval> });
    },

    stopTick() {
      const id = get().tickId;
      if (id) {
        cancelInterval(id);
        set({ tickId: undefined });
      }
    },

    feed() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'feed'),
        evolution: gainExperience(state.evolution, 2),
      }));
    },

    clean() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'clean'),
        evolution: gainExperience(state.evolution, 2),
      }));
    },

    play() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'play'),
        evolution: gainExperience(state.evolution, 3),
      }));
    },

    sleep() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'sleep'),
        evolution: gainExperience(state.evolution, 1),
      }));
    },

    tryEvolve() {
      const { evolution, vitals } = get();
      const vitalsAvg = getVitalsAverage(vitals);
      if (checkEvolutionEligibility(evolution, vitalsAvg)) {
        const nextEvolution = evolvePet(evolution);
        set({ evolution: nextEvolution });
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
          next.energyShield = clamp(next.energyShield + 5);
        } else {
          next.losses += 1;
          next.streak = 0;
          next.energyShield = clamp(next.energyShield - 10);
        }

        let achievements = state.achievements;
        if (result === 'win') {
          achievements = unlockAchievement(achievements, 'battle-first-win');
          if (next.streak >= 3) {
            achievements = unlockAchievement(achievements, 'battle-streak');
          }
        }

        const update: Partial<MetaPetState> = { battle: next };
        if (achievements !== state.achievements) {
          update.achievements = achievements;
        }

        return update;
      });
    },

    updateMiniGameScore(game, score) {
      set(state => {
        const next: MiniGameProgress = {
          ...state.miniGames,
          lastPlayedAt: Date.now(),
        };

        if (game === 'memory') {
          next.memoryHighScore = Math.max(next.memoryHighScore, score);
        } else {
          next.rhythmHighScore = Math.max(next.rhythmHighScore, score);
        }

        let achievements = state.achievements;
        if (game === 'memory' && next.memoryHighScore >= 10) {
          achievements = unlockAchievement(achievements, 'minigame-memory');
        }
        if (game === 'rhythm' && next.rhythmHighScore >= 12) {
          achievements = unlockAchievement(achievements, 'minigame-rhythm');
        }

        const update: Partial<MetaPetState> = { miniGames: next };
        if (achievements !== state.achievements) {
          update.achievements = achievements;
        }

        return update;
      });
    },

    recordVimanaRun(score, lines, level) {
      set(state => {
        const previous = state.miniGames;
        const hasProgress = lines > 0 || score > 0;

        const next: MiniGameProgress = {
          ...previous,
          focusStreak: hasProgress ? previous.focusStreak + 1 : 0,
          vimanaHighScore: Math.max(previous.vimanaHighScore, score),
          vimanaMaxLines: Math.max(previous.vimanaMaxLines, lines),
          vimanaMaxLevel: Math.max(previous.vimanaMaxLevel, level),
          vimanaLastScore: score,
          vimanaLastLines: lines,
          vimanaLastLevel: level,
          lastPlayedAt: Date.now(),
        };

        let achievements = state.achievements;
        if (next.vimanaHighScore >= 1500) {
          achievements = unlockAchievement(achievements, 'minigame-vimana-score');
        }
        if (next.vimanaMaxLines >= 20) {
          achievements = unlockAchievement(achievements, 'minigame-vimana-lines');
        }

        const update: Partial<MetaPetState> = { miniGames: next };
        if (achievements !== state.achievements) {
          update.achievements = achievements;
        }

        return update;
      });
    },

    exploreCell(cellId) {
      set(state => {
        const { vimana, vitals } = state;
        const previousCell = vimana.cells.find(cell => cell.id === cellId);
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

        let achievements = state.achievements;
        if (!previousCell?.discovered && target?.discovered) {
          achievements = unlockAchievement(achievements, 'explorer-first-step');
        }

        const updatedVimana: VimanaState = {
          ...vimana,
          cells,
          activeCellId: cellId,
          scansPerformed: vimana.scansPerformed + 1,
          anomaliesFound,
          lastScanAt: Date.now(),
        };

        const update: Partial<MetaPetState> = {
          vitals: updatedVitals,
          vimana: updatedVimana,
        };

        if (achievements !== state.achievements) {
          update.achievements = achievements;
        }

        return update;
      });
    },

    resolveAnomaly(cellId) {
      set(state => {
        const { vimana, vitals } = state;
        const previousCell = vimana.cells.find(cell => cell.id === cellId);
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

        const updatedVitals = applyVimanaReward('mood', vitals);
        const anomaliesFound = cells.filter(cell => cell.anomaly && cell.discovered).length;

        let anomaliesResolved = vimana.anomaliesResolved ?? 0;
        if (previousCell?.anomaly) {
          anomaliesResolved += 1;
        }

        let achievements = state.achievements;
        if (anomaliesResolved >= 3) {
          achievements = unlockAchievement(achievements, 'explorer-anomaly-hunter');
        }

        const update: Partial<MetaPetState> = {
          vitals: updatedVitals,
          vimana: {
            ...vimana,
            cells,
            anomaliesFound,
            anomaliesResolved,
          },
        };

        if (achievements !== state.achievements) {
          update.achievements = achievements;
        }

        return update;
      });
    },
  }));

  if (autoPause && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      const store = useStore.getState();
      if (document.hidden) {
        store.stopTick();
      } else {
        store.startTick();
      }
    });
  }

  return useStore;
}

function cloneVimanaState(source: VimanaState): VimanaState {
  return {
    ...source,
    cells: source.cells.map(cell => ({ ...cell })),
  };
}
