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
import { summarizeElementWeb } from '../genome/elementResidue';
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

export type { Vitals };
export type PetType = 'geometric' | 'auralia';

export interface MetaPetState {
  vitals: Vitals;
  genome: Genome | null;
  traits: DerivedTraits | null;
  evolution: EvolutionData;
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;
  petType: PetType;
  mirrorMode: MirrorModeState;
  lastAction: null | 'feed' | 'clean' | 'play' | 'sleep';
  lastActionAt: number;
  tickId?: ReturnType<typeof setInterval>;
  setGenome: (genome: Genome, traits: DerivedTraits) => void;
  setPetType: (petType: PetType) => void;
  hydrate: (data: {
    vitals: Vitals;
    genome: Genome;
    traits: DerivedTraits;
    evolution: EvolutionData;
    achievements?: Achievement[];
    battle?: BattleStats;
    miniGames?: MiniGameProgress;
    vimana?: VimanaState;
    petType?: PetType;
    mirrorMode?: MirrorModeState;
  }) => void;
  startTick: () => void;
  stopTick: () => void;
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;
  setLastAction: (action: 'feed' | 'clean' | 'play' | 'sleep') => void;
  tryEvolve: () => boolean;
  recordBattle: (result: 'win' | 'loss', opponent: string) => void;
  updateMiniGameScore: (game: 'memory' | 'rhythm', score: number) => void;
  recordVimanaRun: (score: number, lines: number, level: number) => void;
  exploreCell: (cellId: string) => void;
  resolveAnomaly: (cellId: string) => void;
  beginMirrorMode: (preset: MirrorPrivacyPreset, durationMinutes?: number) => void;
  confirmMirrorCross: () => void;
  completeMirrorMode: (outcome: MirrorOutcome, note?: string) => void;
  refreshConsent: (durationMinutes: number) => void;
}

export type MirrorPhase = 'idle' | 'entering' | 'crossed' | 'returning';
export type MirrorPrivacyPreset = 'stealth' | 'standard' | 'radiant';
export type MirrorOutcome = 'anchor' | 'drift';

export interface MirrorReflection {
  id: string;
  note?: string;
  outcome: MirrorOutcome;
  moodDelta: number;
  energyDelta: number;
  timestamp: number;
  preset: MirrorPrivacyPreset;
}

export interface MirrorModeState {
  phase: MirrorPhase;
  startedAt: number | null;
  consentExpiresAt: number | null;
  preset: MirrorPrivacyPreset | null;
  presenceToken: string | null;
  lastReflection: MirrorReflection | null;
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

const DEFAULT_MIRROR_MODE: MirrorModeState = {
  phase: 'idle',
  startedAt: null,
  consentExpiresAt: null,
  preset: null,
  presenceToken: null,
  lastReflection: null,
};

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
    petType: 'geometric',
    mirrorMode: { ...DEFAULT_MIRROR_MODE },
    lastAction: null,
    lastActionAt: 0,

    setGenome(genome, traits) {
      set({ genome, traits: normalizeTraits(genome, traits) });
    },

    setPetType(petType) {
      set({ petType });
    },

