/**
 * Root Layout
 * Sets up providers and manages app lifecycle (vitals tick)
 */

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { FeatureProvider } from '../src/providers/FeatureProvider';
import { useStore } from '../src/store';
import { FEATURES } from '../src/config';

export default function RootLayout() {
  const startTick = useStore((s) => s.startTick);
  const stopTick = useStore((s) => s.stopTick);

  useEffect(() => {
    // Start vitals tick on mount
    startTick();

    // Handle app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        startTick();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        if (FEATURES.BACKGROUND_PAUSE) {
          stopTick();
        }
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
      stopTick();
    };
  }, [startTick, stopTick]);

  return (
    <FeatureProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="consent"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </FeatureProvider>
  );
}
