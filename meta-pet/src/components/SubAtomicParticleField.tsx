import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import type { Vitals } from '@/store';

interface SubAtomicParticleFieldProps {
  vitals: Vitals;
  size?: number;
  primaryColor?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  radius: number;
  duration: number; // Animation duration for this particle
}

/**
 * Sub-Atomic Particle Field: Renders a dynamic particle system around the pet.
 * The density and velocity of particles are driven by the pet's Energy level.
 * Particles orbit and move around the pet in a chaotic but visually appealing manner.
 */
export function SubAtomicParticleField({
  vitals,
  size = 200,
  primaryColor = '#00D9A5',
}: SubAtomicParticleFieldProps) {
  // Shared value for the animation progress
  const animationProgress = useSharedValue(0);

  // Generate particles based on energy level
  const particles: Particle[] = useMemo(() => {
    const particleCount = Math.floor(5 + (vitals.energy / 100) * 15); // 5 to 20 particles
    const generatedParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 40 + Math.random() * 30; // Distance from center
      const speed = 0.5 + (vitals.energy / 100) * 2; // Speed based on energy

      generatedParticles.push({
        id: i,
        x: size / 2 + Math.cos(angle) * distance,
        y: size / 2 + Math.sin(angle) * distance,
        vx: Math.cos(angle + Math.PI / 4) * speed,
        vy: Math.sin(angle + Math.PI / 4) * speed,
        radius: 1 + Math.random() * 2,
        duration: 2000 + Math.random() * 2000, // Vary animation duration
      });
    }

    return generatedParticles;
  }, [vitals.energy, size]);

  useEffect(() => {
    // Animate the progress value continuously
    animationProgress.value = withRepeat(
      withTiming(1, { duration: 4000 }), // 4 second cycle
      -1,
      true
    );
  }, [animationProgress]);

  // Render each particle with its own animation
  const particleElements = particles.map((particle) => {
    const ParticleView = () => {
      const particleProgress = useSharedValue(0);

      useEffect(() => {
        particleProgress.value = withRepeat(
          withTiming(1, { duration: particle.duration }),
          -1,
          true
        );
      }, [particleProgress, particle.duration]);

      const particleStyle = useAnimatedStyle(() => {
        // Calculate the particle's position based on its velocity and animation progress
        const offsetX = particle.vx * 50 * particleProgress.value;
        const offsetY = particle.vy * 50 * particleProgress.value;

        // Add some orbital motion (circular path)
        const orbitAngle = particleProgress.value * Math.PI * 2;
        const orbitRadius = 30;
        const orbitX = Math.cos(orbitAngle) * orbitRadius;
        const orbitY = Math.sin(orbitAngle) * orbitRadius;

        return {
          transform: [
            { translateX: offsetX + orbitX },
            { translateY: offsetY + orbitY },
          ],
          opacity: interpolate(
            particleProgress.value,
            [0, 0.5, 1],
            [0.3, 1, 0.3],
            Extrapolate.CLAMP
          ),
        };
      });

      return (
        <Animated.View
          style={[
            styles.particle,
            {
              width: particle.radius * 2,
              height: particle.radius * 2,
              backgroundColor: primaryColor,
              left: particle.x - particle.radius,
              top: particle.y - particle.radius,
            },
            particleStyle,
          ]}
        />
      );
    };

    return <ParticleView key={particle.id} />;
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {particleElements}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0, // Behind the main pet
    overflow: 'hidden', // Ensure particles don't overflow the container
  },
  particle: {
    position: 'absolute',
    borderRadius: 100, // Make it a circle
  },
});
