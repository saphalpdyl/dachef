// npm install dotenv node-fetch fs

import 'dotenv/config';
import fetch from 'node-fetch';
import fs from 'fs';

async function testImagenAPI() {
  try {
    const dishName = "Spaghetti Carbonara";
    const prompt = "A delicious plate of pasta with creamy sauce, bacon bits, and parmesan cheese. Top view, professional food photography, on a rustic wooden table.";
    
    console.log("Generating image with Imagen API...");
    const base64Image = await generateImageWithImagen(dishName, prompt);
    
    // Save the image locally to verify it worked
    fs.writeFileSync('test-image.png', Buffer.from(base64Image, 'base64'));
    console.log("Image saved as test-image.png");
  } catch (error) {
    console.error("Error testing Imagen API:", error);
  }
}

async function generateImageWithImagen(dishName, prompt) {
  // Imagen API endpoint
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';
  
  // Combine dish name and prompt for better results
  const fullPrompt = `Extremely minimalistic photograph of ${dishName}. ${prompt}`;
  
  console.log(`Using prompt: ${fullPrompt}`);
  
  const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instances: [
        {
          prompt: fullPrompt,
        }
      ],
      parameters: {
        sampleCount: 4,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Image generation failed: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  console.log("Response received from Imagen API");
  
  // Extract the base64 image data from the Imagen response
  const base64ImageData = data.predictions[0].bytesBase64Encoded;
  
  // Save locally
  const fileName = `${Date.now()}.png`;
  fs.writeFileSync(fileName, Buffer.from(base64ImageData, 'base64'));
  console.log(`Image saved locally as ${fileName}`);

  // Upload to storage bucket
  const { data: uploadData, error } = await supabase.storage
    .from("generatedimages")
    .upload(`public/${fileName}`, decode(base64ImageData), {
      contentType: "image/png",
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  console.log(`Image uploaded to bucket at: ${uploadData.path}`);
  return {
    base64: base64ImageData,
    path: uploadData.path
  };
}

// Run the test
testImagenAPI();