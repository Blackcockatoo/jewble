/**
 * Real-time Response System
 * Provides dynamic, contextual feedback for pet interactions and game events
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
}

export interface ResponseContext {
  mood: number;
  energy: number;
  hunger: number;
  hygiene: number;
  recentActions: string[];
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

  let responses: Array<{ text: string; emoji: string; intensity: string }> = [];
  let responseType: ResponseType = 'action';
  let duration = 3000;

  switch (action) {
    case 'feed':
      responses = responseLibrary.feeding[isVeryTired ? 'neutral' : moodLevel] || responseLibrary.feeding.neutral;
      responseType = 'action';
      duration = 2500;
      break;
    case 'play':
      responses = responseLibrary.playing[isVeryTired ? 'tired' : moodLevel] || responseLibrary.playing.neutral;
      responseType = 'interaction';
      duration = 3500;
      break;
    case 'clean':
      responses = responseLibrary.cleaning[moodLevel] || responseLibrary.cleaning.neutral;
      responseType = 'action';
      duration = 2500;
      break;
    case 'sleep':
      responses = responseLibrary.sleeping.happy;
      responseType = 'action';
      duration = 2000;
      break;
    case 'achievement':
      responses = responseLibrary.achievement.intense;
      responseType = 'achievement';
      duration = 4000;
      break;
    case 'breeding':
      responses = responseLibrary.breeding.intense;
      responseType = 'celebration';
      duration = 4000;
      break;
    case 'battle_victory':
      responses = responseLibrary.battle.victory;
      responseType = 'celebration';
      duration = 3500;
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
      break;
    default:
      responses = [{ text: 'Hi there! 👋', emoji: '👋', intensity: 'subtle' }];
  }

  // Select a random response
  const selected = responses[Math.floor(Math.random() * responses.length)];

  return {
    id: `${Date.now()}-${Math.random()}`,
    type: responseType,
    text: selected.text,
    emoji: selected.emoji,
    intensity: (selected.intensity as 'subtle' | 'normal' | 'intense') || 'normal',
    duration,
    hapticFeedback: selected.intensity === 'intense' ? 'heavy' : selected.intensity === 'normal' ? 'medium' : 'light',
  };
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
    };
  }

  return null;
}
