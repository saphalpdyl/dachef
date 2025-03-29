import { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';

// Define types for the detection results
interface DetectionItem {
  label: string;
  [key: string]: any; // For any additional properties Gemini might return
}

// Hook return type
interface UseGeminiReturn {
  detectItems: (imageUri: string) => Promise<DetectionItem[]>;
  isLoading: boolean;
  error: string | null;
  findRecipe: (items: DetectionItem[]) => Promise<string>;
}

export const useGemini = (apiKey: string): UseGeminiReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the Generative AI client
  const genAI = new GoogleGenerativeAI(apiKey);
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
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const findRecipe = async (items: DetectionItem[]): Promise<string> => {
    try {
      // Extract item labels to use as ingredients
      const ingredients = items.map(item => item.label);
      
      if (ingredients.length === 0) {
        return "No ingredients detected. Please try again with a clearer image.";
      }
      
      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Get the model with web search capability
      // Note: You need to use a model that supports web search
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        systemInstruction: "You are a helpful culinary assistant that finds recipes based on available ingredients.",
        tools: [{ name: "web_search" }]
      });
      
      // Create a prompt for Gemini to search for recipes
      const prompt = `
      I have the following ingredients in my fridge/kitchen: ${ingredients.join(', ')}.
      
      Search the web and find me a suitable recipe that uses most of these ingredients. 
      Format your response as follows:
      
      1. Recipe name (with a link to the source)
      2. Ingredients I already have from my list
      3. Additional ingredients I'll need to buy
      4. Brief cooking instructions
      5. Estimated cooking time
      6. Number of servings
      
      Do not make up a recipe - only use recipes you can find from real websites. 
      Prefer recipes that use as many of my ingredients as possible.
      `;
      
      // Generate content with web search enabled
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
        },
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      const response = result.response;
      let recipeText = response.text();
      
      // Format recipe response
      if (recipeText.trim().length === 0) {
        return createFallbackRecipeSuggestion(ingredients);
      }
      
      // Add header with ingredient list as context
      return `# Recipe Based on Your Ingredients
      
      Available ingredients: ${ingredients.join(', ')}
      
      ${recipeText}
      `;
          
        } catch (error) {
          console.error('Error searching for recipes:', error);
          return createFallbackRecipeSuggestion(items.map(item => item.label));
        }
      };
      
      /**
       * Creates a fallback recipe suggestion if the API call fails
       */
      const createFallbackRecipeSuggestion = (ingredients: string[]): string => {
        if (ingredients.length === 0) {
          return "No ingredients detected. Please try again with a clearer image.";
        }
        
        // Generate a Google search URL with the ingredients
        const searchQuery = encodeURIComponent(`recipe with ${ingredients.join(' ')}`);
        const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
        
        // Create a simple recommendation based on available ingredients
        return `
      # Quick Recipe Suggestion
      
      I noticed you have the following ingredients:
      ${ingredients.map(ing => `- ${ing}`).join('\n')}
      
      I couldn't connect to search for recipes at the moment. Try:
      
      1. [Search Google for recipes](${googleSearchUrl})
      2. Try popular recipe websites:
        - Allrecipes
        - BBC Good Food
        - Epicurious
        - Food Network
      
      3. Or use ingredient-based search tools:
        - SuperCook
        - MyFridgeFood
      `;
  };
  
  
  return {
    detectItems,
    isLoading,
    error,
    findRecipe
  };
};