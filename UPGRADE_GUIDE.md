# Jewble Real-Time Interactive Upgrade Guide

This guide explains the new real-time response system and enhanced visual components that have been added to the Jewble game.

## New Components & Features

### 1. **Real-Time Response System** (`lib/realtime/responseSystem.ts`)

A dynamic response system that provides contextual feedback based on pet mood and game events.

**Key Features:**
- Context-aware responses based on pet vitals (mood, energy, hunger, hygiene)
- Multiple response types: action, mood, achievement, interaction, warning, celebration
- Customizable intensity levels: subtle, normal, intense
- Haptic feedback support for mobile devices

**Usage:**
```typescript
import { getResponse, getIdleResponse, getWarningResponse } from '@/lib/realtime/responseSystem';

const context = {
  mood: 75,
  energy: 60,
  hunger: 40,
  hygiene: 80,
  recentActions: ['play', 'feed'],
};

// Get response for a specific action
const response = getResponse('feed', context);

// Get idle response (random contextual response)
const idleResponse = getIdleResponse(context);

// Get warning if vitals are critical
const warning = getWarningResponse(context);
```

### 2. **useRealtimeResponse Hook** (`hooks/useRealtimeResponse.ts`)

React hook for managing real-time responses in components.

**Features:**
- Auto-trigger idle responses at intervals
- Manual response triggering
- Response history tracking
- Warning detection and display
- Configurable auto-idle interval

**Usage:**
```typescript
import { useRealtimeResponse } from '@/hooks/useRealtimeResponse';

function MyComponent() {
  const { currentResponse, isVisible, triggerResponse } = useRealtimeResponse({
    mood: vitals.mood,
    energy: vitals.energy,
    hunger: vitals.hunger,
    hygiene: vitals.hygiene,
    recentActions: [],
  });

  const handleFeed = () => {
    feed();
    triggerResponse('feed'); // Trigger response for feeding action
  };

  return (
    <>
      <ResponseBubble response={currentResponse} isVisible={isVisible} />
      <button onClick={handleFeed}>Feed</button>
    </>
  );
}
```

### 3. **ResponseBubble Component** (`components/ResponseBubble.tsx`)

Animated speech bubble that displays pet responses with visual effects.

**Features:**
- Smooth entrance and exit animations
- Type-based color gradients
- Intensity-based animation variations
- Particle effects for intense responses
- Glow effects with backdrop blur

**Usage:**
```typescript
import { ResponseBubble } from '@/components/ResponseBubble';

<ResponseBubble response={currentResponse} isVisible={isVisible} />
```

### 4. **EnhancedHUD Component** (`components/EnhancedHUD.tsx`)

Upgraded HUD with real-time responses and slick animations.

**Features:**
- Animated stat bars with shimmer effects
- Critical state indicators with pulsing animations
- Enhanced action buttons with hover effects
- Real-time response integration
- Smooth transitions and spring physics

**Usage:**
```typescript
import { EnhancedHUD } from '@/components/EnhancedHUD';

<EnhancedHUD />
```

### 5. **EnhancedPetSprite Component** (`components/EnhancedPetSprite.tsx`)

Advanced pet sprite with mood-based animations and visual effects.

