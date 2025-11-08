/**
 * Hepta Tag Component
 * Displays a hepta code with B$S styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../providers/ThemeProvider';
import { useStore } from '../../store';

interface HeptaTagProps {
  heptaCode: string;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'large';
}

export const HeptaTag: React.FC<HeptaTagProps> = ({
  heptaCode,
  onPress,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const hapticsEnabled = useStore((s) => s.hapticsEnabled);

  const handlePress = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  // Format hepta code with dashes for readability
  const formatHepta = (code: string) => {
    if (code.length <= 8) return code;
    const chunks = code.match(/.{1,4}/g) || [];
    return chunks.join('-');
  };

  const formattedCode = formatHepta(heptaCode);

  const sizeStyles = {
    compact: styles.textCompact,
    default: styles.textDefault,
    large: styles.textLarge,
  };

  const containerSizeStyles = {
    compact: styles.containerCompact,
    default: styles.containerDefault,
    large: styles.containerLarge,
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress ? handlePress : undefined}
      style={[
        styles.container,
        containerSizeStyles[variant],
        {
          backgroundColor: theme.surface,
          borderColor: theme.primary,
        },
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text
        style={[
          styles.text,
          sizeStyles[variant],
          { color: theme.primary },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formattedCode}
      </Text>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  containerDefault: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containerLarge: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  text: {
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 1,
  },
  textCompact: {
    fontSize: 12,
  },
  textDefault: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 20,
  },
});
