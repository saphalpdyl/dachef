import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, Button, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { DetectionItem, useGemini } from "@/hooks/useGemini";
import { Theme } from "@/components/theme";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionLabel from "@/components/ui/SectionLabel";

// Display the selected image in a similar dotted bordered view
enum CreateRecipeLoadingState {
  WAITING_FOR_IMAGE = 0,
  WAITING_FOR_IMAGE_DETECT_CONFIRMATION = 1,
  DETECTING_ITEMS = 2,
  WAITING_FOR_SELECTION = 3,
  GENERATING_RECIPE = 4,
  DISPLAYING_RECIPE = 5,
}

import React from 'react';
import { StyleSheet } from 'react-native';
import MultiSelector from "@/components/ui/SelectItems";

const DownArrow = ({ size = 20, color = '#000', style = {} }) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View 
        style={[
          styles.arrow, 
          { 
            borderTopWidth: size / 2,
            borderRightWidth: size / 2,
            borderLeftWidth: size / 2,
            borderTopColor: color 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});

export default function CameraScreen() {
  const [error, setError] = useState<string | null>(null);
  const { detectItems } = useGemini(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [items, setItems] = useState<DetectionItem[] | null>(null);

  const [loadingState, setLoadingState] = useState<CreateRecipeLoadingState>(CreateRecipeLoadingState.WAITING_FOR_IMAGE);
  
  async function handleImageUpload() {
    if ( loadingState !== CreateRecipeLoadingState.WAITING_FOR_IMAGE ) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if ( !result.assets || result.assets.length === 0 || result.canceled ) return setError("No image selected");
    
    setImageUri(result.assets[0].uri);
    setLoadingState(CreateRecipeLoadingState.WAITING_FOR_IMAGE_DETECT_CONFIRMATION);
  }

  async function handleDetectItems() {
    if ( !imageUri ) return setError("No image selected");
    
    setLoadingState(CreateRecipeLoadingState.DETECTING_ITEMS);
    
    const items = await detectItems(imageUri);
    setItems(items);
    setLoadingState(CreateRecipeLoadingState.WAITING_FOR_SELECTION);
  }

  async function handleFindRecipe() {
    if ( !items ) return setError("No items selected");

    setLoadingState(CreateRecipeLoadingState.GENERATING_RECIPE);

    // const recipe = await findRecipe(items);
    // setRecipe(recipe);
    setLoadingState(CreateRecipeLoadingState.DISPLAYING_RECIPE);
  }
  
  useEffect(() => {
    setTimeout(handleImageUpload, 100);
  }, []);

  const renderContent: React.JSX.Element[]= []; 

  if ( loadingState >= CreateRecipeLoadingState.WAITING_FOR_IMAGE ) {
    renderContent.push(
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,

        }}  
      >
        <SectionHeading>
          Let's see the fridge
        </SectionHeading>
        <SectionLabel>
          Upload a clear picture of your fridge opened
        </SectionLabel>
          {
            imageUri !== null ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginTop: 10,
              borderWidth: 1,
              borderColor: "black", 
              borderRadius: 10,
              borderStyle: "dashed",
              overflow: "hidden",
              maxHeight: 150,
              backgroundColor: "red",
        }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover"
              }}
            />
          </View>
          ) : (
            <TouchableOpacity
                activeOpacity={0.6}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 20,
                  paddingTop: 30,
                  marginTop: 10,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "black",
                  borderRadius: 10,
                  borderStyle: "dashed",
                }}
                onPress={() => {
                  setImageUri(null);
                  setLoadingState(CreateRecipeLoadingState.WAITING_FOR_IMAGE);
                  handleImageUpload();
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
                  Waiting for image upload
                </Text>
              </TouchableOpacity>
          )

        }
        { imageUri && <TouchableOpacity
          onPress={() => {
            setImageUri(null);
            setLoadingState(CreateRecipeLoadingState.WAITING_FOR_IMAGE);
            handleImageUpload();
          }}
          style={{
            marginTop: 10,
            height: 40,
            alignSelf: "flex-end",
          }}
        >
          <Text style={{ color: Theme.primary, fontSize: 12, fontFamily: "InriaSans-Regular", textDecorationLine: "underline" }}>Replace image</Text>
        </TouchableOpacity>
        }
        <DownArrow size={30} color={"gray"} style={{ alignSelf: "center" }} />
      </View>
    );
  }

  if ( loadingState >= CreateRecipeLoadingState.WAITING_FOR_IMAGE_DETECT_CONFIRMATION ) {
    renderContent.push(
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}  
      >
        <SectionHeading>
          Confirm the image for processing
        </SectionHeading>
        <SectionLabel>
          You can change the image by pressing "Replace image"
        </SectionLabel>
        <View style={{
          marginTop: 20,
        }}></View>
          <Button 
            disabled={loadingState !== CreateRecipeLoadingState.WAITING_FOR_IMAGE_DETECT_CONFIRMATION}
            title="Confirm and continue"
            color={Theme.accent2}
          onPress={handleDetectItems}
        />
        <DownArrow size={30} color={"gray"} style={{ alignSelf: "center" }} />
      </View>
    )
  }

  if ( loadingState === CreateRecipeLoadingState.DETECTING_ITEMS ) {
    renderContent.push(
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}  
      >
        <SectionHeading>
          Procesing image
        </SectionHeading>
        <SectionLabel>
          We are detecting items in the image... It may take a few seconds.
        </SectionLabel>
      </View>
    )
  }

  if ( loadingState >= CreateRecipeLoadingState.WAITING_FOR_SELECTION ) {
    renderContent.push(
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
      >
        <SectionHeading>
          Detection results
        </SectionHeading>
        <SectionLabel>
          Select the items you want to include in the recipe
        </SectionLabel>

        {/* Generate a selectable list of items */}
        <MultiSelector 
          items={items!}
          onSelectConfirm={setSelectedItems}
          itemLabelKey="label"
          allowMultiple
          showSelectAll
          showRandomSelect
          randomCount={6}
          style={{}}

          disabled={loadingState !== CreateRecipeLoadingState.WAITING_FOR_SELECTION}
        />
      </View>
    )
  }
  return <View
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
              fontFamily: "Jaro-Regular-Var", // Try just "InriaSans"
            }}
          >
            Create Recipe
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
    </SafeAreaView>

    <ScrollView>
      {renderContent.map((content, index) => content)}
    </ScrollView>
  </View>

}
