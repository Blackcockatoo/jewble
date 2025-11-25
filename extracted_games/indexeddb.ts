/**
 * IndexedDB Persistence Layer
 *
 * Stores pet state, vitals, genome, and evolution data offline.
 */

import type { PetType, Vitals, MirrorModeState } from '@/lib/store';
import type { Genome, DerivedTraits, GenomeHash } from '@/lib/genome';
import type { EvolutionData } from '@/lib/evolution';
import type { HeptaDigits, PrimeTailId, Rotation, Vault } from '@/lib/identity/types';
import {
  type Achievement,
  type BattleStats,
  type MiniGameProgress,
  type VimanaState,
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
} from '@/lib/progression/types';

const DB_NAME = 'MetaPetDB';
const DB_VERSION = 1;
const STORE_NAME = 'pets';
const VIMANA_FIELDS = ['calm', 'neuro', 'quantum', 'earth'] as const;
const VIMANA_REWARDS = ['mood', 'energy', 'hygiene', 'mystery'] as const;

export interface PetSaveData {
  id: string; // pet ID from crest
  name?: string;
  vitals: Vitals;
  petType: PetType;
  mirrorMode: MirrorModeState;
  genome: Genome;
  genomeHash: GenomeHash;
  traits: DerivedTraits;
  evolution: EvolutionData;
  achievements: Achievement[];
  battle: BattleStats;
  miniGames: MiniGameProgress;
  vimana: VimanaState;
  crest: PrimeTailId;
  heptaDigits: HeptaDigits;
  lastSaved: number;
  createdAt: number;
}

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('lastSaved', 'lastSaved', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Save pet data
 */
export async function savePet(data: PetSaveData): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const saveData = {
      ...data,
      genome: {
        red60: [...data.genome.red60],
        blue60: [...data.genome.blue60],
        black60: [...data.genome.black60],
      },
      achievements: data.achievements.map(entry => ({ ...entry })),
      battle: { ...data.battle },
      miniGames: { ...data.miniGames },
      vimana: cloneVimana(data.vimana),
      mirrorMode: { ...data.mirrorMode },
      heptaDigits: Array.from(data.heptaDigits) as HeptaDigits,
      lastSaved: Date.now(),
    };

    const request = store.put(saveData);

    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Load pet data by ID
 */
export async function loadPet(id: string): Promise<PetSaveData | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      db.close();
      const raw = request.result;
      resolve(raw ? normalizePetData(raw) : null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Get all pets
 */
export async function getAllPets(): Promise<PetSaveData[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      db.close();
      const raw = request.result;
      const items = Array.isArray(raw) ? raw : [];
      resolve(items.map(item => normalizePetData(item)));
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Delete pet data
 */
export async function deletePet(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      db.close();
      resolve();
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

/**
 * Auto-save interval helper
 */
export function setupAutoSave(
  getPetData: () => PetSaveData,
  intervalMs = 60000, // 1 minute
  persist: (data: PetSaveData) => Promise<void> | void = savePet
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const data = getPetData();
      await persist(data);
      console.log('[AutoSave] Pet data saved', new Date().toISOString());
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error);
    }
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

export function exportPetToJSON(data: PetSaveData): string {
  const safeData: PetSaveData = {
    ...data,
    name: data.name?.trim() || undefined,
    genome: {
      red60: [...data.genome.red60],
      blue60: [...data.genome.blue60],
      black60: [...data.genome.black60],
    },
    achievements: data.achievements.map(entry => ({ ...entry })),
    battle: { ...data.battle },
    miniGames: { ...data.miniGames },
    vimana: cloneVimana(data.vimana),
    mirrorMode: { ...data.mirrorMode },
    traits: JSON.parse(JSON.stringify(data.traits)),
    crest: { ...data.crest, tail: [...data.crest.tail] as [number, number, number, number] },
    heptaDigits: Array.from(data.heptaDigits) as HeptaDigits,
  };

  return JSON.stringify(safeData, null, 2);
}

export function importPetFromJSON(json: string, options?: { skipGenomeValidation?: boolean }): PetSaveData {
  const parsed = JSON.parse(json) as Partial<PetSaveData> | null;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid pet file: expected JSON object');
  }

  if (typeof parsed.id !== 'string' || parsed.id.trim() === '') {
    throw new Error('Invalid pet file: missing id');
  }

  if (!isValidVitals(parsed.vitals)) {
    throw new Error('Invalid pet file: vitals are malformed');
  }

  if (!isValidGenome(parsed.genome)) {
    throw new Error('Invalid pet file: genome is malformed');
  }

  // If genome validation was skipped, provide a default empty genome
  const genome: Genome = options?.skipGenomeValidation && !isValidGenome(parsed.genome)
    ? { red60: Array(60).fill(0), blue60: Array(60).fill(0), black60: Array(60).fill(0) }
    : parsed.genome!;

  // PetType validation and default
  const petType: PetType = (() => {
    if (parsed.petType && ['organic', 'geometric', 'hybrid'].includes(parsed.petType)) {
      return parsed.petType as PetType;
    }
    return 'geometric'; // Default to geometric if not specified
  })();

  if (!parsed.genomeHash || !isValidGenomeHash(parsed.genomeHash)) {
    throw new Error('Invalid pet file: genome hashes are malformed');
  }

  if (!parsed.traits || typeof parsed.traits !== 'object') {
    throw new Error('Invalid pet file: traits missing');
  }

  if (!isValidEvolution(parsed.evolution)) {
    throw new Error('Invalid pet file: evolution data is malformed');
  }

  if (!isValidCrest(parsed.crest)) {
    throw new Error('Invalid pet file: crest data is malformed');
  }

  if (!isValidHeptaDigits(parsed.heptaDigits)) {
    throw new Error('Invalid pet file: HeptaCode digits malformed');
  }

  const achievements = (() => {
    if (parsed.achievements === undefined) return [] as Achievement[];
    if (isValidAchievements(parsed.achievements)) {
      return parsed.achievements.map(entry => ({ ...entry }));
    }
    throw new Error('Invalid pet file: achievements malformed');
  })();

  const battle = (() => {
    if (parsed.battle === undefined) return createDefaultBattleStats();
    if (isValidBattleStats(parsed.battle)) {
      return { ...parsed.battle };
    }
    throw new Error('Invalid pet file: battle stats malformed');
  })();

  const miniGames = (() => {
    if (parsed.miniGames === undefined) return createDefaultMiniGameProgress();
    if (isValidMiniGameProgress(parsed.miniGames)) {
      return { ...parsed.miniGames };
    }
    throw new Error('Invalid pet file: mini-game progress malformed');
  })();

  const vimana = (() => {
    if (parsed.vimana === undefined) return createDefaultVimanaState();
    if (isValidVimanaState(parsed.vimana)) {
      return cloneVimana(parsed.vimana);
    }
    throw new Error('Invalid pet file: vimana state malformed');
  })();

  const mirrorMode = (() => {
    if (parsed.mirrorMode === undefined) return createDefaultMirrorMode();
    if (isValidMirrorMode(parsed.mirrorMode)) {
      return { ...parsed.mirrorMode };
    }
    throw new Error('Invalid pet file: mirror mode malformed');
  })();

  const createdAt = typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now();
  const lastSaved = typeof parsed.lastSaved === 'number' ? parsed.lastSaved : Date.now();

  return {
    id: parsed.id,
    name: typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name.trim() : undefined,
    vitals: parsed.vitals,
    petType,
    genome,
    genomeHash: parsed.genomeHash,
    traits: parsed.traits as DerivedTraits,
    evolution: parsed.evolution,
    achievements,
    battle,
    miniGames,
    vimana,
    mirrorMode,
    crest: parsed.crest,
    heptaDigits: Object.freeze([...parsed.heptaDigits]) as HeptaDigits,
    createdAt,
    lastSaved,
  };
}

function cloneVimana(value: VimanaState): VimanaState {
  return {
    ...value,
    cells: value.cells.map(cell => ({ ...cell })),
  };
}

function normalizePetData(raw: unknown): PetSaveData {
  const base = raw && typeof raw === 'object' ? raw : {};

  const typed = base as Partial<PetSaveData>;

  const achievements = isValidAchievements(typed.achievements)
    ? typed.achievements.map(entry => ({ ...entry }))
    : [];
  const battle = isValidBattleStats(typed.battle)
    ? { ...typed.battle }
    : createDefaultBattleStats();
  const miniGames = isValidMiniGameProgress(typed.miniGames)
    ? { ...typed.miniGames }
    : createDefaultMiniGameProgress();
  const vimana = isValidVimanaState(typed.vimana)
    ? cloneVimana(typed.vimana)
    : createDefaultVimanaState();
  const mirrorMode = isValidMirrorMode(typed.mirrorMode)
    ? { ...typed.mirrorMode }
    : createDefaultMirrorMode();

  return {
    ...(typed as PetSaveData),
    achievements,
    battle,
    miniGames,
    vimana,
    mirrorMode,
    petType: isValidPetType(typed.petType) ? typed.petType : 'geometric',
  } as PetSaveData;
}

function isValidVitals(value: unknown): value is Vitals {
  if (!value || typeof value !== 'object') return false;
  const vitals = value as Vitals;
  return ['hunger', 'hygiene', 'mood', 'energy'].every(key => {
    const num = vitals[key as keyof Vitals];
    return typeof num === 'number' && Number.isFinite(num);
  });
}

function isValidGenome(value: unknown): value is Genome {
  if (!value || typeof value !== 'object') return false;
  const genome = value as Genome;
  return (
    isBase7Array(genome.red60, 60) &&
    isBase7Array(genome.blue60, 60) &&
    isBase7Array(genome.black60, 60)
  );
}

function isValidGenomeHash(value: unknown): value is GenomeHash {
  if (!value || typeof value !== 'object') return false;
  const hash = value as GenomeHash;
  return (
    typeof hash.redHash === 'string' &&
    typeof hash.blueHash === 'string' &&
    typeof hash.blackHash === 'string'
  );
}

function isValidPetType(value: unknown): value is PetType {
  return value === 'geometric' || value === 'auralia';
}

function isBase7Array(value: unknown, expectedLength: number): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === expectedLength &&
    value.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 7)
  );
}

