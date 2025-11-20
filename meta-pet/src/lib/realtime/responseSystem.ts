/**
 * Real-time Response System
 * Provides dynamic, contextual feedback for pet interactions and game events
 * Enhanced with audio integration, chain reactions, and predictive responses
 */

export type ResponseType = 'action' | 'mood' | 'achievement' | 'interaction' | 'warning' | 'celebration';

export interface PetResponse {
  id: string;
  type: ResponseType;
  text: string;
  emoji: string;
  intensity: 'subtle' | 'normal' | 'intense';
  duration: number; // milliseconds
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  audioTrigger?: 'success' | 'warning' | 'celebration' | 'idle'; // Audio feedback type
  chainReaction?: PetResponse; // Follow-up response
}

export interface ResponseContext {
  mood: number;
  energy: number;
  hunger: number;
  hygiene: number;
  recentActions: string[];
  evolutionStage?: string; // Current evolution stage
  level?: number; // Experience level
  consecutiveActions?: number; // For streak detection
}

// Response library organized by context and mood
const responseLibrary = {
  feeding: {
    happy: [
      { text: 'Nom nom! 😋', emoji: '😋', intensity: 'normal' },
      { text: 'Delicious! 🤤', emoji: '🤤', intensity: 'normal' },
      { text: 'Thank you! 💚', emoji: '💚', intensity: 'normal' },
      { text: 'Yummy yummy! 🍽️', emoji: '🍽️', intensity: 'intense' },
    ],
    neutral: [
      { text: 'Thanks for the meal 🍴', emoji: '🍴', intensity: 'subtle' },
      { text: 'Eating... 😐', emoji: '😐', intensity: 'subtle' },
    ],
    unhappy: [
      { text: 'Not hungry right now 😒', emoji: '😒', intensity: 'subtle' },
      { text: 'I wanted something else 😑', emoji: '😑', intensity: 'subtle' },
    ],
  },
  playing: {
    happy: [
      { text: 'This is so fun! 🎉', emoji: '🎉', intensity: 'intense' },
      { text: 'Wheee! 🤩', emoji: '🤩', intensity: 'intense' },
      { text: 'Again! Again! 🎊', emoji: '🎊', intensity: 'intense' },
      { text: 'Best day ever! ✨', emoji: '✨', intensity: 'intense' },
    ],
    neutral: [
      { text: 'That was nice 😊', emoji: '😊', intensity: 'normal' },
      { text: 'Fun times 🎮', emoji: '🎮', intensity: 'normal' },
    ],
    tired: [
      { text: 'I need rest... 😴', emoji: '😴', intensity: 'subtle' },
      { text: 'Can we rest soon? 😪', emoji: '😪', intensity: 'subtle' },
    ],
  },
  cleaning: {
    happy: [
      { text: 'Ahhh, refreshing! 💦', emoji: '💦', intensity: 'normal' },
      { text: 'So clean! ✨', emoji: '✨', intensity: 'normal' },
      { text: 'Much better! 🧼', emoji: '🧼', intensity: 'normal' },
    ],
    neutral: [
      { text: 'Getting cleaned up 🚿', emoji: '🚿', intensity: 'subtle' },
    ],
  },
  sleeping: {
    happy: [
      { text: 'Sweet dreams... 😴', emoji: '😴', intensity: 'subtle' },
      { text: 'Zzz... 💤', emoji: '💤', intensity: 'subtle' },
    ],
  },
  achievement: {
    intense: [
      { text: 'INCREDIBLE! 🏆', emoji: '🏆', intensity: 'intense' },
      { text: 'I DID IT! 🎆', emoji: '🎆', intensity: 'intense' },
      { text: 'LEGENDARY! ⭐', emoji: '⭐', intensity: 'intense' },
    ],
  },
  breeding: {
    intense: [
      { text: 'A new friend! 👶', emoji: '👶', intensity: 'intense' },
      { text: 'Welcome to the world! 🌟', emoji: '🌟', intensity: 'intense' },
    ],
  },
  battle: {
    victory: [
      { text: 'Victory! 🎯', emoji: '🎯', intensity: 'intense' },
      { text: 'I won! 💪', emoji: '💪', intensity: 'intense' },
    ],
    defeat: [
      { text: 'I lost... 😔', emoji: '😔', intensity: 'normal' },
      { text: 'Better luck next time 💪', emoji: '💪', intensity: 'normal' },
    ],
  },
  evolution: {
    intense: [
      { text: 'I EVOLVED! 🔄✨', emoji: '✨', intensity: 'intense' },
      { text: 'NEW FORM! 🌈', emoji: '🌈', intensity: 'intense' },
      { text: 'TRANSFORMATION! ⚡', emoji: '⚡', intensity: 'intense' },
    ],
  },
  minigame: {
    victory: [
      { text: 'High score! 🎮', emoji: '🎮', intensity: 'intense' },
      { text: 'Nailed it! 🎯', emoji: '🎯', intensity: 'intense' },
      { text: 'Perfect! ⭐', emoji: '⭐', intensity: 'intense' },
    ],
    good: [
      { text: 'Nice work! 👍', emoji: '👍', intensity: 'normal' },
      { text: 'Getting better! 📈', emoji: '📈', intensity: 'normal' },
    ],
    failure: [
      { text: 'Almost! 😅', emoji: '😅', intensity: 'subtle' },
      { text: "I'll try again 💪", emoji: '💪', intensity: 'subtle' },
    ],
  },
  exploration: {
    discovery: [
      { text: 'Found something! 🔍', emoji: '🔍', intensity: 'normal' },
      { text: 'Interesting! 👀', emoji: '👀', intensity: 'normal' },
      { text: 'New territory! 🗺️', emoji: '🗺️', intensity: 'intense' },
    ],
    anomaly: [
      { text: 'What is this? 🤔', emoji: '🤔', intensity: 'normal' },
      { text: 'Anomaly detected! ⚠️', emoji: '⚠️', intensity: 'intense' },
    ],
  },
  vitals: {
    excellent: [
      { text: "I'm thriving! 🌟", emoji: '🌟', intensity: 'normal' },
      { text: 'Feeling amazing! ✨', emoji: '✨', intensity: 'normal' },
      { text: 'Peak condition! 💫', emoji: '💫', intensity: 'intense' },
    ],
    good: [
      { text: 'Doing well! 😊', emoji: '😊', intensity: 'subtle' },
      { text: 'All good here! ✓', emoji: '✓', intensity: 'subtle' },
    ],
    declining: [
      { text: 'Need some care... 😟', emoji: '😟', intensity: 'normal' },
      { text: 'Not feeling great 😔', emoji: '😔', intensity: 'normal' },
    ],
    critical: [
      { text: 'HELP! 😱', emoji: '😱', intensity: 'intense' },
      { text: 'URGENT! ⚠️', emoji: '⚠️', intensity: 'intense' },
    ],
  },
  streak: {
    milestone: [
      { text: '3 in a row! 🔥', emoji: '🔥', intensity: 'intense' },
      { text: "I'm on fire! 🔥", emoji: '🔥', intensity: 'intense' },
      { text: 'Unstoppable! ⚡', emoji: '⚡', intensity: 'intense' },
    ],
  },
  anticipation: {
    excited: [
      { text: "What's next? 😃", emoji: '😃', intensity: 'subtle' },
      { text: 'Ready for more! 💪', emoji: '💪', intensity: 'subtle' },
    ],
    curious: [
      { text: 'Hmm... 🤔', emoji: '🤔', intensity: 'subtle' },
      { text: 'Waiting... ⏳', emoji: '⏳', intensity: 'subtle' },
    ],
  },
};

