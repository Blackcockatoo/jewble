'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ChangeEvent } from 'react';

import { useStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import { TraitPanel } from '@/components/TraitPanel';
import { PetSprite } from '@/components/PetSprite';
import { HeptaTag } from '@/components/HeptaTag';
import { SeedOfLifeGlyph } from '@/components/SeedOfLifeGlyph';
import { Button } from '@/components/ui/button';
import { VimanaMap } from '@/components/VimanaMap';
import { BattleArena } from '@/components/BattleArena';
import { MiniGamesPanel } from '@/components/MiniGamesPanel';
import { AchievementShelf } from '@/components/AchievementShelf';
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';
import { heptaEncode42, playHepta } from '@/lib/identity/hepta';
import {
  encodeGenome,
  decodeGenome,
  hashGenome,
  type GenomeHash,
  type Genome,
} from '@/lib/genome';
import type { PrimeTailId, HeptaDigits, PrivacyPreset } from '@/lib/identity/types';
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
import { EvolutionPanel } from '@/components/EvolutionPanel';
import { initializeEvolution } from '@/lib/evolution';
import { breedPets, predictOffspring, canBreed } from '@/lib/breeding';
import {
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
  type Achievement,
  type BreedingRecord,
  type BattleStats,
  type MiniGameProgress,
  type VimanaState,
} from '@/lib/progression/types';
import {
  Sparkles,
  Shield,
  Hash,
  Dna,
  Database,
  Volume2,
  Download,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';

interface PetSummary {
  id: string;
  name?: string;
  createdAt: number;
  lastSaved: number;
}

const DNA_CHARS = ['A', 'C', 'G', 'T'] as const;

const PRIVACY_PRESET_ORDER: PrivacyPreset[] = ['stealth', 'standard', 'radiant'];

const PRIVACY_PRESET_DETAILS: Record<PrivacyPreset, {
  title: string;
  tagline: string;
  highlights: string[];
  accentClass: string;
}> = {
  stealth: {
    title: 'Stealth',
    tagline: 'Minimal reveal — tail digits only',
    highlights: ['Crest stored locally', 'Broadcasts anonymized HeptaCode'],
    accentClass: 'text-emerald-400',
  },
  standard: {
    title: 'Standard',
    tagline: 'Balanced sharing for trusted circles',
    highlights: ['Shares crest vault + rotation', 'Keeps genome hashes private'],
    accentClass: 'text-cyan-300',
  },
  radiant: {
    title: 'Radiant',
    tagline: 'Full aura broadcast for public signal',
    highlights: ['Publishes crest metadata', 'Optimized for pairing + discovery'],
    accentClass: 'text-amber-300',
  },
};

const BREEDING_MODE_DETAILS: Record<'BALANCED' | 'DOMINANT' | 'MUTATION', { label: string; description: string }> = {
  BALANCED: {
    label: 'Balanced',
    description: 'Blend genes evenly for predictable traits.',
  },
  DOMINANT: {
    label: 'Dominant',
    description: 'Lean into one parent for lineage continuity.',
  },
  MUTATION: {
    label: 'Mutation',
    description: 'Invite chaos with spontaneous new traits.',
  },
};

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

function genomeToDNAString(genome: Genome): string {
  const pool = [...genome.red60, ...genome.blue60, ...genome.black60];
  const chars: string[] = [];
  for (let i = 0; i < 64; i++) {
    const digit = pool[i % pool.length] ?? 0;
    chars.push(DNA_CHARS[(digit + i) % DNA_CHARS.length]);
  }
  return chars.join('');
}

function deriveTailFromGenome(genome: Genome): [number, number, number, number] {
  const pick = (a: number, b: number) => ((a * 7 + b) % 60) as number;
  return [
    pick(genome.red60[0] ?? 0, genome.red60[1] ?? 0),
    pick(genome.red60[2] ?? 0, genome.blue60[0] ?? 0),
    pick(genome.blue60[1] ?? 0, genome.black60[0] ?? 0),
    pick(genome.black60[1] ?? 0, genome.black60[2] ?? 0),
  ];
}

export default function Home() {
  const startTick = useStore(s => s.startTick);
  const hydrate = useStore(s => s.hydrate);
  const genome = useStore(s => s.genome);
  const evolution = useStore(s => s.evolution);
  const addBreedingRecord = useStore(s => s.addBreedingRecord);
  const breedingHistory = useStore(s => s.breedingHistory);

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
  const [privacyPreset, setPrivacyPreset] = useState<PrivacyPreset>('standard');
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetStatus, setPresetStatus] = useState<string | null>(null);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [breedingPartnerId, setBreedingPartnerId] = useState('');
  const [breedingMode, setBreedingMode] = useState<'BALANCED' | 'DOMINANT' | 'MUTATION'>('BALANCED');
  const [breedingStatus, setBreedingStatus] = useState<string | null>(null);
  const [breedingError, setBreedingError] = useState<string | null>(null);
  const [breedingLoading, setBreedingLoading] = useState(false);
  const [breedingPreview, setBreedingPreview] = useState<{ possibleTraits: string[]; confidence: number } | null>(null);
  const [breedingPartner, setBreedingPartner] = useState<PetSaveData | null>(null);

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
  const privacyPresetRef = useRef<PrivacyPreset>('standard');

  useEffect(() => {
    crestRef.current = crest;
  }, [crest]);

  useEffect(() => {
    heptaRef.current = heptaCode ? Object.freeze([...heptaCode]) as HeptaDigits : null;
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
    privacyPresetRef.current = privacyPreset;
  }, [privacyPreset]);

  useEffect(() => {
    if (!breedingPartnerId) {
      setBreedingPartner(null);
      setBreedingPreview(null);
      setBreedingError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const partner = await loadPet(breedingPartnerId);
        if (cancelled) return;
        if (!partner) {
          setBreedingPartner(null);
          setBreedingPreview(null);
          setBreedingError('Selected partner could not be loaded.');
          return;
        }
        setBreedingPartner(partner);
        setBreedingError(null);
        if (genome) {
          const preview = predictOffspring(genome, partner.genome);
          setBreedingPreview(preview);
        } else {
          setBreedingPreview(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load breeding partner:', error);
          setBreedingPartner(null);
          setBreedingPreview(null);
          setBreedingError('Unable to load partner data.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [breedingPartnerId, genome]);

  useEffect(() => {
    return () => {
      if (autoSaveCleanupRef.current) {
        autoSaveCleanupRef.current();
        autoSaveCleanupRef.current = null;
      }
    };
  }, []);

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
      genome: state.genome,
      genomeHash: genomeHashRef.current,
      traits: state.traits,
      evolution: state.evolution,
      crest: crestRef.current,
      heptaDigits: Array.from(heptaRef.current) as HeptaDigits,
      privacyPreset: privacyPresetRef.current ?? 'standard',
      createdAt: createdAtRef.current ?? Date.now(),
      vimana: {
        ...state.vimana,
        cells: state.vimana.cells.map(cell => ({ ...cell })),
      },
      battle: { ...state.battle },
      miniGames: { ...state.miniGames },
      achievements: state.achievements.map(item => ({ ...item })),
      breedingHistory: state.breedingHistory.map(entry => ({ ...entry })),
      lastSaved: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      if (!persistenceSupportedRef.current) return;
      try {
        const snapshot = buildSnapshot();
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
      vimana: {
        ...pet.vimana,
        cells: pet.vimana.cells.map(cell => ({ ...cell })),
      },
      battle: { ...pet.battle },
      miniGames: { ...pet.miniGames },
      achievements: pet.achievements.map(item => ({ ...item })),
      breedingHistory: pet.breedingHistory.map(entry => ({ ...entry })),
    });

    const digits = Object.freeze([...pet.heptaDigits]) as HeptaDigits;
    const preset = pet.privacyPreset ?? 'standard';

    setCrest(pet.crest);
    setHeptaCode(digits);
    setGenomeHash(pet.genomeHash);
    setCreatedAt(pet.createdAt);
    setPetName(pet.name ?? '');
    setPrivacyPreset(preset);
    setPresetSaving(false);
    setPresetStatus(null);
    setPresetError(null);
    setCurrentPetId(pet.id);

    crestRef.current = pet.crest;
    heptaRef.current = digits;
    genomeHashRef.current = pet.genomeHash;
    createdAtRef.current = pet.createdAt;
    petIdRef.current = pet.id;
    petNameRef.current = pet.name?.trim() ?? '';
    privacyPresetRef.current = preset;
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
      const cleanup = setupAutoSave(() => buildSnapshot(), 60_000);
      autoSaveCleanupRef.current = cleanup;
      setPersistenceActive(true);
    } catch (error) {
      console.warn('Failed to start autosave:', error);
      setPersistenceActive(false);
    }
  }, [buildSnapshot]);

  const ensureDeviceKey = useCallback(async (): Promise<CryptoKey> => {
    if (hmacKeyRef.current) return hmacKeyRef.current;
    const key = await getDeviceHmacKey();
    hmacKeyRef.current = key;
    return key;
  }, []);

  const createFreshPet = useCallback(async (): Promise<PetSaveData> => {
    const hmacKey = await ensureDeviceKey();
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
      genome,
      genomeHash: genomeHashValue,
      traits,
      evolution: initializeEvolution(),
      crest: crestValue,
      heptaDigits: Object.freeze([...heptaDigits]) as HeptaDigits,
      privacyPreset: 'standard',
      vimana: createDefaultVimanaState(),
      battle: createDefaultBattleStats(),
      miniGames: createDefaultMiniGameProgress(),
      achievements: [],
      breedingHistory: [],
      createdAt: created,
      lastSaved: created,
    };
  }, [ensureDeviceKey]);

  const initializeIdentity = useCallback(async () => {
    try {
      const hmacKey = await ensureDeviceKey();

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
  }, [activateAutoSave, applyPetData, createFreshPet, ensureDeviceKey, refreshPetSummaries]);

  const handleBreed = useCallback(async () => {
    if (!breedingPartnerId) {
      setBreedingError('Select a partner companion to begin breeding.');
      return;
    }

    if (!genome || !evolution) {
      setBreedingError('Active companion genome not initialized.');
      return;
    }

    if (!breedingPartner) {
      setBreedingError('Partner data not available yet.');
      return;
    }

    if (!canBreed(evolution.state, breedingPartner.evolution.state)) {
      setBreedingError('Both companions must reach SPECIATION before breeding.');
      return;
    }

    setBreedingLoading(true);
    setBreedingError(null);
    setBreedingStatus(null);

    try {
      const { offspring, traits } = breedPets(genome, breedingPartner.genome, breedingMode);
      const genomeHashValue = await hashGenome(offspring);
      const hmacKey = await ensureDeviceKey();
      const dnaString = genomeToDNAString(offspring);
      const tailDigits = deriveTailFromGenome(offspring);
      const vault = crestRef.current?.vault ?? breedingPartner.crest.vault;
      const rotation = Math.random() > 0.5 ? crestRef.current?.rotation ?? 'CW' : breedingPartner.crest.rotation;

      const crestValue = await mintPrimeTailId({
        dna: dnaString,
        vault,
        rotation,
        tail: tailDigits,
        hmacKey,
      });

      const minutes = Math.floor(Date.now() / 60000) % 8192;
      const heptaDigits = await heptaEncode42(
        {
          version: 1,
          preset: privacyPreset,
          vault: crestValue.vault,
          rotation: crestValue.rotation,
          tail: tailDigits,
          epoch13: minutes,
          nonce14: Math.floor(Math.random() * 16384),
        },
        hmacKey
      );

      const created = Date.now();
      const record: BreedingRecord = {
        offspringId: `pet-${crestValue.signature.slice(0, 12)}`,
        partnerId: breedingPartner.id,
        mode: breedingMode,
        createdAt: created,
      };

      const newPet: PetSaveData = {
        id: record.offspringId,
        name: undefined,
        vitals: {
          hunger: 35,
          hygiene: 72,
          mood: 68,
          energy: 78,
        },
        genome: offspring,
        genomeHash: genomeHashValue,
        traits,
        evolution: initializeEvolution(),
        crest: crestValue,
        heptaDigits: Object.freeze([...heptaDigits]) as HeptaDigits,
        privacyPreset,
        vimana: createDefaultVimanaState(),
        battle: createDefaultBattleStats(),
        miniGames: createDefaultMiniGameProgress(),
        achievements: [],
        breedingHistory: [],
        createdAt: created,
        lastSaved: created,
      };

      await savePet(newPet);
      await refreshPetSummaries();
      applyPetData(newPet);
      addBreedingRecord(record);
      try {
        const snapshot = buildSnapshot();
        await savePet(snapshot);
      } catch (persistError) {
        console.warn('Failed to persist breeding snapshot immediately:', persistError);
      }

      setBreedingStatus('New companion hatched and added to your archive.');
      setBreedingPartnerId('');
    } catch (error) {
      console.error('Breeding failed:', error);
      setBreedingError('Breeding failed. Please try again after restoring vitals.');
    } finally {
      setBreedingLoading(false);
    }
  }, [
    breedingPartnerId,
    genome,
    evolution,
    breedingPartner,
    breedingMode,
    ensureDeviceKey,
    privacyPreset,
    refreshPetSummaries,
    applyPetData,
    addBreedingRecord,
    buildSnapshot,
  ]);

  const handlePlayHepta = useCallback(async () => {
    if (!heptaCode) return;

    try {
      setAudioError(null);
      await playHepta(heptaCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to play audio';
      setAudioError(message);
    }
  }, [heptaCode]);

  const handlePrivacyPresetChange = useCallback(
    async (preset: PrivacyPreset) => {
      if (!crestRef.current) return;
      if (preset === privacyPresetRef.current && heptaRef.current) return;

      try {
        setPresetSaving(true);
        setPresetError(null);
        setPresetStatus(null);

        const hmacKey = await ensureDeviceKey();
        const minutes = Math.floor(Date.now() / 60000) % 8192;
        const digits = await heptaEncode42(
          {
            version: 1,
            preset,
            vault: crestRef.current.vault,
            rotation: crestRef.current.rotation,
            tail: crestRef.current.tail,
            epoch13: minutes,
            nonce14: Math.floor(Math.random() * 16384),
          },
          hmacKey
        );

        const nextDigits = Object.freeze([...digits]) as HeptaDigits;

        setHeptaCode(nextDigits);
        heptaRef.current = nextDigits;
        setPrivacyPreset(preset);
        privacyPresetRef.current = preset;

        const detail = PRIVACY_PRESET_DETAILS[preset];

        if (persistenceSupportedRef.current) {
          try {
            const snapshot = buildSnapshot();
            snapshot.heptaDigits = nextDigits;
            snapshot.privacyPreset = preset;
            await savePet(snapshot);
            await refreshPetSummaries();
            setPresetStatus(`${detail.title} mode archived offline.`);
          } catch (error) {
            console.warn('Failed to persist privacy preset change:', error);
            setPresetStatus(`${detail.title} mode active locally.`);
            setPresetError('Could not sync preset change to IndexedDB. Will retry on next autosave.');
          }
        } else {
          setPresetStatus(`${detail.title} mode active.`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update privacy preset';
        setPresetError(message);
      } finally {
        setPresetSaving(false);
      }
    },
    [buildSnapshot, ensureDeviceKey, refreshPetSummaries]
  );

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
  }, [initializeIdentity, startTick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse text-xl">Initializing...</div>
      </div>
    );
  }

  const handleImportInput = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (file) {
      void handleImportFile(file);
    }
  };

  const availablePartners = petSummaries.filter(summary => summary.id !== currentPetId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Meta-Pet
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-zinc-400 text-sm">Prime-Tail Crest • HeptaCode v1 • Live Vitals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Your Companion
              </h2>

              <div className="relative h-48 mb-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl overflow-hidden">
                <PetSprite />
              </div>

              <HUD />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Dna className="w-5 h-5 text-purple-400" />
                Genome Traits
              </h2>
              <TraitPanel />
            </div>
          </div>

          {/* Identity & Persistence */}
          <div className="lg:col-span-2 space-y-6">
            {crest && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  Prime-Tail Crest
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Vault:</span>
                      <span className="text-blue-400 font-mono font-bold uppercase">{crest.vault}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Rotation:</span>
                      <span className="text-cyan-400 font-mono font-bold">{crest.rotation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Tail:</span>
                      <span className="text-purple-400 font-mono">[{crest.tail.join(', ')}]</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400">DNA Hash:</span>
                      <span className="text-green-400 font-mono text-xs break-all">{crest.dnaHash.slice(0, 16)}...</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400">Signature:</span>
                      <span className="text-pink-400 font-mono text-xs break-all">{crest.signature.slice(0, 16)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Coronated:</span>
                      <span className="text-amber-200 text-xs font-mono">
                        {new Date(crest.coronatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-6xl">👑</div>
                  </div>
                </div>
              </div>
            )}

            {heptaCode && (
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-400" />
                  HeptaCode v1 (42 Digits)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <p className="text-zinc-400 text-sm mb-3">HeptaTag (7-sided, 3 rings)</p>
                    <HeptaTag digits={heptaCode} size={280} />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-zinc-400 text-sm mb-3">Seed of Life (Sacred Geometry)</p>
                    <SeedOfLifeGlyph digits={heptaCode} size={260} />
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-slate-950/50 rounded-lg">
                    <p className="text-xs text-zinc-500 font-mono break-all">Digits: [{heptaCode.join(', ')}]</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-950/60 text-cyan-200 hover:text-cyan-50"
                      onClick={handlePlayHepta}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Play Hepta Tone
                    </Button>
                    <span className={`text-xs ${audioError ? 'text-rose-400' : 'text-zinc-500'}`}>
                      {audioError ?? 'Turn up your volume to hear the crest signature.'}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Privacy Presets</p>
                        <p className="text-xs text-zinc-500">Choose how boldly your crest broadcasts beyond the device.</p>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {presetSaving ? (
                          <span className="text-cyan-300">Saving preset…</span>
                        ) : presetError ? (
                          <span className="text-rose-400">{presetError}</span>
                        ) : presetStatus ? (
                          <span className="text-emerald-300">{presetStatus}</span>
                        ) : (
                          <span>Active: {PRIVACY_PRESET_DETAILS[privacyPreset].title}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {PRIVACY_PRESET_ORDER.map(option => {
                        const detail = PRIVACY_PRESET_DETAILS[option];
                        const isActive = option === privacyPreset;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => void handlePrivacyPresetChange(option)}
                            disabled={presetSaving && !isActive}
                            className={`group h-full rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                              isActive
                                ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                                : 'border-slate-800 bg-slate-950/30 hover:border-slate-600'
                            }`}
                          >
                            <p className={`text-sm font-semibold ${detail.accentClass}`}>{detail.title}</p>
                            <p className="mt-1 text-xs text-zinc-400">{detail.tagline}</p>
                            <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                              {detail.highlights.map(highlight => (
                                <li key={highlight} className="flex items-start gap-2">
                                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400/80" />
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Offline Archives
              </h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wide text-zinc-500">Pet Name</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={event => setPetName(event.target.value)}
                    onBlur={() => void handleNameBlur()}
                    placeholder="Name your companion"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void handleCreateNewPet()} disabled={!persistenceSupported && petSummaries.length > 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    Mint New Companion
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!persistenceSupported}
                    className="border-slate-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import JSON
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={handleImportInput}
                  />
                </div>

                {importError && (
                  <p className="text-xs text-rose-400">{importError}</p>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {petSummaries.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 p-4 text-sm text-zinc-500">
                      {persistenceSupported
                        ? 'No archived companions yet. Mint a new one or import an existing save.'
                        : 'IndexedDB is unavailable in this environment. Persistence features are disabled.'}
                    </div>
                  ) : (
                    petSummaries.map(summary => {
                      const isActive = summary.id === currentPetId;
                      return (
                        <div
                          key={summary.id}
                          className={`rounded-lg border p-4 transition ${
                            isActive
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {summary.name && summary.name.trim() !== '' ? summary.name : 'Unnamed Companion'}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Updated {new Date(summary.lastSaved).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleSelectPet(summary.id)}
                                disabled={isActive}
                              >
                                Load
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleExportPet(summary.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Export
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-200"
                                onClick={() => void handleDeletePet(summary.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                Evolution Progress
              </h2>
              <EvolutionPanel />
            </div>
        </div>
      </div>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <VimanaMap />
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <BattleArena />
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <MiniGamesPanel />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-300" />
                  Breeding Lab
                </h2>
                <p className="text-xs text-zinc-500">
                  Pair SPECIATION companions to mint a fresh lineage with shared heritage.
                </p>
              </div>
              <div className="text-xs text-zinc-400">
                Lineages recorded: <span className="text-cyan-300 font-semibold">{breedingHistory.length}</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-zinc-500">Partner Archive</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={breedingPartnerId}
                  onChange={event => setBreedingPartnerId(event.target.value)}
                  disabled={availablePartners.length === 0}
                >
                  <option value="">Select a companion</option>
                  {availablePartners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {`${partner.name && partner.name.trim() !== '' ? partner.name : partner.id} • Saved ${new Date(partner.lastSaved).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
                {availablePartners.length === 0 && (
                  <p className="text-xs text-zinc-500">Archive another companion to unlock breeding matches.</p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-zinc-500">Fusion Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(BREEDING_MODE_DETAILS) as Array<'BALANCED' | 'DOMINANT' | 'MUTATION'>).map(mode => {
                    const detail = BREEDING_MODE_DETAILS[mode];
                    const active = breedingMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBreedingMode(mode)}
                        className={`rounded-lg border px-2 py-2 text-xs transition ${
                          active
                            ? 'border-pink-400 bg-pink-500/10 text-pink-200'
                            : 'border-slate-700 bg-slate-950/40 text-zinc-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="font-semibold block">{detail.label}</span>
                        <span className="text-[10px] text-zinc-400 block mt-1">{detail.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {breedingPartner && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-zinc-400 space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">Partner Snapshot</p>
                  <p>Vault: <span className="text-cyan-300 font-mono">{breedingPartner.crest.vault}</span></p>
                  <p>Evolution: <span className="text-emerald-300 font-semibold">{breedingPartner.evolution.state}</span></p>
                  <p>Last saved {new Date(breedingPartner.lastSaved).toLocaleString()}</p>
                </div>
                {breedingPreview && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-zinc-400 space-y-2">
                    <p className="text-sm font-semibold text-zinc-200">Trait Forecast</p>
                    <p>Confidence window: <span className="text-amber-300 font-semibold">{breedingPreview.confidence.toFixed(0)}%</span></p>
                    <ul className="space-y-1">
                      {breedingPreview.possibleTraits.slice(0, 5).map(trait => (
                        <li key={trait} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
                          <span className="text-zinc-300">{trait}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {breedingError && <p className="text-xs text-rose-400">{breedingError}</p>}
            {breedingStatus && <p className="text-xs text-emerald-300">{breedingStatus}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void handleBreed()}
                disabled={breedingLoading || !breedingPartnerId}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {breedingLoading ? 'Sequencing…' : 'Forge Offspring'}
              </Button>
              <span className="text-xs text-zinc-500">
                Parents must both reach SPECIATION. Balanced mode keeps traits stable, mutation invites surprises.
              </span>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <AchievementShelf />
          </div>
        </div>

        <div className="mt-8 text-center text-zinc-600 text-xs space-y-1">
          <p>✨ DNA stays private • Only hashes + tail are visible</p>
          <p>🔒 Time-boxed consent • Pairwise identity • Fully offline</p>
          <p>🎨 HeptaCode: One source → Color + Geometry + Tone</p>
          <p className="flex items-center justify-center gap-2">
            <Database className={`w-3 h-3 ${persistenceActive ? 'text-green-400' : 'text-yellow-400'}`} />
            {persistenceSupported
              ? persistenceActive
                ? 'Offline autosave active (sync every 60s)'
                : 'Autosave paused — interact to resume saving'
              : 'Offline persistence unavailable in this environment'}
          </p>
        </div>
      </div>
    </div>
  );
}
