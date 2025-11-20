import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import type { Vitals } from '@/store';

interface TemporalEchoTrailProps {
  vitals: Vitals;
  size?: number;
  primaryColor?: string;
}

interface EchoPosition {
  x: number;
  y: number;
  opacity: number;
  timestamp: number;
}

/**
 * Temporal Echo Trail: Creates a fading trail of the pet's previous positions.
 * This component renders a series of translucent circles at the pet's historical positions,
 * creating a "memory" or "motion blur" effect.
 */
export function TemporalEchoTrail({
  vitals,
  size = 200,
  primaryColor = '#00D9A5',
}: TemporalEchoTrailProps) {
  // Shared value for the pet's animation progress (0 to 1)
  const animationProgress = useSharedValue(0);

  // Ref to store the history of positions
  const positionHistoryRef = useRef<EchoPosition[]>([]);
  const maxHistoryLength = 8; // Number of echo trails to keep

  useEffect(() => {
    // Animate the progress value continuously
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 2000 }), // 2 second cycle
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Update the position history based on the animation progress
    // The pet's position oscillates based on the animation progress and vitals
    const energyScale = 0.8 + (vitals.energy / 100) * 0.4;
    const moodInfluence = (vitals.mood - 50) / 50;

    // Calculate the pet's current position (simulating movement)
    const offsetX = Math.sin(animationProgress.value * Math.PI * 2 + moodInfluence) * 20 * energyScale;
    const offsetY = Math.cos(animationProgress.value * Math.PI * 2) * 15 * energyScale;

    const newPosition: EchoPosition = {
      x: size / 2 + offsetX,
      y: size / 2 + offsetY,
      opacity: 1,
      timestamp: Date.now(),
    };

    // Add the new position to the history
    positionHistoryRef.current.push(newPosition);

    // Keep only the last N positions
    if (positionHistoryRef.current.length > maxHistoryLength) {
      positionHistoryRef.current.shift();
    }
  }, [animationProgress, vitals, size]);

  // Render the echo trail
  const echoTrails = positionHistoryRef.current.map((position, index) => {
    const age = Date.now() - position.timestamp;
    const maxAge = 500; // Milliseconds before an echo fades completely
    const fadeOpacity = Math.max(0, 1 - age / maxAge);
    const relativeOpacity = (index + 1) / maxHistoryLength; // Older echoes are more transparent

    return (
      <View
        key={index}
        style={[
          styles.echo,
          {
            left: position.x - 20, // Center the echo (assuming 40px diameter)
            top: position.y - 20,
            backgroundColor: primaryColor,
            opacity: fadeOpacity * relativeOpacity * 0.5, // Combine age and position opacity
          },
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {echoTrails}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0, // Behind the main pet
  },
  echo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
