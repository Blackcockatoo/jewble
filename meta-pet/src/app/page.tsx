'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { HUD } from '@/components/HUD';
import { TraitPanel } from '@/components/TraitPanel';
import { PetSprite } from '@/components/PetSprite';
import { HeptaTag } from '@/components/HeptaTag';
import { SeedOfLifeGlyph } from '@/components/SeedOfLifeGlyph';
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';
import { heptaEncode42 } from '@/lib/identity/hepta';
import { encodeGenome, decodeGenome, hashGenome, type GenomeHash } from '@/lib/genome';
import type { PrimeTailId, HeptaDigits } from '@/lib/identity/types';
import { savePet, loadPet, setupAutoSave, type PetSaveData } from '@/lib/persistence/indexeddb';
import { EvolutionPanel } from '@/components/EvolutionPanel';
import { Sparkles, Shield, Hash, Dna, Database } from 'lucide-react';

const PET_ID = 'metapet-primary';

export default function Home() {
  const startTick = useStore(s => s.startTick);
  const setGenome = useStore(s => s.setGenome);
  const hydrate = useStore(s => s.hydrate);
  const [crest, setCrest] = useState<PrimeTailId | null>(null);
  const [heptaCode, setHeptaCode] = useState<HeptaDigits | null>(null);
  const [loading, setLoading] = useState(true);
  const [genomeHash, setGenomeHash] = useState<GenomeHash | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [persistenceActive, setPersistenceActive] = useState(false);

  const crestRef = useRef<PrimeTailId | null>(null);
  const heptaRef = useRef<HeptaDigits | null>(null);
  const genomeHashRef = useRef<GenomeHash | null>(null);
  const createdAtRef = useRef<number | null>(null);
  const autoSaveCleanupRef = useRef<(() => void) | null>(null);

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
    return () => {
      if (autoSaveCleanupRef.current) {
        autoSaveCleanupRef.current();
        autoSaveCleanupRef.current = null;
      }
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
  }, []);

  const initializeIdentity = useCallback(async () => {
    try {
      const hmacKey = await getDeviceHmacKey();

      const persistenceSupported = typeof indexedDB !== 'undefined';
      let restored: PetSaveData | null = null;

      if (persistenceSupported) {
        try {
          restored = await loadPet(PET_ID);
        } catch (error) {
          console.warn('Failed to load existing pet save:', error);
        }
      }

      if (restored) {
        hydrate({
          vitals: restored.vitals,
          genome: restored.genome,
          traits: restored.traits,
          evolution: restored.evolution,
        });
        setCrest(restored.crest);
        setHeptaCode(restored.heptaDigits);
        setGenomeHash(restored.genomeHash);
        setCreatedAt(restored.createdAt);
        crestRef.current = restored.crest;
        heptaRef.current = restored.heptaDigits;
        genomeHashRef.current = restored.genomeHash;
        createdAtRef.current = restored.createdAt;
        setPersistenceActive(persistenceSupported);
      } else {
        // Generate mock DNA (in production, this would come from secure vault)
        const primeDNA = 'ATGCCGCGTCATATCACGTTATGCTATACTATACCACATCGTGTCACATTGTACTGTGCT';
        const tailDNA = 'GCTATGCACGTATATCGCGTACGCGTACGCGTACGCGTACGCGTACGCGTACGCGTACGC';

        // Generate genome from DNA
        const genome = await encodeGenome(primeDNA, tailDNA);
        const traits = decodeGenome(genome);
        setGenome(genome, traits);

        const genomeHashValue = await hashGenome(genome);
        setGenomeHash(genomeHashValue);

        // Mint crest
        const newCrest = await mintPrimeTailId({
          dna: primeDNA,
          vault: 'blue',
          rotation: 'CW',
          tail: [12, 37, 5, 59],
          hmacKey,
        });
        setCrest(newCrest);

        // Generate HeptaCode
        const minutes = Math.floor(Date.now() / 60000) % 8192;
        const digits = await heptaEncode42(
          {
            version: 1,
            preset: 'standard',
            vault: 'blue',
            rotation: 'CW',
            tail: [12, 37, 5, 59],
            epoch13: minutes,
            nonce14: Math.floor(Math.random() * 16384),
          },
          hmacKey
        );
        setHeptaCode(digits);

        const created = Date.now();
        setCreatedAt(created);
        crestRef.current = newCrest;
        heptaRef.current = digits;
        genomeHashRef.current = genomeHashValue;
        createdAtRef.current = created;

        if (persistenceSupported) {
          const state = useStore.getState();
          const snapshot: PetSaveData = {
            id: PET_ID,
            vitals: state.vitals,
            genome,
            genomeHash: genomeHashValue,
            traits,
            evolution: state.evolution,
            crest: newCrest,
            heptaDigits: digits,
            createdAt: created,
            lastSaved: Date.now(),
          };
          try {
            await savePet(snapshot);
            setPersistenceActive(true);
          } catch (error) {
            console.warn('Failed to persist initial pet snapshot:', error);
            setPersistenceActive(false);
          }
        } else {
          setPersistenceActive(false);
        }
      }

      if (persistenceSupported) {
        if (autoSaveCleanupRef.current) {
          autoSaveCleanupRef.current();
        }

        const cleanup = setupAutoSave(() => {
          const state = useStore.getState();
          if (!state.genome || !state.traits) {
            throw new Error('Genome not initialized');
          }
          if (!crestRef.current || !heptaRef.current || !genomeHashRef.current) {
            throw new Error('Identity not initialized');
          }

          return {
            id: PET_ID,
            vitals: state.vitals,
            genome: state.genome,
            genomeHash: genomeHashRef.current,
            traits: state.traits,
            evolution: state.evolution,
            crest: crestRef.current,
            heptaDigits: Array.from(heptaRef.current) as HeptaDigits,
            createdAt: createdAtRef.current ?? Date.now(),
            lastSaved: Date.now(),
          };
        }, 60_000);

        autoSaveCleanupRef.current = cleanup;
        setPersistenceActive(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Identity init failed:', error);
      setLoading(false);
      setPersistenceActive(false);
    }
  }, [hydrate, setGenome]);

  useEffect(() => {
    startTick();
    initializeIdentity();
  }, [startTick, initializeIdentity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse text-xl">Initializing...</div>
      </div>
    );
  }

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

          {/* Identity Cards */}
          <div className="lg:col-span-2 space-y-6">
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
                      <span className="text-blue-400 font-mono font-bold uppercase">
                        {crest.vault}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Rotation:</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        {crest.rotation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Tail:</span>
                      <span className="text-purple-400 font-mono">
                        [{crest.tail.join(', ')}]
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400">DNA Hash:</span>
                      <span className="text-green-400 font-mono text-xs break-all">
                        {crest.dnaHash.slice(0, 16)}...
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400">Signature:</span>
                      <span className="text-pink-400 font-mono text-xs break-all">
                        {crest.signature.slice(0, 16)}...
                      </span>
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
                <div className="mt-4 p-3 bg-slate-950/50 rounded-lg">
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    Digits: [{heptaCode.join(', ')}]
                  </p>
                </div>
              </div>
            )}

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
          <p>🔒 Time-boxed consent • Pairwise identity • Fully offline</p>
          <p>🎨 HeptaCode: One source → Color + Geometry + Tone</p>
          <p className="flex items-center justify-center gap-2">
            <Database className={`w-3 h-3 ${persistenceActive ? 'text-green-400' : 'text-yellow-400'}`} />
            {persistenceActive
              ? 'Offline autosave active (sync every 60s)'
              : 'Offline autosave unavailable in this session'}
          </p>
        </div>
      </div>
    </div>
  );
}
