# Interactive Real-Time Responses - Implementation Guide

## Overview

This document describes the comprehensive enhancements made to Jewble's interactive real-time response system. The system provides dynamic, contextual feedback for pet interactions and game events with audio integration, chain reactions, and predictive responses.

## Architecture

### Core Components

1. **responseSystem.ts** (`/meta-pet/src/lib/realtime/responseSystem.ts`)
   - Response generation engine
   - Contextual response library
   - Audio tone mapping
   - Anticipatory response logic

2. **useRealtimeResponse.ts** (`/meta-pet/src/lib/realtime/useRealtimeResponse.ts`)
   - React hook for managing response state
   - Chain reaction handling
   - Audio playback integration
   - Consecutive action tracking

3. **ResponseBubble.tsx** (`/meta-pet/src/components/ResponseBubble.tsx`)
   - UI component for displaying responses
   - Framer Motion animations
   - Type-based color gradients
   - Particle effects for intense responses

4. **PetResponseOverlay.tsx** (`/meta-pet/src/components/PetResponseOverlay.tsx`)
   - Dashboard integration component
   - Zustand store subscription
   - Automatic response triggering
   - Response history display

## Features Implemented

### 1. Enhanced Response Contexts

**New Response Types:**
- ✅ Mini-game victories, good scores, and failures
- ✅ Exploration discoveries and anomalies
- ✅ Vitals check responses (excellent, good, declining, critical)
- ✅ Streak milestones (consecutive actions)
- ✅ Anticipatory responses (predictive feedback)

**Response Categories:**
```typescript
- feeding (happy, neutral, unhappy)
- playing (happy, neutral, tired)
- cleaning (happy, neutral)
- sleeping (happy)
- achievement (intense)
- breeding (intense)
- battle (victory, defeat)
- evolution (intense)
- minigame (victory, good, failure)
- exploration (discovery, anomaly)
- vitals (excellent, good, declining, critical)
- streak (milestone)
- anticipation (excited, curious)
```

### 2. Audio Feedback Integration

**Audio Triggers:**
- `success` - Ascending pleasant tone [0, 2, 4, 6]
- `celebration` - Triumphant pattern [0, 3, 6, 0, 3, 6]
- `warning` - Descending alert [6, 4, 2, 0]
- `idle` - Neutral hum [3, 3, 3]

**Integration with HeptaCode:**
```typescript
// Automatic audio playback on responses
const handleAudioTrigger = async (digits: number[]) => {
  await playHepta(digits, {
    tempo: 200,
    volume: 0.15,
    sustainRatio: 0.7,
  });
};
```

### 3. Chain Reactions

Responses can now trigger follow-up responses automatically:

```typescript
// Example: Playing 3 times in a row triggers a streak celebration
if (consecutiveActions >= 3) {
  chainReaction = {
    type: 'celebration',
    text: "I'm on fire! 🔥",
    emoji: '🔥',
    intensity: 'intense',
    duration: 2000,
    audioTrigger: 'celebration',
  };
}
```

### 4. Predictive/Anticipatory Responses

The system now predicts what the pet might need:

```typescript
// Examples:
- hunger > 60: "Getting a bit hungry... 🍽️"
- energy < 30: "Feeling sleepy... 😴"
- avgVitals > 80: "What's next? 😃"
```

Anticipatory responses are checked every 30 seconds and displayed when appropriate.

### 5. Zustand Store Integration

The `PetResponseOverlay` component automatically detects state changes and triggers responses:

```typescript
// Automatic detection of:
- Feeding (hunger decrease >= 10)
- Playing (mood increase >= 10)
- Cleaning (hygiene increase >= 10)
- Sleeping (energy increase >= 15)
- Evolution (state change)
- Achievements (new achievement unlocked)
- Battle results (wins/losses)
- Mini-game high scores
- Vimana exploration (discoveries, anomalies)
```

### 6. Consecutive Action Tracking

The system tracks consecutive actions within 10 seconds:

```typescript
// Streak detection
if (sameAction && timeSinceLastAction < 10000) {
  consecutiveActionCount++;

  if (consecutiveActionCount >= 3) {
    // Trigger streak celebration
  }
}
```

## Usage

### Basic Integration

Add the `PetResponseOverlay` to your main page:

```tsx
import { PetResponseOverlay } from '@/components/PetResponseOverlay';

export default function Home() {
  return (
    <div>
      <PetResponseOverlay
        enableAudio={true}
        enableAnticipation={true}
      />

      {/* Your other components */}
    </div>
  );
}
```

### Manual Response Triggering

You can manually trigger responses using the hook:

```tsx
import { useRealtimeResponse } from '@/lib/realtime/useRealtimeResponse';
import { ResponseBubble } from '@/components/ResponseBubble';

function MyComponent() {
  const context = {
    mood: 70,
    energy: 80,
    hunger: 30,
    hygiene: 90,
    recentActions: [],
  };

  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse(context, {
    enableAudio: true,
    enableAnticipation: true,
    onAudioTrigger: async (digits) => {
      await playHepta(digits);
    },
  });

  return (
    <div>
      <button onClick={() => triggerResponse('feed')}>
        Feed Pet
      </button>
      <ResponseBubble response={currentResponse} isVisible={isVisible} />
    </div>
  );
}
```

### Available Actions

Trigger any of these actions with `triggerResponse()`:

```typescript
// Basic actions
'feed', 'play', 'clean', 'sleep'

// Game events
'achievement', 'breeding', 'evolution'

// Battle
'battle_victory', 'battle_defeat'

// Mini-games
'minigame_victory', 'minigame_good', 'minigame_failure'

// Exploration
'exploration_discovery', 'exploration_anomaly'

// Diagnostics
'vitals_check'
```

