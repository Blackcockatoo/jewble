import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { HUD } from '../../src/ui/components/HUD';
import { GeometricBackground } from '../../src/ui/components/GeometricBackground';
import { EnhancedPetContainer } from '../../src/ui/components/EnhancedPetContainer';
import { useTheme } from '../../src/providers/ThemeProvider';

// NOTE: The user must replace this placeholder with their actual vitals store hook.
// This placeholder is for demonstration and to ensure the component structure is correct.
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
      {/* Layer 1: Geometric Background (Absolute position, fills screen) */}
      <GeometricBackground />

      {/* Layer 2: Enhanced Pet Container (Pet + Echo Trail + Particle Field) */}
      <View style={styles.petWrapper}>
        <EnhancedPetContainer vitals={vitals} size={250} />
      </View>

      {/* Layer 3: HUD (for score, buttons, etc. - placed on top) */}
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