function isValidEvolution(value: unknown): value is EvolutionData {
  if (!value || typeof value !== 'object') return false;
  const evo = value as EvolutionData;
  return (
    typeof evo.state === 'string' &&
    typeof evo.birthTime === 'number' &&
    typeof evo.lastEvolutionTime === 'number' &&
    typeof evo.experience === 'number' &&
    typeof evo.level === 'number' &&
    typeof evo.currentLevelXp === 'number' &&
    typeof evo.totalXp === 'number' &&
    typeof evo.totalInteractions === 'number' &&
    typeof evo.canEvolve === 'boolean'
  );
}

function isValidAchievements(value: unknown): value is Achievement[] {
  return (
    Array.isArray(value) &&
    value.every(entry => {
      if (!entry || typeof entry !== 'object') return false;
      const achievement = entry as Achievement;
      const earnedAt = achievement.earnedAt;
      return (
        typeof achievement.id === 'string' &&
        typeof achievement.title === 'string' &&
        typeof achievement.description === 'string' &&
        (earnedAt === undefined || typeof earnedAt === 'number')
      );
    })
  );
}

function isValidBattleStats(value: unknown): value is BattleStats {
  if (!value || typeof value !== 'object') return false;
  const stats = value as BattleStats;
  const lastResultValid = stats.lastResult === null || stats.lastResult === 'win' || stats.lastResult === 'loss';
  const lastOpponentValid = stats.lastOpponent === null || typeof stats.lastOpponent === 'string';
  return (
    typeof stats.wins === 'number' &&
    typeof stats.losses === 'number' &&
    typeof stats.streak === 'number' &&
    lastResultValid &&
    lastOpponentValid &&
    typeof stats.energyShield === 'number'
  );
}

