import { Stack } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";
import { FEATURES } from "../src/config";
import { useStore } from "../src/store";

// This is the main App component for Expo Router, implementing the Vitals Tick logic.
export default function App() {
  // Assuming the store is correctly implemented with startTick and stopTick
  const start = useStore((s) => s.startTick);
  const stop = useStore((s) => s.stopTick);

  useEffect(() => {
    // Start the tick immediately on mount
    start();

    // Add event listener for app state changes
    const sub = AppState.addEventListener("change", (s) => {
      // Pause tick when app goes to background or inactive, if feature is enabled
      if ((s === "background" || s === "inactive") && FEATURES.BACKGROUND_PAUSE) {
        stop();
      }
      // Resume tick when app becomes active
      if (s === "active") {
        start();
      }
    });

    // Clean up the event listener on unmount
    return () => sub.remove();
  }, [start, stop]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* These are placeholder screens based on the example in the spec */}
      <Stack.Screen name="(tabs)" redirect={true} />
      <Stack.Screen name="hepta" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
