## Retail Vlog Dashboard for Anand Raghuraman

Build a single-page dashboard that surfaces 6 trending Retail & Consumer vlog topics, refreshed on demand, with expandable cards.

### Key change from your snippet
Your code calls `api.anthropic.com` directly from the browser. That can't ship — it would expose an API key and hit CORS. I'll route the AI call through a TanStack server function using **Lovable AI Gateway** (no key setup needed, `LOVABLE_API_KEY` is auto-provisioned).

Default model: `google/gemini-3-flash-preview` with **web search grounding** so topics reflect the last 7 days of real news. (If you'd rather use a specific model like GPT-5, say the word.)

### Pages / files
- `src/routes/index.tsx` — the dashboard UI (replaces placeholder)
- `src/lib/topics.functions.ts` — `generateTopics` server function (calls Lovable AI Gateway, returns parsed JSON array)
- `src/components/TopicCard.tsx` + `src/components/ExpandedCard.tsx` — split out the two presentational components
- `src/styles.css` — add design tokens for urgency colors + sector accent, keyframes (`pulse`, `spin`, `bounce`, `fadeUp`)

### UX behavior (from your code, preserved)
- Auto-fetch on mount; manual "Refresh Topics" button
- Loading state with skeleton cards + spinner
- Error banner with retry
- Grid of 6 cards, each showing urgency badge, format pill, sector icon, title, hook preview
- Click a card → expanded detail overlay with close button
- Footer with topic count + contact email
- "Updated HH:MM" timestamp

### Design system
Use semantic tokens (no hardcoded hex in JSX). Add to `src/styles.css`:
- `--urgency-breaking`, `--urgency-week`, `--urgency-rising` (oklch)
- `--sector-accent`, refined `--card`, `--muted` for the executive/editorial look
- Typography: tight, editorial — large title, small uppercase metadata
- Light theme by default, polished and "Bloomberg-like"

### Server function shape
```ts
export const generateTopics = createServerFn({ method: "POST" })
  .handler(async () => {
    const gateway = createLovableAiGatewayProvider(process.env.LOVABLE_API_KEY!);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      prompt: `Today is ${...}. Search latest retail news...`,
      output: Output.array({ schema: topicSchema }), // structured output, no regex JSON cleanup
    });
    return output;
  });
```
Structured output via the AI SDK `Output` API removes the fragile ```json``` stripping in your draft.

### Out of scope (ask if you want any)
- Persisting topic history to a database
- Auth / per-user dashboards
- Scheduled auto-refresh / email digest
- Exporting topics to a doc or LinkedIn post draft

Reply "go" to implement, or tell me what to change.
