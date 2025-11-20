# Aurelia Meta Pet Animation Add-on: Integration Guide

**Author:** Manus AI
**Project:** Blackcockatoo/jewble (Meta Pet Mobile)
**Date:** November 20, 2025

---

## Overview

This add-on package enhances the Aurelia meta pet animation with two major features:

1. **Sensational Geometric Background:** An oscillating aperture illusion with concentric circles that appear to expand and shrink simultaneously, creating a hypnotic, visually intense background.
2. **AI-Driven Pet Animation:** A new "Cognitive Load" animation feature that adds a subtle, high-frequency flicker to the pet's inner pattern, inversely driven by the pet's mood state.

---

## Files Included in the Add-on

The following files have been created or modified:

### New Files

1. **`jewble/meta-pet-mobile/src/ui/components/GeometricBackground.tsx`**
   - A new React Native component that renders the animated geometric background.
   - Implements the Oscillating Aperture Illusion using SVG concentric circles.
   - Fully self-contained with internal animation logic.

### Modified Files

1. **`jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx`**
   - Enhanced with the "Cognitive Load" animation feature.
   - Adds a new shared value, `cognitiveFlicker`, that drives the opacity of the pet's inner Seed of Life pattern.
   - The flicker amplitude is inversely proportional to the pet's mood (low mood = high flicker, high mood = low flicker).

2. **`jewble/meta-pet-mobile/app/(tabs)/index.tsx`**
   - Integrated the `GeometricBackground` component into the home screen.
   - The background is rendered before the HUD to ensure it appears behind the pet.

---

## Integration Instructions

### Step 1: Copy the New Component

Copy the `GeometricBackground.tsx` file from the add-on package to your project:

```bash
cp jewble/meta-pet-mobile/src/ui/components/GeometricBackground.tsx \
   <your-project>/meta-pet-mobile/src/ui/components/
```

### Step 2: Update the PetMorph Component

Replace the existing `PetMorph.tsx` file with the enhanced version from the add-on package:

```bash
cp jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx \
   <your-project>/meta-pet-mobile/src/ui/animations/
```

Alternatively, if you have custom modifications to `PetMorph.tsx`, manually apply the following changes:

**Changes to `PetMorph.tsx`:**

1. **Add a new shared value** (after line 32):
   ```typescript
   const cognitiveFlicker = useSharedValue(0);
   ```

2. **Add cognitive load animation logic** (after line 54, in the `useEffect` hook):
   ```typescript
   // Cognitive Load (AI Animation) affects flicker amplitude
   // Inverse relationship: Low mood (e.g., 10) = High Flicker (e.g., 0.9)
   // High mood (e.g., 90) = Low Flicker (e.g., 0.1)
   const flickerAmplitude = 1 - (vitals.mood / 100); // 0.0 to 1.0
   
   // High-frequency, small-amplitude flicker
   cognitiveFlicker.value = withRepeat(
     withSequence(
       withTiming(flickerAmplitude * 0.5, { duration: 50 }),
       withTiming(flickerAmplitude * 0.1, { duration: 50 })
     ),
     -1,
     true
   );
   ```

3. **Add a new animated style** (after the `glowStyle` definition, around line 70):
   ```typescript
   const flickerStyle = useAnimatedStyle(() => {
     // The flicker value is small (0.0 to 0.5), so we use it to modulate the stroke opacity
     const baseOpacity = 0.6;
     const modulatedOpacity = baseOpacity + cognitiveFlicker.value;
     
     return {
       strokeOpacity: modulatedOpacity,
     };
   });
   ```

4. **Apply the flicker style to the Seed of Life pattern** (around line 121):
   - Change from:
     ```typescript
     <Path
       d="M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30"
       fill="none"
       stroke="#D4AF37"
       strokeWidth="1.5"
       strokeOpacity={0.6}
     />
     ```
   - To:
     ```typescript
     <Path
       d="M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30"
       fill="none"
       stroke="#D4AF37"
       strokeWidth="1.5"
       {...flickerStyle}
     />
     ```

### Step 3: Update the Home Screen

Replace the existing `app/(tabs)/index.tsx` file with the updated version from the add-on package:

```bash
cp jewble/meta-pet-mobile/app/(tabs)/index.tsx \
   <your-project>/meta-pet-mobile/app/(tabs)/
```

Alternatively, if you have custom modifications to `index.tsx`, manually apply the following changes:

**Changes to `app/(tabs)/index.tsx`:**

1. **Add the import statement** (after the existing imports, around line 8):
   ```typescript
   import { GeometricBackground } from '../../src/ui/components/GeometricBackground';
   ```

