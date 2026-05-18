import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { generateTopics, type Topic } from "@/lib/topics.functions";
import { TopicCard, ExpandedCard } from "@/components/TopicCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Retail Intelligence · What to Vlog Next" },
      {
        name: "description",
        content:
          "Live trending Retail & Consumer vlog topics for Anand Raghuraman, Senior Managing Director at FTI Consulting.",
      },
    ],
  }),
});

function Index() {
  const fetchTopics = useServerFn(generateTopics);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { topics } = await fetchTopics();
      setTopics(topics);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error(e);
      setError("Couldn't load topics. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-5 py-10 sm:px-8 sm:py-14">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Anand Raghuraman · Retail Intelligence
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Retail News on the Street
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Six timely Retail &amp; Consumer angles, refreshed on demand and grounded in this week's news.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastRefreshed && !loading && (
              <span className="text-xs text-muted-foreground">
                Updated{" "}
                {lastRefreshed.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin-slow">⟳</span>
                  Scanning…
                </>
              ) : (
                "↻ Refresh Topics"
              )}
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && topics.length === 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-5 animate-pulse-soft">
              Scanning retail intelligence…
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-xl border bg-card animate-pulse-soft"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <TopicCard
                key={i}
                topic={topic}
                index={i}
                selected={selected === i}
                onClick={() => setSelected(selected === i ? null : i)}
              />
            ))}
          </div>
        )}

        {/* Expanded */}
        {selected !== null && topics[selected] && (
          <ExpandedCard topic={topics[selected]} onClose={() => setSelected(null)} />
        )}

        {/* Footer */}
        {topics.length > 0 && (
          <footer className="mt-12 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <span>{topics.length} topics · Powered by live web intelligence</span>
            <a
              href="mailto:anand.raghuraman@fticonsulting.com"
              className="hover:text-foreground transition-colors"
            >
              anand.raghuraman@fticonsulting.com
            </a>
          </footer>
        )}
      </div>
    </main>
  );
}
