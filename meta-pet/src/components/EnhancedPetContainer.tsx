import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PetMorph } from '../animations/PetMorph';
import { TemporalEchoTrail } from './TemporalEchoTrail';
import { SubAtomicParticleField } from './SubAtomicParticleField';
import { getHeptaChromaticColor } from '../utils/petUpgrades';
import type { Vitals } from '@/store';

interface EnhancedPetContainerProps {
  vitals: Vitals;
  size?: number;
}

/**
 * EnhancedPetContainer: A wrapper component that combines all four upgrades:
 * 1. Hepta-Chromatic Aura (integrated in PetMorph)
 * 2. Fractalized Shell (integrated in PetMorph)
 * 3. Temporal Echo Trail (rendered behind the pet)
 * 4. Sub-Atomic Particle Field (rendered around the pet)
 */
export function EnhancedPetContainer({
  vitals,
  size = 200,
}: EnhancedPetContainerProps) {
  const primaryColor = getHeptaChromaticColor(vitals);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Layer 1: Temporal Echo Trail (farthest back) */}
      <TemporalEchoTrail vitals={vitals} size={size} primaryColor={primaryColor} />

      {/* Layer 2: Sub-Atomic Particle Field (behind the pet) */}
      <SubAtomicParticleField vitals={vitals} size={size} primaryColor={primaryColor} />

      {/* Layer 3: Main Pet (PetMorph with Hepta-Chromatic Aura and Fractalized Shell) */}
      <PetMorph vitals={vitals} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