function isValidMiniGameProgress(value: unknown): value is MiniGameProgress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as MiniGameProgress;
  const lastPlayedValid = progress.lastPlayedAt === null || typeof progress.lastPlayedAt === 'number';
  const numericFields = [
    progress.memoryHighScore,
    progress.rhythmHighScore,
    progress.focusStreak,
    progress.vimanaHighScore,
    progress.vimanaMaxLines,
    progress.vimanaMaxLevel,
    progress.vimanaLastScore,
    progress.vimanaLastLines,
    progress.vimanaLastLevel,
  ];
  const statsValid = numericFields.every(
    field => typeof field === 'number' && Number.isFinite(field)
  );

  return statsValid && lastPlayedValid;
}

function isValidVimanaState(value: unknown): value is VimanaState {
  if (!value || typeof value !== 'object') return false;
  const state = value as VimanaState;
  const lastScanValid = state.lastScanAt === null || typeof state.lastScanAt === 'number';
  return (
    Array.isArray(state.cells) &&
    state.cells.every(isValidVimanaCell) &&
    typeof state.activeCellId === 'string' &&
    typeof state.anomaliesFound === 'number' &&
    typeof state.anomaliesResolved === 'number' &&
    typeof state.scansPerformed === 'number' &&
    lastScanValid
  );
}

