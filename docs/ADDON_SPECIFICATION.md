# Aurelia Meta Pet Animation Add-on Technical Specification

**Author:** Manus AI
**Project:** Blackcockatoo/jewble (Meta Pet Mobile)
**Goal:** Implement a sensational geometric background with an optical illusion effect and enhance the pet's animation with more detailed, AI-driven features.

---

## 1. Geometric Background: The Oscillating Aperture Illusion

The background will implement a variation of the **Oscillating Aperture Illusion** (also known as the "Shrink and Swell Illusion") to create the requested effect where the pattern appears to expand and shrink at the same rate. This will be achieved by animating a geometric pattern (e.g., concentric circles or a spiral) within a fixed aperture.

### 1.1. Technical Implementation

*   **New Component:** A new React Native component, `GeometricBackground.tsx`, will be created in `jewble/meta-pet-mobile/src/ui/components/`.
*   **Technology Stack:** It will utilize `react-native-svg` for drawing the geometric pattern and `react-native-reanimated` for the smooth, mathematically-driven animation.
*   **Illusion Logic:**
    *   The pattern will be a series of concentric circles.
    *   The animation will involve a continuous, non-linear change in the **spacing** between the circles, while the overall viewable area remains constant.
    *   A shared value, `t`, will oscillate between 0 and 1 using a smooth function (e.g., `withRepeat(withTiming(...), -1, true)`).
    *   The radius of each circle $R_n$ will be calculated based on $t$ and its index $n$, using a function that creates the illusion of simultaneous expansion and contraction. A simple model could involve modulating the base radius with a sine wave:
        $$R_n(t) = R_{base} + n \cdot D_{base} + A \cdot \sin(2\pi t + \phi_n)$$
        where $R_{base}$ is the starting radius, $D_{base}$ is the base spacing, $A$ is the amplitude of the oscillation, and $\phi_n$ is a phase shift for each circle to create the wave-like motion.

### 1.2. Integration

The `GeometricBackground` component will be placed behind the existing pet component in the main view, likely in `jewble/meta-pet-mobile/app/(tabs)/index.tsx` or a similar container component.

---

## 2. Enhanced Pet Animation: AI-Driven Features

The existing `PetMorph.tsx` already uses `vitals` (energy, mood, hygiene) to drive scale, rotation, and glow. The enhancement will focus on adding more "AI-driven" detail by introducing a new, complex animation state.

### 2.1. New Feature: "Cognitive Load" Animation

A new animation will be introduced to simulate the pet's "thinking" or "cognitive load," which will be a subtle, high-frequency visual noise or flicker.

*   **Implementation:** The `PetMorph.tsx` component will be modified.
*   **Logic:**
    *   A new shared value, `cognitiveFlicker`, will be introduced, oscillating at a high frequency (e.g., 10-20 times per second) with a small amplitude.
    *   This flicker will be mapped to a subtle visual property of the pet, such as the `strokeWidth` or `strokeOpacity` of the inner geometric patterns (e.g., the Seed of Life pattern).
    *   The **amplitude** of this flicker will be inversely proportional to the pet's `mood` (low mood = high cognitive load/flicker, high mood = low flicker).

### 2.2. Modification to `PetMorph.tsx`

The following modifications will be made to `jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx`:

1.  Import necessary reanimated functions.
2.  Introduce `cognitiveFlicker` shared value and its animation logic.
3.  Apply `cognitiveFlicker` to the `strokeOpacity` of the Seed of Life pattern.

| Feature | Current Logic (PetMorph.tsx) | Proposed Enhancement (AI Animation) |
| :--- | :--- | :--- |
| **Size/Bounce** | Driven by `vitals.energy` | No change |
| **Rotation** | Driven by `vitals.mood` | No change |
| **Glow/Opacity** | Driven by `vitals.hygiene` | No change |
| **Inner Pattern** | Static `strokeOpacity` (0.6) | **Dynamic "Cognitive Load" Flicker** driven by `vitals.mood` (Inverse relationship) |

---

## 3. Deliverables

The final add-on package will consist of the following files:

1.  `jewble/meta-pet-mobile/src/ui/components/GeometricBackground.tsx` (New Component)
2.  `jewble/meta-pet-mobile/src/ui/animations/PetMorph.tsx` (Modified Component)
3.  `jewble/meta-pet-mobile/app/(tabs)/index.tsx` (Modified to integrate the background)
4.  `jewble/ADDON_INTEGRATION_GUIDE.md` (Instructions for the user to apply the changes)
