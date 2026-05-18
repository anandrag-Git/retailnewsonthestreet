import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createGeminiProvider = (apiKey: string) =>
  createGoogleGenerativeAI({ apiKey });

export function getApiKey(): string {
  const key =
    (globalThis as any).GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  return key;
}