function isValidVimanaCell(value: unknown): value is VimanaState['cells'][number] {
  if (!value || typeof value !== 'object') return false;
  const cell = value as VimanaState['cells'][number];
  const fieldValid = VIMANA_FIELDS.includes(cell.field as (typeof VIMANA_FIELDS)[number]);
  const rewardValid = VIMANA_REWARDS.includes(cell.reward as (typeof VIMANA_REWARDS)[number]);
  return (
    typeof cell.id === 'string' &&
    typeof cell.label === 'string' &&
    typeof cell.field === 'string' &&
    fieldValid &&
    typeof cell.discovered === 'boolean' &&
    typeof cell.anomaly === 'boolean' &&
    typeof cell.energy === 'number' &&
    typeof cell.reward === 'string' &&
    rewardValid &&
    (cell.visitedAt === undefined || typeof cell.visitedAt === 'number')
  );
}

function isValidCrest(value: unknown): value is PrimeTailId {
  if (!value || typeof value !== 'object') return false;
  const crest = value as PrimeTailId & { tail: number[] };
  const vaults: Vault[] = ['red', 'blue', 'black'];
  const rotations: Rotation[] = ['CW', 'CCW'];

  return (
    typeof crest.vault === 'string' &&
    vaults.includes(crest.vault as Vault) &&
    typeof crest.rotation === 'string' &&
    rotations.includes(crest.rotation as Rotation) &&
    Array.isArray(crest.tail) &&
    crest.tail.length === 4 &&
    crest.tail.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 60) &&
    typeof crest.coronatedAt === 'number' &&
    typeof crest.dnaHash === 'string' &&
    typeof crest.mirrorHash === 'string' &&
    typeof crest.signature === 'string'
  );
}

function isValidHeptaDigits(value: unknown): value is HeptaDigits {
  return (
    Array.isArray(value) &&
    value.length === 42 &&
    value.every(v => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 7)
  );
}

function isValidMirrorMode(value: unknown): value is MirrorModeState {
  if (!value || typeof value !== 'object') return false;
  const mirror = value as MirrorModeState;
  const phaseOk =
    mirror.phase === 'idle' ||
    mirror.phase === 'entering' ||
    mirror.phase === 'crossed' ||
    mirror.phase === 'returning';
  const presetOk =
    mirror.preset === null ||
    mirror.preset === 'stealth' ||
    mirror.preset === 'standard' ||
    mirror.preset === 'radiant';

  const reflectionOk =
    mirror.lastReflection === null ||
    (typeof mirror.lastReflection === 'object' &&
      mirror.lastReflection !== null &&
      typeof mirror.lastReflection.id === 'string' &&
      (mirror.lastReflection.outcome === 'anchor' || mirror.lastReflection.outcome === 'drift') &&
      typeof mirror.lastReflection.moodDelta === 'number' &&
      typeof mirror.lastReflection.energyDelta === 'number' &&
      typeof mirror.lastReflection.timestamp === 'number' &&
      (mirror.lastReflection.note === undefined || typeof mirror.lastReflection.note === 'string') &&
      (mirror.lastReflection.preset === 'stealth' ||
        mirror.lastReflection.preset === 'standard' ||
        mirror.lastReflection.preset === 'radiant'));

  return (
    phaseOk &&
    presetOk &&
    (mirror.startedAt === null || typeof mirror.startedAt === 'number') &&
    (mirror.consentExpiresAt === null || typeof mirror.consentExpiresAt === 'number') &&
    (mirror.presenceToken === null || typeof mirror.presenceToken === 'string') &&
    reflectionOk
  );
}

function createDefaultMirrorMode(): MirrorModeState {
  return {
    phase: 'idle',
    startedAt: null,
    consentExpiresAt: null,
    preset: null,
    presenceToken: null,
    lastReflection: null,
  };
}
