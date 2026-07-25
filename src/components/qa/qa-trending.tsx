"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Tag, HelpCircle, CheckCircle } from "lucide-react";
import type { Question } from "@/types/qa.types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TopContributor {
  rank: number;
  name: string;
  image?: string | null;
  questionCount: number;
}

interface QATrendingProps {
  trendingQuestions: Question[];
  popularTags: { id: string; name: string; slug: string }[];
  contributors: TopContributor[];
}

/**
 * Right sidebar for the Q&A page.
 * Shows an Ask-a-Question call-to-action, top questions of the week,
 * popular tag chips, and a "How It Works" explainer.
 */
export function QATrending({
  trendingQuestions,
  popularTags,
  contributors,
}: QATrendingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTags = (searchParams.get("tag") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  function toggleTag(slug: string) {
    const next = selectedTags.includes(slug)
      ? selectedTags.filter((s) => s !== slug)
      : [...selectedTags, slug];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set("tag", next.join(","));
    else params.delete("tag");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      {/* ── Ask a Question CTA ───────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-semibold text-foreground">Ask a Question</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Have a question? Get help from the NUB community.
          </p>
          <Link
            href="/qa/ask"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand/90"
          >
            Ask Question
          </Link>
        </CardContent>
      </Card>

      {/* ── Top Questions (this week) ─────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Top Questions</h3>
        </div>
        {trendingQuestions.length > 0 ? (
          <div className="space-y-2">
            {trendingQuestions.map((q, idx) => (
              <Link
                key={q.id}
                href={`/qa/${q.id}`}
                className="flex items-start gap-3 rounded-lg border bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-xs font-medium text-foreground">
                    {q.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {q.answerCount} answers · {q.viewCount} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
            No questions yet.
          </p>
        )}
      </div>

      {/* ── Popular Tags ───────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Tag className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Popular Tags</h3>
        </div>
        {popularTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => {
              const active = selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags yet.</p>
        )}
      </div>

      {/* ── How It Works ──────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">How It Works</h3>
        </div>
        <ol className="space-y-2">
          {[
            "Ask your question",
            "Community answers",
            "Best answer accepted",
            "Earn reputation",
          ].map((step, idx) => (
            <li key={step} className="flex items-start gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {idx + 1}
              </span>
              <span className="text-xs text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Top Contributors (compact) ────────────────────────── */}
      {contributors.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Top Contributors</h3>
          </div>
          <div className="space-y-1.5">
            {contributors.slice(0, 3).map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-2.5 rounded-lg bg-card p-2 ring-1 ring-foreground/10"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {entry.rank}
                </span>
                <span className="truncate text-xs font-medium text-foreground">
                  {entry.name ?? "Unknown"}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {entry.questionCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
