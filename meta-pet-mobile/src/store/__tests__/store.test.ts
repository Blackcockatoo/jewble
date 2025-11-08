import { renderHook, act } from '@testing-library/react-native';
import { useStore } from '../index';

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStore());
    act(() => {
      result.current.stopTick();
    });
  });

  describe('Vitals', () => {
    it('should initialize with default vitals', () => {
      const { result } = renderHook(() => useStore());

      expect(result.current.vitals.hunger).toBeGreaterThanOrEqual(0);
      expect(result.current.vitals.hunger).toBeLessThanOrEqual(100);
      expect(result.current.vitals.hygiene).toBeGreaterThanOrEqual(0);
      expect(result.current.vitals.mood).toBeGreaterThanOrEqual(0);
      expect(result.current.vitals.energy).toBeGreaterThanOrEqual(0);
    });

    it('should feed and reduce hunger', () => {
      const { result } = renderHook(() => useStore());
      const initialHunger = result.current.vitals.hunger;

      act(() => {
        result.current.feed();
      });

      expect(result.current.vitals.hunger).toBeLessThan(initialHunger);
    });

    it('should clean and increase hygiene', () => {
      const { result } = renderHook(() => useStore());
      const initialHygiene = result.current.vitals.hygiene;

      act(() => {
        result.current.clean();
      });

      expect(result.current.vitals.hygiene).toBeGreaterThanOrEqual(initialHygiene);
    });

    it('should play and increase mood', () => {
      const { result } = renderHook(() => useStore());
      const initialMood = result.current.vitals.mood;

      act(() => {
        result.current.play();
      });

      expect(result.current.vitals.mood).toBeGreaterThan(initialMood);
    });

    it('should sleep and increase energy', () => {
      const { result } = renderHook(() => useStore());
      const initialEnergy = result.current.vitals.energy;

      act(() => {
        result.current.sleep();
      });

      expect(result.current.vitals.energy).toBeGreaterThan(initialEnergy);
    });

    it('should clamp vitals between 0 and 100', () => {
      const { result } = renderHook(() => useStore());

      // Feed multiple times
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.feed();
        }
      });

      expect(result.current.vitals.hunger).toBeGreaterThanOrEqual(0);
      expect(result.current.vitals.hunger).toBeLessThanOrEqual(100);
      expect(result.current.vitals.energy).toBeLessThanOrEqual(100);
    });
  });

  describe('Tick System', () => {
    it('should start and stop tick', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.startTick();
      });

      expect(result.current.isTicking).toBe(true);

      act(() => {
        result.current.stopTick();
      });

      expect(result.current.isTicking).toBe(false);
    });

    it('should not start tick if already ticking', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.startTick();
        result.current.startTick(); // Try to start again
      });

      expect(result.current.isTicking).toBe(true);
    });

    it('should increment tick count over time', async () => {
      const { result } = renderHook(() => useStore());
      const initialCount = result.current.tickCount;

      act(() => {
        result.current.startTick();
      });

      // Wait for a few ticks
      await new Promise(resolve => setTimeout(resolve, 3100));

      act(() => {
        result.current.stopTick();
      });

      expect(result.current.tickCount).toBeGreaterThan(initialCount);
    });
  });

  describe('Evolution', () => {
    it('should initialize evolution data', () => {
      const { result } = renderHook(() => useStore());

      expect(result.current.evolution).toBeDefined();
      expect(result.current.evolution.currentStage).toBeDefined();
      expect(result.current.evolution.experience).toBeDefined();
    });

    it('should try evolution when eligible', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        const evolved = result.current.tryEvolve();
        // May or may not evolve depending on requirements
        expect(typeof evolved).toBe('boolean');
      });
    });
  });

  describe('Settings', () => {
    it('should update settings', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.updateSettings({ audioEnabled: false });
      });

      expect(result.current.settings.audioEnabled).toBe(false);
    });

    it('should toggle dark mode', () => {
      const { result } = renderHook(() => useStore());
      const initialDarkMode = result.current.settings.darkMode;

      act(() => {
        result.current.updateSettings({ darkMode: !initialDarkMode });
      });

      expect(result.current.settings.darkMode).toBe(!initialDarkMode);
    });
  });

  describe('Data Management', () => {
    it('should export data', async () => {
      const { result } = renderHook(() => useStore());

      let exportData;
      await act(async () => {
        exportData = await result.current.exportData();
      });

      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('vitals');
      expect(exportData).toHaveProperty('evolution');
    });

    it('should clear all data', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.clearAllData();
      });

      // Check that data is reset to defaults
      expect(result.current.genome).toBeNull();
    });
  });
});
