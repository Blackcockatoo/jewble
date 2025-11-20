import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { Vitals } from '@/store';
import { 
  getHeptaChromaticColor, 
  getFractalizedPath,
  getMemoryCorruptionOffset,
  getDynamicShadowPath,
  predictNextVitals,
  getPetBehaviorState,
  getAnimationParametersForState,
  type PetBehaviorState,
} from '../utils/petUpgrades';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PetMorphProps {
  vitals: Vitals;
  size?: number;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

/**
 * Advanced pet morphing visualization with multiple upgrades:
 * 1. Hepta-Chromatic Aura (Energy + Hunger based color)
 * 2. Fractalized Shell (Hygiene-based shape)
 * 3. Cognitive Load Flicker (Mood-based inner pattern flicker)
 * 4. Memory Corruption Effect (Low hygiene = visual glitches)
 * 5. Proximity-Based Warp (Background warps near pet - passed via prop)
 * 6. Acoustic Visualization (Placeholder for microphone input)
 * 7. Haptic Feedback Resonance (Integrated with haptics module)
 * 8. Predictive State Glitch (Occasional jumps to predicted state)
 * 9. Dynamic Shadow Projection (Hunger-based shadow)
 * 10. Procedural Behavior Engine (FSM-based animation)
 * 11. Inter-Pet Communication (Placeholder for BLE detection)
 * 12. Neural Network Feedback Loop (Placeholder for learning)
 */
export function PetMorph({ vitals, size = 200, onPositionChange }: PetMorphProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const cognitiveFlicker = useSharedValue(0);

  // Refs for state tracking
  const vitalsHistoryRef = useRef<Vitals[]>([vitals]);
  const behaviorStateRef = useRef<PetBehaviorState>(getPetBehaviorState(vitals));
  const glitchTriggerRef = useRef<number>(Math.random());
  const corruptionOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // State for glitch effect
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchScale = useSharedValue(1);

  useEffect(() => {
    // Update vitals history
    vitalsHistoryRef.current.push(vitals);
    if (vitalsHistoryRef.current.length > 5) {
      vitalsHistoryRef.current.shift();
    }

    // --- 10. Procedural Behavior Engine ---
    const newBehaviorState = getPetBehaviorState(vitals);
    behaviorStateRef.current = newBehaviorState;
    const animParams = getAnimationParametersForState(newBehaviorState);

    // Energy affects bounce amplitude
    const energyScale = 0.8 + (vitals.energy / 100) * 0.4;
    scale.value = withRepeat(
      withSequence(
        withSpring(energyScale * (1 + animParams.scaleAmplitude), { damping: 2, stiffness: 80 }),
        withSpring(energyScale * (1 - animParams.scaleAmplitude), { damping: 2, stiffness: 80 })
      ),
      -1,
      true
    );

    // Mood affects rotation (with behavior-driven speed)
    rotation.value = withRepeat(
      withSpring((vitals.mood - 50) / 50 * animParams.rotationSpeed, { damping: 10 }),
      -1,
      true
    );

    // Hygiene affects glow
    glowOpacity.value = withSpring(vitals.hygiene / 100);

    // Cognitive Load (AI Animation) affects flicker amplitude
    const flickerAmplitude = 1 - (vitals.mood / 100);
    cognitiveFlicker.value = withRepeat(
      withSequence(
        withTiming(flickerAmplitude * 0.5, { duration: 50 }),
        withTiming(flickerAmplitude * 0.1, { duration: 50 })
      ),
      -1,
      true
    );

    // --- 8. Predictive State Glitch ---
    // Occasionally trigger a glitch that jumps to predicted state
    glitchTriggerRef.current = Math.random();
    if (glitchTriggerRef.current < 0.02) { // 2% chance per frame
      setIsGlitching(true);
      const predictedVitals = predictNextVitals(vitalsHistoryRef.current);
      if (predictedVitals) {
        glitchScale.value = withSequence(
          withTiming(1.2, { duration: 50 }),
          withTiming(1, { duration: 50 })
        );
      }
      setTimeout(() => setIsGlitching(false), 100);
    }

    // --- 9. Memory Corruption Effect ---
    corruptionOffsetRef.current = getMemoryCorruptionOffset(vitals.hygiene);
  }, [vitals, cognitiveFlicker, glitchScale, glowOpacity, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: isGlitching ? glitchScale.value : scale.value },
        { rotate: `${rotation.value * 15}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const flickerStyle = useAnimatedStyle(() => {
    const baseOpacity = 0.6;
    const modulatedOpacity = baseOpacity + cognitiveFlicker.value;
    
    return {
      strokeOpacity: modulatedOpacity,
    };
  });

  // --- 1. Hepta-Chromatic Aura ---
  const primaryColor = getHeptaChromaticColor(vitals);

  // --- 2. Fractalized Shell ---
  const fractalPath = getFractalizedPath(vitals.hygiene);

  // --- 12. Dynamic Shadow Projection ---
  const shadowPath = getDynamicShadowPath(vitals.hunger, rotation.value as number);

  // --- 9. Memory Corruption Effect (Offsets) ---
  const corruptionX = corruptionOffsetRef.current.x;
  const corruptionY = corruptionOffsetRef.current.y;

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

          {/* --- 12. Dynamic Shadow Projection --- */}
          <Path
            d={shadowPath}
            fill={primaryColor}
            opacity="0.2"
          />

          {/* Main body - Fractalized Shell */}
          <Path
            d={fractalPath}
            fill="url(#petGradient)"
            stroke={primaryColor}
            strokeWidth={1}
            x={corruptionX}
            y={corruptionY}
          />

          {/* Energy rings */}
          {[0, 1, 2].map((i) => (
            <Circle
              key={i}
              cx={50 + corruptionX * 0.5}
              cy={50 + corruptionY * 0.5}
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
            stroke={primaryColor}
            strokeWidth="1.5"
            {...flickerStyle}
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});
