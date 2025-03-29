import { useState } from "react";
import {
  Button,
  Image,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useGemini } from "@/hooks/useGemini";
import { Theme } from "@/components/theme";
import { useFonts } from "expo-font";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionLabel from "@/components/ui/SectionLabel";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    InriaSans: require("../../assets/fonts/InriaSans-Bold.ttf"), // Adjust the path as needed
    "InriaSans-Italic": require("../../assets/fonts/InriaSans-Italic.ttf"),
    "InriaSans-Regular": require("../../assets/fonts/InriaSans-Regular.ttf"),
    "Jaro-Regular-Var": require("../../assets/fonts/Jaro-Regular-Var.ttf"),
    "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Or a loading indicator
  }

  return (
    <View
      style={{
        backgroundColor: "#fff",
        height: "100%",
      }}
    >
      <SafeAreaView>
        <View
          style={{
            backgroundColor: Theme.secondary,
            paddingLeft: 20,
            height: 110,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
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
                fontFamily: "InriaSans-Regular",
              }}
            >
              A professional-chef based on Gemini
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
          }}
        >
          <SectionHeading>See what you can cook today, John?</SectionHeading>
          <SectionLabel>
            Take a picture of your fridge, so we can take care of recipes
          </SectionLabel>
          {/* Surround by a dotted border */}
          <TouchableOpacity
            activeOpacity={0.6}
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              paddingTop: 40,
              marginTop: 10,
              padding: 40,
              borderWidth: 1,
              borderColor: "black",
              borderRadius: 10,
              borderStyle: "dashed",
              // on press, make the background color change to Theme.primary
            }}
          >
            <Image
              source={require("../../assets/images/ui/fridge_plus_everything.png")}
              style={{ width: 150, height: 100 }}
            />
            <Text
              style={{
                fontSize: 19,
                fontFamily: "InriaSans-Bold",
                textAlign: "center",
                color: Theme.primary,
              }}
            >
              Upload a picture
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
          }}
        >
          <SectionHeading>
            Previous Recipes
          </SectionHeading>
          <SectionLabel>
            Based on what you have had this week
          </SectionLabel>
        </View>
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
          }}
        >
          {/* Heading at left, and powered by label at right */}
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
            <SectionHeading>Grub & Dash at home</SectionHeading>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 3 }}>
              <Text style={{ fontFamily: "InriaSans-Bold", fontSize: 8, color: "#999" }}>Powered by</Text>
              <Image
                source={require("../../assets/images/ui/knot_logo.png")}
                style={{ width: 22, height: 8 }}
              />
            </View>
          </View>
          <SectionLabel>
            Cook cleaner and greener alternatives of your favorite dishes
          </SectionLabel>
        </View>
      </SafeAreaView>
    </View>
  );
}
