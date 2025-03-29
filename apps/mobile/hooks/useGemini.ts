import { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

import { GoogleGenAI } from "@google/genai";
import { ParsedRecipe } from '@/app/types';

// Define types for the detection results
export interface DetectionItem {
  label: string;
  [key: string]: any; // For any additional properties Gemini might return
}

// Hook return type
interface UseGeminiReturn {
  detectItems: (imageUri: string) => Promise<DetectionItem[]>;
  isLoading: boolean;
  error: string | null;
  findRecipe: (items: DetectionItem[]) => Promise<{
    searchQueries: string[],
    whereItSearched: {
      "web": {
        title: string,
        uri: string,
      }
    }[],
    response: string,
  }>;
  parseRecipe: (rawResponse: string) => Promise<ParsedRecipe[]>;
}

export const useGemini = (apiKey: string): UseGeminiReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the Generative AI client
  const genAI = new GoogleGenerativeAI(apiKey);
  const newGenAI = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-2.5-pro-exp-03-25';

  /**
   * Helper function to convert image URI to base64
   */
  const getImageBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (err) {
      throw new Error(`Failed to convert image to base64: ${err}`);
    }
  };
  
  /**
   * Helper function to parse JSON from response text
   */
  const parseJson = (jsonOutput: string): string => {
    // Parsing out the markdown fencing
    const lines = jsonOutput.split('\n');
    let jsonContent = jsonOutput;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '```json') {
        // Remove everything before "```json"
        const remainingLines = lines.slice(i + 1).join('\n');
        // Remove everything after the closing "```"
        jsonContent = remainingLines.split('```')[0]; 
        break;
      }
    }
    
    return jsonContent.trim();
  };

  const detectItems = async (imageUri: string): Promise<DetectionItem[]> => {
    return [{"label": "Doughnut"}, {"label": "Yogurt"}, {"label": "Pickles"}, {"label": "Green apple"}, {"label": "Containerized food"}, {"label": "Red apple"}, {"label": "Lemon"}, {"label": "Egg"}, {"label": "Avocado"}, {"label": "Pickled vegetables"}, {"label": "Jam/Preserves"}, {"label": "Celery"}, {"label": "Fresh herbs"}, {"label": "Honey"}, {"label": "Juice"}, {"label": "Milk"}, {"label": "Carrot"}, {"label": "Sausage"}, {"label": "Orange"}, {"label": "Green bell pepper"}, {"label": "Yellow bell pepper"}, {"label": "Tomato"}, {"label": "Butter"}];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the model
      const model = genAI.getGenerativeModel({
        model: modelName,
      });
      
      // Define system instructions
      const bounding_box_system_instructions = 
        "Return a JSON array with labels. Never return masks or code fencing. Limit to 100 objects. " +
        "If an object is present multiple times, ignore them. Look for unique items in the space.";
      
      // Define safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ];

      // Convert image to base64
      const base64Image = await getImageBase64(imageUri);
      
      // Create image part
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      };
      
      // Define prompt
      const prompt = "Detect food items in a fridge or kitchen environment (with \"label\" as specific item name\"). Do not repeat the same item. Look all over the image. Name them in a way that is generally written in recipies";
      
      // Generate content
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
        generationConfig: {
          temperature: 0,
        },
        safetySettings,
        systemInstruction: bounding_box_system_instructions,
      });
      
      const response = result.response;
      const responseText = response.text();

      
      // Parse the JSON
      const jsonString = parseJson(responseText);
      const items: DetectionItem[] = JSON.parse(jsonString);

      return items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error detecting items:', errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const parseRecipe = async (rawResponse: string) : Promise<ParsedRecipe[]> => {
    const response = await newGenAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "model",
          parts: [{ text: `Stritcly follow this format and create all recipes with steps from the given data from a better model.
\`\`\`json
{
    type: "breakfast" | "lunch" | "dinner",
    title: string,
    steps: {
      description: string,
      timeToComplete: string,
      ingredients: string[],
    }
  }
\`\`\`"`}]
        },
        {
          role: "user",
          parts: [{ text: rawResponse }]
        }
      ],
      config: {
        temperature: 0.1,
      }
    });
    
    console.log("RES: ", response.text);
    return JSON.parse(parseJson(response.text ?? ""));
  }
  
  const findRecipe = async (items: DetectionItem[]): Promise<{
    searchQueries: string[],
    whereItSearched: {
      "web": {
        title: string,
        uri: string,
      }
    }[],
    response: string,
  }> => {
    return {
      searchQueries: ["What are some easy recipes using bananas?", "banana recipes"],
      whereItSearched: [{"web": {"title": "vegrecipesofindia.com", "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AQXblrwIE72CZEJtTFrIBRdyq5ZHu0iBob3bG4Ebh18xaOz8ttsLuqrOikgSAmbRCh9Ala52gqpwjib15lZCb-8T4-eU0WoolmuvbkNZVLoZIi7gQBJlW2NplIPwyJiu9GJyig22oaddYgo7"}}, {"web": {"title": "bbcgoodfood.com", "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AQXblrzJRz6FbBVF8nKmqVgyUC_vRbV6Y6eBLm8ib3HS2BC6YJ9Od4aGHizivRsn-yId7fqaTqNIVVXV5pVBkH8WfviGvSJOYP5H5Z2Dn6oix6tDJcHh7aIFJSm9fM4YgEldoUVZus5ZtSeiMigvE5TjDSUpHEvuZ1BLsohymg=="}}],
      response: `
      Okay, based on the ingredients you have, here are several recipe ideas ranging from breakfast to dinner:

**Breakfast & Brunch Ideas:**

1.  **Sausage & Egg Scramble/Bake:**
    *   Cook sausage (broken up or sliced) with diced bell peppers (green and yellow) and tomato.
    *   Whisk eggs with milk, salt, pepper, and perhaps some chopped fresh herbs.
    *   Combine the sausage/veggie mix with the eggs. You can either scramble this in a pan or pour it into a baking dish and bake until set (like an egg bake/frittata).
    *   Serve topped with diced avocado and maybe a squeeze of lemon. You have butter for cooking or toasting bread on the side. (Sources 1, 4, 5, 12, 13, 16, 27)   

2.  **Avocado Toast Variations:**
    *   Toast bread (if you have it, otherwise the doughnut could be a *very* adventurous base!).
    *   Mash avocado with lemon juice, salt, and pepper. Spread on the toast/base.
    *   Top with a fried or scrambled egg.
    *   Add sliced tomato. (Sources 6, 8, 9, 10, 11, 19, 23, 25, 28, 29)
    *   Other potential toppings you have: crumbled cooked sausage, pickled vegetables, fresh herbs. (Sources 8, 10, 28)

3.  **Yogurt Parfait:**
    *   Layer yogurt in a glass or bowl.
    *   Add chopped apples (red and green) and orange segments.
    *   Drizzle with honey and/or add a spoonful of jam/preserves.
    *   If you have granola or nuts, those would be great additions for crunch. (Sources 17, 18, 21, 24, 26, 33, 34)
    *   You could mix some orange juice or lemon juice/zest into the yogurt for extra flavor. (Sources 18, 24, 26, 32)
    *   A touch of shredded carrot could even be mixed into the yogurt or used as a layer. (Source 30)

**Lunch/Dinner Ideas:**

4.  **Sausage and Vegetable Stew/Sauté:**
    *   Sauté sausage (sliced) with carrots, celery, bell peppers, and tomato in butter or oil.
    *   You could add some juice or milk to create a bit of sauce, seasoned with fresh herbs, salt, and pepper. (Sources 2, 3, 7, 14, 15, 35, 37)
    *   Consider adding diced apple towards the end for a touch of sweetness, or incorporate pickles/pickled vegetables for tanginess.

5.  **Breakfast Salad:**
    *   Combine cooked sausage (maybe rolled into small meatballs and baked), hard-boiled eggs (chopped), tomatoes, and diced avocado.
    *   Make a simple dressing with lemon juice and optionally some mashed avocado/egg yolk. Season with salt, pepper, and fresh herbs. (Source 1)

6.  **Sausage & Pepper Rice/Grain Bowl (if you have rice/grains):**
    *   Sauté sausage, bell peppers, and tomato.
    *   Serve over cooked rice or another grain. Top with avocado and fresh herbs. (Sources 35, 22) You could make a simple dressing using lemon juice, honey, and herbs. (Source 22)

**Notes:**

*   **Doughnut:** This is the trickiest ingredient. While not conventional, you could potentially use slices of a plain doughnut as a base for avocado toast (sweet & savory!) or even crumble it over a yogurt parfait like granola.
*   **Pickles/Pickled Vegetables:** These could be chopped and added to the sausage sauté for acidity, mixed into the breakfast salad, or used as a topping for avocado toast. (Sources 8, 10)
*   **Containerized Food:** This is too vague to incorporate specifically, but if it's something like leftover rice, cooked beans, or grains, it could be added to the sausage sauté or bowls.
*   **Fresh Herbs:** Use generously in the savory dishes like scrambles, stews, salads, and avocado toast. (Sources 1, 6, 8, 23, 28)
*   **Butter/Milk/Juice:** Use for cooking (butter), adding creaminess to eggs or sauce (milk), or as part of dressings/marinades (juice, especially lemon/orange).  

Which of these ideas sounds most appealing to you? Knowing your preference might help narrow down a specific recipe!

      `,
    }
    
    try {
      // Extract item labels to use as ingredients
      const ingredients = items.map(item => item.label);
      
      if (ingredients.length === 0) {
        return {
          searchQueries: [],
          whereItSearched: [],
          response: "",
        };
      }
      
      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the model with web search capability
      // Note: You need to use a model that supports web search
      const response = await newGenAI.models.generateContent({
        // model: "gemini-2.5-pro-exp-03-25",
        model: "gemini-2.0-flash",
        // systemInstruction: "You are a helpful culinary assistant that finds recipes based on available ingredients.",
        contents: [
          {
            role: 'model',
            parts: [{ text: "You are a helpful culinary assistant that finds recipes based on available ingredients." }]
          },
          {
            role: 'user',
            parts: [{ text: `I have the following ingredients in my fridge/kitchen: ${ingredients.join(', ')}.` }]
          }
        ],
        config: {
          tools: [{googleSearch: {

          }}],
        },
      });

      const searchQueries = response.candidates![0].groundingMetadata!.webSearchQueries;
      const whereItSearched = response.candidates![0].groundingMetadata!.groundingChunks;
      return {
        searchQueries: searchQueries ?? [],
        whereItSearched: whereItSearched as any ?? [],
        response: response.text ?? "",
      };
    } catch (error) {
      console.error('Error searching for recipes:', error);
      return {
        searchQueries: [],
        whereItSearched: [],
        response: "",
      };
    }
  };
  
  
  return {
    detectItems,
    isLoading,
    error,
    findRecipe,
    parseRecipe,
  };
};