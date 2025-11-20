# Copilot Instructions for meta-pet-mobile

## Project Overview
This is a React Native mobile app organized into `app/` (UI, navigation) and `src/` (business logic, state, identity, engine). The architecture separates UI from core logic, with clear boundaries for features, state, and identity management.

## Key Directories & Files
- `app/`: Entry points (`App.tsx`, `Root.tsx`), navigation, and UI tabs.
- `src/engine/`: Simulation logic (`sim.ts`), randomization (`rng.ts`), genome operations (`genome.ts`).
- `src/identity/`: User identity, consent, and cryptography (notably `hepta/` for codecs and ECC).
- `src/providers/`: Context providers for features and theming.
- `src/store/`: Centralized state management.
- `src/ui/`: UI components and audio utilities.

## Patterns & Conventions
- **Provider Pattern**: Use React context providers from `src/providers/` for global state/features.
- **Engine Isolation**: Simulation and random logic are isolated in `src/engine/` and should not directly depend on UI code.
- **Identity & Security**: All identity and cryptographic logic is in `src/identity/`, with `hepta/` for advanced encoding/crypto.
- **Component Structure**: UI components are modular, found in `src/ui/components/`.
- **Assets**: Static assets (fonts, icons, sfx) are in `assets/`.

## Developer Workflows
- **Build/Run**: Use standard React Native commands (`npx react-native run-android`/`run-ios`).
- **Debugging**: Debug via Metro bundler and React Native tools; engine logic can be unit tested in isolation.
- **Testing**: (No test files detected; add details if/when tests are present.)

## Integration Points
- **FeatureProvider/ThemeProvider**: Wrap app entry points with these providers for feature flags and theming.
- **State Management**: Use `src/store/` for app-wide state; avoid ad-hoc state outside this pattern.
- **Audio**: Use `src/ui/audio/playHepta.native.ts` for platform-specific audio playback.

## Examples
- To add a new simulation feature, extend `src/engine/sim.ts` and expose via a provider if needed.
- For new identity features, add to `src/identity/` and update relevant codecs/ECC in `hepta/`.
- UI changes should be made in `app/` or `src/ui/components/`.

## Notes
- Follow the separation of concerns between UI, engine, and identity.
- Reference existing files for implementation style and cross-component communication.
- If adding new providers, follow the pattern in `src/providers/`.

---
For questions or unclear conventions, ask for clarification or examples from maintainers.
