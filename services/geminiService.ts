import { GoogleGenAI } from "@google/genai";
import { Reading } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCosmicReading = async (): Promise<Reading> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an ancient, mystical astrologer. 
      Generate a short, cryptic, but ultimately encouraging "cosmic reading" or horoscope for the current moment.
      The output should be JSON with two keys: "title" (a short mystical title, e.g., "The Whispering Comet") and "prophecy" (the reading, max 60 words).
      Do not use markdown blocks. Return only the JSON string.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as Reading;
  } catch (error) {
    console.error("Gemini connection failed", error);
    return {
      title: "The Silent Stars",
      prophecy: "The celestial interference is strong. The stars are shifting, please gaze into the void again later."
    };
  }
};