import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGemini } from '@/hooks/useGemini';
import { Theme } from '@/components/theme';
import { useFonts } from 'expo-font';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'InriaSans': require('../../assets/fonts/InriaSans-Bold.ttf'), // Adjust the path as needed
    'InriaSans-Italic': require('../../assets/fonts/InriaSans-Italic.ttf'),
    'InriaSans-Regular': require('../../assets/fonts/InriaSans-Regular.ttf'),
    'Jaro-Regular-Var': require('../../assets/fonts/Jaro-Regular-Var.ttf'),
    'SpaceMono-Regular': require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Or a loading indicator
  }

  return (
    <View
      style={{
        backgroundColor: Theme.background,
        height: "100%",
      }}
    >
      <SafeAreaView>
        <View
          style={{
            backgroundColor: Theme.secondary,
            height: 110,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              paddingLeft: 20,
            }}
          >
            <Text
              style={{
                color: Theme.background,
                fontSize: 30,
                textAlign: "start",
                paddingTop: 40,
                fontFamily: "Jaro-Regular-Var", // Try just "InriaSans"
              }}
              >
              DACHEF
            </Text>
            <Text
              style={{
                color: Theme.background,
                fontSize: 12,
                textAlign: "start",
                fontFamily: "InriaSans",
              }}
            >
              A professional-chef based on Gemini
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}