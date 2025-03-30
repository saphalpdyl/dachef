import { ParsedRecipe } from "@/app/types";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Theme } from "../theme";

import { Expand, CookingPot, Clock, EllipsisVertical } from "lucide-react-native";

export const RecipeCollaspable = ({
  recipe,
  disableCollapsable = false,
}: {
  recipe: ParsedRecipe;
  disableCollapsable?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!disableCollapsable);

  const changeCollapsable = (val: boolean) => {
    if (disableCollapsable) return;
    setIsCollapsed(val);
  }

  return (
    <View>
      <View
        style={{
          borderRadius: 10,
          backgroundColor: "#fafafa",
          padding: 10,
          gap: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 9 }}>
          <Text style={{ fontSize: 13, fontWeight: "bold" }}>{recipe.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 11, color: "gray" }}>{recipe.totalTime}</Text>
            <Text
              style={{
                fontSize: 11,
                color: "white",
                textTransform: "capitalize",
                backgroundColor:
                  recipe.type === "breakfast"
                    ? Theme.emerald
                    : recipe.type === "lunch"
                    ? Theme.primary
                    : "violet",
                paddingHorizontal: 5,
                borderRadius: 5,
              }}
            >
              {recipe.type}{" "}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }} onPress={() => changeCollapsable(!isCollapsed)}>
          <Expand size={20} color={"gray"} />
        </TouchableOpacity>
      </View>

      {!isCollapsed && (
        <View
          style={{
            backgroundColor: "#fcfcfc",
            borderRadius: 10,
          }}
        >
          {
            recipe.steps.map((step, index) => (
              <View key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  padding: 10,
                  paddingRight: 20,
                  gap: 10,
                }}
              >
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <CookingPot size={18} color="#545454" />
                  <Text style={{ fontSize: 13, fontWeight: "bold" }}>{step.description}</Text>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <EllipsisVertical size={18} color="gray" />
                  <Text style={{ fontStyle: "italic" , fontSize: 11, color: "#545454" }}>{step.ingredients.length > 0 ? "Ingredients: " : ""  }{step.ingredients.join(", ")}</Text>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Clock size={18} color="#545454" />
                  <Text style={{ fontSize: 12, color: "#545454" }}>{step.timeToComplete}</Text>
                </View>
              </View>
            ))
          }
        </View>
      )}
    </View>
  );
};