/**
 * Get a contextual response for a given action
 */
export function getResponse(
  action: string,
  context: ResponseContext,
): PetResponse {
  const moodLevel = context.mood > 70 ? 'happy' : context.mood > 40 ? 'neutral' : 'unhappy';
  const isVeryTired = context.energy < 30;
  const isConsecutive = (context.consecutiveActions ?? 0) >= 3;

  let responses: Array<{ text: string; emoji: string; intensity: string }> = [];
  let responseType: ResponseType = 'action';
  let duration = 3000;
  let audioTrigger: 'success' | 'warning' | 'celebration' | 'idle' | undefined;
  let chainReaction: PetResponse | undefined;

  switch (action) {
    case 'feed':
      responses = responseLibrary.feeding[isVeryTired ? 'neutral' : moodLevel] || responseLibrary.feeding.neutral;
      responseType = 'action';
      duration = 2500;
      audioTrigger = 'success';
      break;
    case 'play':
      responses = responseLibrary.playing[isVeryTired ? 'tired' : moodLevel] || responseLibrary.playing.neutral;
      responseType = 'interaction';
      duration = 3500;
      audioTrigger = 'success';
      // Add streak reaction if consecutive
      if (isConsecutive) {
        const streakResponse = responseLibrary.streak.milestone[0];
        chainReaction = {
          id: `chain-${Date.now()}`,
          type: 'celebration',
          text: streakResponse.text,
          emoji: streakResponse.emoji,
          intensity: 'intense',
          duration: 2000,
          audioTrigger: 'celebration',
        };
      }
      break;
    case 'clean':
      responses = responseLibrary.cleaning[moodLevel] || responseLibrary.cleaning.neutral;
      responseType = 'action';
      duration = 2500;
      audioTrigger = 'success';
      break;
    case 'sleep':
      responses = responseLibrary.sleeping.happy;
      responseType = 'action';
      duration = 2000;
      audioTrigger = 'idle';
      break;
    case 'achievement':
      responses = responseLibrary.achievement.intense;
      responseType = 'achievement';
      duration = 4000;
      audioTrigger = 'celebration';
      break;
    case 'breeding':
      responses = responseLibrary.breeding.intense;
      responseType = 'celebration';
      duration = 4000;
      audioTrigger = 'celebration';
      break;
    case 'battle_victory':
      responses = responseLibrary.battle.victory;
      responseType = 'celebration';
      duration = 3500;
      audioTrigger = 'celebration';
      break;
    case 'battle_defeat':
      responses = responseLibrary.battle.defeat;
      responseType = 'mood';
      duration = 3000;
      break;
    case 'evolution':
      responses = responseLibrary.evolution.intense;
      responseType = 'celebration';
      duration = 5000;
      audioTrigger = 'celebration';
      break;
    case 'minigame_victory':
      responses = responseLibrary.minigame.victory;
      responseType = 'achievement';
      duration = 3500;
      audioTrigger = 'celebration';
      break;
    case 'minigame_good':
      responses = responseLibrary.minigame.good;
      responseType = 'interaction';
      duration = 2500;
      audioTrigger = 'success';
      break;
    case 'minigame_failure':
      responses = responseLibrary.minigame.failure;
      responseType = 'mood';
      duration = 2000;
      break;
    case 'exploration_discovery':
      responses = responseLibrary.exploration.discovery;
      responseType = 'interaction';
      duration = 2500;
      audioTrigger = 'success';
      break;
    case 'exploration_anomaly':
      responses = responseLibrary.exploration.anomaly;
      responseType = 'warning';
      duration = 3000;
      audioTrigger = 'warning';
      break;
    case 'vitals_check':
      const avgVitals = (context.mood + context.energy + (100 - context.hunger) + context.hygiene) / 4;
      if (avgVitals >= 80) {
        responses = responseLibrary.vitals.excellent;
        audioTrigger = 'success';
      } else if (avgVitals >= 60) {
        responses = responseLibrary.vitals.good;
      } else if (avgVitals >= 40) {
        responses = responseLibrary.vitals.declining;
        audioTrigger = 'warning';
      } else {
        responses = responseLibrary.vitals.critical;
        audioTrigger = 'warning';
      }
      responseType = 'mood';
      duration = 2500;
      break;
    default:
      responses = [{ text: 'Hi there! 👋', emoji: '👋', intensity: 'subtle' }];
      audioTrigger = 'idle';
  }

  // Select a random response
  const selected = responses[Math.floor(Math.random() * responses.length)];

  const response: PetResponse = {
    id: `${Date.now()}-${Math.random()}`,
    type: responseType,
    text: selected.text,
    emoji: selected.emoji,
    intensity: (selected.intensity as 'subtle' | 'normal' | 'intense') || 'normal',
    duration,
    hapticFeedback: selected.intensity === 'intense' ? 'heavy' : selected.intensity === 'normal' ? 'medium' : 'light',
    audioTrigger,
    chainReaction,
  };

  return response;
}

