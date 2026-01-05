import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

// Helper to get AI instance. Note: We create a new instance per call
// to ensure we pick up the latest selected API Key if the user changes it.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

interface SceneConcept {
  description: string;
  palette: string[];
}

/**
 * Generates 5 distinct scene descriptions and color palettes based on the theme.
 * Uses a faster text model for this planning step.
 */
export const generateScenes = async (theme: string): Promise<SceneConcept[]> => {
  const ai = getAI();
  const systemInstruction = "You are a creative director for a children's coloring book. Create fun, age-appropriate, and distinct scene concepts with matching color palettes.";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 distinct, simple, and fun scene descriptions for a coloring book with the theme: "${theme}". 
    For each scene, also suggest a complementary color palette of 5 hex codes (e.g., "#FF5733") that would look good when colored.
    Return ONLY a JSON array of objects.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            palette: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse scenes:", e);
    // Fallback if JSON parsing fails
    return Array(5).fill(null).map((_, i) => ({
      description: `${theme} scene ${i + 1}`,
      palette: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"]
    }));
  }
};

/**
 * Generates a single coloring book image using the high-quality Nano Banana Pro model.
 */
export const generateColoringPage = async (sceneDescription: string, size: ImageSize): Promise<string> => {
  const ai = getAI();
  const prompt = `A clean, black and white children's coloring book page. Thick bold lines, white background, no shading, no grayscale, high contrast. Subject: ${sceneDescription}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4", // Portrait mainly for coloring books
        imageSize: size,
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data returned from API");
};

/**
 * Chat with Gemini to ask questions.
 */
export const sendChatMessage = async (message: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful assistant for the ColorCraft app. You help parents and kids with ideas for coloring, themes, or general questions.",
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I couldn't generate a response.";
};
