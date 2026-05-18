import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider } from "./ai-gateway";

const SYSTEM_PROMPT = `You are a senior retail & consumer industry analyst and content strategist. Your job is to surface the most compelling, timely vlog topics for Anand Raghuraman — a Senior Managing Director at FTI Consulting with 25 years in Retail & Consumer, based in Amsterdam. He vlogs for a general business audience on platforms like LinkedIn.

Generate exactly 6 trending retail & consumer vlog topics. For each topic provide:
- title: A punchy, specific vlog title (max 10 words)
- sector: One of: Grocery, Apparel, Beauty, eCommerce, Luxury, CPG/FMCG, General Merchandise, Home/DIY, Consumer Electronics, Discount/Value, DTC, Supply Chain, AI in Retail
- hook: A 2-sentence hook explaining WHY this is hot RIGHT NOW and what angle makes it compelling
- urgency: "Breaking" | "This Week" | "Rising"
- format: e.g. "Hot Take", "Deep Dive", "Data Story", "Interview Angle", "Trend Explainer"

Make topics genuinely current, specific, and opinionated — not generic. Mix sectors and formats. Prioritize topics where Anand's practitioner expertise (turnarounds, M&A, DTC, cost reduction, AI in retail) adds distinctive value.`;

const SECTORS = [
  "Grocery", "Apparel", "Beauty", "eCommerce", "Luxury", "CPG/FMCG",
  "General Merchandise", "Home/DIY", "Consumer Electronics",
  "Discount/Value", "DTC", "Supply Chain", "AI in Retail",
] as const;

const topicSchema = z.object({
  title: z.string(),
  sector: z.string(),
  hook: z.string(),
  urgency: z.string(),
  format: z.string(),
});

export type Topic = z.infer<typeof topicSchema>;

const VALID_URGENCY = ["Breaking", "This Week", "Rising"] as const;

function normalizeTopic(t: Topic): Topic {
  const sector = SECTORS.find((s) => s.toLowerCase() === t.sector.toLowerCase()) ?? t.sector;
  const urgency =
    VALID_URGENCY.find((u) => u.toLowerCase() === t.urgency.toLowerCase()) ?? "Rising";
  return { ...t, sector, urgency };
}

export const generateTopics = createServerFn({ method: "POST" }).handler(async () => {
  const apiKey = process.env["GOOGLE_GENERATIVE_AI_API_KEY"];
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");

  const gemini = createGeminiProvider(apiKey);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  let text = "";
  try {
    const result = await generateText({
      model: gemini("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Today is ${today}. Based on the latest retail and consumer industry developments, generate 6 highly relevant vlog topics that reflect what's actually happening right now.\n\nRespond ONLY with a valid JSON array of 6 objects, no markdown fences, no preamble. Example:\n[{"title":"...","sector":"Grocery","hook":"...","urgency":"Breaking","format":"Hot Take"}]`,
    });
    text = result.text;
  } catch (err) {
    console.error("[generateTopics] AI call failed:", err);
    throw new Error("AI request failed. Please try again.");
  }

  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) {
    console.error("[generateTopics] No JSON array in response:", text);
    throw new Error("Model did not return a JSON array");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.error("[generateTopics] JSON parse failed. Raw:", text);
    throw new Error("Could not parse model output as JSON");
  }

  const result = z.array(topicSchema).safeParse(parsed);
  if (!result.success) {
    console.error("[generateTopics] Schema validation failed:", result.error.issues, "Raw:", parsed);
    throw new Error("Model output didn't match expected shape");
  }

  const topics = result.data.slice(0, 6).map(normalizeTopic);
  return { topics, generatedAt: new Date().toISOString() };
});