2. **Integrate the background in the JSX** (before the `<HUD />` component):
   ```typescript
   <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
     {/* The GeometricBackground is positioned absolutely to fill the screen */}
     <GeometricBackground />
     {/* The HUD (which contains the pet) is placed on top */}
     <HUD />
   </SafeAreaView>
   ```

---

## Customization Options

### Geometric Background

The `GeometricBackground` component accepts the following optional props:

- **`size?: number`** (default: `400`)
  - The size of the SVG canvas in pixels.
  - For a full-screen background, you may want to increase this or use `useWindowDimensions()` to dynamically set the size.

To customize the visual appearance, edit the following constants in `GeometricBackground.tsx`:

- **`NUM_CIRCLES`** (line 26): Number of concentric circles (default: 15).
- **`BASE_RADIUS`** (line 28): Starting radius of the innermost circle (default: 5).
- **`BASE_SPACING`** (line 29): Spacing between circles (default: 5).
- **`AMPLITUDE`** (line 31): Amplitude of the oscillation effect (default: 2).
- **Colors:** The gradient colors in the SVG Defs (lines 42-44):
  - `stopColor="#1A237E"` (Deep Indigo) and `stopColor="#000000"` (Black) for the background gradient.
  - `stroke="#8C9EFF"` (Light Indigo/Violet) for the circle lines.

### Pet Animation (Cognitive Load)

The cognitive load flicker can be customized by modifying the following in `PetMorph.tsx`:

- **Flicker Amplitude Calculation** (line 60):
  ```typescript
  const flickerAmplitude = 1 - (vitals.mood / 100); // Inverse relationship
  ```
  - Change the formula to adjust how mood affects the flicker intensity.

- **Flicker Frequency and Duration** (lines 63-70):
  ```typescript
  cognitiveFlicker.value = withRepeat(
    withSequence(
      withTiming(flickerAmplitude * 0.5, { duration: 50 }),
      withTiming(flickerAmplitude * 0.1, { duration: 50 })
    ),
    -1,
    true
  );
  ```
  - Adjust the `duration` values (in milliseconds) to change the flicker speed.
  - Modify the multipliers (`0.5`, `0.1`) to change the flicker amplitude range.

---

## Testing the Add-on

After integrating the files, follow these steps to test the add-on:

1. **Install Dependencies:**
   ```bash
   cd <your-project>/meta-pet-mobile
   npm install
   # or
   yarn install
   ```

2. **Run the Development Server:**
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Launch the App:**
   - For iOS: `npm run ios`
   - For Android: `npm run android`

4. **Observe the Changes:**
   - The geometric background should appear behind the pet, with concentric circles oscillating smoothly.
   - The pet's inner Seed of Life pattern should flicker subtly, with the intensity varying based on the pet's mood.
   - Interact with the pet to change its mood and observe the cognitive load flicker intensity increase or decrease accordingly.

---

## Technical Details

### Oscillating Aperture Illusion

The geometric background implements a mathematical model of the oscillating aperture illusion:

- **Animation Parameter:** A shared value `t` oscillates from 0 to 1 over a 4-second cycle.
- **Circle Radius Calculation:** For the nth circle, the radius is calculated as:
  $$R_n(t) = R_{base} + n \cdot D_{base} + A \cdot \sin(2\pi t + \phi_n)$$
  where $\phi_n = \frac{n}{NUM\_CIRCLES} \cdot 2\pi$ is the phase shift for each circle.
- **Effect:** The sine wave modulation creates the illusion of simultaneous expansion and contraction, with each circle oscillating at the same rate but with a phase offset, creating a wave-like motion.

### Cognitive Load Animation

The cognitive load animation is a high-frequency, small-amplitude flicker that modulates the opacity of the pet's inner pattern:

- **Frequency:** ~10 Hz (50ms on, 50ms off per cycle).
- **Amplitude:** Inversely proportional to the pet's mood (0.0 to 1.0 range).
- **Effect:** Creates a subtle visual representation of the pet's mental state, with stressed/sad pets appearing to "flicker" more intensely.

---

## Troubleshooting

### Issue: The geometric background doesn't appear

**Solution:** Ensure that the `GeometricBackground` component is rendered before the `HUD` component in the JSX tree. The absolute positioning should place it behind the HUD.

### Issue: The pet's flicker is too intense or too subtle

**Solution:** Adjust the `flickerAmplitude` calculation or the multipliers in the `withTiming` calls within the `cognitiveFlicker` animation logic.

### Issue: The animation is laggy or stuttering

**Solution:** Ensure that you're using the latest version of `react-native-reanimated`. The add-on is compatible with `react-native-reanimated` v2 and above.

---

## Support and Feedback

For questions, issues, or feature requests related to this add-on, please refer to the main project repository or contact the development team.

---

## License

This add-on is provided as part of the Blackcockatoo/jewble project and follows the same license terms as the main project.
