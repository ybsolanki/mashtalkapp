
import { GoogleGenAI, Type } from "@google/genai";

export interface AIProcessedContent {
  translatedText: string;
  detectedLanguage: string;
  isEmergency: boolean;
  urgencyLevel: 'low' | 'medium' | 'high';
}

const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) return process.env.API_KEY;
      if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    }
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      if ((import.meta as any).env.VITE_GEMINI_API_KEY) return (import.meta as any).env.VITE_GEMINI_API_KEY;
    }
  } catch {
    // Fallback to empty string if access fails
  }
  return '';
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Offline emergency triage fallback engine for off-grid mesh operation
const performOfflineAIAnalysis = (text: string, targetLanguage: string): AIProcessedContent => {
  const lower = text.toLowerCase();
  const emergencyKeywords = [
    'sos', 'help', 'emergency', 'doctor', 'blood', 'bleed', 'hospital', 'injury',
    'flood', 'disaster', 'fire', 'trapped', 'rescue', 'danger', 'earthquake',
    'blast', 'pain', 'medical', 'urgent', 'dead', 'die', 'save'
  ];

  const highUrgencyKeywords = ['sos', 'dying', 'trapped', 'fire', 'flood', 'blast', 'severe'];

  const isEmergency = emergencyKeywords.some(keyword => lower.includes(keyword));
  const isHighUrgency = highUrgencyKeywords.some(keyword => lower.includes(keyword));

  const urgencyLevel: 'low' | 'medium' | 'high' = isHighUrgency
    ? 'high'
    : isEmergency
    ? 'medium'
    : 'low';

  return {
    translatedText: text,
    detectedLanguage: 'en',
    isEmergency,
    urgencyLevel
  };
};

export const processMessageAI = async (
  text: string, 
  targetLanguage: string
): Promise<AIProcessedContent> => {
  if (!ai) {
    console.warn("Gemini API key missing. Operating in 100% Offline AI Rule Engine mode.");
    return performOfflineAIAnalysis(text, targetLanguage);
  }

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
      isEmergency: result.isEmergency ?? false,
      urgencyLevel: (result.urgencyLevel as 'low' | 'medium' | 'high') || 'low'
    };
  } catch (error) {
    console.error("AI Processing API Error, falling back to Offline AI Engine:", error);
    return performOfflineAIAnalysis(text, targetLanguage);
  }
};

