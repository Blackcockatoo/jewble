/**
 * Persistence Utilities
 *
 * LocalStorage-based state management for Guardian data
 */

import type { GuardianSaveData } from '../types';

const STORAGE_KEY = 'auralia_guardian_state';

/**
 * Save Guardian state to localStorage
 */
export function saveGuardianState(data: GuardianSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save Guardian state:', error);
  }
}

/**
 * Load Guardian state from localStorage
 */
export function loadGuardianState(): GuardianSaveData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as GuardianSaveData) : null;
  } catch (error) {
    console.error('Failed to load Guardian state:', error);
    return null;
  }
}

/**
 * Clear Guardian state from localStorage
 */
export function clearGuardianState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Guardian state:', error);
  }
}

/**
 * Export Guardian state as JSON string
 */
export function exportGuardianState(data: GuardianSaveData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Import Guardian state from JSON string
 */
export function importGuardianState(json: string): GuardianSaveData | null {
  try {
    const data = JSON.parse(json) as GuardianSaveData;

    // Validate required fields
    if (
      !data.seedName ||
      typeof data.energy !== 'number' ||
      typeof data.curiosity !== 'number' ||
      typeof data.bond !== 'number' ||
      typeof data.health !== 'number'
    ) {
      throw new Error('Invalid Guardian state data');
    }

    return data;
  } catch (error) {
    console.error('Failed to import Guardian state:', error);
    return null;
  }
}

/**
 * Create a snapshot of current state
 */
export function createSnapshot(data: GuardianSaveData): GuardianSaveData {
  return {
    ...data,
    lastSaved: Date.now(),
  };
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
