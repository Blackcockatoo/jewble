# Real-Time Interactive Response System

A comprehensive, context-aware response system for Jewble that provides dynamic feedback for pet interactions and game events.

## Features

- ✅ **50+ Unique Responses** across 13 categories
- ✅ **Audio Feedback** integrated with HeptaCode tones
- ✅ **Chain Reactions** for sequential responses
- ✅ **Predictive Responses** that anticipate pet needs
- ✅ **Streak Detection** celebrates consecutive actions
- ✅ **Automatic Integration** with Zustand store
- ✅ **Response History** tracking
- ✅ **Haptic Feedback** support for mobile

## Quick Start

### 1. Add to Your Page

```tsx
import { PetResponseOverlay } from '@/components/PetResponseOverlay';

export default function MyPage() {
  return (
    <div>
      <PetResponseOverlay enableAudio={true} enableAnticipation={true} />
      {/* Your content */}
    </div>
  );
}
```

### 2. Manual Response Triggering

```tsx
import { useRealtimeResponse } from '@/lib/realtime';
import { ResponseBubble } from '@/components/ResponseBubble';

function MyComponent() {
  const context = {
    mood: 70,
    energy: 80,
    hunger: 30,
    hygiene: 90,
    recentActions: [],
  };

  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse(context);

  return (
    <>
      <button onClick={() => triggerResponse('feed')}>Feed</button>
      <ResponseBubble response={currentResponse} isVisible={isVisible} />
    </>
  );
}
```

## Response Types

### Basic Actions
- `feed` - Feeding responses based on mood
- `play` - Playing responses (can trigger streaks)
- `clean` - Cleaning responses
- `sleep` - Sleeping/resting responses

### Game Events
- `achievement` - Achievement unlocks
- `evolution` - Evolution celebrations
- `breeding` - Breeding success

### Battle
- `battle_victory` - Battle wins
- `battle_defeat` - Battle losses

### Mini-Games
- `minigame_victory` - High scores
- `minigame_good` - Good performance
- `minigame_failure` - Try again messages

### Exploration
- `exploration_discovery` - New discoveries
- `exploration_anomaly` - Anomaly encounters

### Diagnostics
- `vitals_check` - Overall health check

## Audio Integration

The system integrates with HeptaCode for audio feedback:

```typescript
const handleAudioTrigger = async (digits: number[]) => {
  await playHepta(digits, {
    tempo: 200,
    volume: 0.15,
    sustainRatio: 0.7,
  });
};
```

**Audio Triggers:**
- `success` - Ascending pleasant tone [0, 2, 4, 6]
- `celebration` - Triumphant pattern [0, 3, 6, 0, 3, 6]
- `warning` - Descending alert [6, 4, 2, 0]
- `idle` - Neutral hum [3, 3, 3]

## Chain Reactions

Responses can trigger follow-up responses:

```typescript
// Playing 3 times triggers:
"Wheee! 🤩" → (after 3.5s) → "I'm on fire! 🔥"
```

## Anticipatory Responses

The system predicts what the pet might need:

- Hunger > 60: "Getting a bit hungry... 🍽️"
- Energy < 30: "Feeling sleepy... 😴"
- High vitals: "What's next? 😃"

Checked every 30 seconds when `enableAnticipation={true}`.

## API Reference

### `useRealtimeResponse(context, options)`

**Parameters:**
- `context: ResponseContext` - Pet state
- `options: UseRealtimeResponseOptions` - Configuration

**Options:**
```typescript
{
  autoIdleInterval?: number;        // Default: 8000ms
  enableWarnings?: boolean;         // Default: true
  enableAnticipation?: boolean;     // Default: true
  enableAudio?: boolean;            // Default: false
  onAudioTrigger?: (digits: number[]) => Promise<void>;
}
```

**Returns:**
```typescript
{
  currentResponse: PetResponse | null;
  isVisible: boolean;
  triggerResponse: (action: string) => void;
  triggerIdleResponse: () => void;
  triggerAnticipationResponse: () => void;
  responseHistory: PetResponse[];
  consecutiveActionCount: number;
}
```

### `ResponseContext`

```typescript
interface ResponseContext {
  mood: number;              // 0-100
  energy: number;            // 0-100
  hunger: number;            // 0-100
  hygiene: number;           // 0-100
  recentActions: string[];
  evolutionStage?: string;
  level?: number;
  consecutiveActions?: number;
}
```

### `PetResponse`

```typescript
interface PetResponse {
  id: string;
  type: ResponseType;
  text: string;
  emoji: string;
  intensity: 'subtle' | 'normal' | 'intense';
  duration: number;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  audioTrigger?: 'success' | 'warning' | 'celebration' | 'idle';
  chainReaction?: PetResponse;
}
```

## Testing

Visit `/test-responses` to access the interactive test page where you can:
- Trigger all response types manually
- Adjust context sliders
- View response history
- Test audio feedback
- Experiment with streaks and chain reactions

## Customization

### Add New Response Types

1. Add to response library in `responseSystem.ts`:

```typescript
myNewAction: {
  happy: [
    { text: 'Custom! ✨', emoji: '✨', intensity: 'intense' },
  ],
},
```

2. Add case in `getResponse()`:

```typescript
case 'my_new_action':
  responses = responseLibrary.myNewAction.happy;
  responseType = 'celebration';
  audioTrigger = 'celebration';
  break;
```

### Customize Audio Tones

Edit `getAudioToneForResponse()`:

```typescript
case 'my_custom_sound':
  return [0, 1, 2, 3, 4, 5, 6]; // Full scale
```

## Architecture

```
├── responseSystem.ts          # Core response engine
├── useRealtimeResponse.ts     # React hook
├── index.ts                   # Barrel exports
└── README.md                  # This file
```

## Dependencies

- `zustand` - State management
- `framer-motion` - Animations
- `react` - React hooks

## Browser Support

- Modern browsers with Web Audio API
- ES6+ support required
- Optional haptic feedback on mobile

## Performance

- Response history limited to 10 items
- Efficient Zustand subscriptions
- Proper timer cleanup
- Audio throttling when disabled

## Troubleshooting

### Responses Not Appearing

1. Verify `PetResponseOverlay` is mounted
2. Check Zustand store initialization
3. Check browser console for errors

### Audio Not Playing

1. Ensure `enableAudio={true}`
2. Check browser audio permissions
3. Verify volume settings
4. Test with `/test-responses` page

### Too Many Responses

1. Increase `autoIdleInterval`
2. Disable anticipation with `enableAnticipation={false}`

## Examples

See `/test-responses` page for comprehensive examples and interactive testing.

## License

Part of the Jewble project.
