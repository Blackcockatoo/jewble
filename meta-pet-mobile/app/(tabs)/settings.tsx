/**
 * Settings Screen
 * App configuration and preferences
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../src/providers/ThemeProvider';
import { useStore } from '../../src/store';
import { SeedOfLifeGlyph } from '../../src/ui/components/SeedOfLifeGlyph';
import { persistence } from '../../src/store/persistence';
import { isConsentValid } from '../../src/identity/consent';

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, value, onToggle }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? theme.primaryLight : theme.textTertiary}
      />
    </View>
  );
};

export default function SettingsScreen() {
  const { theme } = useTheme();
  const darkMode = useStore((s) => s.darkMode);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const toggleAudio = useStore((s) => s.toggleAudio);
  const toggleHaptics = useStore((s) => s.toggleHaptics);
  const evolution = useStore((s) => s.evolution);
  const exportData = useStore((s) => s.exportData);
  const consent = useStore((s) => s.consent);
  const hydrate = useStore((s) => s.hydrate);
  const consentValid = isConsentValid(consent);

  const handleToggleDarkMode = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleDarkMode();
  };

  const handleToggleAudio = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleAudio();
  };

  const handleToggleHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleHaptics();
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your Meta-Pet data. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            persistence.clearAll();
            hydrate();
            if (hapticsEnabled) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            Alert.alert('Data Reset', 'All data has been cleared. You can start fresh now.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    if (!consentValid) {
      Alert.alert(
        'Consent Required',
        'Please review and accept the privacy consent before exporting your data.'
      );
      return;
    }

    try {
      if (hapticsEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const payload = exportData();
      const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

      if (!directory) {
        throw new Error('No writable directory available for export.');
      }

      const timestamp = new Date(payload.exportedAt).toISOString().replace(/[:.]/g, '-');
      const fileUri = `${directory}meta-pet-export-${timestamp}.json`;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Share Meta-Pet Export',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Created', `Your data export was saved to:\n${fileUri}`);
      }

      if (hapticsEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Failed to export data', error);
      if (hapticsEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert(
        'Export Failed',
        'We were unable to create an export package. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <SeedOfLifeGlyph size={120} opacity={0.2} />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>App Info</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Version</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Build</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>Beta</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Pet Age</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {Math.floor((Date.now() - evolution.birthTime) / (1000 * 60 * 60 * 24))} days
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
          <SettingRow
            label="Dark Mode"
            description="Use dark theme for better battery life"
            value={darkMode}
            onToggle={handleToggleDarkMode}
          />
          <SettingRow
            label="Audio"
            description="Play hepta tones and sound effects"
            value={audioEnabled}
            onToggle={handleToggleAudio}
          />
          <SettingRow
            label="Haptic Feedback"
            description="Enable vibration feedback on interactions"
            value={hapticsEnabled}
            onToggle={handleToggleHaptics}
          />
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data</Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: consentValid ? 1 : 0.5 },
            ]}
            onPress={handleExportData}
            activeOpacity={0.7}
            disabled={!consentValid}
          >
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Export Data</Text>
          </TouchableOpacity>
          {!consentValid && (
            <Text style={[styles.helperText, { color: theme.textTertiary }]}>Accept the privacy consent to enable exports.</Text>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton, { borderColor: theme.ui.error }]}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: theme.ui.error }]}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
          <Text style={[styles.aboutText, { color: theme.textTertiary }]}>
            B$S Meta-Pet is a sacred geometry-inspired virtual companion with deterministic genome
            encoding and evolution mechanics.
          </Text>
          <Text style={[styles.aboutText, { color: theme.textTertiary, marginTop: 12 }]}>
            Never share your genome vaults. Only share crest hashes for archival purposes.
          </Text>
        </View>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
