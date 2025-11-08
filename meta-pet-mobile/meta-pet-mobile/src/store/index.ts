import { create } from 'zustand';

// Define the state structure
interface VitalsState {
  isTicking: boolean;
  tickCount: number;
  startTick: () => void;
  stopTick: () => void;
}

// Placeholder for the interval ID
let tickInterval: NodeJS.Timeout | null = null;

export const useStore = create<VitalsState>((set, get) => ({
  isTicking: false,
  tickCount: 0,

  startTick: () => {
    if (get().isTicking) return;

    set({ isTicking: true });
    console.log("Vitals Tick Started");

    // Placeholder for the actual tick logic
    // The actual interval should use FEATURES.LOW_POWER_TICK_MS logic, but for now, a placeholder is fine.
    tickInterval = setInterval(() => {
      set((state) => ({ tickCount: state.tickCount + 1 }));
      // In a real implementation, this is where the engine/sim.ts logic would be called
    }, 1000);

  },

  stopTick: () => {
    if (!get().isTicking) return;

    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    set({ isTicking: false });
    console.log("Vitals Tick Stopped");
  },
}));
