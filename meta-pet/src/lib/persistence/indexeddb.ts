/**
 * IndexedDB Persistence Layer
 *
 * Stores pet state, vitals, genome, and evolution data offline.
 */

import type { Vitals } from '@/lib/store';
import type { Genome, DerivedTraits, GenomeHash } from '@/lib/genome';
import type { EvolutionData } from '@/lib/evolution';
import type {
  HeptaDigits,
  PrimeTailId,
  PrivacyPreset,
  Rotation,
  Vault,
} from '@/lib/identity/types';

const DB_NAME = 'MetaPetDB';
const DB_VERSION = 1;
const STORE_NAME = 'pets';

export interface PetSaveData {
  id: string; // pet ID from crest
  name?: string;
  vitals: Vitals;
  genome: Genome;
  genomeHash: GenomeHash;
  traits: DerivedTraits;
  evolution: EvolutionData;
  crest: PrimeTailId;
  heptaDigits: HeptaDigits;
  privacyPreset: PrivacyPreset;
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
      resolve(request.result || null);
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
      resolve(request.result || []);
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
  intervalMs = 60000 // 1 minute
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const data = getPetData();
      await savePet(data);
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
    traits: JSON.parse(JSON.stringify(data.traits)),
    crest: { ...data.crest, tail: [...data.crest.tail] as [number, number, number, number] },
    heptaDigits: Array.from(data.heptaDigits) as HeptaDigits,
    privacyPreset: data.privacyPreset,
  };

  return JSON.stringify(safeData, null, 2);
}

export function importPetFromJSON(json: string): PetSaveData {
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

  const privacyPreset = isValidPrivacyPreset(parsed.privacyPreset)
    ? parsed.privacyPreset
    : 'standard';

  const createdAt = typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now();
  const lastSaved = typeof parsed.lastSaved === 'number' ? parsed.lastSaved : Date.now();

  return {
    id: parsed.id,
    name: typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name.trim() : undefined,
    vitals: parsed.vitals,
    genome: parsed.genome,
    genomeHash: parsed.genomeHash,
    traits: parsed.traits as DerivedTraits,
    evolution: parsed.evolution,
    crest: parsed.crest,
    heptaDigits: Object.freeze([...parsed.heptaDigits]) as HeptaDigits,
    privacyPreset,
    createdAt,
    lastSaved,
  };
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
    typeof evo.totalInteractions === 'number' &&
    typeof evo.canEvolve === 'boolean'
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

function isValidPrivacyPreset(value: unknown): value is PrivacyPreset {
  return value === 'stealth' || value === 'standard' || value === 'radiant';
}
