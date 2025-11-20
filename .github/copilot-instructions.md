## Jewble Meta-Pet – AI Agent Instructions

### 1. Big Picture
- Jewble is a privacy-first virtual pet monorepo: `meta-pet` (Next.js web), `meta-pet-mobile` (Expo), `apps/web-vite` (shell), `packages/core` (shared logic).
- Core pillars: Prime-Tail identity, HeptaCode v1 encoding, Red60/Blue60/Black60 genome, vitals tick loop, 4-stage evolution, breeding, exploration, and mini-games.
- **DNA and identity are sacred:** raw DNA never leaves the device; only hashes / encoded forms are persisted or exported.

### 2. Architecture & Imports
- Treat `packages/core` as the source of truth for gameplay logic; UI layers in `meta-pet` and `meta-pet-mobile` should consume its exports, not duplicate logic.
- Use subpath exports from `@metapet/core` (see `packages/core/package.json`) and app-level aliases (`@/*` in `meta-pet`, `meta-pet-mobile`) instead of importing from `packages/core/src/*`.
- Web crypto, storage, and audio are adapter-based; follow existing patterns like `meta-pet/src/lib/identity/crest.ts`, `meta-pet/src/lib/persistence/indexeddb.ts`, and mobile equivalents in `meta-pet-mobile/src/identity` and `meta-pet-mobile/src/store/persistence.ts`.

### 3. State & Vitals Patterns
- Both web and mobile use a **single Zustand store instance** (e.g., `meta-pet/src/lib/store/index.ts`, `meta-pet-mobile/src/store/index.ts`). Never create additional stores; always import the exported `useStore`.
- Vitals tick at a low-power interval (default 2000ms) controlled by feature flags (`meta-pet-mobile/src/config.ts`, similar config in web). Always call `startTick` on mount and `stopTick` on unmount/background.
- Vitals decay rules (hunger, hygiene, energy, mood) and evolution transitions live in shared logic (`packages/core` / `meta-pet/src/lib/evolution`). When updating balance, change the core module and then adjust UI copy/tooltips.

### 4. Identity, Genome & Privacy
- Prime-Tail crest and HeptaCode v1 live under `meta-pet/src/lib/identity` and `meta-pet-mobile/src/identity`; reuse helpers like `mintPrimeTailId`, `heptaEncode42`, `playHepta` rather than rolling new crypto.
- Any new identity-related UI must **never expose raw DNA**; only show hashes, Hepta digits, or derived traits (see `meta-pet/src/components/TraitPanel.tsx`, `HeptaTag.tsx`, `SeedOfLifeGlyph.tsx`).
- When adding export/import flows, follow the sealed export pattern (`meta-pet/src/lib/persistence/sealed.ts`) so that exports are HMAC-signed and tamper-evident.

### 5. Cross-Platform UI & Auralia
- Prefer shared conceptual flows between web and mobile (HUD, Hepta, settings) but allow platform-specific presentation (`meta-pet/src/components/HUD.tsx` vs `meta-pet-mobile/src/ui/components/HUD.tsx`). Keep props and naming aligned where reasonable.
- The Auralia Guardian add-on (`meta-pet/src/components/auralia`, `components/auralia/README.md`) is an advanced meta-pet; extend it by **feeding from existing MossPrimeSeed / genome primitives**, not by adding separate RNG systems.
- Sacred geometry visuals (Seed of Life, hepta crowns, sigils) should use existing components / color tokens (gold, deep black, sacred violet) rather than introducing new ad-hoc palettes.

### 6. Workflows & Commands
- Root install: `npm install` (or `bun install` inside `meta-pet` if following that README).
- Web dev: `cd meta-pet && npm run dev` (or `bun dev`). Vite shell: `cd apps/web-vite && npm run dev`.
- Mobile dev: `cd meta-pet-mobile && npm start`; use `npm run ios` / `npm run android` for simulators/emulators.
- Web tests use Vitest in `meta-pet` (`npm test`, `npm run test:coverage`); mobile test infra exists on paper but may be stale—prefer adding tests for core logic in `packages/core` and `meta-pet/src/lib/*`.

### 7. Conventions & Gotchas
- TypeScript everywhere; avoid `any` in core logic and keep public APIs documented with JSDoc, especially in `packages/core` and `meta-pet/src/lib/*`.
- Respect feature flags when adding risky or experimental behavior (`meta-pet-mobile/src/config.ts`, similar config for web); default new flags to safe/off.
- IndexedDB (web) and MMKV (mobile) auto-save snapshots on a cadence; when changing state shape, provide lightweight migration or guards to avoid failing loads.
- When touching ECC/Hepta logic, keep outputs at exactly 42 base-7 digits and maintain single-error-correction-per-7-block guarantees; mirror existing tests/usage in both web and mobile identity modules.

### 8. Where to Look First
- High-level overview: root `README.md`, `meta-pet/README.md`, `meta-pet-mobile/README.md`, and `docs/PROJECT_ASSESSMENT_2025-11-09.md`.
- Core gameplay logic: `packages/core/src/**` (vitals, evolution, genome, breeding) plus their re-exports.
- Web experience: `meta-pet/src/app/page.tsx`, `meta-pet/src/components/*`, `meta-pet/src/lib/*`.
- Mobile experience: `meta-pet-mobile/app/(tabs)`, `meta-pet-mobile/src/engine`, `meta-pet-mobile/src/ui`.

_Last updated: 2025-11-20 – keep this file concise; prefer adding deep technical detail to the READMEs referenced above and only summarizing patterns here._