/**
 * Get a random contextual response based on mood
 */
export function getIdleResponse(context: ResponseContext): PetResponse {
  const moodLevel = context.mood > 70 ? 'happy' : context.mood > 40 ? 'neutral' : 'unhappy';

  const idleResponses = {
    happy: [
      { text: 'Life is good! 🌟', emoji: '🌟', intensity: 'subtle' },
      { text: 'I love this! 💕', emoji: '💕', intensity: 'subtle' },
      { text: 'Feeling great! 😄', emoji: '😄', intensity: 'subtle' },
    ],
    neutral: [
      { text: 'Just chillin... 😌', emoji: '😌', intensity: 'subtle' },
      { text: 'What\'s next? 🤔', emoji: '🤔', intensity: 'subtle' },
    ],
    unhappy: [
      { text: 'I\'m bored 😐', emoji: '😐', intensity: 'subtle' },
      { text: 'Feeling down... 😔', emoji: '😔', intensity: 'subtle' },
    ],
  };

  const responses = idleResponses[moodLevel] || idleResponses.neutral;
  const selected = responses[Math.floor(Math.random() * responses.length)];

  return {
    id: `idle-${Date.now()}-${Math.random()}`,
    type: 'mood',
    text: selected.text,
    emoji: selected.emoji,
    intensity: 'subtle',
    duration: 2500,
  };
}

