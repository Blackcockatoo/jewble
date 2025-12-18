/**
 * MMKV Persistence Layer
 * Handles saving and loading state from React Native MMKV storage
 */

import { MMKV } from 'react-native-mmkv';
import type { Vitals } from '../engine/state';
import type { Genome, DerivedTraits } from '../engine/genome';
import type { EvolutionData } from '../engine/evolution';
import type { Achievement, BattleStats, MiniGameProgress, VimanaState } from '../engine/progression/types';
import type { ConsentState } from '../identity/types';
import type { BirthChart, DailyHoroscope, GRSResult, BreedingPreview } from '../engine/astrogenetics';

const storage = new MMKV();

const KEYS = {
  VITALS: 'meta-pet:vitals',
  GENOME: 'meta-pet:genome',
  TRAITS: 'meta-pet:traits',
  EVOLUTION: 'meta-pet:evolution',
  ACHIEVEMENTS: 'meta-pet:achievements',
  BATTLE: 'meta-pet:battle',
  MINI_GAMES: 'meta-pet:miniGames',
  VIMANA: 'meta-pet:vimana',
  LAST_UPDATE: 'meta-pet:lastUpdate',
  DARK_MODE: 'meta-pet:darkMode',
  AUDIO_ENABLED: 'meta-pet:audioEnabled',
  HAPTICS_ENABLED: 'meta-pet:hapticsEnabled',
  CONSENT: 'meta-pet:consent',
  BIRTH_CHART: 'meta-pet:birthChart',
  HOROSCOPE: 'meta-pet:horoscope',
  GRS: 'meta-pet:grs',
  BREEDING_PREVIEW: 'meta-pet:breedingPreview',
};

export const persistence = {
  // Vitals
  saveVitals: (vitals: Vitals) => {
    storage.set(KEYS.VITALS, JSON.stringify(vitals));
  },
  loadVitals: (): Vitals | null => {
    const data = storage.getString(KEYS.VITALS);
    return data ? JSON.parse(data) : null;
  },

  // Genome
  saveGenome: (genome: Genome) => {
    storage.set(KEYS.GENOME, JSON.stringify(genome));
  },
  loadGenome: (): Genome | null => {
    const data = storage.getString(KEYS.GENOME);
    return data ? JSON.parse(data) : null;
  },

  // Traits
  saveTraits: (traits: DerivedTraits) => {
    storage.set(KEYS.TRAITS, JSON.stringify(traits));
  },
  loadTraits: (): DerivedTraits | null => {
    const data = storage.getString(KEYS.TRAITS);
    return data ? JSON.parse(data) : null;
  },

  // Evolution
  saveEvolution: (evolution: EvolutionData) => {
    storage.set(KEYS.EVOLUTION, JSON.stringify(evolution));
  },
  loadEvolution: (): EvolutionData | null => {
    const data = storage.getString(KEYS.EVOLUTION);
    return data ? JSON.parse(data) : null;
  },

  // Achievements
  saveAchievements: (achievements: Achievement[]) => {
    storage.set(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },
  loadAchievements: (): Achievement[] => {
    const data = storage.getString(KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  },

  // Battle Stats
  saveBattleStats: (battle: BattleStats) => {
    storage.set(KEYS.BATTLE, JSON.stringify(battle));
  },
  loadBattleStats: (): BattleStats | null => {
    const data = storage.getString(KEYS.BATTLE);
    return data ? JSON.parse(data) : null;
  },

  // Mini Games
  saveMiniGameProgress: (miniGames: MiniGameProgress) => {
    storage.set(KEYS.MINI_GAMES, JSON.stringify(miniGames));
  },
  loadMiniGameProgress: (): MiniGameProgress | null => {
    const data = storage.getString(KEYS.MINI_GAMES);
    return data ? JSON.parse(data) : null;
  },

  // Vimana State
  saveVimanaState: (vimana: VimanaState) => {
    storage.set(KEYS.VIMANA, JSON.stringify(vimana));
  },
  loadVimanaState: (): VimanaState | null => {
    const data = storage.getString(KEYS.VIMANA);
    return data ? JSON.parse(data) : null;
  },

  // Last Update Time
  saveLastUpdate: (time: number) => {
    storage.set(KEYS.LAST_UPDATE, time);
  },
  loadLastUpdate: (): number => {
    return storage.getNumber(KEYS.LAST_UPDATE) ?? Date.now();
  },

  // Settings
  saveDarkMode: (enabled: boolean) => {
    storage.set(KEYS.DARK_MODE, enabled);
  },
  loadDarkMode: (): boolean => {
    return storage.getBoolean(KEYS.DARK_MODE) ?? true; // Default to dark mode
  },

  saveAudioEnabled: (enabled: boolean) => {
    storage.set(KEYS.AUDIO_ENABLED, enabled);
  },
  loadAudioEnabled: (): boolean => {
    return storage.getBoolean(KEYS.AUDIO_ENABLED) ?? true;
  },

  saveHapticsEnabled: (enabled: boolean) => {
    storage.set(KEYS.HAPTICS_ENABLED, enabled);
  },
  loadHapticsEnabled: (): boolean => {
    return storage.getBoolean(KEYS.HAPTICS_ENABLED) ?? true;
  },

  // Consent
  saveConsent: (consent: ConsentState) => {
    storage.set(KEYS.CONSENT, JSON.stringify(consent));
  },
  loadConsent: (): ConsentState | null => {
    const data = storage.getString(KEYS.CONSENT);
    return data ? JSON.parse(data) : null;
  },

  // Birth Chart
  saveBirthChart: (chart: BirthChart) => {
    // Serialize Date objects to ISO strings
    const serializable = {
      ...chart,
      birthTime: chart.birthTime.toISOString(),
    };
    storage.set(KEYS.BIRTH_CHART, JSON.stringify(serializable));
  },
  loadBirthChart: (): BirthChart | null => {
    const data = storage.getString(KEYS.BIRTH_CHART);
    if (!data) return null;
    const parsed = JSON.parse(data);
    // Deserialize Date objects
    return {
      ...parsed,
      birthTime: new Date(parsed.birthTime),
    };
  },

  // Horoscope
  saveHoroscope: (horoscope: DailyHoroscope) => {
    const serializable = {
      ...horoscope,
      date: horoscope.date.toISOString(),
    };
    storage.set(KEYS.HOROSCOPE, JSON.stringify(serializable));
  },
  loadHoroscope: (): DailyHoroscope | null => {
    const data = storage.getString(KEYS.HOROSCOPE);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      date: new Date(parsed.date),
    };
  },

  // GRS
  saveGRS: (grs: GRSResult) => {
    storage.set(KEYS.GRS, JSON.stringify(grs));
  },
  loadGRS: (): GRSResult | null => {
    const data = storage.getString(KEYS.GRS);
    return data ? JSON.parse(data) : null;
  },

  // Breeding Preview
  saveBreedingPreview: (preview: BreedingPreview) => {
    const serializable = {
      ...preview,
      breedTime: preview.breedTime.toISOString(),
    };
    storage.set(KEYS.BREEDING_PREVIEW, JSON.stringify(serializable));
  },
  loadBreedingPreview: (): BreedingPreview | null => {
    const data = storage.getString(KEYS.BREEDING_PREVIEW);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      breedTime: new Date(parsed.breedTime),
    };
  },

  // Clear all data
  clearAll: () => {
    storage.clearAll();
  },
};
