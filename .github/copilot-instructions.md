# Jewble - AI Coding Agent Instructions

## Project Overview
Jewble is a React/TypeScript project with an interactive "Guardian" AI system featuring adaptive audio synthesis, canvas visualization, and persistent memory. The codebase uses a modular architecture with `shared/` containing cross-cutting components.

## Architecture Patterns

### Module Organization
- **`shared/auralia/`**: Guardian AI system with autonomous behaviors, evolution stages, and audio-visual feedback
- Components are self-contained with co-located hooks, types, and demo implementations
- Export pattern: Types → Hooks → Components → Demo → Default placeholder

### Guardian System Architecture
The Guardian is a stateful AI entity with three interconnected layers:

1. **Stats System** (`GuardianStats`): `energy`, `curiosity`, `bond` (0-100 range)
2. **Evolution System**: 4 stages (Seedling → Sprout → Guardian → Ancient) triggered by stat thresholds
3. **AI State Machine**: 5 modes (`idle` → `observing`/`focusing`/`dreaming` → `playing` → `idle`)

**State transitions** happen probabilistically using `GuardianField.prng()` with time-based thresholds:
- Idle waits 4-10s before transitioning
- Focusing → Playing after 2-5s (triggers audio note)
- Dreaming generates insights after 6-12s

### Audio Architecture (Web Audio API)
- **Base frequency**: 432 Hz (not standard 440 Hz)
- **Drone oscillators**: 3 sine waves at 1×, 1.5×, 2× base frequency
  - Volumes tied to stats: energy/curiosity/bond (max 0.06 × evolution multiplier)
  - Use exponential ramping with `linearRampToValueAtTime` over 0.6s
- **Note oscillators**: Scale-specific intervals (harmonic/pentatonic/dorian/phrygian)
  - Triggered by `playNote(index)` with 0.4s duration
  - Attack: 0.00001 → 0.18 in 0.02s, decay to 0.00001
- **Safety**: Always clamp gains to `[0.00001, 1]` and wrap in try-catch

### Canvas Rendering Pattern
1. Set up high-DPI canvas: `width/height × devicePixelRatio`, scale context
2. Clear with state-dependent gradient (hue varies by AI mode: dreaming=260°, playing=200°, focusing=120°, idle=20°)
3. Draw sigil polygon connecting points with low-opacity strokes
4. Render points with radial glow gradients (size/intensity from evolution)
5. Add decorative diagonal lines with `globalCompositeOperation=''lighter''`

**Key**: Canvas updates are `useEffect`-driven with complete redraw on dependency changes

### Memory & Persistence
- **LocalStorage key**: `auralia_guardian_memory_v1`
- **Structure**: `{ insights: MemoryInsight[], visits: number }`
- **Safety**: Comprehensive error handling with fallback to empty state
- **Limits**: Keep only last 50 insights (slice on read/write)

## Code Conventions

### Type Definitions
- Export all domain types at file top (Stats, Points, Fields, AI states, etc.)
- Use string literals for enums: `mode: ''idle'' | ''observing'' | ...`
- Audio scales are `Record<ScaleName, number[]>` with frequency ratios

### React Patterns
- **Custom hooks** for complex state logic (`useGuardianMemory`, `useEvolution`, `useAdaptiveAudio`, `useGuardianSystem`)
- **Refs** for persistent objects that shouldn''t trigger re-renders (AudioContext, oscillators, PRNG field)
- **Memoization**: Use `useCallback` for functions passed as dependencies or props
- **Effect cleanup**: Always return cleanup functions to stop oscillators, clear intervals, close contexts

### State Management
- Derived state via hooks when possible (evolution from stats)
- Update patterns: `setStats(s => ({ ...s, energy: Math.min(100, s.energy + delta) }))`
- Time tracking: Store `since: Date.now()` in state, calculate `timeInState` in effects

### Audio Best Practices
- Never start oscillators without try-catch
- Cancel scheduled values before scheduling new ones: `gain.cancelScheduledValues(now)`
- Use exponential ramping for volume (sounds more natural than linear)
- Check for AudioContext/webkitAudioContext browser compatibility

### Error Handling
- LocalStorage operations wrapped in try-catch (can throw in private browsing)
- Type guards: `typeof parsed !== ''object''`, `Array.isArray()`
- Null coalescing with defaults: `parsed.visits || 0`

## Development Workflows

### Adding New Guardian Behaviors
1. Add state to `GuardianAIState.mode` union type
2. Implement transition logic in `useGuardianSystem` effect''s `tick()` function
3. Update canvas hue mapping in `GuardianSigilCanvas`
4. Consider adding audio response in evolution stage config

### Modifying Evolution Stages
1. Edit `DEFAULT_EVOLUTIONS` array with new thresholds
2. Update `audio` config (scale, droneMultiplier) for musical progression
3. Update `visual` config (glow, pointSize) for visual feedback
4. Evolution auto-triggers via `useEvolution` hook when stats meet thresholds

### Testing Audio Changes
- Test in Chrome/Firefox (Safari has WebAudio quirks)
- Use dev tools to inspect `AudioContext.state` (must be ''running'')
- Check volume ranges don''t exceed 1.0 (causes distortion)
- Verify exponential ramps: `gain.value` should never be 0 (use 0.00001)

## Key Files
- `shared/auralia/guardianBehavior.ts`: Complete Guardian system (398 lines)
  - Lines 1-13: Type definitions
  - Lines 15-26: Audio scale constants
  - Lines 28-37: Evolution stage definitions
  - Lines 39-58: Memory hooks with localStorage
  - Lines 60-74: Evolution progression logic
  - Lines 76-157: Adaptive audio synthesis
  - Lines 159-171: Sigil point generation (deterministic PRNG)
  - Lines 173-252: Canvas visualization component
  - Lines 254-337: Main Guardian system hook (AI state machine)
  - Lines 339-366: Demo component

## Common Pitfalls
- **AudioContext must be resumed**: User interaction required before audio plays (browser security)
- **Canvas coordinate system**: Set logical size via style, physical via width/height attributes
- **Interval cleanup**: Always store interval ID and clear in effect cleanup
- **PRNG seeding**: Guardian uses custom LCG (not Math.random) for deterministic sigils
- **React strict mode**: Effects run twice in dev; use `mounted` flag for async operations
