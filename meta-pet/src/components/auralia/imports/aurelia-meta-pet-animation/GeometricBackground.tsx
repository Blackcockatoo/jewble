import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GeometricBackgroundProps {
  size?: number;
  petPosition?: { x: number; y: number }; // Pet's screen coordinates for proximity-based warp
}

/**
 * Implements the Oscillating Aperture Illusion using concentric circles.
 * The circles' spacing is animated to create the illusion of simultaneous
 * expansion and contraction, giving the background a sensational geometric intensity.
 * 
 * UPGRADE 5: Proximity-Based Warp
 * The background warps and distorts in the immediate vicinity of the pet,
 * as if the pet's presence is bending space-time.
 */
export function GeometricBackground({ size = 400, petPosition }: GeometricBackgroundProps) {
  // Shared value for the animation progress (0 to 1)
  const t = useSharedValue(0);

  // Shared values for pet position (used for proximity-based warp)
  const petPositionX = useSharedValue(petPosition?.x ?? size / 2);
  const petPositionY = useSharedValue(petPosition?.y ?? size / 2);

  useEffect(() => {
    // Animate 't' smoothly from 0 to 1 and back, repeating indefinitely
    t.value = withRepeat(
      withTiming(1, { duration: 4000 }), // 4 second cycle
      -1, // Repeat indefinitely
      true // Reverse the animation on each cycle
    );
  }, [t]);

  useEffect(() => {
    if (petPosition) {
      petPositionX.value = petPosition.x;
      petPositionY.value = petPosition.y;
    }
  }, [petPosition, petPositionX, petPositionY]);

  // Number of concentric circles
  const NUM_CIRCLES = 15;
  // Base radius and spacing (normalized to 100x100 viewBox)
  const BASE_RADIUS = 5;
  const BASE_SPACING = 5;
  // Amplitude of the illusion effect
  const AMPLITUDE = 2;

  // Array of circle indices to map over
  const circleIndices = Array.from({ length: NUM_CIRCLES }, (_, i) => i);

  // Create separate component for each circle to avoid hooks in loops
  const AnimatedCircleComponent = ({ n }: { n: number }) => {
    const animatedProps = useAnimatedStyle(() => {
      // Calculate the base radius for the nth circle
      const baseR = BASE_RADIUS + n * BASE_SPACING;
      const phaseShift = (n / NUM_CIRCLES) * Math.PI * 2;
      const modulation = Math.sin(t.value * Math.PI * 2 + phaseShift);

      // --- UPGRADE 5: Proximity-Based Warp ---
      // The background warps in the vicinity of the pet
      let proximityWarp = 0;
      if (petPosition) {
        // Normalize pet position to SVG viewBox coordinates (0-100)
        const petX = (petPositionX.value / size) * 100;
        const petY = (petPositionY.value / size) * 100;
        const centerX = 50;
        const centerY = 50;

        // Calculate distance from circle center to pet
        const dx = centerX - petX;
        const dy = centerY - petY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply a radial distortion effect: circles near the pet are warped more
        const warpRadius = 30; // Radius of the warp effect
        const warpStrength = Math.max(0, 1 - distance / warpRadius);
        proximityWarp = warpStrength * 3 * Math.sin(t.value * Math.PI * 2);
      }

      const r = baseR + AMPLITUDE * modulation + proximityWarp;

      // Interpolate 't' to control the stroke opacity for a subtle pulse
      const opacity = interpolate(
        t.value,
        [0, 0.5, 1],
        [0.3, 0.6, 0.3],
        Extrapolate.CLAMP
      );

      return {
        r: r,
        strokeOpacity: opacity,
      };
    });

    return (
      <AnimatedCircle
        cx="50"
        cy="50"
        fill="none"
        stroke="#8C9EFF" // Light Indigo/Violet for the lines
        strokeWidth="0.5"
        // The 'r' and 'strokeOpacity' are animated
        {...animatedProps}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* A subtle radial gradient for depth */}
          <RadialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#1A237E" stopOpacity="1" /> {/* Deep Indigo */}
            <Stop offset="100%" stopColor="#000000" stopOpacity="1" /> {/* Black */}
          </RadialGradient>
        </Defs>
        {/* Background fill */}
        <Circle cx="50" cy="50" r="50" fill="url(#bgGradient)" />

        {/* Animated Concentric Circles */}
        {circleIndices.map((n) => (
          <AnimatedCircleComponent key={n} n={n} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure it fills the entire screen/container where it's placed
  },
});
