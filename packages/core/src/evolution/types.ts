export type EvolutionState = 'GENETICS' | 'NEURO' | 'SPECIATION';

export interface EvolutionRequirement {
  minAge: number;
  minInteractions: number;
  minVitalsAverage: number;
  specialCondition?: () => boolean;
  specialDescription?: string;
}

export interface EvolutionData {
  state: EvolutionState;
  birthTime: number;
  lastEvolutionTime: number;
  experience: number;
  totalInteractions: number;
  canEvolve: boolean;
}

export const EVOLUTION_ORDER: EvolutionState[] = ['GENETICS', 'NEURO', 'SPECIATION'];

export const EVOLUTION_REQUIREMENTS: Record<EvolutionState, EvolutionRequirement> = {
  GENETICS: {
    minAge: 0,
    minInteractions: 0,
    minVitalsAverage: 0,
  },
  NEURO: {
    minAge: 1000 * 60 * 60,
    minInteractions: 12,
    minVitalsAverage: 55,
    specialDescription: 'Stabilize the neural lattice and complete bonding rituals.',
  },
  SPECIATION: {
    minAge: 1000 * 60 * 60 * 48,
    minInteractions: 80,
    minVitalsAverage: 75,
    specialDescription: 'PrimeTail crest refinement and consciousness alignment.',
  },
};
