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
  const apiKey = process.env['GOOGLE_GENERATIVE_AI_API_KEY'];
  if (!apiKey) throw new Error(
