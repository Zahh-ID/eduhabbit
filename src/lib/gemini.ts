import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
export const genAI = new GoogleGenerativeAI(apiKey);

export function getGeminiModel(modelName = "gemini-1.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}
