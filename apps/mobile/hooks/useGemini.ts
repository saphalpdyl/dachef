import { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

import { GoogleGenAI } from "@google/genai";

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
    }[]
  }>;
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
        model: "gemini-2.5-pro-exp-03-25",
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
    findRecipe
  };
};