/**
 * Evolution System Types
 *
 * 4-state evolution machine:
 * 1. GENETICS (0-24h): Basic genome, learning vitals
 * 2. NEURO (24h-7d): Develops personality, unlocks abilities
 * 3. QUANTUM (7d-30d): Advanced consciousness, rare traits emerge
 * 4. SPECIATION (30d+): Final form, breeding unlocked
 */

export type EvolutionState = 'GENETICS' | 'NEURO' | 'QUANTUM' | 'SPECIATION';

export interface EvolutionData {
  state: EvolutionState;
  birthTime: number; // timestamp
  lastEvolutionTime: number; // timestamp
  experience: number; // 0-100 per state
  totalInteractions: number;
  canEvolve: boolean;
}

export interface EvolutionRequirement {
  minAge: number; // milliseconds
  minInteractions: number;
  minVitalsAverage: number; // 0-100
  description: string;
  specialCondition?: () => boolean;
  specialDescription?: string;
}

export interface EvolutionStageInfo {
  title: string;
  tagline: string;
  celebration: string;
  focus: string[];
  specialCondition?: () => boolean;
}

export const EVOLUTION_REQUIREMENTS: Record<EvolutionState, EvolutionRequirement> = {
  GENETICS: {
    minAge: 0,
    minInteractions: 0,
    minVitalsAverage: 0,
    description: 'Stabilize the genome imprint and establish baseline vitals.',
  },
  NEURO: {
    minAge: 5 * 60 * 1000, // 5 minutes for testing (change to 24 hours for production)
    minInteractions: 10, // Reduced for testing
    minVitalsAverage: 40,
    description: 'Sustain care for a full day so neural pathways can form.',
  },
  QUANTUM: {
    minAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    minInteractions: 500,
    minVitalsAverage: 60,
    description: 'Keep the companion engaged for a week to unlock quantum awareness.',
  },
  SPECIATION: {
    minAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    minInteractions: 2000,
    minVitalsAverage: 75,
    description: 'Maintain peak vitality for a month to reach final form.',
    specialDescription: 'Complete upcoming lineage quests to branch the species.',
  },
};

export const EVOLUTION_ORDER: EvolutionState[] = ['GENETICS', 'NEURO', 'QUANTUM', 'SPECIATION'];

export interface EvolutionVisuals {
  colors: string[];
  glowIntensity: number;
  particleCount: number;
  auraRadius: number;
}

export const EVOLUTION_VISUALS: Record<EvolutionState, EvolutionVisuals> = {
  GENETICS: {
    colors: ['#4ECDC4', '#45B7D1'],
    glowIntensity: 0.3,
    particleCount: 5,
    auraRadius: 0,
  },
  NEURO: {
    colors: ['#9B59B6', '#8E44AD'],
    glowIntensity: 0.5,
    particleCount: 10,
    auraRadius: 20,
  },
  QUANTUM: {
    colors: ['#F39C12', '#E67E22'],
    glowIntensity: 0.8,
    particleCount: 20,
    auraRadius: 40,
  },
  SPECIATION: {
    colors: ['#E74C3C', '#C0392B', '#FFD700'],
    glowIntensity: 1.0,
    particleCount: 30,
    auraRadius: 60,
  },
};

export const EVOLUTION_STAGE_INFO: Record<EvolutionState, EvolutionStageInfo> = {
  GENETICS: {
    title: 'Genetics',
    tagline: 'Genome imprint stabilizing. Gentle care builds trust.',
    celebration: 'Neural bloom ignites! Your companion is ready to evolve.',
    focus: [
      'Keep hunger under control with regular feedings.',
      'Maintain hygiene above 50 to prevent stress.',
      'Balance energy with frequent naps.',
    ],
  },
  NEURO: {
    title: 'Neuro',
    tagline: 'Synaptic pathways are firing. Emotional bonds deepen.',
    celebration: 'Consciousness expands—quantum senses awaken!',
    focus: [
      'Play often to raise mood and curiosity.',
      'Mix in rest cycles to avoid burnout.',
      'Keep vitals average above 60 for optimal growth.',
    ],
  },
  QUANTUM: {
    title: 'Quantum',
    tagline: 'Reality bends around shared intent. Rare abilities emerge.',
    celebration: 'Speciation seeds planted. Destiny awaits!',
    focus: [
      'Chain interactions to reach high experience streaks.',
      'Experiment with routines to discover latent abilities.',
      'Sustain vitals near peak to anchor the phase.',
    ],
  },
  SPECIATION: {
    title: 'Speciation',
    tagline: 'Final form unlocked. New lineages prepare to branch.',
    celebration: 'The bloodline is ready for its next great story.',
    focus: [
      'Plan lineage quests to define the species arc.',
      'Share crest hashes for archival (never DNA).',
      'Prepare for breeding and anomaly expeditions.',
    ],
  },
};
