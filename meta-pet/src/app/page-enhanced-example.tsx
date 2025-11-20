/**
 * EXAMPLE: Enhanced Main Game Page
 * 
 * This file demonstrates how to integrate all the new real-time response
 * and visual effect components into the main game page.
 * 
 * Copy relevant sections to your actual page.tsx to enable the upgrades.
 */

'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useStore } from '@/lib/store';
import type { PetType } from '@metapet/core/store';

// NEW IMPORTS - Enhanced Components
import { EnhancedHUD } from '@/components/EnhancedHUD';
import { EnhancedPetSprite } from '@/components/EnhancedPetSprite';
import { EnhancedBattleArena } from '@/components/EnhancedBattleArena';
import { VisualEffectsRenderer, useVisualEffects } from '@/components/VisualEffects';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { useRealtimeResponse } from '@/hooks/useRealtimeResponse';

// EXISTING IMPORTS
import { TraitPanel } from '@/components/TraitPanel';
import { AuraliaGuardian } from '@/components/AuraliaGuardian';
import { HeptaTag } from '@/components/HeptaTag';
import { SeedOfLifeGlyph } from '@/components/SeedOfLifeGlyph';
import { AchievementShelf } from '@/components/AchievementShelf';
import { Button } from '@/components/ui/button';
import { mintPrimeTailId, getDeviceHmacKey } from '@/lib/identity/crest';
import { heptaEncode42, playHepta } from '@/lib/identity/hepta';
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
import { EvolutionPanel } from '@/components/EvolutionPanel';
import { MiniGamesPanel } from '@/components/MiniGamesPanel';
import { VimanaMap } from '@/components/VimanaMap';
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
  Zap,
  Baby,
  FlaskConical,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';

interface PetSummary {
  id: string;
  name?: string;
  createdAt: number;
  lastSaved: number;
}

const DNA_CHARS = ['A', 'C', 'G', 'T'] as const;

/**
 * ENHANCED MAIN GAME PAGE
 * 
 * Key changes:
 * 1. Replaced HUD with EnhancedHUD
 * 2. Replaced PetSprite with EnhancedPetSprite
 * 3. Added VisualEffectsRenderer for game events
 * 4. Integrated useRealtimeResponse hook
 * 5. Added PageTransition wrapper for smooth transitions
 * 6. Enhanced event handlers with visual feedback
 */
