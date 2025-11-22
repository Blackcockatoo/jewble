/**
 * Tabs Layout
 * Bottom tab navigation for main app screens
 */

import { Tabs } from 'expo-router';
import { useTheme } from '../../src/providers/ThemeProvider';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="hepta"
        options={{
          title: 'Hepta',
          tabBarIcon: ({ color }) => <TabIcon name="code" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cosmos"
        options={{
          title: 'Cosmos',
          tabBarIcon: ({ color }) => <TabIcon name="cosmos" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon component (you can replace with actual icons later)
function TabIcon({ name, color }: { name: string; color: string }) {
  const { Text } = require('react-native');
  const icons = {
    home: '🏠',
    code: '🔮',
    cosmos: '🌌',
    settings: '⚙️',
  };

  return (
    <Text style={{ fontSize: 24, color }}>
      {icons[name as keyof typeof icons] || '•'}
    </Text>
  );
}
