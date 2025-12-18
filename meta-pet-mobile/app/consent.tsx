/**
 * Consent Screen
 * Privacy and identity consent modal
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../src/providers/ThemeProvider';
import { useStore } from '../src/store';
import { SeedOfLifeGlyph } from '../src/ui/components/SeedOfLifeGlyph';
import { isConsentValid } from '../src/identity/consent';
import { COLORS } from '../src/ui/theme/colors';

export default function ConsentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);
  const consent = useStore((s) => s.consent);
  const acceptConsent = useStore((s) => s.acceptConsent);
  const revokeConsent = useStore((s) => s.revokeConsent);
  const consentAccepted = isConsentValid(consent);

  const handleAccept = () => {
    if (consentAccepted) {
      router.back();
      return;
    }

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    acceptConsent();
    setTimeout(() => {
      router.back();
    }, 500);
  };

  const handleDecline = () => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    revokeConsent();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <SeedOfLifeGlyph size={120} opacity={0.5} />
          <Text style={[styles.title, { color: theme.text }]}>Privacy & Identity</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            B$S Meta-Pet Consent
          </Text>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Sealed Identity System
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Your Meta-Pet uses a sealed identity system with deterministic genome encoding.
            All genetic data is stored locally on your device.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>
            Data Privacy
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • No genome data is ever transmitted to external servers
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • All vitals and progression data is stored locally using MMKV
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Only share crest hashes for archival purposes
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • Never share your genome vaults (red60, blue60, black60)
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.primary, marginTop: 20 }]}>
            Sacred Geometry
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            This app uses sacred geometry principles and hepta encoding for unique identity
            generation. Your companion's traits are derived deterministically from its genome.
          </Text>

          <Text style={[styles.warning, { color: COLORS.ui.warning, marginTop: 20 }]}>
            ⚠️ Experimental Software
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            This is beta software. Back up your hepta codes if you want to preserve your
            Meta-Pet's identity.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.acceptButton,
              { backgroundColor: theme.primary, opacity: consentAccepted ? 0.6 : 1 },
            ]}
            onPress={handleAccept}
            activeOpacity={0.8}
            disabled={consentAccepted}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {consentAccepted ? 'Consent Already Granted' : 'I Understand & Accept'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.declineButton, { borderColor: theme.border }]}
            onPress={handleDecline}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Decline</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  content: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  warning: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    // backgroundColor set dynamically
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
