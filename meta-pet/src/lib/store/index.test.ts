import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useStore } from './index';
import { initializeEvolution } from '@/lib/evolution';
import type { Genome, DerivedTraits } from '@/lib/genome';

describe('Store State Management', () => {
  // Reset store before each test
  beforeEach(() => {
    useStore.setState({
      vitals: {
        hunger: 50,
        hygiene: 50,
        mood: 50,
        energy: 50,
      },
      genome: null,
      traits: null,
      evolution: initializeEvolution(),
      achievements: [],
      battle: {
        wins: 0,
        losses: 0,
        energyShield: 100,
        streak: 0,
        lastOpponent: null,
        lastResult: null,
      },
      miniGames: {
        memoryHighScore: 0,
        rhythmHighScore: 0,
        lastPlayedAt: null,
      },
      vimana: {
        cells: Array(9).fill(null).map((_, i) => ({
          id: `cell-${i}`,
          explored: false,
          hasAnomaly: false,
          reward: null,
        })),
        tetrisHighScore: 0,
        tetrisLastPlayed: null,
      },
    });
  });

  describe('Initial State', () => {
    it('should have initial vitals', () => {
      const state = useStore.getState();

      expect(state.vitals.hunger).toBeDefined();
      expect(state.vitals.hygiene).toBeDefined();
      expect(state.vitals.mood).toBeDefined();
      expect(state.vitals.energy).toBeDefined();
    });

    it('should have initialized evolution', () => {
      const state = useStore.getState();

      expect(state.evolution).toBeDefined();
      expect(state.evolution.state).toBe('GENETICS');
    });

    it('should have empty genome initially', () => {
      const state = useStore.getState();

      expect(state.genome).toBeNull();
      expect(state.traits).toBeNull();
    });

    it('should have empty achievements initially', () => {
      const state = useStore.getState();

      expect(state.achievements).toEqual([]);
    });
  });

  describe('Vitals Actions', () => {
    it('should increase hunger when feed is called', () => {
      const initialHunger = useStore.getState().vitals.hunger;

      useStore.getState().feed();

      const newHunger = useStore.getState().vitals.hunger;
      expect(newHunger).toBeGreaterThan(initialHunger);
    });

    it('should increase hygiene when clean is called', () => {
      const initialHygiene = useStore.getState().vitals.hygiene;

      useStore.getState().clean();

      const newHygiene = useStore.getState().vitals.hygiene;
      expect(newHygiene).toBeGreaterThan(initialHygiene);
    });

    it('should increase mood when play is called', () => {
      const initialMood = useStore.getState().vitals.mood;

      useStore.getState().play();

      const newMood = useStore.getState().vitals.mood;
      expect(newMood).toBeGreaterThan(initialMood);
    });

    it('should increase energy when sleep is called', () => {
      const initialEnergy = useStore.getState().vitals.energy;

      useStore.getState().sleep();

      const newEnergy = useStore.getState().vitals.energy;
      expect(newEnergy).toBeGreaterThan(initialEnergy);
    });

    it('should clamp vitals at 100', () => {
      // Set hunger very high
      useStore.setState({ vitals: { ...useStore.getState().vitals, hunger: 95 } });

      useStore.getState().feed();

      const hunger = useStore.getState().vitals.hunger;
      expect(hunger).toBeLessThanOrEqual(100);
    });
  });

  describe('Genome Management', () => {
    it('should set genome and traits', () => {
      const testGenome: Genome = {
        red60: Array(60).fill(1),
        blue60: Array(60).fill(2),
        black60: Array(60).fill(3),
      };
      const testTraits: DerivedTraits = {
        physical: {
          bodyType: 'Spherical',
          primaryColor: '#FF6B6B',
          secondaryColor: '#C44569',
          pattern: 'Solid',
          texture: 'Smooth',
          size: 1.0,
          proportions: { head: 0.33, limbs: 0.33, tail: 0.34 },
          features: ['Horns'],
        },
        personality: {
          temperament: 'Playful',
          energy: 80,
          social: 70,
          curiosity: 90,
          patience: 50,
          bravery: 60,
          quirks: ['Bouncy'],
        },
        latent: {
          evolutionPath: 'Light Bringer',
          rareAbilities: ['Telepathy'],
          potential: 85,
          affinity: 'Fire',
        },
      };

      useStore.getState().setGenome(testGenome, testTraits);

      const state = useStore.getState();
      expect(state.genome).toEqual(testGenome);
      expect(state.traits).toEqual(testTraits);
    });
  });

  describe('Evolution System', () => {
    it('should not evolve when requirements are not met', () => {
      const result = useStore.getState().tryEvolve();

      expect(result).toBe(false);
      expect(useStore.getState().evolution.state).toBe('GENETICS');
    });

    it('should evolve when requirements are met', () => {
      // Set up evolution that meets all requirements for NEURO
      useStore.setState({
        evolution: {
          state: 'GENETICS',
          birthTime: Date.now() - 100_000_000, // Very old
          lastEvolutionTime: Date.now() - 100_000_000,
          experience: 100,
          totalInteractions: 100,
          canEvolve: true,
        },
        vitals: {
          hunger: 80,
          hygiene: 80,
          mood: 80,
          energy: 80,
        },
      });

      const result = useStore.getState().tryEvolve();

      expect(result).toBe(true);
      expect(useStore.getState().evolution.state).toBe('NEURO');
    });
  });

  describe('Battle System', () => {
    it('should record battle win', () => {
      useStore.getState().recordBattle('win', 'TestOpponent');

      const battle = useStore.getState().battle;
      expect(battle.wins).toBe(1);
      expect(battle.losses).toBe(0);
      expect(battle.lastResult).toBe('win');
      expect(battle.lastOpponent).toBe('TestOpponent');
      expect(battle.streak).toBe(1);
    });

    it('should record battle loss', () => {
      useStore.getState().recordBattle('loss', 'StrongOpponent');

      const battle = useStore.getState().battle;
      expect(battle.wins).toBe(0);
      expect(battle.losses).toBe(1);
      expect(battle.lastResult).toBe('loss');
      expect(battle.streak).toBe(0);
    });

    it('should increase energy shield on win', () => {
      // Set shield to a lower value so it can increase (default is 100, which is max)
      useStore.setState({
        battle: {
          ...useStore.getState().battle,
          energyShield: 50,
        },
      });

      const initialShield = useStore.getState().battle.energyShield;

      useStore.getState().recordBattle('win', 'Opponent1');

      const newShield = useStore.getState().battle.energyShield;
      expect(newShield).toBeGreaterThan(initialShield);
      expect(newShield).toBe(55); // 50 + 5
    });

    it('should decrease energy shield on loss', () => {
      const initialShield = useStore.getState().battle.energyShield;

      useStore.getState().recordBattle('loss', 'Opponent1');

      const newShield = useStore.getState().battle.energyShield;
      expect(newShield).toBeLessThan(initialShield);
    });

    it('should track win streak', () => {
      useStore.getState().recordBattle('win', 'Opponent1');
      useStore.getState().recordBattle('win', 'Opponent2');
      useStore.getState().recordBattle('win', 'Opponent3');

      const battle = useStore.getState().battle;
      expect(battle.streak).toBe(3);
    });

    it('should reset streak on loss', () => {
      useStore.getState().recordBattle('win', 'Opponent1');
      useStore.getState().recordBattle('win', 'Opponent2');
      useStore.getState().recordBattle('loss', 'Opponent3');

      const battle = useStore.getState().battle;
      expect(battle.streak).toBe(0);
    });

    it('should unlock achievement on first win', () => {
      useStore.getState().recordBattle('win', 'FirstOpponent');

      const achievements = useStore.getState().achievements;
      const hasFirstWin = achievements.some(a => a.id === 'battle-first-win');
      expect(hasFirstWin).toBe(true);
    });

    it('should unlock streak achievement on 3+ win streak', () => {
      useStore.getState().recordBattle('win', 'Opponent1');
      useStore.getState().recordBattle('win', 'Opponent2');
      useStore.getState().recordBattle('win', 'Opponent3');

      const achievements = useStore.getState().achievements;
      const hasStreak = achievements.some(a => a.id === 'battle-streak');
      expect(hasStreak).toBe(true);
    });
  });

  describe('Mini-Games', () => {
    it('should update memory high score', () => {
      useStore.getState().updateMiniGameScore('memory', 8);

      const miniGames = useStore.getState().miniGames;
      expect(miniGames.memoryHighScore).toBe(8);
    });

    it('should update rhythm high score', () => {
      useStore.getState().updateMiniGameScore('rhythm', 15);

      const miniGames = useStore.getState().miniGames;
      expect(miniGames.rhythmHighScore).toBe(15);
    });

    it('should only update high score if new score is higher', () => {
      useStore.getState().updateMiniGameScore('memory', 10);
      useStore.getState().updateMiniGameScore('memory', 5);

      const miniGames = useStore.getState().miniGames;
      expect(miniGames.memoryHighScore).toBe(10);
    });

    it('should update lastPlayedAt timestamp', () => {
      const before = Date.now();
      useStore.getState().updateMiniGameScore('memory', 5);
      const after = Date.now();

      const miniGames = useStore.getState().miniGames;
      expect(miniGames.lastPlayedAt).toBeGreaterThanOrEqual(before);
      expect(miniGames.lastPlayedAt).toBeLessThanOrEqual(after);
    });

    it('should unlock memory achievement at score 10', () => {
      useStore.getState().updateMiniGameScore('memory', 10);

      const achievements = useStore.getState().achievements;
      const hasMemory = achievements.some(a => a.id === 'minigame-memory');
      expect(hasMemory).toBe(true);
    });

    it('should unlock rhythm achievement at score 12', () => {
      useStore.getState().updateMiniGameScore('rhythm', 12);

      const achievements = useStore.getState().achievements;
      const hasRhythm = achievements.some(a => a.id === 'minigame-rhythm');
      expect(hasRhythm).toBe(true);
    });
  });

  describe('Hydration', () => {
    it('should hydrate state from saved data', () => {
      const savedData = {
        vitals: {
          hunger: 75,
          hygiene: 85,
          mood: 90,
          energy: 65,
        },
        genome: {
          red60: Array(60).fill(2),
          blue60: Array(60).fill(3),
          black60: Array(60).fill(4),
        } as Genome,
        traits: {
          physical: {
            bodyType: 'Cubic' as const,
            primaryColor: '#4ECDC4',
            secondaryColor: '#3B3B98',
            pattern: 'Striped' as const,
            texture: 'Fuzzy' as const,
            size: 1.5,
            proportions: { head: 0.4, limbs: 0.3, tail: 0.3 },
            features: ['Wings'],
          },
          personality: {
            temperament: 'Calm' as const,
            energy: 60,
            social: 80,
            curiosity: 70,
            patience: 90,
            bravery: 50,
            quirks: ['Gentle'],
          },
          latent: {
            evolutionPath: 'Harmony Guardian' as const,
            rareAbilities: ['Healing'],
            potential: 90,
            affinity: 'Water' as const,
          },
        } as DerivedTraits,
        evolution: {
          state: 'NEURO' as const,
          birthTime: 1000000,
          lastEvolutionTime: 2000000,
          experience: 50,
          totalInteractions: 75,
          canEvolve: false,
        },
      };

      useStore.getState().hydrate(savedData);

      const state = useStore.getState();
      expect(state.vitals).toEqual(savedData.vitals);
      expect(state.genome).toEqual(savedData.genome);
      expect(state.traits).toEqual(savedData.traits);
      expect(state.evolution).toEqual(savedData.evolution);
    });

    it('should preserve tickId during hydration', () => {
      useStore.setState({ tickId: 12345 });

      useStore.getState().hydrate({
        vitals: { hunger: 50, hygiene: 50, mood: 50, energy: 50 },
        genome: { red60: [], blue60: [], black60: [] } as Genome,
        traits: {} as DerivedTraits,
        evolution: initializeEvolution(),
      });

      expect(useStore.getState().tickId).toBe(12345);
    });
  });

  describe('Achievement System', () => {
    it('should not duplicate achievements', () => {
      useStore.getState().recordBattle('win', 'Opponent1');
      useStore.getState().recordBattle('win', 'Opponent2');

      const achievements = useStore.getState().achievements;
      const firstWinAchievements = achievements.filter(a => a.id === 'battle-first-win');
      expect(firstWinAchievements).toHaveLength(1);
    });

    it('should include earnedAt timestamp in achievement', () => {
      const before = Date.now();
      useStore.getState().recordBattle('win', 'Opponent1');
      const after = Date.now();

      const achievements = useStore.getState().achievements;
      const firstWin = achievements.find(a => a.id === 'battle-first-win');

      expect(firstWin?.earnedAt).toBeDefined();
      expect(firstWin!.earnedAt).toBeGreaterThanOrEqual(before);
      expect(firstWin!.earnedAt).toBeLessThanOrEqual(after);
    });
  });
});
