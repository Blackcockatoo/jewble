/**
 * Cosmos Screen - Astrogenetics
 * Cosmic birth charts, horoscopes, and breeding mechanics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useStore } from '../../src/store';
import {
  formatPlanetaryModifier,
  getFortuneColor,
  getGRSStatusColor,
  type GRSState,
} from '../../src/engine/astrogenetics';

export default function CosmosScreen() {
  const { theme } = useTheme();
  const birthChart = useStore((s) => s.birthChart);
  const horoscope = useStore((s) => s.horoscope);
  const grs = useStore((s) => s.grs);
  const lastBreedingPreview = useStore((s) => s.lastBreedingPreview);
  const createBirthChart = useStore((s) => s.createBirthChart);
  const refreshHoroscope = useStore((s) => s.refreshHoroscope);
  const updateGRS = useStore((s) => s.updateGRS);
  const previewBreeding = useStore((s) => s.previewBreeding);
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);

  const [birthTimeInput, setBirthTimeInput] = useState('');
  const [breedTimeInput, setBreedTimeInput] = useState('');
  const [happiness, setHappiness] = useState('0');
  const [activity, setActivity] = useState('5');

  const haptic = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [hapticsEnabled]);

  const handleSetNow = () => {
    haptic();
    const now = new Date();
    const localISO = now.toISOString().slice(0, 16);
    setBirthTimeInput(localISO);
    setBreedTimeInput(localISO);
  };

  const handleCreateBirthChart = () => {
    if (!birthTimeInput) return;
    haptic();
    const date = new Date(birthTimeInput);
    createBirthChart(date);
  };

  const handleRefreshHoroscope = () => {
    haptic();
    refreshHoroscope();
  };

  const handleCalculateGRS = () => {
    haptic();
    const state: GRSState = {
      happiness: parseFloat(happiness) || 0,
      activity: parseFloat(activity) || 5,
      neglected: false,
      socialTrend: 0.5, // positive trend
      entropy: 0.3, // mostly predictable
      challenge: 0.6,
    };
    updateGRS(state);
  };

  const handlePreviewBreeding = () => {
    if (!breedTimeInput || !birthChart) return;
    haptic();
    const date = new Date(breedTimeInput);
    previewBreeding(date);
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cosmic Astrogenetics</Text>
          <Text style={styles.subtitle}>Birth Charts & Meta-Horoscopes</Text>
        </View>

        {/* Create Birth Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Birth Chart</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DDTHH:MM"
              placeholderTextColor={theme.textTertiary}
              value={birthTimeInput}
              onChangeText={setBirthTimeInput}
            />
            <TouchableOpacity style={styles.smallBtn} onPress={handleSetNow}>
              <Text style={styles.smallBtnText}>Now</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleCreateBirthChart}>
            <Text style={styles.btnText}>Hatch Pet</Text>
          </TouchableOpacity>
        </View>

        {/* Birth Chart Display */}
        {birthChart && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cosmic Birth Chart</Text>

            {/* Gate Banner */}
            <View style={styles.gateBanner}>
              <Text style={styles.gateName}>{birthChart.gate}</Text>
              <Text style={styles.runeText}>
                {birthChart.rune.name} - {birthChart.rune.effect}
              </Text>
            </View>

            {/* Lucas Index */}
            <View style={styles.centerInfo}>
              <Text style={styles.label}>Lucas Index</Text>
              <Text style={styles.lucasValue}>{birthChart.lucasIndex}</Text>
              <Text style={styles.smallLabel}>
                Born: {birthChart.birthTime.toLocaleString()}
              </Text>
              <Text style={styles.smallLabel}>Age: {birthChart.days} days</Text>
            </View>

            {/* Genetic Sequences */}
            <Text style={styles.sectionTitle}>Genetic Sequences</Text>

            <Text style={styles.sequenceLabel}>Red (Physical)</Text>
            <View style={[styles.sequence, styles.sequenceRed]}>
              <Text style={styles.sequenceText}>{birthChart.sequences.red}</Text>
            </View>
            <View style={styles.traitGrid}>
              <Text style={styles.traitItem}>Size: {birthChart.traits.physical.size}</Text>
              <Text style={styles.traitItem}>Hue: {birthChart.traits.physical.colorHue}°</Text>
              <Text style={styles.traitItem}>Pattern: {birthChart.traits.physical.pattern}</Text>
              <Text style={styles.traitItem}>Accent: {birthChart.traits.physical.accent}</Text>
            </View>

            <Text style={styles.sequenceLabel}>Blue (Personality)</Text>
            <View style={[styles.sequence, styles.sequenceBlue]}>
              <Text style={styles.sequenceText}>{birthChart.sequences.blue}</Text>
            </View>
            <View style={styles.traitGrid}>
              <Text style={styles.traitItem}>Social: {birthChart.traits.personality.sociability}</Text>
              <Text style={styles.traitItem}>Energy: {birthChart.traits.personality.energy}%</Text>
              <Text style={styles.traitItem}>Intel: {birthChart.traits.personality.intelligence}</Text>
              <Text style={styles.traitItem}>Affection: {birthChart.traits.personality.affection}</Text>
            </View>

            <Text style={styles.sequenceLabel}>Black (Hidden)</Text>
            <View style={[styles.sequence, styles.sequenceBlack]}>
              <Text style={styles.sequenceText}>{birthChart.sequences.black}</Text>
            </View>
            <Text style={styles.smallLabel}>Unlocks at Level 10</Text>
          </View>
        )}

        {/* Planetary Heritage */}
        {birthChart && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Planetary Heritage</Text>
            {birthChart.planets.map((planet) => {
              const mod = formatPlanetaryModifier(planet.modifier);
              return (
                <View key={planet.name} style={styles.planetRow}>
                  <Text style={styles.planetName}>
                    {planet.symbol} {planet.name}
                  </Text>
                  <Text style={styles.planetAngle}>{planet.angle.toFixed(1)}°</Text>
                  <Text
                    style={[
                      styles.planetMod,
                      mod.isPositive && styles.modPositive,
                      mod.isNeutral && styles.modNeutral,
                      !mod.isPositive && !mod.isNeutral && styles.modNegative,
                    ]}
                  >
                    {mod.text} {planet.trait}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Daily Horoscope */}
        {horoscope && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Cosmic Forecast</Text>
            <TouchableOpacity style={styles.smallBtn} onPress={handleRefreshHoroscope}>
              <Text style={styles.smallBtnText}>Refresh</Text>
            </TouchableOpacity>
            <View style={styles.horoscope}>
              <Text style={styles.horoscopeDate}>
                {horoscope.date.toLocaleDateString()}
              </Text>
              <Text style={styles.horoscopeGate}>
                Active Gate: {horoscope.gate}
              </Text>
              <Text style={styles.horoscopeRune}>
                Rune: {horoscope.rune.name} - {horoscope.rune.effect}
              </Text>
              <Text style={styles.horoscopeResonance}>
                Resonance: {(horoscope.resonance * 100).toFixed(1)}%
              </Text>
              <View
                style={[
                  styles.fortuneBadge,
                  { backgroundColor: getFortuneColor(horoscope.fortuneLevel) + '33' },
                ]}
              >
                <Text
                  style={[
                    styles.fortuneText,
                    { color: getFortuneColor(horoscope.fortuneLevel) },
                  ]}
                >
                  {horoscope.fortuneLevel === 'stellar'
                    ? 'Stellar Alignment'
                    : horoscope.fortuneLevel === 'calm'
                    ? 'Calm Skies'
                    : 'Cosmic Tension'}
                </Text>
              </View>
              <Text style={styles.effectsTitle}>Today's Effects:</Text>
              {horoscope.effects.map((effect, i) => (
                <Text key={i} style={styles.effectItem}>
                  • {effect}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* GRS Calculator */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Growth Readiness Score</Text>
          <Text style={styles.smallLabel}>Optimal timing for evolution & training</Text>

          {grs && (
            <View style={styles.grsContainer}>
              <View style={styles.grsBarContainer}>
                <View
                  style={[
                    styles.grsBar,
                    {
                      width: `${grs.score}%`,
                      backgroundColor: getGRSStatusColor(grs.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.grsScore}>{grs.score}%</Text>
              <View
                style={[
                  styles.grsStatus,
                  { backgroundColor: getGRSStatusColor(grs.status) + '33' },
                ]}
              >
                <Text
                  style={[
                    styles.grsStatusText,
                    { color: getGRSStatusColor(grs.status) },
                  ]}
                >
                  {grs.status}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Happiness (-3 to +3)"
              placeholderTextColor={theme.textTertiary}
              value={happiness}
              onChangeText={setHappiness}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Activity (0-9)"
              placeholderTextColor={theme.textTertiary}
              value={activity}
              onChangeText={setActivity}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleCalculateGRS}>
            <Text style={styles.btnText}>Calculate GRS</Text>
          </TouchableOpacity>
        </View>

        {/* Breeding Simulator */}
        {birthChart && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Breeding Simulator</Text>
            <Text style={styles.smallLabel}>
              Simulate offspring by choosing a breeding time
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DDTHH:MM"
                placeholderTextColor={theme.textTertiary}
                value={breedTimeInput}
                onChangeText={setBreedTimeInput}
              />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handlePreviewBreeding}>
              <Text style={styles.btnText}>Simulate Breeding</Text>
            </TouchableOpacity>

            {lastBreedingPreview && (
              <View style={styles.breedingResult}>
                <Text style={styles.breedingTitle}>Offspring Preview</Text>
                <Text style={styles.breedingInfo}>
                  Time: {lastBreedingPreview.breedTime.toLocaleString()}
                </Text>
                <Text style={styles.breedingInfo}>
                  Gate: {lastBreedingPreview.gate}
                </Text>
                <Text style={styles.breedingInfo}>
                  Rune: {lastBreedingPreview.rune.effect}
                </Text>
                <Text style={styles.breedingInfo}>
                  Baby Lucas: {lastBreedingPreview.babyLucasIndex}
                </Text>
                <View style={[styles.sequence, styles.sequenceRed]}>
                  <Text style={styles.sequenceText}>
                    {lastBreedingPreview.sequences.red}
                  </Text>
                </View>
                <Text style={styles.breedingTraits}>
                  Size: {lastBreedingPreview.physicalTraits.size} | Color:{' '}
                  {lastBreedingPreview.physicalTraits.colorHue}° | Pattern:{' '}
                  {lastBreedingPreview.physicalTraits.pattern}
                </Text>
                <Text style={styles.tipText}>
                  Tip: Try breeding during different gates to see how offspring
                  change!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      color: theme.text,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    halfInput: {
      flex: 1,
    },
    btn: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
    },
    btnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    smallBtn: {
      backgroundColor: theme.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    smallBtnText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
    },
    gateBanner: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    gateName: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    runeText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 13,
      marginTop: 4,
    },
    centerInfo: {
      alignItems: 'center',
      marginBottom: 16,
    },
    label: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    lucasValue: {
      color: theme.primary,
      fontSize: 32,
      fontWeight: 'bold',
    },
    smallLabel: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      marginTop: 8,
    },
    sequenceLabel: {
      color: theme.textSecondary,
      fontSize: 14,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sequence: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
    },
    sequenceRed: {
      backgroundColor: 'rgba(248,113,113,0.1)',
      borderColor: 'rgba(127,29,29,0.5)',
    },
    sequenceBlue: {
      backgroundColor: 'rgba(96,165,250,0.1)',
      borderColor: 'rgba(30,58,138,0.5)',
    },
    sequenceBlack: {
      backgroundColor: 'rgba(161,161,170,0.1)',
      borderColor: 'rgba(63,63,70,0.5)',
    },
    sequenceText: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 18,
      letterSpacing: 3,
      color: theme.text,
    },
    traitGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    traitItem: {
      backgroundColor: theme.background,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      fontSize: 12,
      color: theme.text,
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    planetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      padding: 10,
      borderRadius: 8,
      marginBottom: 6,
    },
    planetName: {
      flex: 1,
      fontWeight: '600',
      color: theme.text,
    },
    planetAngle: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: theme.textSecondary,
      marginRight: 12,
    },
    planetMod: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    modPositive: {
      color: '#4ade80',
      backgroundColor: 'rgba(74,222,128,0.1)',
    },
    modNeutral: {
      color: theme.textSecondary,
    },
    modNegative: {
      color: '#f87171',
      backgroundColor: 'rgba(248,113,113,0.1)',
    },
    horoscope: {
      backgroundColor: theme.background,
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    horoscopeDate: {
      color: theme.primary,
      fontWeight: '600',
      marginBottom: 8,
    },
    horoscopeGate: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    horoscopeRune: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 4,
    },
    horoscopeResonance: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 8,
    },
    fortuneBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginBottom: 12,
    },
    fortuneText: {
      fontWeight: '600',
      fontSize: 12,
    },
    effectsTitle: {
      color: theme.text,
      fontWeight: '600',
      marginBottom: 4,
    },
    effectItem: {
      color: theme.textSecondary,
      fontSize: 14,
      marginBottom: 2,
    },
    grsContainer: {
      marginBottom: 16,
    },
    grsBarContainer: {
      height: 24,
      backgroundColor: theme.background,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    grsBar: {
      height: '100%',
      borderRadius: 12,
    },
    grsScore: {
      textAlign: 'center',
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 18,
      marginTop: 8,
    },
    grsStatus: {
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginTop: 8,
    },
    grsStatusText: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    breedingResult: {
      marginTop: 16,
      padding: 16,
      backgroundColor: theme.background,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    breedingTitle: {
      color: theme.primary,
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 8,
    },
    breedingInfo: {
      color: theme.text,
      fontSize: 13,
      marginBottom: 4,
    },
    breedingTraits: {
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 8,
    },
    tipText: {
      color: theme.textSecondary,
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 12,
    },
  });
