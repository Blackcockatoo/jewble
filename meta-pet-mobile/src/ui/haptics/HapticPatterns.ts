import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Vitals } from '@/store';

/**
 * Advanced haptic feedback patterns that respond to app state
 */

// Helper to check if haptics are available
const isHapticsAvailable = () => Platform.OS !== 'web';

export const HapticPatterns = {
  /**
   * Light tap for UI interactions
   */
  tap: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Success feedback
   */
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning feedback
   */
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error feedback
   */
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Selection changed
   */
  selection: async () => {
    await Haptics.selectionAsync();
  },

  /**
   * Heavy impact (for important actions)
   */
  heavyImpact: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Feed action - satisfying double tap
   */
  feed: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
  },

  /**
   * Play action - playful triple tap
   */
  play: async () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, i * 80);
    }
  },

  /**
   * Clean action - sweeping pattern
   */
  clean: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 50);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
  },

  /**
   * Sleep action - calming descent
   */
  sleep: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 200);
  },

  /**
   * Evolution - dramatic ascending pattern
   */
  evolution: async () => {
    const delays = [0, 100, 150, 200, 300];
    const impacts = [
      Haptics.ImpactFeedbackStyle.Light,
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Heavy,
      Haptics.ImpactFeedbackStyle.Heavy,
    ];

    for (let i = 0; i < delays.length; i++) {
      setTimeout(async () => {
        await Haptics.impactAsync(impacts[i]);
      }, delays[i]);
    }

    setTimeout(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);
  },

  /**
   * Hepta code chime sync - rhythmic pattern
   */
  heptaChime: async (digitCount: number = 7) => {
    for (let i = 0; i < Math.min(digitCount, 7); i++) {
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, i * 150);
    }
  },

  /**
   * Critical vitals warning - pulsing pattern
   */
  criticalVitals: async () => {
    for (let i = 0; i < 2; i++) {
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, i * 300);
    }
  },

  /**
   * Adaptive haptic based on vitals state
   */
  vitalsResponsive: async (vitals: Vitals) => {
    const avgVitals = (vitals.hunger + vitals.hygiene + vitals.mood + vitals.energy) / 4;

    if (avgVitals < 30) {
      // Critical - strong warning
      await HapticPatterns.criticalVitals();
    } else if (avgVitals < 50) {
      // Low - warning
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (avgVitals > 80) {
      // Thriving - success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Normal - light tap
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * DNA mint celebration
   */
  dnaMinted: async () => {
    const pattern = [100, 50, 50, 100, 200];
    for (let i = 0; i < pattern.length; i++) {
      setTimeout(async () => {
        await Haptics.impactAsync(
          i % 2 === 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
        );
      }, pattern.slice(0, i).reduce((a, b) => a + b, 0));
    }
  },
};

/**
 * Haptic manager with settings awareness
 */
export class HapticManager {
  private static enabled = true;

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  static async trigger(pattern: keyof typeof HapticPatterns, ...args: any[]) {
    if (!this.enabled || !isHapticsAvailable()) return;

    try {
      const fn = HapticPatterns[pattern] as any;
      if (typeof fn === 'function') {
        await fn(...args);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
}
