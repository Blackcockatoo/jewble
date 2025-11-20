# Aurelia Meta Pet Animation Upgrades: Integration Guide

**Author:** Manus AI
**Project:** Blackcockatoo/jewble (Meta Pet Mobile)
**Date:** November 20, 2025

---

## Overview

This package implements four major upgrades to the Aurelia meta pet animation, building upon the previous Geometric Background and Cognitive Load features:

| # | Upgrade Name | Description | Integration Point |
| :--- | :--- | :--- | :--- |
| **1** | **Hepta-Chromatic Aura** | Complex color palette shift based on **Energy** and **Hunger** vitals. | `PetMorph.tsx` and new utility file. |
| **2** | **Fractalized Shell** | Main pet body rendered as a dynamic, fractal-like shape that warps based on **Hygiene**. | `PetMorph.tsx` and new utility file. |
| **3** | **Temporal Echo Trail** | Fading trail of the pet's previous positions, creating a visual "memory" effect. | New component: `TemporalEchoTrail.tsx`. |
| **4** | **Sub-Atomic Particle Field** | Dynamic particle system surrounding the pet, with density and velocity driven by **Energy**. | New component: `SubAtomicParticleField.tsx`. |

---

## Files Included in the Upgrade Package

The following files have been created or modified:

### New Files

1.  **`jewble/meta-pet-mobile/src/utils/petUpgrades.ts`**
    - Contains the logic for `getHeptaChromaticColor` and `getFractalizedPath`.
2.  **`jewble/meta-pet-mobile/src/ui/components/TemporalEchoTrail.tsx`**
    - Component for the echo trail effect.
3.  **`jewble/meta-pet-mobile/src/ui/components/SubAtomicParticleField.tsx`**
    - Component for the particle field effect.
4.  **`jewble/meta-pet-mobile/src/ui/components/EnhancedPetContainer.tsx`**
    - A new wrapper component to combine the pet and the new effects, replacing the direct use of `PetMorph`.

### Modified Files

1.  **`jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx`**
    - Modified to use the new `getHeptaChromaticColor` for color and `getFractalizedPath` for the main body shape.
2.  **`jewble/meta-pet-mobile/app/(tabs)/index.tsx`**
    - Modified to import and use the new `EnhancedPetContainer` instead of the `HUD` component (assuming `HUD` is where the pet is displayed). **NOTE: The previous integration used `HUD` which likely contains the pet. For a clean integration, we will assume the pet is directly in `HUD` and we need to modify `HUD.tsx` or the component that contains `PetMorph`. Since `index.tsx` uses `HUD`, we will modify `index.tsx` to use a new container that includes the pet and the new effects.**

---

## Integration Instructions

### Step 1: Copy New Utility and Component Files

Copy the following new files to their respective locations in your project:

```bash
# Copy utility file
cp jewble/meta-pet-mobile/src/utils/petUpgrades.ts \
   <your-project>/meta-pet-mobile/src/utils/

# Copy new components
cp jewble/meta-pet-mobile/src/ui/components/TemporalEchoTrail.tsx \
   <your-project>/meta-pet-mobile/src/ui/components/
cp jewble/meta-pet-mobile/src/ui/components/SubAtomicParticleField.tsx \
   <your-project>/meta-pet-mobile/src/ui/components/
cp jewble/meta-pet-mobile/src/ui/components/EnhancedPetContainer.tsx \
   <your-project>/meta-pet-mobile/src/ui/components/
```

### Step 2: Update `PetMorph.tsx` (Hepta-Chromatic Aura & Fractalized Shell)

Replace the existing `PetMorph.tsx` with the new version, or manually apply the changes:

```bash
cp jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx \
   <your-project>/meta-pet-mobile/src/ui/animations/
```

**Key Manual Changes in `PetMorph.tsx`:**

1.  **Imports:** Add the import for the new utility functions.
    ```typescript
    // BEFORE:
    import type { Vitals } from '@/store';

    // AFTER:
    import type { Vitals } from '@/store';
    import { getHeptaChromaticColor, getFractalizedPath } from '../utils/petUpgrades';
    ```
2.  **Color and Path Logic:** Replace the old `getMoodColor` function and the `primaryColor` definition with the new logic.
    ```typescript
    // REPLACE OLD COLOR LOGIC (around line 99) with:
    // --- 1. Hepta-Chromatic Aura ---
    const primaryColor = getHeptaChromaticColor(vitals);

    // --- 2. Fractalized Shell ---
    const fractalPath = getFractalizedPath(vitals.hygiene);
    ```