**Features:**
- Mood-based animations (happy, neutral, tired, unhappy, hungry)
- Dynamic eye and mouth expressions
- Animated particles (hearts for happy, Z's for tired)
- Glossy shine effect
- Contextual glow based on mood
- Smooth transitions between states

**Usage:**
```typescript
import { EnhancedPetSprite } from '@/components/EnhancedPetSprite';

<EnhancedPetSprite />
```

### 6. **VisualEffects System** (`components/VisualEffects.tsx`)

Reusable visual effects for game events.

**Available Effects:**
- `explosion` - 💥 Explosion effect
- `sparkle` - ✨ Sparkle particles
- `heart` - ❤️ Floating hearts
- `star` - ⭐ Rotating stars
- `lightning` - ⚡ Lightning bolt
- `heal` - 💚 Healing effect
- `victory` - 🏆 Victory trophy

**Usage:**
```typescript
import { useVisualEffects, VisualEffectsRenderer } from '@/components/VisualEffects';

function MyComponent() {
  const { effects, triggerEffect } = useVisualEffects();

  const handleVictory = () => {
    triggerEffect('victory', window.innerWidth / 2, window.innerHeight / 2, 2000);
  };

  return (
    <>
      <VisualEffectsRenderer effects={effects} />
      <button onClick={handleVictory}>Victory!</button>
    </>
  );
}
```

### 7. **EnhancedBattleArena Component** (`components/EnhancedBattleArena.tsx`)

Fully animated battle system with real-time feedback.

**Features:**
- Animated health bars with smooth transitions
- Battle log with action history
- Real-time response system integration
- Visual effects for attacks
- Multiple action types: physical, special, heal
- Critical health state indicators

**Usage:**
```typescript
import { EnhancedBattleArena } from '@/components/EnhancedBattleArena';

<EnhancedBattleArena
  playerName="Your Pet"
  opponentName="Enemy"
  playerHp={80}
  playerMaxHp={100}
  opponentHp={60}
  opponentMaxHp={100}
  onAttack={(damage) => console.log('Attack:', damage)}
  onSpecialAttack={(damage) => console.log('Special:', damage)}
  onHeal={(amount) => console.log('Heal:', amount)}
  onFlee={() => console.log('Fled')}
/>
```

### 8. **Page Transition Components** (`components/PageTransition.tsx`)

Smooth page and content transitions.

**Components:**
- `PageTransition` - Wraps entire pages with fade/slide transitions
- `StaggerContainer` - Container for staggered animations
- `StaggerItem` - Individual items in stagger sequence

**Usage:**
```typescript
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/PageTransition';

<PageTransition>
  <StaggerContainer>
    <StaggerItem><div>Item 1</div></StaggerItem>
    <StaggerItem><div>Item 2</div></StaggerItem>
  </StaggerContainer>
</PageTransition>
```

## Integration Steps

### Step 1: Replace HUD Component
In your main page or layout, replace the old HUD with EnhancedHUD:

```typescript
// Before
import { HUD } from '@/components/HUD';

// After
import { EnhancedHUD } from '@/components/EnhancedHUD';

// In your component
<EnhancedHUD />
```

### Step 2: Replace PetSprite Component
Replace the old pet sprite with the enhanced version:

```typescript
// Before
import { PetSprite } from '@/components/PetSprite';

// After
import { EnhancedPetSprite } from '@/components/EnhancedPetSprite';

// In your component
<EnhancedPetSprite />
```

### Step 3: Update Battle Arena (Optional)
If using the battle system, replace with EnhancedBattleArena:

```typescript
// Before
import { BattleArena } from '@/components/BattleArena';

// After
import { EnhancedBattleArena } from '@/components/EnhancedBattleArena';
```

### Step 4: Add Visual Effects to Event Handlers
Integrate visual effects into your game event handlers:

```typescript
import { useVisualEffects } from '@/components/VisualEffects';

function MyGameComponent() {
  const { effects, triggerEffect } = useVisualEffects();

  const handleAchievement = () => {
    triggerEffect('star', window.innerWidth / 2, window.innerHeight / 2, 2000);
  };

  return (
    <>
      <VisualEffectsRenderer effects={effects} />
      {/* Your content */}
    </>
  );
}
```

## Customization

### Response Library
Customize pet responses by editing `lib/realtime/responseSystem.ts`:

```typescript
const responseLibrary = {
  feeding: {
    happy: [
      { text: 'Your custom response! 😋', emoji: '😋', intensity: 'normal' },
      // Add more responses...
    ],
  },
  // Add more action types...
};
```

### Animation Timing
Adjust animation speeds in component files:

```typescript
// In EnhancedHUD.tsx
<motion.div
  animate={getMoodAnimation()}
  transition={{
    duration: 1.5, // Adjust this value
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Color Schemes
Customize colors in component files:

```typescript
// In ResponseBubble.tsx
const typeColors = {
  action: 'from-blue-400 to-cyan-400', // Customize colors
  mood: 'from-purple-400 to-pink-400',
  // ...
};
```

## Performance Tips

1. **Memoization**: Components are wrapped with `memo()` to prevent unnecessary re-renders
2. **Animation Optimization**: Use `will-change` CSS property for frequently animated elements
3. **Effect Cleanup**: Visual effects automatically clean up after their duration
4. **Lazy Loading**: Import components only when needed

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with haptic feedback on supported devices

## Troubleshooting

### Responses not appearing
- Check that `useRealtimeResponse` hook is properly initialized
- Ensure `ResponseBubble` component is rendered
- Verify vitals data is being passed correctly

### Animations stuttering
- Reduce the number of simultaneous animations
- Check browser performance (DevTools > Performance)
- Disable some visual effects if needed

### Effects not showing
- Ensure `VisualEffectsRenderer` is mounted
- Check that `triggerEffect` is being called with correct parameters
- Verify z-index values don't conflict with other elements

## Next Steps

1. Test all new components in your application
2. Customize responses and animations to match your game's theme
3. Add sound effects to complement the visual feedback
4. Consider adding more response types for new game features
5. Gather user feedback and iterate on animations

## Support

For issues or questions, refer to the component source files which contain detailed comments and type definitions.
