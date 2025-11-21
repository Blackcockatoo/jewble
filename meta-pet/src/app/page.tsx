'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useStore } from '@/lib/store';
import type { PetType } from '@metapet/core/store';
import { HUD } from '@/components/HUD';
import { AuraliaMetaPet } from '@/components/AuraliaMetaPet';
import { Button } from '@/components/ui/button';
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';
import { heptaEncode42 } from '@/lib/identity/hepta';
import { encodeGenome, decodeGenome, hashGenome, type Genome, type GenomeHash } from '@/lib/genome';
import type { PrimeTailId, HeptaDigits, Rotation, Vault } from '@/lib/identity/types';
import {
  savePet,
  loadPet,
  getAllPets,
  deletePet,
  setupAutoSave,
  exportPetToJSON,
  importPetFromJSON,
  type PetSaveData,
} from '@/lib/persistence/indexeddb';
import {
  breedPets,
  predictOffspring,
  calculateSimilarity,
  canBreed,
  type BreedingResult,
} from '@/lib/breeding';
import { initializeEvolution } from '@/lib/evolution';
import {
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
} from '@/lib/progression/types';
import { PetResponseOverlay } from '@/components/PetResponseOverlay';

interface PetSummary {
  id: string;
  name?: string;
  createdAt: number;
  lastSaved: number;
}

const DNA_CHARS = ['A', 'C', 'G', 'T'] as const;

function randomDNA(length: number): string {
  const values = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(values, value => DNA_CHARS[value % DNA_CHARS.length]).join('');
}

function randomTail(): [number, number, number, number] {
  const values = new Uint8Array(4);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < values.length; i++) {
      values[i] = Math.floor(Math.random() * 256);
    }
  }
  return [values[0] % 60, values[1] % 60, values[2] % 60, values[3] % 60];
}

function slugify(value: string | undefined, fallback: string): string {
  const base = value && value.trim() !== '' ? value.trim().toLowerCase() : fallback;
  return base
    .replace(/[^a-z0-9\-\s]/g, '')
    .replace(/\s+/g, '-');
}

function createDebouncedSave(delay: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let latest: PetSaveData | null = null;
  let pending: Array<{ resolve: () => void; reject: (error: unknown) => void }> = [];

  const flush = async () => {
    const snapshot = latest;
    const listeners = pending;
    pending = [];
    latest = null;

    if (!snapshot) {
      listeners.forEach(listener => listener.resolve());
      return;
    }

    try {
      await savePet(snapshot);
      listeners.forEach(listener => listener.resolve());
    } catch (error) {
      listeners.forEach(listener => listener.reject(error));
      throw error;
    }
  };

  return (data: PetSaveData) =>
    new Promise<void>((resolve, reject) => {
      latest = data;
      pending.push({ resolve, reject });

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        timeout = null;
        flush().catch(err => {
          console.warn('Debounced save flush failed:', err);
        });
      }, delay);
    });
}

const PET_ID = 'metapet-primary';