    hydrate({ vitals, genome, traits, evolution, achievements, battle, miniGames, vimana, petType, mirrorMode }) {
      set(state => ({
        vitals: { ...vitals },
        genome,
        traits: normalizeTraits(genome, traits),
        evolution: { ...evolution },
        achievements: achievements ? achievements.map(entry => ({ ...entry })) : state.achievements,
        battle: battle ? { ...battle } : state.battle,
        miniGames: miniGames ? { ...miniGames } : state.miniGames,
        vimana: vimana ? cloneVimanaState(vimana) : state.vimana,
        petType: petType ?? state.petType,
        mirrorMode: mirrorMode ? { ...mirrorMode } : state.mirrorMode,
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

    setLastAction(action) {
      set({ lastAction: action, lastActionAt: Date.now() });
    },

    feed() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'feed'),
        evolution: gainExperience(state.evolution, 5),
      }));
      get().setLastAction('feed');
    },

    clean() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'clean'),
        evolution: gainExperience(state.evolution, 5),
      }));
      get().setLastAction('clean');
    },

    play() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'play'),
        evolution: gainExperience(state.evolution, 10),
      }));
      get().setLastAction('play');
    },

    sleep() {
      set(state => ({
        vitals: applyInteraction(state.vitals, 'sleep'),
        evolution: gainExperience(state.evolution, 3),
      }));
      get().setLastAction('sleep');
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

        // Grant XP for battle wins
        if (result === 'win') {
          update.evolution = gainExperience(state.evolution, 15);
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

        // Grant XP based on score (5-10 XP)
        const xpGain = Math.min(10, Math.max(5, Math.floor(score / 2)));
        update.evolution = gainExperience(state.evolution, xpGain);

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

        // Grant XP based on performance (5-10 XP, scaled by lines and level)
        if (hasProgress) {
          const xpGain = Math.min(10, Math.max(5, Math.floor(lines / 2) + level));
          update.evolution = gainExperience(state.evolution, xpGain);
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

    beginMirrorMode(preset, durationMinutes = 15) {
      const now = Date.now();
      set(state => ({
        mirrorMode: {
          phase: 'entering',
          startedAt: now,
          consentExpiresAt: now + durationMinutes * 60_000,
          preset,
          presenceToken: state.mirrorMode.presenceToken ?? null,
          lastReflection: state.mirrorMode.lastReflection,
        },
      }));
    },

    confirmMirrorCross() {
      set(state => {
        if (state.mirrorMode.phase !== 'entering') return {};
        const token = state.mirrorMode.presenceToken ?? generatePresenceToken();
        const now = Date.now();
        const consentActive =
          state.mirrorMode.consentExpiresAt === null || state.mirrorMode.consentExpiresAt > now;
        const moodBoost = consentActive ? 6 : 3;
        const energyBoost = consentActive ? 4 : 2;

        return {
          mirrorMode: {
            ...state.mirrorMode,
            phase: 'crossed',
            presenceToken: token,
          },
          vitals: {
            ...state.vitals,
            mood: clamp(state.vitals.mood + moodBoost),
            energy: clamp(state.vitals.energy + energyBoost),
          },
        };
      });
    },

    completeMirrorMode(outcome, note) {
      set(state => {
        if (state.mirrorMode.phase === 'idle') return {};
        const moodDelta = outcome === 'anchor' ? 8 : -6;
        const energyDelta = outcome === 'anchor' ? 5 : -8;
        const reflection: MirrorReflection = {
          id: generatePresenceToken(),
          note,
          outcome,
          moodDelta,
          energyDelta,
          timestamp: Date.now(),
          preset: state.mirrorMode.preset ?? 'standard',
        };

        return {
          mirrorMode: {
            phase: 'returning',
            startedAt: state.mirrorMode.startedAt,
            consentExpiresAt: state.mirrorMode.consentExpiresAt,
            preset: state.mirrorMode.preset,
            presenceToken: state.mirrorMode.presenceToken,
            lastReflection: reflection,
          },
          vitals: {
            ...state.vitals,
            mood: clamp(state.vitals.mood + moodDelta),
            energy: clamp(state.vitals.energy + energyDelta),
          },
        };
      });

      // Allow the phase to settle back to idle after a beat
      set(state => ({
        mirrorMode: {
          ...state.mirrorMode,
          phase: 'idle',
        },
      }));
    },

    refreshConsent(durationMinutes) {
      const now = Date.now();
      set(state => ({
        mirrorMode: {
          ...state.mirrorMode,
          consentExpiresAt: now + durationMinutes * 60_000,
        },
      }));
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

function normalizeTraits(genome: Genome, traits: DerivedTraits): DerivedTraits {
  if (traits.elementWeb) {
    return traits;
  }

  return {
    ...traits,
    elementWeb: summarizeElementWeb(genome),
  };
}

function cloneVimanaState(source: VimanaState): VimanaState {
  return {
    ...source,
    cells: source.cells.map(cell => ({ ...cell })),
  };
}

function generatePresenceToken(): string {
  const cryptoApi = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoApi && 'randomUUID' in cryptoApi) {
    return cryptoApi.randomUUID();
  }

  const rand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return `mirror-${rand.toString(36)}`;
}
