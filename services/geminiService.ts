import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const API_KEY = process.env.API_KEY;

export const initializeGemini = () => {
  if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } else {
    console.warn("Gemini API Key is missing.");
  }
};

export const startChatSession = () => {
  if (!ai) initializeGemini();
  if (!ai) return null;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are NexusTrader AI, an elite financial analyst and trading assistant. 
      You speak concisely, professionally, and with authority. 
      You analyze market data provided in the context.
      If asked about specific assets, refer to technical patterns (RSI, MACD, Support/Resistance) and fundamental catalysts.
      Do not give financial advice as absolute fact; always use probabilistic language (e.g., "likely", "potential upside").
      Keep responses under 100 words unless asked for a deep dive.`,
    },
  });
  return chatSession;
};

export const sendChatMessage = async (message: string, contextData: string): Promise<string> => {
  if (!chatSession) {
    startChatSession();
  }

  if (!chatSession) {
    // Fallback if no API key
    return "I cannot connect to the market servers (API Key missing). Please check your configuration.";
  }

  try {
    const prompt = `Context Data: ${contextData}\n\nUser Question: ${message}`;
    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || "I'm analyzing the data but couldn't generate a text response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection interrupted. Retrying analysis...";
  }
};
