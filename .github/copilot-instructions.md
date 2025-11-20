# Jewble Meta-Pet AI Agent Instructions

## Project Overview
Jewble is a **privacy-first virtual pet game** built as a monorepo with cross-platform support. The core is a deterministic, genome-driven pet simulation system where pets evolve through 4 stages (GENETICS → NEURO → QUANTUM → SPECIATION), featuring breeding with genetic inheritance, battle arenas, exploration, and mini-games.

**Key Design Principle:** Offline-first with DNA-based identity that never leaves the device. Only hashes are shared/exported.

## Architecture

### Monorepo Structure
```
jewble/
├── packages/core/          # Platform-agnostic business logic (Zustand store, vitals, evolution, genome)
├── meta-pet/               # Next.js 15 web app (main dashboard)
├── meta-pet-mobile/        # React Native + Expo mobile app
└── apps/web-vite/          # Vite shell (minimal vitals display)
```

**Critical Pattern:** The `@metapet/core` package is the source of truth for all game logic. Both web and mobile apps import from it and provide platform-specific adapters (e.g., `webCrypto.ts` for Web Crypto API, native secure storage for mobile).

### Core Package Exports
```typescript
// packages/core/package.json defines subpath exports:
import { ... } from '@metapet/core';         // Main exports
import { ... } from '@metapet/core/vitals';  // Vitals system
import { ... } from '@metapet/core/store';   // Zustand store
import { ... } from '@metapet/core/genome';  // Genome encoding
import { ... } from '@metapet/core/evolution'; // Evolution logic
```

**NEVER import directly from `packages/core/src/...`** - always use the exported subpaths.

### Path Aliases
- **Web (meta-pet):** `@/*` maps to `./src/*`
- **Mobile (meta-pet-mobile):** `@/*` maps to `./src/*`, with granular aliases like `@/store`, `@/config`, `@/engine/*`
- **Root tsconfig:** `@shared/*` maps to `./shared/*`

## Identity & Genome System

### Prime-Tail Crest
- **DNA Format:** `primeDNA` (60 chars) + `tailDNA` (60 chars) = 120 total characters
- **Privacy:** Raw DNA never leaves device. Only `GenomeHash` (forward hash + mirror hash + tail) is shareable
- **HMAC Signing:** Uses Web Crypto API (web) or Expo SecureStore (mobile) for tamper-evident signatures

### HeptaCode v1
- **Base-7 Encoding:** 30 data digits + 6 parity → 42 symbols total (♈♉♊♋♌♍♎)
- **Error Correction:** 6×7 ECC - corrects 1 error per 7-symbol block
- **MAC Authentication:** 28-bit HMAC prevents tampering
- **Files:** `meta-pet-mobile/src/identity/hepta/` (codec, ecc, audio playback)

### Genome Traits (Red60/Blue60/Black60)
Derived deterministically from DNA via MossPrimeSeed constants:
```typescript
// Genome drives visual traits, stats, evolution thresholds
RED   = "113031491493..." // Spine energy
BLACK = "011235831459..." // Mystery halo  
BLUE  = "012776329785..." // Form integrity
```

## Development Workflows

### Running Apps
```bash
# Next.js web (primary dev target)
cd meta-pet && npm run dev

# Expo mobile
cd meta-pet-mobile && npm start

# Vite shell
cd apps/web-vite && npm run dev
```

### Testing
**Web only** - Vitest configured at `meta-pet/vitest.config.ts`:
```bash
cd meta-pet
npm test              # Run tests
npm run test:ui       # UI mode
npm run test:coverage # Coverage report
```

**Test files:** `meta-pet/src/**/*.test.ts` (e.g., `store/index.test.ts`, `evolution/index.test.ts`)

**Mobile tests:** Not yet implemented (no test runner configured).

### Building
```bash
# Next.js production build
cd meta-pet && npm run build

# Mobile builds (requires EAS CLI)
cd meta-pet-mobile
eas build --profile production-ios
eas build --profile production-android
```

## Key Conventions

### Vitals System
- **Tick Rate:** 2 seconds (configurable via `LOW_POWER_TICK_MS` in feature flags)
- **Auto-Pause:** Vitals stop ticking when app backgrounds (battery-safe)
- **Decay Rates:**
  - Hunger: +0.25/tick (increases)
  - Hygiene: -0.15/tick (decreases)
  - Energy: -0.20/tick (decreases)
  - Mood: ±0.05/tick (depends on energy)

**Implementation:** Controlled by `useStore().startTick()` / `stopTick()` in Zustand store.

### Evolution System
- **4 Stages:** GENETICS (0-5min) → NEURO (5min-7d) → QUANTUM (7-30d) → SPECIATION (30d+)
- **Requirements:** Each stage checks `minAge`, `minInteractions`, `minVitalsAverage`, optional `specialCondition()`
- **State Machine:** See `packages/core/src/evolution/index.ts` for `EVOLUTION_REQUIREMENTS`

### Feature Flags
Located in `meta-pet-mobile/src/config.ts` and similar files:
```typescript
export const FEATURES = {
  MOCK_MODE: false,
  IDENTITY: true,
  AUDIO: true,
  TICK: true,
  BACKGROUND_PAUSE: true,
  LOW_POWER_TICK_MS: 2000,
};
```

