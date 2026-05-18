import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createGeminiProvider = (apiKey: string) =>
  createGoogleGenerativeAI({ apiKey });