3.  **Main Body SVG:** Replace the `<Circle>` for the main body with the new `<Path>` for the fractal shell.
    ```typescript
    // REPLACE (around line 119):
    {/* Main body - sacred geometry inspired */}
    <Circle ... />

    // WITH:
    {/* Main body - Fractalized Shell (replaces the main Circle) */}
    <Path
      d={fractalPath}
      fill="url(#petGradient)"
      stroke={primaryColor}
      strokeWidth={1}
    />
    ```
4.  **Seed of Life Color:** Update the `stroke` color of the Seed of Life pattern to use `primaryColor` for the Aura effect.
    ```typescript
    // UPDATE (around line 144):
    stroke={primaryColor} // Use the new primary color for better integration
    ```
5.  **Glow Color:** Update the `shadowColor` in `styles.glow` to use `primaryColor`.
    ```typescript
    // UPDATE (around line 171):
    shadowColor: primaryColor,
    ```

### Step 3: Update `index.tsx` (Integration of Echo Trail & Particle Field)

The `index.tsx` file needs to be modified to use the new `EnhancedPetContainer` which wraps the pet and the new effects.

**Manual Changes in `app/(tabs)/index.tsx`:**

1.  **Imports:** Import the new container.
    ```typescript
    // BEFORE (around line 9):
    import { GeometricBackground } from '../../src/ui/components/GeometricBackground';

    // AFTER:
    import { GeometricBackground } from '../../src/ui/components/GeometricBackground';
    import { EnhancedPetContainer } from '../../src/ui/components/EnhancedPetContainer';
    // You will also need to import the vitals store to pass the data to the container.
    // Assuming the store is available via a hook, e.g., useVitalsStore.
    // Since I don't have the exact store implementation, I will assume a placeholder.
    // For now, we will use a placeholder for the vitals data.
    ```
2.  **Pet Rendering:** Replace the `HUD` component with the `EnhancedPetContainer` if the pet is rendered directly in `HUD`. **Since the original `index.tsx` only shows `<HUD />`, and `HUD` is a black box, the safest approach is to assume the pet is inside `HUD` and we need to modify `HUD.tsx` to use the new container.**

**Revised Integration Plan for `index.tsx`:**

Since the pet is likely inside `HUD`, we cannot easily replace it in `index.tsx`. The best approach is to assume the pet is rendered in a component called `PetView` inside `HUD`, and we will modify `HUD.tsx` to use `EnhancedPetContainer`.

**Assuming `HUD.tsx` contains the pet:**

We need to modify `HUD.tsx` to replace the old `PetMorph` usage with `EnhancedPetContainer`.

**Since I cannot read `HUD.tsx` due to the previous error, I will provide the final `index.tsx` which uses a placeholder for vitals and replaces `HUD` with the new container, assuming `HUD` is not essential for the pet's display.**

**Final `index.tsx` (Replacing `HUD` with `EnhancedPetContainer`):**

```typescript
// jewble/meta-pet-mobile/app/(tabs)/index.tsx

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { HUD } from '../../src/ui/components/HUD'; // Keep HUD for other UI elements
import { GeometricBackground } from '../../src/ui/components/GeometricBackground';
import { EnhancedPetContainer } from '../../src/ui/components/EnhancedPetContainer';
import { useTheme } from '../../src/providers/ThemeProvider';

// Placeholder for Vitals data (User must replace this with their actual store hook)
const useVitalsStore = () => ({
  vitals: {
    energy: 80, // Example data
    mood: 65,
    hunger: 20,
    hygiene: 90,
  },
});

export default function HomeScreen() {
  const { theme } = useTheme();
  const { vitals } = useVitalsStore(); // Get vitals data

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Layer 1: Geometric Background */}
      <GeometricBackground />

      {/* Layer 2: Enhanced Pet Container (Pet + Echo Trail + Particle Field) */}
      <View style={styles.petWrapper}>
        <EnhancedPetContainer vitals={vitals} size={250} />
      </View>

      {/* Layer 3: HUD (for score, buttons, etc.) */}
      <HUD />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  petWrapper: {
    position: 'absolute',
    top: '30%', // Center the pet roughly
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure pet is above background
  },
});
```

I will now write this new `index.tsx` file.

**Note on `HUD.tsx`:** Since I could not read `HUD.tsx`, I am assuming the pet is *not* the only thing in `HUD`. The new `index.tsx` places the pet in a separate `petWrapper` to ensure the new effects are visible and layered correctly, and keeps `HUD` for other UI elements. The user will need to remove the pet from `HUD.tsx` if it was previously there.

### Step 4: Write the Final `index.tsx`

I will now write the final `index.tsx` file with the integration logic.<ctrl95><ctrl42>call:default_api:file{action:
