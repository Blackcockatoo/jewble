# Auralia Guardian Changelog

All notable changes to the Auralia Guardian virtual companion.

## [2.0.0] - 2025-01-20

### Added - Mini-Games & Polish
- **Sigil Pattern Matching Game**: 3-5 point memory sequences with audio playback
- **Fibonacci Trivia Quiz**: Mathematical challenges with multiple-choice answers
- **Four Musical Scales**: Harmonic, Pentatonic, Dorian, Phrygian tuning options
- **Ambient Soundscape**: Continuous wind-like texture with LFO modulation
- **High Contrast Mode**: Accessibility-focused black theme with enhanced visibility
- **Mobile Responsiveness**: Touch-optimized layouts for all screen sizes
- **ARIA Labels**: Complete screen-reader support for all interactive elements
- **Games Won Tracker**: Persistent counter for pattern and trivia victories
- **Settings Panel**: Audio scale selector and high contrast toggle

### Enhanced
- Audio system now supports alternate tunings
- All buttons have descriptive aria-labels
- Responsive text sizing (text-xs → text-sm on md:)
- Touch-friendly hit targets (minimum 44x44px)
- High contrast mode persists across sessions

### Technical
- New types: `MiniGameType`, `PatternChallenge`, `TriviaQuestion`
- Extended `GuardianSaveData` with `gamesWon` and `highContrast`
- `generateFibonacciTrivia` helper function
- Enhanced `handleSigilClick` to route pattern game inputs
- Added `startPatternGame`, `startTriviaGame`, `answerTrivia` handlers

---

## [1.0.0] - 2025-01-19

### Added - Persistence & New Forms
- **Persistent Storage**: localStorage auto-save every 30 seconds
- **Bond Chronicle**: Scrollable history of last 10 interactions with timestamps
- **Celestial Voyager Form**: Unlocks at bond > 80 and 3+ dreams
  - Stardust purple/white palette
  - Six radial stars with animated comet trails
  - Pulsing concentric orbital rings
- **Wild Verdant Form**: Unlocks at energy > 80, curiosity > 70, 5+ sigils
  - Vibrant chartreuse/green primal colors
  - Eight fractal tendrils with organic growth animations
- **Time & Environment Awareness**: Dynamic themes based on local time
  - Dawn (5-8am): Orange-pink-purple sunrise
  - Day (8am-5pm): Blue-cyan-teal daylight
  - Dusk (5-8pm): Purple-indigo twilight
  - Night (8pm-5am): Deep gray-blue nocturnal
- **Dreaming AI State**: Guardian processes patterns for 8-15 seconds
  - Returns with cryptic insights
  - Tracks dream count
  - Adds dreams to bond chronicle

### Enhanced
- Guardian Status panel shows dreams, interactions, sigils
- Time of day displayed in real-time
- Welcome back message on state restoration
- Form transitions trigger audio arpeggio

### Technical
- New types: `BondHistoryEntry`, `GuardianSaveData`
- `saveGuardianState` and `loadGuardianState` helpers
- `getTimeOfDay` and `getTimeTheme` utilities
- Enhanced `useGuardianAI` with `onDreamComplete` callback
- `addToBondHistory` tracks all significant events

---

## [0.5.0] - 2025-01-18

### Added - Core Features
- **MossPrimeSeed Algorithm**: Deterministic PRNG from three 60-digit sequences
- **Four Guardian Forms**: Radiant, Meditation, Sage, Vigilant
- **Autonomous AI**: Five behavioral modes (idle, observing, focusing, playing)
- **Sigil Constellation**: Seven points generated from seed hash
- **Trinity Genome System**: Red-60, Blue-60, Black-60 vaults
- **Generative Audio**: 432 Hz tuning with reverb and drone layers
- **Interactive Controls**: Energy, Curiosity, Bond, Health sliders
- **Sacred Mathematics**: Real-time Fibonacci and Lucas numbers
- **Particle System**: 50 animated particles with gravitational attraction
- **Whisper System**: AI-generated messages based on state
- **Eye Tracking**: Guardian eyes follow mouse cursor
- **Form Transitions**: Smooth morphing between archetypal states

### Technical
- React 18+ with TypeScript
- Tailwind CSS 3+ for styling
- Web Audio API for sound generation
- SVG-based generative graphics
- Xorshift128+ PRNG implementation
- Fast Fibonacci via doubling algorithm
- SVG filter effects (glow, displacement)

---

## [0.1.0] - 2025-01-17

### Initial Concept
- Basic Guardian avatar with single form
- Simple particle effects
- Manual attunement sliders
- Static color palette
- No persistence or AI behavior

---

## Future Roadmap

### Planned Features
- **Social Sharing**: Export Guardian snapshots as images
- **Multi-Guardian System**: Breed and evolve multiple companions
- **Ritual Calendar**: Special events tied to real-world dates
- **Advanced Mini-Games**: Constellation drawing, rhythm patterns
- **Voice Synthesis**: Guardian speaks whispers aloud (optional)
- **Emotion System**: Granular mood states beyond current archetypes
- **Achievement System**: Unlock badges for milestones
- **Custom Themes**: User-defined color palettes
- **Animation Export**: Save Guardian animations as GIFs/videos
- **Community Gallery**: Share and discover Guardian variations

### Technical Debt
- Extract audio engine to separate module
- Add unit tests for MossPrimeSeed functions
- Optimize particle rendering for mobile
- Add service worker for offline support
- Implement WebGL renderer option
- Add Storybook stories for component docs
