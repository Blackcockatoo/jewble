/**
 * Theme Provider
 * Provides theme context with dark mode support
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useStore } from '../store';
import { getTheme, type Theme, COLORS } from '../ui/theme/colors';

interface ThemeContextType {
  theme: Theme;
  colors: typeof COLORS;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  const theme = getTheme(darkMode);

  const value: ThemeContextType = {
    theme,
    colors: COLORS,
    isDark: darkMode,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
