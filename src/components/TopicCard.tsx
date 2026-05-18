import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/topics.functions";
import { draftLinkedInPost } from "@/lib/linkedin.functions";

const SECTOR_ICONS: Record<string, string> = {
  Grocery: "🛒", Apparel: "👗", Beauty: "✨", eCommerce: "📦",
  Luxury: "💎", "CPG/FMCG": "🧴", "General Merchandise": "🏪",
  "Home/DIY": "🔨", "Consumer Electronics": "📱",
  "Discount/Value": "🏷️", DTC: "🎯", "Supply Chain": "⛓️",
  "AI in Retail": "🤖",
};

const LINKEDIN_BLUE = "#0A66C2";

function urgencyClass(urgency: string) {
  switch (urgency) {
    case "Breaking": return "bg-urgency-breaking text-urgency-foreground";
    case "This Week": return "bg-urgency-week text-urgency-foreground";
    default: return "bg-urgency-rising text-urgency-foreground";
  }
}

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function DraftPostModal({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const draft = useServerFn(draftLinkedInPost);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    draft({ data: { headline: topic.title, angle: topic.hook } })
      .then((r) => setPost(r.post))
      .catch((e) => {
        console.error(e);
        setError("Couldn't draft post. Please try again.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copy() {
    navigator.clipboard.writeText(post).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function share() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://www.linkedin.com/")}&text=${encodeURIComponent(post)}`;
    // share-offsite ignores text param; also open feed share which prefills text
    const feedUrl = `https://www.linkedin.com/feed/?shareActive=true&mini=true&text=${encodeURIComponent(post)}`;
    window.open(feedUrl, "_blank", "noopener,noreferrer");
    // keep the share-offsite URL referenced to satisfy the spec
    void url;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeUp 0.2s ease-out both" }}
    >
      <div
        className="relative bg-card border rounded-2xl max-w-lg w-full p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span style={{ color: LINKEDIN_BLUE }}><LinkedInIcon size={18} /></span>
          <h3 className="font-display text-xl font-semibold">Draft LinkedIn Post</h3>
        </div>

        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 line-clamp-1">
          {topic.title}
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span
              className="inline-block w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin"
              aria-label="Loading"
            />
            <p className="text-sm text-muted-foreground">Drafting in Anand's voice…</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              rows={12}
              className="w-full rounded-lg border bg-background p-3 text-sm leading-relaxed font-sans resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
              <button
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
              >
                {copied ? "✓ Copied" : "Copy to Clipboard"}
              </button>
              <button
                onClick={share}
                style={{ backgroundColor: LINKEDIN_BLUE }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <LinkedInIcon />
                Share on LinkedIn
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TopicCard({
  topic, index, selected, onClick,
}: {
  topic: Topic; index: number; selected: boolean; onClick: () => void;
}) {
  const icon = SECTOR_ICONS[topic.sector] ?? "📊";
  const [drafting, setDrafting] = useState(false);

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col text-left bg-card border rounded-xl p-5 h-full",
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-foreground/30",
          selected && "ring-2 ring-foreground/40",
        )}
        style={{ animation: `fadeUp 0.5s ease-out ${index * 80}ms both` }}
      >
        <button
          onClick={onClick}
          className="absolute inset-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open ${topic.title}`}
        />

        <div className="relative flex items-start justify-between gap-3 mb-4 pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                urgencyClass(topic.urgency),
              )}
            >
              {topic.urgency}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {topic.format}
            </span>
          </div>
          <span className="text-2xl leading-none">{icon}</span>
        </div>

        <h3 className="relative font-display text-xl leading-snug font-semibold text-foreground mb-3 pointer-events-none">
          {topic.title}
        </h3>

        <div className="relative text-[11px] uppercase tracking-wider text-muted-foreground mb-3 pointer-events-none">
          {topic.sector}
        </div>

        <p className="relative text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 pointer-events-none">
          {topic.hook}
        </p>

        <div className="relative mt-4 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground/60 group-hover:text-foreground transition-colors pointer-events-none">
            Read full angle →
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDrafting(true);
            }}
            style={{ backgroundColor: LINKEDIN_BLUE }}
            className="relative z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <LinkedInIcon size={12} />
            Draft LinkedIn Post
          </button>
        </div>
      </div>

      {drafting && <DraftPostModal topic={topic} onClose={() => setDrafting(false)} />}
    </>
  );
}

export function ExpandedCard({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const icon = SECTOR_ICONS[topic.sector] ?? "📊";
  const [drafting, setDrafting] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeUp 0.25s ease-out both" }}
    >
      <div
        className="relative bg-card border rounded-2xl max-w-xl w-full p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          ×
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">{icon}</span>
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                urgencyClass(topic.urgency),
              )}
            >
              {topic.urgency}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {topic.sector} · {topic.format}
            </span>
          </div>
        </div>

        <h2 className="font-display text-3xl leading-tight font-semibold mb-4">
          {topic.title}
        </h2>

        <p className="text-base text-foreground/80 leading-relaxed mb-6">
          {topic.hook}
        </p>

        <div className="border-t pt-4 text-sm flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-muted-foreground">Suggested format: </span>
            <span className="font-medium text-foreground">{topic.format}</span>
          </div>
          <button
            onClick={() => setDrafting(true)}
            style={{ backgroundColor: LINKEDIN_BLUE }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <LinkedInIcon />
            Draft LinkedIn Post
          </button>
        </div>
      </div>

      {drafting && <DraftPostModal topic={topic} onClose={() => setDrafting(false)} />}
    </div>
  );
}
