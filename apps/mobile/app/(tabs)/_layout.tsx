import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function StackLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="create_recipe"
        options={{
          title: 'Create Recipe',
        }}
      />
      <Stack.Screen
        name="snap_view"
        options={{
          title: 'Snap View', 
        }}
      />
    </Stack>
  );
}
