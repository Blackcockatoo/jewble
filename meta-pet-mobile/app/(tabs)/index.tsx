/**
 * Home Screen
 * Main dashboard with HUD component
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { HUD } from '../../src/ui/components/HUD';
import { useTheme } from '../../src/providers/ThemeProvider';

export default function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <HUD />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