/**
 * Get a warning response for critical vitals
 */
export function getWarningResponse(context: ResponseContext): PetResponse | null {
  if (context.hunger > 80) {
    return {
      id: `warning-${Date.now()}`,
      type: 'warning',
      text: 'I\'m STARVING! 😫',
      emoji: '😫',
      intensity: 'intense',
      duration: 3000,
      hapticFeedback: 'heavy',
      audioTrigger: 'warning',
    };
  }

  if (context.hygiene < 20) {
    return {
      id: `warning-${Date.now()}`,
      type: 'warning',
      text: 'I need a bath! 🚿',
      emoji: '🚿',
      intensity: 'normal',
      duration: 2500,
      hapticFeedback: 'medium',
      audioTrigger: 'warning',
    };
  }

  if (context.energy < 10) {
    return {
      id: `warning-${Date.now()}`,
      type: 'warning',
      text: 'So tired... 😴',
      emoji: '😴',
      intensity: 'normal',
      duration: 2500,
      hapticFeedback: 'light',
      audioTrigger: 'warning',
    };
  }

  return null;
}

/**
 * Get a predictive/anticipatory response based on context
 * Detects patterns and suggests next actions
 */
export function getAnticipatoryResponse(context: ResponseContext): PetResponse | null {
  const avgVitals = (context.mood + context.energy + (100 - context.hunger) + context.hygiene) / 4;

  // Predict what the pet might need soon
  if (context.hunger > 60 && context.hunger < 80) {
    return {
      id: `anticipate-${Date.now()}`,
      type: 'mood',
      text: 'Getting a bit hungry... 🍽️',
      emoji: '🍽️',
      intensity: 'subtle',
      duration: 2500,
    };
  }

  if (context.energy < 30 && context.energy > 10) {
    return {
      id: `anticipate-${Date.now()}`,
      type: 'mood',
      text: 'Feeling sleepy... 😴',
      emoji: '😴',
      intensity: 'subtle',
      duration: 2500,
    };
  }

  if (avgVitals > 80 && context.mood > 70) {
    const responses = responseLibrary.anticipation.excited;
    const selected = responses[Math.floor(Math.random() * responses.length)];
    return {
      id: `anticipate-${Date.now()}`,
      type: 'mood',
      text: selected.text,
      emoji: selected.emoji,
      intensity: 'subtle',
      duration: 2000,
    };
  }

  return null;
}

/**
 * Generate audio tone based on response type
 * Returns frequency array for HeptaCode playback
 */
export function getAudioToneForResponse(audioTrigger?: string): number[] {
  // Map audio triggers to HeptaCode digit patterns
  switch (audioTrigger) {
    case 'success':
      return [0, 2, 4, 6]; // Ascending pleasant tone
    case 'celebration':
      return [0, 3, 6, 0, 3, 6]; // Triumphant pattern
    case 'warning':
      return [6, 4, 2, 0]; // Descending warning
    case 'idle':
      return [3, 3, 3]; // Neutral hum
    default:
      return [];
  }
}
