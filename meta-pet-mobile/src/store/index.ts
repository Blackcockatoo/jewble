/**
 * Zustand Store - Meta-Pet Mobile
 * Complete state management with vitals, genome, evolution, and persistence
 */

import { create } from 'zustand';
import { FEATURES } from '../config';
import type { Vitals } from '../engine/state';
import { DEFAULT_VITALS, clamp, applyInteraction, getVitalsAverage } from '../engine/state';
import type { Genome, DerivedTraits } from '../engine/genome';
import { decodeGenome, generateRandomGenome } from '../engine/genome';
import type { EvolutionData } from '../engine/evolution';
import { initializeEvolution, gainExperience, checkEvolutionEligibility, evolvePet } from '../engine/evolution';
import { tick, calculateElapsedTicks } from '../engine/sim';
import type { Achievement, BattleStats, MiniGameProgress, VimanaState } from '../engine/progression/types';
import { createDefaultBattleStats, createDefaultMiniGameProgress, createDefaultVimanaState } from '../engine/progression/types';
import type { ConsentState } from '../identity/types';
import { createDefaultConsent, grantConsent, revokeConsent as revokeConsentState, isConsentValid } from '../identity/consent';
import { persistence } from './persistence';

export interface ExportPayload {
  version: string;
  exportedAt: number;
  genome: Genome | null;
  traits: DerivedTraits | null;
  vitals: Vitals;
  evolution: EvolutionData;
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;
  consent: ConsentState;
}

export interface State {
  // Core State
  vitals: Vitals;
  genome: Genome | null;
  traits: DerivedTraits | null;
  evolution: EvolutionData;
  lastUpdateTime: number;

  // Progression
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;

  // Tick Management
  tickId?: ReturnType<typeof setInterval>;

  // Settings
  darkMode: boolean;
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  consent: ConsentState;

  // Core Actions
  setGenome: (genome: Genome, traits: DerivedTraits) => void;
  generateNewPet: () => void;
  hydrate: () => void;
  startTick: () => void;
  stopTick: () => void;

  // Vitals Actions
  feed: () => void;
  clean: () => void;
  play: () => void;
  sleep: () => void;

  // Evolution Actions
  tryEvolve: () => boolean;

  // Progression Actions
  recordBattle: (result: 'win' | 'loss', opponent: string) => void;
  updateMiniGameScore: (game: 'memory' | 'rhythm', score: number) => void;
  exploreCell: (cellId: string) => void;
  resolveAnomaly: (cellId: string) => void;

  // Settings Actions
  toggleDarkMode: () => void;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  acceptConsent: () => void;
  revokeConsent: () => void;

