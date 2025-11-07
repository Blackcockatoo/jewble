/**
 * IndexedDB Persistence Layer
 *
 * Stores pet state, vitals, genome, and evolution data offline.
 */

import type { Vitals } from '@/lib/store';
import type { Genome, DerivedTraits, GenomeHash } from '@/lib/genome';
import type { EvolutionData } from '@/lib/evolution';
import type { HeptaDigits, PrimeTailId } from '@/lib/identity/types';

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
