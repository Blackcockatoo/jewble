import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { Vitals } from '@/store';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PetMorphProps {
  vitals: Vitals;
  size?: number;
}

/**
 * Advanced pet morphing visualization that responds to vitals in real-time
 * - Shape morphs based on energy (0-100 affects size/bounce)
 * - Color shifts based on mood (affects hue rotation)
 * - Pulsation speed based on hunger (affects animation tempo)
 * - Cleanliness affects opacity/glow
 */
export function PetMorph({ vitals, size = 200 }: PetMorphProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Energy affects bounce amplitude
    const energyScale = 0.8 + (vitals.energy / 100) * 0.4; // 0.8-1.2
    scale.value = withRepeat(
      withSequence(
        withSpring(energyScale * 1.1, { damping: 2, stiffness: 80 }),
        withSpring(energyScale * 0.9, { damping: 2, stiffness: 80 })
      ),
      -1,
      true
    );

    // Mood affects rotation
    rotation.value = withRepeat(
      withSpring((vitals.mood - 50) / 50, { damping: 10 }),
      -1,
      true
    );

    // Hygiene affects glow
    glowOpacity.value = withSpring(vitals.hygiene / 100);
  }, [vitals]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value * 15}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // Color based on mood
  const getMoodColor = (mood: number): string => {
    if (mood > 70) return '#00D9A5'; // Happy green
    if (mood > 40) return '#7EC8E3'; // Neutral blue
    if (mood > 20) return '#FFB84D'; // Low orange
    return '#FF6B6B'; // Sad red
  };

  const primaryColor = getMoodColor(vitals.mood);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.petContainer, animatedStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="petGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.4" />
            </RadialGradient>
          </Defs>

          {/* Main body - sacred geometry inspired */}
          <Circle
            cx="50"
            cy="50"
            r={40 + (vitals.hunger / 100) * 5}
            fill="url(#petGradient)"
          />

          {/* Energy rings */}
          {[0, 1, 2].map((i) => (
            <Circle
              key={i}
              cx="50"
              cy="50"
              r={45 + i * 5}
              fill="none"
              stroke={primaryColor}
              strokeWidth="1"
              strokeOpacity={0.2 * (vitals.energy / 100)}
            />
          ))}

          {/* Seed of Life pattern overlay */}
          <Path
            d="M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity={0.6}
          />
        </Svg>
      </Animated.View>

      {/* Glow effect */}
      <Animated.View style={[styles.glow, glowStyle, { backgroundColor: primaryColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petContainer: {
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    zIndex: 1,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});