  // Data Management
  exportData: () => ExportPayload;
}

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
  // Initial State
  vitals: DEFAULT_VITALS,
  genome: null,
  traits: null,
  evolution: initializeEvolution(),
  lastUpdateTime: Date.now(),
  achievements: [],
  battle: createDefaultBattleStats({ energyShield: 50 }),
  miniGames: createDefaultMiniGameProgress(),
  vimana: createDefaultVimanaState({ layout: 'grid' }),
  darkMode: true,
  audioEnabled: true,
  hapticsEnabled: true,
  consent: createDefaultConsent(),

  // Generate new pet
  generateNewPet() {
    const genome = generateRandomGenome();
    const traits = decodeGenome(genome);
    const evolution = initializeEvolution();

    set({
      genome,
      traits,
      evolution,
      vitals: DEFAULT_VITALS,
      lastUpdateTime: Date.now(),
    });

    // Persist
    persistence.saveGenome(genome);
    persistence.saveTraits(traits);
    persistence.saveEvolution(evolution);
    persistence.saveVitals(DEFAULT_VITALS);
    persistence.saveLastUpdate(Date.now());
  },

  // Set genome from external source (e.g., hepta code)
  setGenome(genome: Genome, traits: DerivedTraits) {
    set({ genome, traits });
    persistence.saveGenome(genome);
    persistence.saveTraits(traits);
  },

  // Hydrate state from persistence
  hydrate() {
    const savedVitals = persistence.loadVitals();
    const savedGenome = persistence.loadGenome();
    const savedTraits = persistence.loadTraits();
    const savedEvolution = persistence.loadEvolution();
    const savedAchievements = persistence.loadAchievements();
    const savedBattle = persistence.loadBattleStats();
    const savedMiniGames = persistence.loadMiniGameProgress();
    const savedVimana = persistence.loadVimanaState();
    const lastUpdate = persistence.loadLastUpdate();
    const darkMode = persistence.loadDarkMode();
    const audioEnabled = persistence.loadAudioEnabled();
    const hapticsEnabled = persistence.loadHapticsEnabled();
    const savedConsent = persistence.loadConsent();

    // Calculate elapsed ticks if we have a last update time
    let vitals = savedVitals || DEFAULT_VITALS;
    let evolution = savedEvolution || initializeEvolution();

    if (savedVitals && savedEvolution && FEATURES.TICK) {
      const elapsedTicks = calculateElapsedTicks(lastUpdate, FEATURES.LOW_POWER_TICK_MS);
      if (elapsedTicks > 0) {
        // Simulate ticks that happened while app was closed (max 100 to prevent overflow)
        const ticksToSimulate = Math.min(elapsedTicks, 100);
        for (let i = 0; i < ticksToSimulate; i++) {
          const result = tick(vitals, evolution);
          vitals = result.vitals;
          evolution = result.evolution;
        }
      }
    }

    const consent = savedConsent && isConsentValid(savedConsent)
      ? savedConsent
      : createDefaultConsent();

    set({
      vitals,
      genome: savedGenome,
      traits: savedTraits,
      evolution,
      achievements: savedAchievements,
      battle: savedBattle
        ? { ...createDefaultBattleStats({ energyShield: 50 }), ...savedBattle }
        : createDefaultBattleStats({ energyShield: 50 }),
      miniGames: savedMiniGames
        ? { ...createDefaultMiniGameProgress(), ...savedMiniGames }
        : createDefaultMiniGameProgress(),
      vimana: savedVimana
        ? {
            ...createDefaultVimanaState({ layout: 'grid' }),
            ...savedVimana,
            cells: savedVimana.cells.map(cell => ({ ...cell })),
          }
        : createDefaultVimanaState({ layout: 'grid' }),
      lastUpdateTime: Date.now(),
      darkMode,
      audioEnabled,
      hapticsEnabled,
      consent,
    });

    // Save updated state
    persistence.saveVitals(vitals);
    persistence.saveEvolution(evolution);
    persistence.saveLastUpdate(Date.now());
    persistence.saveConsent(consent);
  },

  // Start vitals tick
  startTick() {
    if (!FEATURES.TICK) return;
    if (get().tickId) return; // Already running

    const id = setInterval(() => {
      const { vitals, evolution } = get();
      const result = tick(vitals, evolution);

      set({
        vitals: result.vitals,
        evolution: result.evolution,
        lastUpdateTime: Date.now(),
      });

      // Persist periodically (every 10 ticks = ~20 seconds)
      if (Math.random() < 0.1) {
        persistence.saveVitals(result.vitals);
        persistence.saveEvolution(result.evolution);
        persistence.saveLastUpdate(Date.now());
      }
    }, FEATURES.LOW_POWER_TICK_MS);

    set({ tickId: id });
  },

  // Stop vitals tick
  stopTick() {
    const id = get().tickId;
    if (id) {
      clearInterval(id);
      set({ tickId: undefined });

      // Save on stop
      const { vitals, evolution } = get();
      persistence.saveVitals(vitals);
      persistence.saveEvolution(evolution);
      persistence.saveLastUpdate(Date.now());
    }
  },

  // Vitals Actions
  feed() {
    set(state => {
      const newVitals = applyInteraction(state.vitals, 'feed');
      const newEvolution = gainExperience(state.evolution, 2);

      persistence.saveVitals(newVitals);
      persistence.saveEvolution(newEvolution);

      return {
        vitals: newVitals,
        evolution: newEvolution,
      };
    });
  },

  clean() {
    set(state => {
      const newVitals = applyInteraction(state.vitals, 'clean');
      const newEvolution = gainExperience(state.evolution, 2);

      persistence.saveVitals(newVitals);
      persistence.saveEvolution(newEvolution);

      return {
        vitals: newVitals,
        evolution: newEvolution,
      };
    });
  },

  play() {
    set(state => {
      const newVitals = applyInteraction(state.vitals, 'play');
      const newEvolution = gainExperience(state.evolution, 3);

      persistence.saveVitals(newVitals);
      persistence.saveEvolution(newEvolution);

      return {
        vitals: newVitals,
        evolution: newEvolution,
      };
    });
  },

  sleep() {
    set(state => {
      const newVitals = applyInteraction(state.vitals, 'sleep');
      const newEvolution = gainExperience(state.evolution, 1);

      persistence.saveVitals(newVitals);
      persistence.saveEvolution(newEvolution);

      return {
        vitals: newVitals,
        evolution: newEvolution,
      };
    });
  },

  // Evolution Actions
  tryEvolve() {
    const { evolution, vitals } = get();
    const vitalsAvg = getVitalsAverage(vitals);

    if (checkEvolutionEligibility(evolution, vitalsAvg)) {
      const newEvolution = evolvePet(evolution);
      set({ evolution: newEvolution });
      persistence.saveEvolution(newEvolution);
      return true;
    }
    return false;
  },

  // Progression Actions
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

      persistence.saveBattleStats(next);
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

      persistence.saveMiniGameProgress(next);
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

      const newVimana = {
        ...vimana,
        cells,
        activeCellId: cellId,
        scansPerformed: vimana.scansPerformed + 1,
        anomaliesFound,
        lastScanAt: Date.now(),
      };

      persistence.saveVitals(updatedVitals);
      persistence.saveVimanaState(newVimana);

      return {
        vitals: updatedVitals,
        vimana: newVimana,
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

      const updatedVitals = applyVimanaReward('mood', vitals);
      const anomaliesFound = cells.filter(cell => cell.anomaly && cell.discovered).length;

      const newVimana = {
        ...vimana,
        cells,
        anomaliesFound,
      };

      persistence.saveVitals(updatedVitals);
      persistence.saveVimanaState(newVimana);

      return {
        vitals: updatedVitals,
        vimana: newVimana,
      };
    });
  },

  // Settings Actions
  toggleDarkMode() {
    set(state => {
      const newValue = !state.darkMode;
      persistence.saveDarkMode(newValue);
      return { darkMode: newValue };
    });
  },

  toggleAudio() {
    set(state => {
      const newValue = !state.audioEnabled;
      persistence.saveAudioEnabled(newValue);
      return { audioEnabled: newValue };
    });
  },

  toggleHaptics() {
    set(state => {
      const newValue = !state.hapticsEnabled;
      persistence.saveHapticsEnabled(newValue);
      return { hapticsEnabled: newValue };
    });
  },

  acceptConsent() {
    const consent = grantConsent();
    set({ consent });
    persistence.saveConsent(consent);
  },

  revokeConsent() {
    const consent = revokeConsentState();
    set({ consent });
    persistence.saveConsent(consent);
  },

  exportData() {
    const state = get();
    return {
      version: '1.0.0',
      exportedAt: Date.now(),
      genome: state.genome,
      traits: state.traits,
      vitals: state.vitals,
      evolution: state.evolution,
      achievements: state.achievements,
      battle: state.battle,
      miniGames: state.miniGames,
      vimana: state.vimana,
      consent: state.consent,
    };
  },
}));

// Initialize store on app load
useStore.getState().hydrate();
