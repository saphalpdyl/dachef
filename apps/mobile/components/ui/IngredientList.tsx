import { View, Text } from "react-native";
import { Theme } from "../theme";
import { useEffect, useState } from "react";
import { useGemini } from "@/hooks/useGemini";

export default function IngredientList({
  ingredients,
}: {
  ingredients: string[];
}) {
  const [emissionData, setEmissionData] = useState<{
    ingredient: string;
    emissionData: number;
    level: "low" | "medium" | "high";
  }[]>([]);

  const {
    getEmissionDataFromCSVAndList,
  } = useGemini(process.env.EXPO_PUBLIC_GEMINI_API_KEY || "");

  async function getEmissionData() {
    const response = await fetch("https://pastebin.com/raw/jJm3C47S");
    const data = await response.text();

    const emissionData = await getEmissionDataFromCSVAndList(ingredients, data);
    setEmissionData(emissionData);
  }
  
  useEffect(() => {
    getEmissionData();
  }, []);
  
  return (
    <View>
      {ingredients.map((item, index) => (
        <View
          key={item}
          style={{
          backgroundColor: index % 2 === 1 ? "#f5f5f5" : "transparent",
          padding: 4,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: "InriaSans-Regular",
              fontSize: 12,
              color: Theme.accent,
            }}
        >
          {item}
        </Text>
        {
          emissionData.length === ingredients.length && (
            <Text
              style={{
                fontFamily: "InriaSans-Regular",
                fontSize: 12,
                color: emissionData[index].level === "low" ? "green" : emissionData[index].level === "medium" ? "orange" : "red"  ,
              }}
            >
              { emissionData[index].emissionData } 
              <Text style={{ color: "black" }}>
                &nbsp;CO2e/kg
              </Text>
            </Text>
          )
        }
      </View>
    ))}
    </View>
  );
}
