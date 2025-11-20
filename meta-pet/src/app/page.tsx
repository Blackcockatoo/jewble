
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useStore } from '@/lib/store';
import type { PetType } from '@metapet/core/store';
import { HUD } from '@/components/HUD';
import { TraitPanel } from '@/components/TraitPanel';
import { PetSprite } from '@/components/PetSprite';
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
import { BattleArena } from '@/components/BattleArena';
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