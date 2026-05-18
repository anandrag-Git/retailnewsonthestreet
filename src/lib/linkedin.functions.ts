import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiProvider } from "./ai-gateway";
import { createGeminiProvider, getApiKey } from "./ai-gateway";

const SYSTEM_PROMPT = `You are writing on behalf of Anand Raghuraman — Senior Managing Director at FTI Consulting, EMEA Corporate Finance & Restructuring, with 25+ years in Retail & Consumer. Former Partner at BCG, Roland Berger and EY; ex-SVP Strategy at Ross Stores. He vlogs on retail and consumer industry trends for a senior executive and investor audience. Write a LinkedIn post in his voice: authoritative but accessible, sharp observations, no fluff, occasional rhetorical questions to provoke thinking, ends with a clear point of view or call to action. Never use hashtag spam — maximum 3 relevant hashtags at the end.`;

const inputSchema = z.object({
  headline: z.string().min(1).max(500),
  angle: z.string().min(1).max(2000),
});

export const draftLinkedInPost = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = getApiKey();

    const gemini = createGeminiProvider(apiKey);

    const { text } = await generateText({
      model: gemini("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Write a 150-word LinkedIn post about this vlog topic — Headline: ${data.headline}. Angle: ${data.angle}. Make it feel like a teaser that makes people want to watch the vlog.`,
    });

    return { post: text.trim() };
  });
