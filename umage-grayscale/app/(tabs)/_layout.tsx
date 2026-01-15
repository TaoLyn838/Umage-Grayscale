import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f2f2f2',
        tabBarInactiveTintColor: '#c0c0c0',
        tabBarStyle: { backgroundColor: '#1c1c1c' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Grayscale',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-filter-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
