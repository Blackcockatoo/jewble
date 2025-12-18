# Jewble - AI Coding Agent Instructions

## Project Structure
**Jewble** is a multi-platform monorepo (npm workspaces) for a virtual pet game with genetic identity systems:
- `packages/core` – Platform-agnostic game engine (Zustand store, evolution, vitals, genome encoding)
- `meta-pet` – Next.js web dashboard (full-featured gameplay UI, crypto adapter)
- `meta-pet-mobile` – Expo/React Native mobile app (persistence via MMKV)
- `apps/web-vite` – Lightweight Vite shell (vitals display only)
- `shared/auralia/` – Guardian AI subsystem (audio synthesis, canvas visualization)

## Core Gameplay Architecture

### The Pet Store (Zustand)
**`meta-pet/src/store/index.ts`** is the single source of truth. It implements:
- **Vitals** (hunger, energy, happiness) with time-based decay via `tick()` interval
- **Genome** (Red60/Blue60/Black60 base-60 encoding) → **DerivedTraits** (element metrics, wave functions)
- **Evolution** (4 stages: Genetics → Neuro → Quantum → Speciation) auto-triggered via thresholds
- **Achievements**, **Battles**, **Mini-games**, **Vimana exploration**, **Mirror mode** (privacy feature)
- Methods: `feed()`, `play()`, `sleep()`, `clean()` call `applyInteraction()` which updates vitals

**Key insight:** Store initializes `vitals` from defaults, hydrates from persisted state, and auto-ticks every 1s.

### Element Math & Genetics
**Genome structure:** 3 arrays of 60 base-60 digits (Prime-Tail Crest ID). `decodeGenome()` extracts:
- **Element triples** (Z≤118 atomic numbers) mapped to residues on base-60 circle
- **Bridge score** (residues hosting both layers)
- **Frontier weight** (high-Z element preference)
- **Charge vector** (`c2`, `c3`, `c5` exponent sums)
- **Heptasignature** (base-7 aggregates)
- **Element wave** (complex oscillation from layer/angle/factorization)

`summarizeElementWeb()` computes these once, stores in `traits.elements`. Use when breeding or displaying genetic info.

### Evolution Stages
Each stage in `DEFAULT_EVOLUTIONS` has:
- **Threshold stats** (energy/curiosity/bond values that trigger progression)
- **Audio config** (scale: harmonic/pentatonic/dorian/phrygian, drones multiplier)
- **Visual config** (glow intensity, point size for sigil canvas)

When vitals meet thresholds, `evolvePet()` updates stage and audio style. Check `meta-pet/src/evolution/index.ts`.

## State Management Patterns

### Zustand Store Actions
All mutations go through store methods, never direct state assignment:
```ts
feed: () => {
  const { vitals } = useStore.getState();
  useStore.setState({ vitals: applyInteraction(vitals, 'feed') });
}
```

### Hydration Flow
Apps must call `hydrate()` on startup with persisted data (localStorage for web, MMKV for mobile):
```ts
const stored = JSON.parse(localStorage.getItem('meta-pet-state') || '{}');
useStore.getState().hydrate(stored);
```

### Persistence
- **Web (meta-pet):** localStorage via Zustand persist middleware (see store/index.ts)
- **Mobile (meta-pet-mobile):** MMKV storage (sync storage layer)
- **Vite (apps/web-vite):** No persistence (read-only vitals display)

## Guardian AI System

### Overview
**`shared/auralia/guardianBehavior.tsx`** is a semi-autonomous companion with:
- **Stats:** energy, curiosity, bond (0-100)
- **Evolution:** 4 stages (Seedling → Sprout → Guardian → Ancient)
- **AI modes:** idle → observing/focusing/dreaming → playing → idle (probabilistic FSM)
- **Audio:** 432 Hz base frequency, 3 drone oscillators, scale-based note synth
- **Canvas:** Deterministic sigil points (LCG PRNG), radial glow, mode-dependent hues

### Integration
Guardian is **opt-in visual overlay**; not core gameplay. Lives in `shared/auralia/` for reuse across apps.
- Imported in `meta-pet` as companion UI element
- Can be disabled (audio/canvas paused independently)
- Persists insights to localStorage (`auralia_guardian_memory_v1`)

