'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import { TraitPanel } from '@/components/TraitPanel';
import { PetSprite } from '@/components/PetSprite';
import { HeptaTag } from '@/components/HeptaTag';
import { SeedOfLifeGlyph } from '@/components/SeedOfLifeGlyph';
import { AchievementShelf } from '@/components/AchievementShelf';
import { MiniGamesPanel } from '@/components/MiniGamesPanel';
import { Button } from '@/components/ui/button';
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';
import { heptaEncode42, playHepta } from '@/lib/identity/hepta';
import { encodeGenome, decodeGenome, hashGenome, type GenomeHash } from '@/lib/genome';
import type { PrimeTailId, HeptaDigits } from '@/lib/identity/types';
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
import {
  createDefaultBattleStats,
  createDefaultMiniGameProgress,
  createDefaultVimanaState,
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
          <p className="text-zinc-400 text-sm">
            Prime-Tail Crest • HeptaCode v1 • Live Vitals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pet Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Your Companion
              </h2>

              {/* Pet sprite */}
              <div className="relative h-48 mb-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl overflow-hidden">
                <PetSprite />
              </div>

              <HUD />
            </div>

            {/* Genome Traits */}
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
            {/* Identity Cards */}
            {/* Crest */}
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
                      <span className="text-zinc-400">Mirror Hash:</span>
                      <span className="text-sky-400 font-mono text-xs break-all">{crest.mirrorHash.slice(0, 16)}...</span>
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

            {/* HeptaCode Visuals */}
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
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-slate-950/50 rounded-lg">
                    <p className="text-xs text-zinc-500 font-mono break-all">
                      Digits: [{heptaCode.join(', ')}]
                    </p>
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
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
              <MiniGamesPanel petName={petName.trim() || undefined} />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <AchievementShelf />
          </div>

          {/* Evolution */}
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              Evolution Progress
              </h2>
              <EvolutionPanel />
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-zinc-600 text-xs space-y-1">
          <p>✨ DNA stays private • Only hashes + tail are visible</p>
          <p>🔆 Time-boxed consent • Pairwise identity • Fully offline</p>
          <p>🎿 HeptaCode: One source → Color + Geometry + Tone</p>
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
