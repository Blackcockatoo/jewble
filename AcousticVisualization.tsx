import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AcousticVisualizationProps {
  size?: number;
  primaryColor?: string;
}

/**
 * UPGRADE 6: Acoustic Visualization (Placeholder)
 * Simulates the pet's reaction to ambient sound.
 * NOTE: Actual microphone integration requires native code setup (e.g., expo-av)
 * and user permissions, which cannot be implemented here.
 * This component simulates the effect based on a simple, rhythmic pulse.
 */
export function AcousticVisualization({
  size = 200,
  primaryColor = '#00D9A5',
}: AcousticVisualizationProps) {
  // Shared value to simulate the average decibel level (0 to 1)
  const simulatedDecibel = useSharedValue(0);

  useEffect(() => {
    // Simulate a rhythmic sound input (e.g., a background beat)
    simulatedDecibel.value = withRepeat(
      withTiming(1, { duration: 500 }), // 0.5 second pulse
      -1,
      true
    );
  }, []);

  // Number of visualization bars
  const NUM_BARS = 10;
  const barElements = Array.from({ length: NUM_BARS }, (_, i) => {
    const animatedStyle = useAnimatedStyle(() => {
      // Each bar reacts slightly differently (phase shift)
      const phaseShift = i / NUM_BARS;
      const pulse = interpolate(
        simulatedDecibel.value,
        [0, 1],
        [0.1, 1],
        Extrapolate.CLAMP
      );
      
      // Height is based on the pulse and a slight phase shift
      const heightScale = 0.1 + pulse * 0.9 * (1 - Math.abs(simulatedDecibel.value - phaseShift));

      return {
        height: heightScale * (size / 2),
        opacity: heightScale,
      };
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.bar,
          {
            backgroundColor: primaryColor,
            width: size / (NUM_BARS * 2),
          },
          animatedStyle,
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {barElements}
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
    flexDirection: 'row',
    zIndex: 0, // Behind the pet
  },
  bar: {
    marginHorizontal: 2,
    borderRadius: 2,
    alignSelf: 'flex-end',
  },
});