**Usage:** Guard experimental features behind flags for safe rollout.

### Persistence
- **Web:** IndexedDB via `meta-pet/src/lib/storage/db.ts` (auto-saves every 30s)
- **Mobile:** MMKV via `meta-pet-mobile/src/store/persistence.ts`

**Multi-Pet Support:** Both platforms support managing multiple pets with unique IDs.

### Sacred Geometry UI
- **Seed of Life Pattern:** Used in pet visuals (`SeedOfLifeGlyph.tsx`)
- **Golden Ratio:** φ = 1.618 for spacing, sizing
- **Color System:** B$S gold (#D4AF37), deep black (#0A0A0A), sacred violet (#8B7EC8), vitals colors (green/blue/orange/red)

## Component Patterns

### Animation
- **Web:** Framer Motion (`framer-motion@12.23.24`)
- **Mobile:** React Native Reanimated (`react-native-reanimated`)

Example from mobile:
```typescript
// PetMorph.tsx - vitals drive scale, rotation, glow
const scale = useAnimatedStyle(() => ({
  transform: [{ scale: interpolate(energy, [0, 100], [0.8, 1.2]) }],
}));
```

### Zustand Store Pattern
```typescript
// Store is created once and exported
export const useStore = createMetaPetWebStore();

// Usage in components
const { vitals, feed, evolution } = useStore();
```

**DO NOT** create multiple store instances - use the singleton exported from `src/lib/store/index.ts`.

### TypeScript
- **Strict Mode Enabled:** `noImplicitAny: false` (some flexibility), but prefer explicit types
- **No `any` in Core Logic:** Especially in `packages/core` - use proper interfaces
- **JSDoc Comments:** Add for public APIs and complex functions

## Common Gotchas

1. **Path Imports:** Always use `@metapet/core/subpath` not direct file paths
2. **Vitals Tick Lifecycle:** Must call `stopTick()` on unmount to prevent memory leaks
3. **Genome Hashing:** Never expose raw DNA in UI or exports - only `GenomeHash`
4. **Mobile Import Paths:** The mobile app had issues with `@/` imports - ensure `babel-plugin-module-resolver` is configured or use relative paths
5. **Platform-Specific Crypto:** Web uses Web Crypto API, mobile uses Expo SecureStore - abstract via adapters
6. **Auto-Save Debouncing:** Both platforms auto-save, but don't assume instant persistence

## Documentation Files
- **`README.md`**: Quick start, monorepo overview
- **`meta-pet-mobile/IMPLEMENTATION_SUMMARY.md`**: Deep technical dive on mobile app
- **`meta-pet-mobile/SETUP.md`**: Detailed mobile setup guide
- **`docs/PROJECT_ASSESSMENT_2025-11-09.md`**: Comprehensive project status, gaps, recommendations
- **`ADDON_SPECIFICATION.md`**: Add-on integration specs (geometric backgrounds, AI animations)
- **`components/auralia/README.md`**: Auralia Guardian system (MossPrimeSeed, sigil games)

## Performance Targets (Mobile)
- **App Start:** < 2.5s (mid-tier device)
- **Frame Rate:** 60 fps sustained
- **Bundle Size:** ≤ 6 MB
- **Crash-Free Rate:** ≥ 99.5%

## Status & Priorities
**Current Phase:** Late beta / pre-launch (75-85% complete)

**Launch Blockers:**
1. Final QA sweep on core loops
2. Performance profiling (dashboard, map rendering)
3. Accessibility audit (WCAG compliance)
4. Security review (exports/imports)
5. Analytics instrumentation

**Known Gaps:**
- Mobile test infrastructure not set up (unlike web which has Vitest)
- Some code duplication between web and mobile (e.g., HUD.tsx)
- Accessibility deferred too late in process

## Code Quality Standards
- **Linting:** Biome (formatting), ESLint (web)
- **Type Safety:** All new code must be TypeScript
- **Testing:** Write tests for business logic in `packages/core` and `meta-pet/src/lib/*`
- **Naming:** Descriptive function names (e.g., `checkEvolutionEligibility`, not `checkEvol`)

## When Making Changes
1. **Core Logic Changes:** Update `packages/core` first, then adapt UI layers
2. **Feature Flags:** Use them for risky changes
3. **Tests:** Add tests for new logic in `meta-pet/src/**/*.test.ts`
4. **Platform Parity:** If adding web feature, consider mobile implications
5. **Documentation:** Update relevant READMEs if changing architecture

## Quick Reference
| Task | Command |
|------|---------|
| Run web dev | `cd meta-pet && npm run dev` |
| Run mobile | `cd meta-pet-mobile && npm start` |
| Run tests | `cd meta-pet && npm test` |
| Type check | `cd meta-pet && npm run lint` |
| Format | `cd meta-pet && npm run format` |
| Build web | `cd meta-pet && npm run build` |
| Build mobile | `cd meta-pet-mobile && eas build --profile production-ios` |

---

**Last Updated:** November 20, 2025
**Project Status:** Late Beta - Launch Target Q4 2025
