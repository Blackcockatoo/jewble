/**
 * B$S Theme Colors
 * Sacred geometry inspired color palette with dark mode support
 */

export const COLORS = {
  // B$S Sacred Geometry Colors
  gold: {
    light: '#FFD700',
    DEFAULT: '#D4AF37',
    dark: '#B8860B',
    metallic: '#CFB53B',
  },
  black: {
    pure: '#000000',
    DEFAULT: '#0A0A0A',
    soft: '#1A1A1A',
    lighter: '#2A2A2A',
  },
  white: {
    pure: '#FFFFFF',
    DEFAULT: '#F5F5F5',
    soft: '#E5E5E5',
    darker: '#D5D5D5',
  },

  // Vitals Status Colors
  vitals: {
    excellent: '#00D9A5',  // Bright green
    good: '#7EC8E3',       // Blue
    low: '#FFB84D',        // Orange
    critical: '#FF6B6B',   // Red
  },

  // Evolution State Colors
  evolution: {
    genetics: '#4ECDC4',
    neuro: '#9B59B6',
    quantum: '#F39C12',
    speciation: '#E74C3C',
  },

  // Sacred Geometry Accent Colors
  sacred: {
    violet: '#8B7EC8',
    indigo: '#4F46E5',
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
  },

  // UI Colors
  ui: {
    primary: '#D4AF37',    // Gold
    secondary: '#8B7EC8',  // Violet
    success: '#00D9A5',
    warning: '#FFB84D',
    error: '#FF6B6B',
    info: '#7EC8E3',
  },
};

export interface Theme {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  shadow: string;
}

export const darkTheme: Theme = {
  background: COLORS.black.DEFAULT,
  backgroundSecondary: COLORS.black.soft,
  surface: COLORS.black.soft,
  surfaceElevated: COLORS.black.lighter,
  text: COLORS.white.DEFAULT,
  textSecondary: COLORS.white.soft,
  textTertiary: '#999999',
  border: COLORS.black.lighter,
  borderSubtle: '#333333',
  primary: COLORS.gold.DEFAULT,
  primaryDark: COLORS.gold.dark,
  primaryLight: COLORS.gold.light,
  accent: COLORS.sacred.violet,
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const lightTheme: Theme = {
  background: COLORS.white.DEFAULT,
  backgroundSecondary: COLORS.white.soft,
  surface: COLORS.white.pure,
  surfaceElevated: COLORS.white.DEFAULT,
  text: COLORS.black.soft,
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: COLORS.white.darker,
  borderSubtle: '#E0E0E0',
  primary: COLORS.gold.dark,
  primaryDark: COLORS.gold.dark,
  primaryLight: COLORS.gold.metallic,
  accent: COLORS.sacred.violet,
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const getTheme = (isDark: boolean): Theme => (isDark ? darkTheme : lightTheme);
