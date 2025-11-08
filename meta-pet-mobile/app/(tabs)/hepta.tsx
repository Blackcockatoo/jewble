/**
 * Hepta Screen
 * Display and manage hepta codes
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useStore } from '../../src/store';
import { HeptaTag } from '../../src/ui/components/HeptaTag';
import { SeedOfLifeGlyph } from '../../src/ui/components/SeedOfLifeGlyph';
import { playHepta } from '../../src/ui/audio/playHepta.native';

export default function HeptaScreen() {
  const { theme } = useTheme();
  const genome = useStore((s) => s.genome);
  const traits = useStore((s) => s.traits);
  const generateNewPet = useStore((s) => s.generateNewPet);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);

  const [inputCode, setInputCode] = useState('');

  const handlePlayHepta = async (vault: 'red' | 'blue' | 'black') => {
    if (!genome) return;

    const vaultArray = genome[`${vault}60`];
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (audioEnabled) {
      await playHepta(vaultArray.slice(0, 7), { vault, rotation: 'CW' });
    }
  };

  const handleGenerateNew = () => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    generateNewPet();
    Alert.alert('New Pet Generated!', 'Your Meta-Pet has been created with a new genome.');
  };

  const handleImportCode = () => {
    if (!inputCode.trim()) {
      Alert.alert('Error', 'Please enter a hepta code');
      return;
    }

    // TODO: Implement hepta code import logic
    Alert.alert('Import', 'Hepta code import coming soon!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Hepta Code</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your Meta-Pet's Genetic Identity
          </Text>
        </View>

        {/* Sacred Geometry */}
        <View style={styles.glyphContainer}>
          <SeedOfLifeGlyph size={200} opacity={0.3} />
        </View>

        {/* Current Genome Display */}
        {genome && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Genome</Text>

            <View style={styles.vaultContainer}>
              <Text style={[styles.vaultLabel, { color: theme.textSecondary }]}>Red Vault (Physical)</Text>
              <HeptaTag
                heptaCode={genome.red60.slice(0, 12).join('')}
                variant="default"
                onPress={() => handlePlayHepta('red')}
              />
            </View>

            <View style={styles.vaultContainer}>
              <Text style={[styles.vaultLabel, { color: theme.textSecondary }]}>Blue Vault (Personality)</Text>
              <HeptaTag
                heptaCode={genome.blue60.slice(0, 12).join('')}
                variant="default"
                onPress={() => handlePlayHepta('blue')}
              />
            </View>

            <View style={styles.vaultContainer}>
              <Text style={[styles.vaultLabel, { color: theme.textSecondary }]}>Black Vault (Latent)</Text>
              <HeptaTag
                heptaCode={genome.black60.slice(0, 12).join('')}
                variant="default"
                onPress={() => handlePlayHepta('black')}
              />
            </View>
          </View>
        )}

        {/* Trait Summary */}
        {traits && (
          <View style={[styles.traitsCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.traitsTitle, { color: theme.text }]}>Decoded Traits</Text>
            <View style={styles.traitRow}>
              <Text style={[styles.traitLabel, { color: theme.textSecondary }]}>Temperament:</Text>
              <Text style={[styles.traitValue, { color: theme.primary }]}>
                {traits.personality.temperament}
              </Text>
            </View>
            <View style={styles.traitRow}>
              <Text style={[styles.traitLabel, { color: theme.textSecondary }]}>Body Type:</Text>
              <Text style={[styles.traitValue, { color: theme.primary }]}>
                {traits.physical.bodyType}
              </Text>
            </View>
            <View style={styles.traitRow}>
              <Text style={[styles.traitLabel, { color: theme.textSecondary }]}>Evolution Path:</Text>
              <Text style={[styles.traitValue, { color: theme.primary }]}>
                {traits.latent.evolutionPath}
              </Text>
            </View>
          </View>
        )}

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Import Hepta Code</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Enter hepta code..."
            placeholderTextColor={theme.textTertiary}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleImportCode}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>Import Code</Text>
          </TouchableOpacity>
        </View>

        {/* Generate New */}
        <TouchableOpacity
          style={[styles.button, styles.generateButton, { borderColor: theme.primary }]}
          onPress={handleGenerateNew}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>Generate New Pet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  glyphContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vaultContainer: {
    marginBottom: 16,
  },
  vaultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  traitsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  traitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  traitLabel: {
    fontSize: 14,
  },
  traitValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
