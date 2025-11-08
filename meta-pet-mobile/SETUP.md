# B$S Meta-Pet Mobile - Setup Guide

Complete setup and build guide for the Meta-Pet mobile application.

## Prerequisites

- Node.js 18+ and npm/yarn/bun
- Expo CLI: `npm install -g expo-cli` or `npx expo`
- iOS: Xcode 14+ (Mac only)
- Android: Android Studio with SDK 33+

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
bun install

# Start development server
npm start
# or
expo start
```

## Project Structure

```
meta-pet-mobile/
├── app/                      # Expo Router app directory
│   ├── _layout.tsx          # Root layout with providers
│   ├── (tabs)/              # Tab navigation
│   │   ├── _layout.tsx      # Tab layout
│   │   ├── index.tsx        # Home screen (HUD)
│   │   ├── hepta.tsx        # Hepta code screen
│   │   └── settings.tsx     # Settings screen
│   └── consent.tsx          # Consent modal
├── src/
│   ├── engine/              # Core engine
│   │   ├── state.ts         # Vitals state management
│   │   ├── sim.ts           # Simulation tick logic
│   │   ├── rng.ts           # Seeded RNG
│   │   ├── genome.ts        # Genome encoding/decoding
│   │   ├── evolution/       # Evolution system
│   │   └── progression/     # Achievements, battles, etc.
│   ├── identity/            # Sealed identity system
│   │   ├── sealed.ts
│   │   ├── consent.ts
│   │   ├── crest.ts
│   │   └── hepta/           # Hepta encoding
│   ├── store/               # Zustand state management
│   │   ├── index.ts         # Main store with vitals tick
│   │   └── persistence.ts   # MMKV storage
│   ├── providers/           # React contexts
│   │   ├── ThemeProvider.tsx
│   │   └── FeatureProvider.tsx
│   ├── ui/
│   │   ├── components/      # React Native components
│   │   │   ├── HUD.tsx
│   │   │   ├── HeptaTag.tsx
│   │   │   └── SeedOfLifeGlyph.tsx
│   │   ├── audio/
│   │   │   └── playHepta.native.ts
│   │   └── theme/
│   │       └── colors.ts
│   └── config.ts            # Feature flags
└── assets/                  # Images, fonts, sounds
```

## Key Features

### 1. Vitals Tick System

The vitals tick runs every 2 seconds (configurable in `config.ts`):

```typescript
// config.ts
export const FEATURES = {
  TICK: true,
  BACKGROUND_PAUSE: true,
  LOW_POWER_TICK_MS: 2000,
};
```

The tick automatically:
- Decreases hygiene and energy
- Increases hunger
- Adjusts mood based on energy
- Checks evolution eligibility
- Persists state to MMKV storage

### 2. MMKV Persistence

All data is stored locally using `react-native-mmkv`:

- Vitals (hunger, hygiene, mood, energy)
- Genome (red60, blue60, black60)
- Evolution state and progression
- Achievements and battle stats
- User settings (dark mode, audio, haptics)

Data persists across app restarts and survives background mode.

### 3. Theme System

B$S-inspired dark/light themes with sacred geometry colors:

```typescript
// Primary colors
Gold: #D4AF37
Black: #0A0A0A
Violet: #8B7EC8

// Vitals status colors
Excellent: #00D9A5
Good: #7EC8E3
Low: #FFB84D
Critical: #FF6B6B
```

### 4. Sacred Geometry UI

- Seed of Life glyphs using react-native-svg
- Golden ratio proportions
- Hepta code displays with monospace styling
- Minimalist, high-contrast design

### 5. Audio System

Hepta codes can be played as musical sequences using expo-av:

```typescript
// Play hepta code
await playHepta(genome.red60.slice(0, 7), {
  vault: 'red',
  rotation: 'CW'
});
```

## Assets Setup

### Required Assets

You need to create these image files:

1. **icon.png** (1024x1024) - App icon
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon
3. **splash.png** (1284x2778) - Splash screen
4. **favicon.png** (48x48) - Web favicon

See `/assets/README.md` for detailed specifications.

### Quick Asset Generation

Use the provided SVG placeholders:

```bash
# Convert SVG to PNG (requires ImageMagick or online tool)
# For icon.png
convert -background none -resize 1024x1024 assets/PLACEHOLDER_ICON.svg assets/icon.png

# For splash.png
convert -background none -resize 1284x2778 assets/PLACEHOLDER_SPLASH.svg assets/splash.png

# For adaptive-icon.png (same as icon)
cp assets/icon.png assets/adaptive-icon.png

# For favicon.png (resized icon)
convert -background none -resize 48x48 assets/icon.png assets/favicon.png
```

Or use online converters:
- https://cloudconvert.com/svg-to-png
- https://www.iloveimg.com/

## Running the App

### Development

```bash
# Start Expo dev server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Building for Production

```bash
# iOS (requires Mac + Xcode)
eas build --platform ios

# Android
eas build --platform android

# Or use Expo's build service
expo build:ios
expo build:android
```

## Configuration

### Feature Flags

Edit `src/config.ts` to toggle features:

```typescript
export const FEATURES = {
  MOCK_MODE: false,        // Use mock data
  IDENTITY: true,          // Enable identity system
  AUDIO: true,             // Enable hepta audio
  TICK: true,              // Enable vitals tick
  BACKGROUND_PAUSE: true,  // Pause tick in background
  LOW_POWER_TICK_MS: 2000, // Tick interval (ms)
};
```

### Theme Customization

Edit `src/ui/theme/colors.ts` to adjust colors.

## Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Troubleshooting

### "Cannot find module 'react-native-mmkv'"

```bash
npx expo install react-native-mmkv
cd ios && pod install && cd ..
```

### Vitals tick not working

1. Check `FEATURES.TICK` is `true` in `config.ts`
2. Verify `startTick()` is called in `app/_layout.tsx`
3. Check console for errors

### Dark mode not switching

1. Ensure `ThemeProvider` wraps the app in `app/_layout.tsx`
2. Check `useStore().darkMode` is being updated
3. Verify MMKV persistence is working

### Assets not loading

1. Ensure asset files exist in `/assets/` directory
2. Check `app.json` paths are correct
3. Run `expo start -c` to clear cache

## Production Checklist

Before releasing:

- [ ] Create proper app icons (not placeholders)
- [ ] Create splash screen with branding
- [ ] Test on real devices (iOS + Android)
- [ ] Add sound effects to `/assets/sfx/`
- [ ] Update app version in `app.json`
- [ ] Configure EAS project ID
- [ ] Test vitals tick in background
- [ ] Test MMKV persistence
- [ ] Test evolution system over multiple days
- [ ] Add analytics (optional)
- [ ] Set up error tracking (optional)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://expo.github.io/router/docs/)
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Native SVG](https://github.com/software-mansion/react-native-svg)

## Support

For issues or questions:
- Check existing documentation in `/assets/` and `/src/`
- Review the web version at `/home/user/jewble/meta-pet/`
- Ensure all dependencies are installed correctly

## License

B$S Meta-Pet - Experimental Software