export default function Home() {
  const startTick = useStore(s => s.startTick);
  const stopTick = useStore(s => s.stopTick);
  const setGenome = useStore(s => s.setGenome);
  const hydrate = useStore(s => s.hydrate);
  const petType = useStore(s => s.petType);
  const setPetType = useStore(s => s.setPetType);
  const genome = useStore(s => s.genome);
  const traits = useStore(s => s.traits);
  const evolution = useStore(s => s.evolution);
  const [crest, setCrest] = useState<PrimeTailId | null>(null);
  const [heptaCode, setHeptaCode] = useState<HeptaDigits | null>(null);
  const [loading, setLoading] = useState(true);
  const [genomeHash, setGenomeHash] = useState<GenomeHash | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [persistenceActive, setPersistenceActive] = useState(false);
  const [persistenceSupported, setPersistenceSupported] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [petSummaries, setPetSummaries] = useState<PetSummary[]>([]);
  const [currentPetId, setCurrentPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [breedingMode, setBreedingMode] = useState<'BALANCED' | 'DOMINANT' | 'MUTATION'>('BALANCED');
  const [breedingPartnerId, setBreedingPartnerId] = useState('');
  const [breedingPreview, setBreedingPreview] = useState<{
    possibleTraits: string[];
    confidence: number;
    similarity: number;
    partnerName?: string;
    partnerStage?: string;
  } | null>(null);
  const [breedingResult, setBreedingResult] = useState<BreedingResult | null>(null);
  const [breedingPartner, setBreedingPartner] = useState<PetSaveData | null>(null);
  const [offspringSummary, setOffspringSummary] = useState<PetSummary | null>(null);
  const [breedingError, setBreedingError] = useState<string | null>(null);
  const [breedingBusy, setBreedingBusy] = useState(false);

  const debouncedSave = useMemo(() => createDebouncedSave(1_000), []);

  const crestRef = useRef<PrimeTailId | null>(null);
  const heptaRef = useRef<HeptaDigits | null>(null);
  const genomeHashRef = useRef<GenomeHash | null>(null);
  const createdAtRef = useRef<number | null>(null);
  const petIdRef = useRef<string | null>(null);
  const petNameRef = useRef<string>('');
  const hmacKeyRef = useRef<CryptoKey | null>(null);
  const persistenceSupportedRef = useRef(false);
  const autoSaveCleanupRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const genomeToDna = useCallback((value: Genome): string => {
    const alphabet = ['A', 'C', 'G', 'T'];
    const flatten = [...value.red60, ...value.blue60, ...value.black60];
    return flatten
      .map(gene => {
        const safe = Number.isFinite(gene) ? Math.abs(Math.round(gene)) : 0;
        return alphabet[safe % alphabet.length];
      })
      .join('');
  }, []);

  const deriveTailFromLineage = useCallback((seed: string): [number, number, number, number] => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash ^ seed.charCodeAt(i)) * 16777619;
      hash >>>= 0;
    }

    const next = () => {
      hash ^= hash << 13;
      hash ^= hash >>> 17;
      hash ^= hash << 5;
      hash >>>= 0;
      return hash % 60;
    };

    return [next(), next(), next(), next()];
  }, []);

  const buildOffspringName = useCallback(
    (lineageKey: string, partnerName?: string | null) => {
      const left = (petNameRef.current || 'ORIGIN').slice(0, 4).toUpperCase();
      const right = (partnerName && partnerName.trim() !== '' ? partnerName : 'ALLY')
        .slice(0, 4)
        .toUpperCase();
      return `${left}-${right}-${lineageKey.slice(0, 4).toUpperCase()}`;
    },
    []
  );

  useEffect(() => {
    crestRef.current = crest;
  }, [crest]);

  useEffect(() => {
    heptaRef.current = heptaCode;
  }, [heptaCode]);

  useEffect(() => {
    genomeHashRef.current = genomeHash;
  }, [genomeHash]);

  useEffect(() => {
    createdAtRef.current = createdAt;
  }, [createdAt]);

  useEffect(() => {
    petNameRef.current = petName.trim();
  }, [petName]);

  useEffect(() => {
    return () => {
      if (autoSaveCleanupRef.current) {
        autoSaveCleanupRef.current();
        autoSaveCleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const previewPartner = async () => {
      if (!breedingPartnerId || !persistenceSupportedRef.current) {
        setBreedingPartner(null);
        setBreedingPreview(null);
        return;
      }

      try {
        const partner = await loadPet(breedingPartnerId);
        if (cancelled) return;
        setBreedingPartner(partner);

        if (!partner || !genome) {
          setBreedingPreview(null);
          return;
        }

        const similarity = calculateSimilarity(genome, partner.genome);
        const prediction = predictOffspring(genome, partner.genome);
        setBreedingPreview({
          possibleTraits: prediction.possibleTraits,
          confidence: prediction.confidence,
          similarity,
          partnerName: partner.name,
          partnerStage: partner.evolution.state,
        });
        setBreedingError(null);
      } catch (error) {
        console.warn('Failed to load partner pet for breeding preview:', error);
        if (!cancelled) {
          setBreedingPartner(null);
          setBreedingPreview(null);
          setBreedingError('Unable to load partner data for breeding.');
        }
      }
    };

    void previewPartner();
    return () => {
      cancelled = true;
    };
  }, [breedingPartnerId, genome]);

  const buildSnapshot = useCallback((): PetSaveData => {
    const state = useStore.getState();

    if (!petIdRef.current) {
      throw new Error('No active pet id');
    }
    if (!state.genome || !state.traits) {
      throw new Error('Genome not initialized');
    }
    if (!crestRef.current || !heptaRef.current || !genomeHashRef.current) {
      throw new Error('Identity not initialized');
    }

    return {
      id: petIdRef.current,
      name: petNameRef.current || undefined,
      vitals: state.vitals,
      petType: state.petType,
      mirrorMode: state.mirrorMode,
      genome: state.genome,
      genomeHash: genomeHashRef.current,
      traits: state.traits,
      evolution: state.evolution,
      achievements: state.achievements.map(entry => ({ ...entry })),
      battle: { ...state.battle },
      miniGames: { ...state.miniGames },
      vimana: {
        ...state.vimana,
        cells: state.vimana.cells.map(cell => ({ ...cell })),
      },
      crest: crestRef.current,
      heptaDigits: Array.from(heptaRef.current) as HeptaDigits,
      createdAt: createdAtRef.current ?? Date.now(),
      lastSaved: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof indexedDB === 'undefined') return;

    const handleBeforeUnload = () => {
      try {
        const state = useStore.getState();
        if (!state.genome || !state.traits) return;
        if (!crestRef.current || !heptaRef.current || !genomeHashRef.current) return;

        const snapshot: PetSaveData = {
          id: PET_ID,
          vitals: state.vitals,
          petType: state.petType,
          mirrorMode: state.mirrorMode,
          genome: state.genome,
          genomeHash: genomeHashRef.current,
          traits: state.traits,
          evolution: state.evolution,
          achievements: state.achievements.map(entry => ({ ...entry })),
          battle: { ...state.battle },
          miniGames: { ...state.miniGames },
          vimana: {
            ...state.vimana,
            cells: state.vimana.cells.map(cell => ({ ...cell })),
          },
          crest: crestRef.current,
          heptaDigits: Array.from(heptaRef.current) as HeptaDigits,
          lastSaved: Date.now(),
          createdAt: createdAtRef.current ?? Date.now(),
        };

        void savePet(snapshot);
      } catch (error) {
        console.warn('Failed to persist pet on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [buildSnapshot]);

  const refreshPetSummaries = useCallback(async () => {
    if (!persistenceSupportedRef.current) {
      setPetSummaries([]);
      return;
    }

    try {
      const pets = await getAllPets();
      const summaries = pets
        .map<PetSummary>(pet => ({
          id: pet.id,
          name: pet.name,
          createdAt: pet.createdAt,
          lastSaved: pet.lastSaved,
        }))
        .sort((a, b) => b.lastSaved - a.lastSaved);
      setPetSummaries(summaries);
    } catch (error) {
      console.warn('Failed to load pet archive list:', error);
      setPetSummaries([]);
    }
  }, []);

  const applyPetData = useCallback((pet: PetSaveData) => {
    hydrate({
      vitals: { ...pet.vitals },
      genome: {
        red60: [...pet.genome.red60],
        blue60: [...pet.genome.blue60],
        black60: [...pet.genome.black60],
      },
      traits: pet.traits,
      evolution: { ...pet.evolution },
      achievements: pet.achievements?.map(entry => ({ ...entry })) ?? [],
      battle: pet.battle ? { ...pet.battle } : createDefaultBattleStats(),
      miniGames: pet.miniGames ? { ...pet.miniGames } : createDefaultMiniGameProgress(),
      vimana: pet.vimana
        ? {
            ...pet.vimana,
            cells: pet.vimana.cells.map(cell => ({ ...cell })),
          }
        : createDefaultVimanaState(),
      petType: pet.petType,
      mirrorMode: pet.mirrorMode,
    });

    const digits = Object.freeze([...pet.heptaDigits]) as HeptaDigits;

    setCrest(pet.crest);
    setHeptaCode(digits);
    setGenomeHash(pet.genomeHash);
    setCreatedAt(pet.createdAt);
    setPetName(pet.name ?? '');
    setCurrentPetId(pet.id);

    crestRef.current = pet.crest;
    heptaRef.current = digits;
    genomeHashRef.current = pet.genomeHash;
    createdAtRef.current = pet.createdAt;
    petIdRef.current = pet.id;
    petNameRef.current = pet.name?.trim() ?? '';
  }, [hydrate]);

  const activateAutoSave = useCallback(() => {
    if (!persistenceSupportedRef.current) {
      setPersistenceActive(false);
      return;
    }

    if (autoSaveCleanupRef.current) {
      autoSaveCleanupRef.current();
      autoSaveCleanupRef.current = null;
    }

    try {
      const cleanup = setupAutoSave(() => buildSnapshot(), 60_000, debouncedSave);
      autoSaveCleanupRef.current = cleanup;
      setPersistenceActive(true);
    } catch (error) {
      console.warn('Failed to start autosave:', error);
      setPersistenceActive(false);
    }
  }, [buildSnapshot, debouncedSave]);

  const createFreshPet = useCallback(async (): Promise<PetSaveData> => {
    const ensureKey = async () => {
      if (hmacKeyRef.current) return hmacKeyRef.current;
      const key = await getDeviceHmacKey();
      hmacKeyRef.current = key;
      return key;
    };

    const hmacKey = await ensureKey();
    const primeDNA = randomDNA(64);
    const tailDNA = randomDNA(64);
    const tail = randomTail();
    const rotation = Math.random() > 0.5 ? 'CW' : 'CCW';

    const genome = await encodeGenome(primeDNA, tailDNA);
    const traits = decodeGenome(genome);
    const genomeHashValue = await hashGenome(genome);

    const crestValue = await mintPrimeTailId({
      dna: primeDNA,
      vault: 'blue',
      rotation,
      tail,
      hmacKey,
    });

    const minutes = Math.floor(Date.now() / 60000) % 8192;
    const heptaDigits = await heptaEncode42(
      {
        version: 1,
        preset: 'standard',
        vault: crestValue.vault,
        rotation: crestValue.rotation,
        tail,
        epoch13: minutes,
        nonce14: Math.floor(Math.random() * 16384),
      },
      hmacKey
    );

    const created = Date.now();

    return {
      id: `pet-${crestValue.signature.slice(0, 12)}`,
      name: undefined,
      vitals: {
        hunger: 30,
        hygiene: 70,
        mood: 60,
        energy: 80,
      },
      petType: 'geometric',
      mirrorMode: {
        phase: 'idle',
        startedAt: null,
        consentExpiresAt: null,
        preset: null,
        presenceToken: null,
        lastReflection: null,
      },
      genome,
      genomeHash: genomeHashValue,
      traits,
      evolution: initializeEvolution(),
      achievements: [],
      battle: createDefaultBattleStats(),
      miniGames: createDefaultMiniGameProgress(),
      vimana: createDefaultVimanaState(),
      crest: crestValue,
      heptaDigits: Object.freeze([...heptaDigits]) as HeptaDigits,
      createdAt: created,
      lastSaved: created,
    };
  }, []);

  const createOffspringFromResult = useCallback(
    async (result: BreedingResult, partnerName?: string | null): Promise<PetSaveData> => {
      if (!result.offspring) {
        throw new Error('Missing offspring genome');
      }

      const hmacKey = await getDeviceHmacKey();
      const tail = deriveTailFromLineage(result.lineageKey);
      const rotation: Rotation = result.lineageKey.charCodeAt(0) % 2 === 0 ? 'CW' : 'CCW';
      const vault: Vault = crestRef.current?.vault ?? 'blue';
      const dna = genomeToDna(result.offspring);
      const crestValue = await mintPrimeTailId({
        dna,
        vault,
        rotation,
        tail,
        hmacKey,
      });

      const minutes = Math.floor(Date.now() / 60000) % 8192;
      const heptaDigits = await heptaEncode42(
        {
          version: 1,
          preset: 'standard',
          vault: crestValue.vault,
          rotation: crestValue.rotation,
          tail,
          epoch13: minutes,
          nonce14: Math.floor(Math.random() * 16384),
        },
        hmacKey
      );

      const now = Date.now();
      const genomeHashValue = await hashGenome(result.offspring);

      return {
        id: `pet-${crestValue.signature.slice(0, 12)}`,
        name: buildOffspringName(result.lineageKey, partnerName),
        vitals: {
          hunger: 40,
          hygiene: 70,
          mood: 70,
          energy: 75,
        },
        petType: 'geometric',
        mirrorMode: {
          phase: 'idle',
          startedAt: null,
          consentExpiresAt: null,
          preset: null,
          presenceToken: null,
          lastReflection: null,
        },
        genome: result.offspring,
        genomeHash: genomeHashValue,
        traits: result.traits,
        evolution: initializeEvolution(),
        achievements: [],
        battle: createDefaultBattleStats(),
        miniGames: createDefaultMiniGameProgress(),
        vimana: createDefaultVimanaState(),
        crest: crestValue,
        heptaDigits: Object.freeze([...heptaDigits]) as HeptaDigits,
        createdAt: now,
        lastSaved: now,
      };
    },
    [buildOffspringName, deriveTailFromLineage, genomeToDna]
  );

  const handleBreedWithPartner = useCallback(async () => {
    setBreedingError(null);
    setBreedingResult(null);
    setOffspringSummary(null);

    if (!persistenceSupportedRef.current) {
      setBreedingError('Breeding requires offline archives so offspring can be saved.');
      return;
    }

    if (!genome || !traits || !evolution) {
      setBreedingError('Active companion is not initialized. Try loading or creating a pet first.');
      return;
    }

    if (!breedingPartner || !breedingPartnerId) {
      setBreedingError('Select a partner from your saved companions to begin breeding.');
      return;
    }

    if (!canBreed(evolution.state, breedingPartner.evolution.state)) {
      setBreedingError('Both companions must reach SPECIATION before they can breed.');
      return;
    }

    setBreedingBusy(true);

    try {
      const result = breedPets(genome, breedingPartner.genome, breedingMode);
      const offspring = await createOffspringFromResult(result, breedingPartner.name);
      await savePet(offspring);
      await refreshPetSummaries();

      setBreedingResult(result);
      setOffspringSummary({
        id: offspring.id,
        name: offspring.name,
        createdAt: offspring.createdAt,
        lastSaved: offspring.lastSaved,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Breeding attempt failed. Please try again.';
      setBreedingError(message);
    } finally {
      setBreedingBusy(false);
    }
  }, [
    breedingMode,
    breedingPartner,
    breedingPartnerId,
    createOffspringFromResult,
    evolution,
    genome,
    refreshPetSummaries,
    traits,
  ]);

  const initializeIdentity = useCallback(async () => {
    try {
      const hmacKey = await getDeviceHmacKey();
      hmacKeyRef.current = hmacKey;

      const supported = typeof indexedDB !== 'undefined';
      persistenceSupportedRef.current = supported;
      setPersistenceSupported(supported);

      let activePet: PetSaveData | null = null;

      if (supported) {
        try {
          const pets = await getAllPets();
          const sorted = [...pets].sort((a, b) => b.lastSaved - a.lastSaved);
          if (sorted.length > 0) {
            activePet = sorted[0];
          }
          const summaries = sorted.map<PetSummary>(pet => ({
            id: pet.id,
            name: pet.name,
            createdAt: pet.createdAt,
            lastSaved: pet.lastSaved,
          }));
          setPetSummaries(summaries);
        } catch (error) {
          console.warn('Failed to load existing pet save:', error);
          setPetSummaries([]);
        }
      }

      if (!activePet) {
        const freshPet = await createFreshPet();
        activePet = freshPet;
        if (supported) {
          try {
            await savePet(freshPet);
          } catch (error) {
            console.warn('Failed to persist initial pet snapshot:', error);
          }
        }
      }

      if (activePet) {
        applyPetData(activePet);
      }

      if (supported) {
        await refreshPetSummaries();
        activateAutoSave();
      } else {
        setPersistenceActive(false);
      }
    } catch (error) {
      console.error('Identity init failed:', error);
      setPersistenceActive(false);
      setPetSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [activateAutoSave, applyPetData, createFreshPet, refreshPetSummaries]);

  const handlePlayHepta = useCallback(async () => {
    if (!heptaCode) return;

    try {
      setAudioError(null);
      await playHepta(heptaCode);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Audio unavailable - click to enable';
      setAudioError(message);
      console.warn('Audio playback failed:', error);
    }
  }, [heptaCode]);

  const handleNameBlur = useCallback(async () => {
    if (!persistenceSupportedRef.current || !currentPetId) return;

    try {
      const snapshot = buildSnapshot();
      snapshot.name = petName.trim() ? petName.trim() : undefined;
      await savePet(snapshot);
      await refreshPetSummaries();
    } catch (error) {
      console.warn('Failed to save pet name:', error);
    }
  }, [buildSnapshot, currentPetId, petName, refreshPetSummaries]);

  const handleCreateNewPet = useCallback(async () => {
    try {
      const newPet = await createFreshPet();
      let petToApply: PetSaveData = newPet;

      if (persistenceSupportedRef.current) {
        try {
          await savePet(newPet);
          const stored = await loadPet(newPet.id);
          if (stored) {
            petToApply = stored;
          }
          await refreshPetSummaries();
        } catch (error) {
          console.warn('Failed to store new pet:', error);
        }
        activateAutoSave();
      } else {
        setPersistenceActive(false);
      }

      applyPetData(petToApply);
      setImportError(null);
    } catch (error) {
      console.error('Failed to create new pet:', error);
    }
  }, [activateAutoSave, applyPetData, createFreshPet, refreshPetSummaries]);

  const handleSelectPet = useCallback(async (id: string) => {
    if (id === currentPetId) return;
    try {
      const pet = await loadPet(id);
      if (!pet) return;
      applyPetData(pet);
      if (persistenceSupportedRef.current) {
        activateAutoSave();
      }
      setImportError(null);
    } catch (error) {
      console.error('Failed to load pet:', error);
    }
  }, [activateAutoSave, applyPetData, currentPetId]);

  const handleExportPet = useCallback(async (id: string) => {
    try {
      const pet = await loadPet(id);
      if (!pet) return;

      const json = exportPetToJSON(pet);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nameSlug = slugify(pet.name, 'meta-pet');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nameSlug}-${id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export pet archive:', error);
    }
  }, []);

  const handleImportFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const imported = importPetFromJSON(text);
      await savePet(imported);
      const stored = await loadPet(imported.id);
      const petToApply = stored ?? imported;
      applyPetData(petToApply);
      await refreshPetSummaries();
      if (persistenceSupportedRef.current) {
        activateAutoSave();
      }
      setImportError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      setImportError(message);
      console.error('Failed to import pet archive:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [activateAutoSave, applyPetData, refreshPetSummaries]);

  const handleDeletePet = useCallback(async (id: string) => {
    if (!persistenceSupportedRef.current) return;
    if (!window.confirm('Delete this companion from local archives?')) return;

    try {
      await deletePet(id);
      await refreshPetSummaries();
      if (id === currentPetId) {
        const pets = await getAllPets();
        const sorted = pets.sort((a, b) => b.lastSaved - a.lastSaved);
        if (sorted.length > 0) {
          applyPetData(sorted[0]);
          activateAutoSave();
        } else {
          const newPet = await createFreshPet();
          let petToApply: PetSaveData = newPet;
          try {
            await savePet(newPet);
            const stored = await loadPet(newPet.id);
            if (stored) {
              petToApply = stored;
            }
            await refreshPetSummaries();
          } catch (error) {
            console.warn('Failed to persist replacement pet:', error);
          }
          applyPetData(petToApply);
          activateAutoSave();
        }
      }
      setImportError(null);
    } catch (error) {
      console.error('Failed to delete pet:', error);
    }
  }, [activateAutoSave, applyPetData, createFreshPet, currentPetId, refreshPetSummaries]);

  useEffect(() => {
    startTick();
    void initializeIdentity();

    return () => {
      stopTick();
    };
  }, [initializeIdentity, startTick, stopTick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce" aria-hidden>
            🧬
          </div>
          <div className="space-y-1">
            <p className="text-white font-semibold">Initializing Meta-Pet...</p>
            <p className="text-zinc-400 text-sm">Generating genome sequence</p>
          </div>
        </div>
      </div>
    );
  }

  const handleImportInput = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (file) {
      void handleImportFile(file);
    }
  };

  const canBreedNow = Boolean(
    genome && breedingPartner && evolution && canBreed(evolution.state, breedingPartner.evolution.state)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      {/* Real-time Response Overlay */}
      <PetResponseOverlay enableAudio={true} enableAnticipation={true} />

      <div className="w-full max-w-2xl">
        {/* Main Pet Window */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Pet Display Area */}
          <div className="aspect-square bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 relative">
            <AuraliaMetaPet />
          </div>

          {/* Controls Bar */}
          <div className="p-6 bg-slate-900/90 border-t border-slate-700/50">
            <HUD />
          </div>
        </div>
      </div>
    </div>
  );
}
