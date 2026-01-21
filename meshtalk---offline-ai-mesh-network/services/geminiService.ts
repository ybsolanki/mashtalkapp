
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIProcessedContent {
  translatedText: string;
  detectedLanguage: string;
  isEmergency: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export const processMessageAI = async (
  text: string, 
  targetLanguage: string
): Promise<AIProcessedContent> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this message for an offline mesh network: "${text}". 
      Translate it to language code: ${targetLanguage}. 
      Check if it indicates an emergency (injury, disaster, request for help, etc.).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            isEmergency: { type: Type.BOOLEAN },
            urgencyLevel: { 
              type: Type.STRING,
              description: "low, medium, or high"
            }
          },
          required: ["translatedText", "detectedLanguage", "isEmergency", "urgencyLevel"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      translatedText: result.translatedText || text,
      detectedLanguage: result.detectedLanguage || 'unknown',
      isEmergency: result.isEmergency || false,
      urgencyLevel: result.urgencyLevel || 'low'
    };
  } catch (error) {
    console.error("AI Processing Error:", error);
    return {
      translatedText: text,
      detectedLanguage: 'unknown',
      isEmergency: false,
      urgencyLevel: 'low'
    };
  }
};
