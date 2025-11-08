/**
 * Seed of Life Glyph
 * Sacred geometry visualization using React Native SVG
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../providers/ThemeProvider';

interface SeedOfLifeGlyphProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const SeedOfLifeGlyph: React.FC<SeedOfLifeGlyphProps> = ({
  size = 200,
  color,
  opacity = 1,
}) => {
  const { theme } = useTheme();
  const strokeColor = color || theme.primary;
  const strokeWidth = size / 50;

  // Calculate positions for the 7 circles (1 center + 6 surrounding)
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 6;
  const angleStep = (Math.PI * 2) / 6; // 60 degrees

  const circles = [
    // Center circle
    { cx: centerX, cy: centerY },
    // 6 surrounding circles
    ...Array.from({ length: 6 }, (_, i) => ({
      cx: centerX + radius * Math.cos(angleStep * i),
      cy: centerY + radius * Math.sin(angleStep * i),
    })),
  ];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G opacity={opacity}>
          {circles.map((circle, index) => (
            <Circle
              key={index}
              cx={circle.cx}
              cy={circle.cy}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          ))}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