### Audio Implementation
**`useAuraliaAudio(enabled, stats, scale)`** hook manages Web Audio:
- 3 sine-wave drones at 432Hz × {1, 1.5, 2} with gain tied to stats (max 0.06)
- LFO modulates at 0.18 Hz (subtle wobble)
- Exponential ramping: `gain.linearRampToValueAtTime(target, context.currentTime + 0.6)`
- Note playback via separate gain/osc triggered by mode transitions
- **Always clamp gains to [0.00001, 1]**, wrap in try-catch (AudioContext quirks)

### Canvas Rendering
High-DPI canvas with sigil pattern (polygon + points + glow):
1. Scale canvas: `canvas.width/height = logical × devicePixelRatio`
2. Background: gradient hue varies by mode (idle=20°, focusing=120°, playing=200°, dreaming=260°)
3. Draw sigil: deterministic LCG points → polygon strokes → radial glow gradients
4. Update: useEffect dependency triggers full redraw (no partial updates)

## Development Workflows

### Running the Monorepo
```bash
npm install                  # Bootstrap all packages
npm run dev:web             # Next.js (localhost:3000)
npm run dev:mobile          # Expo (use Expo Go app)
npm run dev:vite            # Vite (localhost:5173)
cd meta-pet && npm run test # Vitest suite
```

### Adding Game Features
1. **Define state** in `MetaPetState` (store/index.ts)
2. **Implement logic** in appropriate module (evolution/, vitals/, progression/)
3. **Wire action** via store method
4. **Persist:** auto-handled if using hydrate/localStorage flow
5. **Test:** add Vitest cases in `meta-pet/src/**/*.test.ts`

### Genome/Breeding Changes
- Modify logic in `packages/core/src/genome/` or `packages/core/src/genetics/`
- Update `decodeGenome()` → `DerivedTraits` pipeline
- Re-sync `meta-pet` imports (re-export from core)
- Test element wave math in isolation (complex domain)

### Guardian Audio Tweaks
1. Adjust scales in `AUDIO_SCALES`
2. Modify drone ratios/volumes in `useAuraliaAudio`
3. Change evolution stage audio config (`DEFAULT_EVOLUTIONS`)
4. Test in Chrome/Firefox (Safari has strict Web Audio policies)

## Code Conventions

### Types
- Export domain types at file top (Vitals, Genome, GuardianStats, etc.)
- Union types for enums: `mode: 'idle' | 'observing' | ...` (not const enums)
- Genome arrays are `number[]` (base-60 digits 0-59)
- Time stored as `number` (Date.now() milliseconds)

### Zustand Patterns
- Single `create()` call per store (meta-pet has one global store)
- Actions are store methods, not external reducers
- Use `getState()` for imperative reads, subscription for reactive updates
- Persist middleware config: `localStorage` key, version number, structure

### React in Guardian
- **Refs:** AudioContext, oscillators (don't re-render on change)
- **Effect cleanup:** Always stop audio nodes, clear intervals
- **useCallback:** Required for functions passed as dependencies
- **Memoization:** useMemo for expensive deriving (element wave calc)

### Error Handling
- localStorage can throw (private browsing) → wrap in try-catch with fallback defaults
- AudioContext operations → try-catch (context might be closed/suspended)
- Type guards: `Array.isArray()`, `typeof obj === 'object'`
- Null safety: `state?.property || defaultValue`

## Cross-Platform Considerations

### Web (Next.js) vs Mobile (Expo)
- **Shared:** `@metapet/core` (Zustand, pure logic)
- **Diverges:** Persistence layer (localStorage vs MMKV), crypto adapters, UI framework
- **Mobile quirks:** MMKV is synchronous, Expo doesn't support some Web APIs (crypto uses `expo-crypto`)
- **Testing:** Vitest for core, manual smoke tests for Expo (no Jest setup currently)

### Web Shell (Vite)
- Minimal read-only vitals display (no game logic)
- Consumes only store subset
- Useful for dashboards or external integrations

## Common Pitfalls

- **Vitals decay:** Must call `startTick()` or vitals won't change (happens on hydrate auto)
- **Store mutations:** Never modify vitals directly; use action methods
- **AudioContext suspended:** Requires user interaction first (browser security); Guardian auto-resumes on first hover/click
- **Genome decoding:** Element indices aren't sequential (use `residues` lookup table)
- **Element wave math:** Complex domain with layer offsets & factorization; isolate tests
- **Persistence race:** Mobile MMKV syncs async; check for conflicts on app resume
- **Guardian visuals:** High-DPI canvas scaling must match actual device pixel ratio