export default function EnhancedGamePage() {
  const vitals = useStore(s => s.vitals);
  const traits = useStore(s => s.traits);
  const evolution = useStore(s => s.evolution);

  // NEW: Visual effects system
  const { effects, triggerEffect } = useVisualEffects();

  // NEW: Real-time response system
  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse(
    {
      mood: vitals.mood,
      energy: vitals.energy,
      hunger: vitals.hunger,
      hygiene: vitals.hygiene,
      recentActions: [],
    },
    { autoIdleInterval: 8000, enableWarnings: true },
  );

  const [currentTab, setCurrentTab] = useState<'main' | 'traits' | 'breeding' | 'battle' | 'evolution'>('main');
  const [selectedPetForBreeding, setSelectedPetForBreeding] = useState<string | null>(null);
  const [petList, setPetList] = useState<PetSummary[]>([]);

  // Dummy function to satisfy loadAllPets
  const loadAllPets = useCallback(async () => {
    const pets = await getAllPets();
    setPetList(pets.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt, lastSaved: p.lastSaved })))  }, []);

  // Load pets on mount
  useEffect(() => {
    loadAllPets();
    setupAutoSave();
  }, [loadAllPets]);  // ENHANCED: Breeding with visual feedback
  const handleBreeding = useCallback(async () => {
    if (!selectedPetForBreeding) return;

    // Trigger visual effect
    triggerEffect('heart', window.innerWidth / 2, window.innerHeight / 2, 2000);
    triggerResponse('breeding');

    // Your existing breeding logic...
    // const result = await breedPets(...);

    // Trigger celebration effect
    setTimeout(() => {
      triggerEffect('star', window.innerWidth / 2, window.innerHeight / 2, 2000);
    }, 500);
  }, [selectedPetForBreeding, triggerEffect, triggerResponse]);

  // ENHANCED: Evolution with visual feedback
  const handleEvolution = useCallback(() => {
    // Trigger evolution effect
    triggerEffect('explosion', window.innerWidth / 2, window.innerHeight / 2, 1500);
    triggerResponse('evolution');

    // Your existing evolution logic...
  }, [triggerEffect, triggerResponse]);

  // ENHANCED: Achievement with visual feedback
  const handleAchievement = useCallback(() => {
    triggerEffect('victory', window.innerWidth / 2, window.innerHeight / 2, 2000);
    triggerResponse('achievement');
  }, [triggerEffect, triggerResponse]);

  return (
    <PageTransition>
      {/* Visual Effects Renderer - Must be at root level */}
      <VisualEffectsRenderer effects={effects} />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <StaggerContainer staggerDelay={0.1}>
            <StaggerItem>
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Jewble Meta-Pet
                </h1>
                <p className="text-slate-400">Real-time interactive pet evolution experience</p>
              </div>
            </StaggerItem>

            {/* Tab Navigation */}
            <StaggerItem>
              <div className="flex gap-2 justify-center flex-wrap">
                {(['main', 'traits', 'breeding', 'battle', 'evolution'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    className={`
                      px-4 py-2 rounded-lg font-semibold transition-all
                      ${
                        currentTab === tab
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Pet Display */}
            <StaggerItem>
              <div className="lg:col-span-2 space-y-6">
                {currentTab === 'main' && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
                    <div className="aspect-square bg-gradient-to-b from-slate-700 to-slate-900 rounded-lg overflow-hidden">
                      {/* NEW: Enhanced Pet Sprite */}
                      {traits && <EnhancedPetSprite />}
                    </div>
                  </div>
                )}

                {currentTab === 'traits' && traits && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <TraitPanel />
                  </div>
                )}

                {currentTab === 'breeding' && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 space-y-4">
                    <h2 className="text-2xl font-bold">Breeding</h2>
                    <div className="space-y-2">
                      {petList.map(pet => (
                        <button
                          key={pet.id}
                          onClick={() => setSelectedPetForBreeding(pet.id)}
                          className={`
                            w-full p-3 rounded-lg text-left transition-all
                            ${
                              selectedPetForBreeding === pet.id
                                ? 'bg-pink-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }
                          `}
                        >
                          {pet.name || `Pet ${pet.id.slice(0, 8)}`}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleBreeding}
                      disabled={!selectedPetForBreeding}
                      className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 py-3 rounded-lg font-bold transition-all"
                    >
                      <Baby className="inline mr-2 w-4 h-4" />
                      Breed
                    </button>
                  </div>
                )}

                {currentTab === 'battle' && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    {/* NEW: Enhanced Battle Arena */}
                    <EnhancedBattleArena
                      playerName={traits?.personality?.temperament || 'Your Pet'}
                      opponentName="Wild Beast"
                      playerHp={80}
                      playerMaxHp={100}
                      opponentHp={60}
                      opponentMaxHp={100}
                      onAttack={() => triggerEffect('lightning', window.innerWidth / 2, window.innerHeight / 2, 800)}
                      onSpecialAttack={() =>
                        triggerEffect('explosion', window.innerWidth / 2, window.innerHeight / 2, 1000)
                      }
                      onHeal={() => triggerEffect('heal', window.innerWidth / 2, window.innerHeight / 2, 800)}
                    />
                  </div>
                )}

                {currentTab === 'evolution' && evolution && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                    <EvolutionPanel />
                    <button
                      onClick={handleEvolution}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold transition-all"
                    >
                      <Sparkles className="inline mr-2 w-4 h-4" />
                      Evolve
                    </button>
                  </div>
                )}
              </div>
            </StaggerItem>

            {/* Right Column - Controls & Info */}
            <StaggerItem>
              <div className="space-y-6">
                {/* NEW: Enhanced HUD with Real-time Responses */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Pet Status</h3>
                  <EnhancedHUD />
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleAchievement}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-semibold transition-all"
                    >
                      🏆 Achievement
                    </button>
                    <button
                      onClick={() => triggerEffect('sparkle', window.innerWidth / 2, window.innerHeight / 2, 1500)}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-all"
                    >
                      ✨ Sparkle
                    </button>
                  </div>
                </div>

                {/* Pet Info */}
                {traits && (
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-sm space-y-2">
                    <div>
                      <span className="text-slate-400">Body Type:</span>
                      <span className="ml-2 font-semibold">{traits.physical?.bodyType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Temperament:</span>
                      <span className="ml-2 font-semibold">{traits.personality?.temperament}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Level:</span>
                      <span className="ml-2 font-semibold">{evolution?.state || 1}</span>
                    </div>
                  </div>
                )}
              </div>
            </StaggerItem>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

/**
 * INTEGRATION CHECKLIST
 * 
 * To use this enhanced page:
 * 
 * 1. ✅ Install dependencies (already done):
 *    - framer-motion (already in package.json)
 * 
 * 2. ✅ Copy new files to your project:
 *    - lib/realtime/responseSystem.ts
 *    - hooks/useRealtimeResponse.ts
 *    - components/ResponseBubble.tsx
 *    - components/EnhancedHUD.tsx
 *    - components/EnhancedPetSprite.tsx
 *    - components/VisualEffects.tsx
 *    - components/EnhancedBattleArena.tsx
 *    - components/PageTransition.tsx
 * 
 * 3. ✅ Replace your current page.tsx with this enhanced version
 *    OR selectively integrate components into your existing page
 * 
 * 4. ✅ Update imports in your components to use enhanced versions
 * 
 * 5. ✅ Test all interactions and animations
 * 
 * 6. ✅ Customize responses and colors to match your theme
 * 
 * For more details, see UPGRADE_GUIDE.md
 */
