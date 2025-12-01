/**
 * HUD (Heads-Up Display)
 * Main vitals display component with sacred geometry styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../providers/ThemeProvider';
import { useStore } from '../../store';
import { getVitalStatus } from '../../engine/state';
import { EVOLUTION_STAGE_INFO } from '../../engine/evolution';
import { SeedOfLifeGlyph } from './SeedOfLifeGlyph';

interface VitalBarProps {
  label: string;
  value: number;
  icon: string;
  onPress?: () => void;
}

const VitalBar: React.FC<VitalBarProps> = ({ label, value, icon, onPress }) => {
  const { theme, colors } = useTheme();
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);

  const status = getVitalStatus(value);
  const barColor = colors.vitals[status];

  const handlePress = () => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[styles.vitalContainer, { backgroundColor: theme.surface }]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.vitalHeader}>
        <Text style={[styles.vitalIcon, { color: theme.text }]}>{icon}</Text>
        <Text style={[styles.vitalLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.vitalValue, { color: theme.text }]}>{Math.round(value)}</Text>
      </View>
      <View style={[styles.vitalBarBackground, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.vitalBarFill,
            {
              width: `${Math.max(0, Math.min(100, value))}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

export const HUD: React.FC = () => {
  const { theme, colors } = useTheme();
  const vitals = useStore((s) => s.vitals);
  const evolution = useStore((s) => s.evolution);
  const traits = useStore((s) => s.traits);
  const feed = useStore((s) => s.feed);
  const clean = useStore((s) => s.clean);
  const play = useStore((s) => s.play);
  const sleep = useStore((s) => s.sleep);
  const tryEvolve = useStore((s) => s.tryEvolve);

  const evolutionInfo = EVOLUTION_STAGE_INFO[evolution.state];
  const stateColor = colors.evolution[evolution.state.toLowerCase() as keyof typeof colors.evolution];

  const handleEvolve = () => {
    const success = tryEvolve();
    if (success) {
      if (useStore.getState().hapticsEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sacred Geometry Background */}
      <View style={styles.glyphContainer}>
        <SeedOfLifeGlyph size={300} opacity={0.1} />
      </View>

      {/* Header */}
      <LinearGradient
        colors={[theme.surface, theme.surfaceElevated]}
        style={styles.header}
      >
        <View>
          <Text style={[styles.petName, { color: theme.text }]}>
            {traits?.personality.temperament || 'Meta-Pet'}
          </Text>
          <View style={styles.evolutionBadge}>
            <View style={[styles.evolutionDot, { backgroundColor: stateColor }]} />
            <Text style={[styles.evolutionText, { color: theme.textSecondary }]}>
              {evolutionInfo.title}
            </Text>
          </View>
        </View>
        <View style={styles.experienceContainer}>
          <Text style={[styles.experienceLabel, { color: theme.textSecondary }]}>XP</Text>
          <Text style={[styles.experienceValue, { color: theme.primary }]}>
            {evolution.experience}/100
          </Text>
        </View>
      </LinearGradient>

      {/* Tagline */}
      <Text style={[styles.tagline, { color: theme.textTertiary }]}>
        {evolutionInfo.tagline}
      </Text>

      {/* Vitals */}
      <View style={styles.vitalsContainer}>
        <VitalBar label="Hunger" value={100 - vitals.hunger} icon="<V" onPress={feed} />
        <VitalBar label="Hygiene" value={vitals.hygiene} icon="=�" onPress={clean} />
        <VitalBar label="Mood" value={vitals.mood} icon="=
" onPress={play} />
        <VitalBar label="Energy" value={vitals.energy} icon="�" onPress={sleep} />
      </View>

      {/* Evolution Button */}
      {evolution.canEvolve && (
        <TouchableOpacity
          style={[styles.evolveButton, { backgroundColor: theme.primary }]}
          onPress={handleEvolve}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.evolveButtonGradient}
          >
            <Text style={[styles.evolveButtonText, { color: theme.background }]}>
              � EVOLVE TO {EVOLUTION_STAGE_INFO[evolution.state]?.celebration?.split('')?.[0] || 'NEXT STAGE'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Stats Footer */}
      <View style={[styles.footer, { backgroundColor: theme.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{evolution.totalInteractions}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Interactions</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {Math.floor((Date.now() - evolution.birthTime) / (1000 * 60 * 60 * 24))}d
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Age</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {traits ? `${traits.physical.bodyType}` : 'Unknown'}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Type</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  glyphContainer: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginLeft: -150,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  evolutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  evolutionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  evolutionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  experienceContainer: {
    alignItems: 'flex-end',
  },
  experienceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  experienceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  vitalsContainer: {
    gap: 12,
    marginBottom: 24,
    zIndex: 1,
  },
  vitalContainer: {
    padding: 12,
    borderRadius: 8,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  vitalIcon: {
    fontSize: 20,
  },
  vitalLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vitalBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  vitalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  evolveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  evolveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  evolveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
});
