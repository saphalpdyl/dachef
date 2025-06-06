import { useEffect, useState } from "react";
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
import { DetectionItem, useGemini } from "@/hooks/useGemini";
import { Theme } from "@/components/theme";
import { useFonts } from "expo-font";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionLabel from "@/components/ui/SectionLabel";
import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParsedRecipe } from "../types";
import { supabase } from "@/components/supabase";

import mock_knot_instacart from "../../assets/mock/knot_instacart_mock.json";

type RootStackParamList = {
  create_recipe: {};
  snap_view: {
    override_rawRecipeText: string;
    override_parsedRecipes: string;
    override_imageUri: string;
    override_items: string;
    override_selectedItems: string;
    override_searchQueries: string[];
    override_whereItSearched: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [ snaps, setSnaps ] = useState<{
    id: string;
    created_at: string;
    raw_recipe_content: string;
    parsed_recipes: ParsedRecipe[];
    image_url: string;
    items: DetectionItem[];
    selected_items: DetectionItem[];
    search_queries: string[];
    grounding_chunks: string[];
  }[]>([]);
  
  const navigation = useNavigation<NavigationProp>();
  
  useEffect(() => {
    getPreviousSnaps();
  }, []);

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

  async function getPreviousSnaps() {
    const { data, error } = await supabase.from("snap").select("*").limit(4);
    
    if (!data) return;

    // Get the recipe for each snap
    
    const newData = await Promise.all(data.map(async (snap) => {
      
      const { data: recipeData, error: recipeError } = await supabase.from("recipe").select("*").eq("parent_snap", snap.id as string);
      return {
        ...snap,
        selected_items: snap.selected_ingredients,
        parsed_recipes: recipeData?.map((recipe) => ({
          totalTime: recipe.totaltime,
          title: recipe.title,
          type: recipe.type,
          steps: recipe.steps,
        })) as ParsedRecipe[],
      };
    }));

    setSnaps(newData);
    console.log("NEW DATA", JSON.stringify(newData, null, 2));

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
                textAlign: "left",
                paddingTop: 40,
                fontFamily: "Jaro-Regular-Var",
              }}
            >
              DACHEF
            </Text>
            <Text
              style={{
                color: Theme.background,
                fontSize: 12,
                textAlign: "left",
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
            }}
            onPress={() => {
              // router.push("/camera");
              navigation.navigate({ name: "create_recipe", params: {} });
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
              Create a new snap
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
            Previous Snaps
          </SectionHeading>
          <SectionLabel>
            Recipes related to previous snaps
          </SectionLabel>
          {snaps.slice(0,4).map((snap) => (
            <TouchableOpacity key={snap.id} onPress={() => {
              // console.log({
              //   override_rawRecipeText: snap.raw_recipe_content,
              //   override_parsedRecipes: snap.parsed_recipes,
              //   override_imageUri: snap.image_url,
              //   override_items: snap.selected_items,
              //   override_selectedItems: [],
              //   override_searchQueries: snap.search_queries,
              //   override_whereItSearched: snap.grounding_chunks,
              // })
              navigation.navigate("snap_view", {
                override_rawRecipeText: snap.raw_recipe_content,
                override_parsedRecipes: JSON.stringify(snap.parsed_recipes),
                override_imageUri: `https://vsijqepwoadwisdtbktt.supabase.co/storage/v1/object/public/snapimages/${snap.image_url}`,
                override_items: JSON.stringify(snap.selected_items),
                override_selectedItems: JSON.stringify(snap.selected_items.map(i => ({
                  label: i,
                }))),
                override_searchQueries: snap.search_queries,
                override_whereItSearched: JSON.stringify(snap.grounding_chunks),
              });
            }}
            style={{
              backgroundColor: "#fafafa",
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
            }}
            >
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image
                  source={{ uri: `https://vsijqepwoadwisdtbktt.supabase.co/storage/v1/object/public/snapimages/${snap.image_url}` }}
                  style={{ width: 40, height: 40, borderRadius: 10 }}
                />
                <View style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>  
                    <Text style={{ fontFamily: "InriaSans-Regular", fontSize: 12, color: "#666", fontWeight: "bold" }}>
                      {snap.parsed_recipes.length} recipes | 
                    </Text>
                    <Text style={{ fontFamily: "InriaSans-Regular", fontSize: 12, color: "#666" }}>
                      {snap.selected_items.length > 3 
                        ? `${snap.selected_items.slice(0,3).join(", ")}...`
                        : snap.selected_items.join(", ")}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: "InriaSans-Regular", fontSize: 12, color: "#666" }}>
                    {new Date(snap.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