## Response Properties

```typescript
interface PetResponse {
  id: string;                           // Unique identifier
  type: ResponseType;                   // Response category
  text: string;                         // Display text
  emoji: string;                        // Emoji icon
  intensity: 'subtle' | 'normal' | 'intense'; // Animation intensity
  duration: number;                     // Display duration (ms)
  hapticFeedback?: 'light' | 'medium' | 'heavy'; // Mobile haptics
  audioTrigger?: 'success' | 'warning' | 'celebration' | 'idle'; // Audio cue
  chainReaction?: PetResponse;          // Follow-up response
}
```

## Customization

### Adding New Response Types

1. Add to `responseLibrary` in `responseSystem.ts`:

```typescript
const responseLibrary = {
  // ... existing responses ...
  myNewAction: {
    happy: [
      { text: 'Custom response! ✨', emoji: '✨', intensity: 'intense' },
    ],
  },
};
```

2. Add case in `getResponse()`:

```typescript
case 'my_new_action':
  responses = responseLibrary.myNewAction.happy;
  responseType = 'celebration';
  duration = 3000;
  audioTrigger = 'celebration';
  break;
```

### Customizing Audio Tones

Modify `getAudioToneForResponse()` to add new audio patterns:

```typescript
case 'my_custom_sound':
  return [0, 1, 2, 3, 4, 5, 6]; // Full scale ascending
```

### Adjusting Timing

```typescript
// In PetResponseOverlay
autoIdleInterval: 12000,     // Idle responses every 12s

// In useRealtimeResponse
anticipationInterval: 30000,  // Check anticipation every 30s
```

## Performance Considerations

1. **Response History**: Limited to 10 items to prevent memory issues
2. **Audio Throttling**: Only plays if enabled and audioTrigger is set
3. **State Subscriptions**: Efficient Zustand subscriptions with minimal re-renders
4. **Timer Cleanup**: All timeouts are properly cleaned up on unmount

## Testing

### Manual Testing Checklist

- [ ] Feed action triggers response
- [ ] Play action triggers response
- [ ] Clean action triggers response
- [ ] Sleep action triggers response
- [ ] Evolution triggers celebration
- [ ] Achievement triggers celebration
- [ ] Battle victory triggers response
- [ ] Mini-game completion triggers response
- [ ] Exploration discovery triggers response
- [ ] Warning appears when vitals are critical
- [ ] Idle responses appear automatically
- [ ] Anticipatory responses predict needs
- [ ] Consecutive actions trigger streaks
- [ ] Audio plays on responses (if enabled)
- [ ] Chain reactions appear correctly
- [ ] Response history displays

### Test Consecutive Actions

1. Click "Play" 3 times quickly (within 10 seconds)
2. Should see: Play response → Streak celebration

### Test Audio

1. Enable audio in PetResponseOverlay
2. Trigger any action
3. Listen for HeptaCode tone

### Test Anticipation

1. Wait 30 seconds with high vitals
2. Should see anticipatory response like "What's next? 😃"

## Browser Compatibility

- **Web Audio API**: Required for audio feedback
- **Framer Motion**: Required for animations
- **Modern ES6+**: Uses async/await, optional chaining

## Future Enhancements

Potential improvements:
- [ ] Voice synthesis for responses
- [ ] More sophisticated AI-driven response generation
- [ ] Multiplayer response synchronization (WebSocket)
- [ ] Customizable response personalities
- [ ] Response sentiment analysis
- [ ] Advanced chain reaction patterns
- [ ] Response learning from user preferences

## Troubleshooting

### Responses Not Appearing

1. Check that `PetResponseOverlay` is mounted
2. Verify Zustand store is properly initialized
3. Check browser console for errors

### Audio Not Playing

1. Ensure `enableAudio={true}` is set
2. Check browser audio permissions
3. Verify Web Audio API is supported
4. Check volume settings

### Responses Appearing Too Frequently

1. Adjust `autoIdleInterval` (increase value)
2. Disable anticipation with `enableAnticipation={false}`

### Chain Reactions Not Working

1. Verify consecutive action detection
2. Check `consecutiveActions` threshold (default: 3)
3. Ensure timeouts are properly set up

## File Structure

```
meta-pet/
├── src/
│   ├── lib/
│   │   └── realtime/
│   │       ├── responseSystem.ts          (Response engine)
│   │       └── useRealtimeResponse.ts     (React hook)
│   ├── components/
│   │   ├── ResponseBubble.tsx             (UI component)
│   │   └── PetResponseOverlay.tsx         (Dashboard integration)
│   └── app/
│       └── page.tsx                        (Main dashboard with overlay)
```

## API Reference

### `getResponse(action, context)`
Generate a contextual response for an action.

### `getIdleResponse(context)`
Get a random mood-based idle response.

### `getWarningResponse(context)`
Check if any vitals are critical and return warning.

### `getAnticipatoryResponse(context)`
Predict what the pet might need and return suggestion.

### `getAudioToneForResponse(audioTrigger)`
Map audio trigger to HeptaCode digit pattern.

### `useRealtimeResponse(context, options)`
React hook for managing response state and triggering responses.

## Credits

Implemented as part of the Jewble interactive response system enhancement.
- Response system architecture
- Audio integration with HeptaCode
- Chain reaction support
- Predictive/anticipatory responses
- Full Zustand store integration

---

**Version**: 1.0.0
**Last Updated**: 2025-11-20
**Status**: Production Ready ✅
