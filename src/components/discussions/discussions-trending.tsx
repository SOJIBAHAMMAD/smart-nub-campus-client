"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Tag, Users } from "lucide-react";
import type { Discussion } from "@/types/discussion.types";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";

export interface TopContributor {
  rank: number;
  name: string;
  image?: string | null;
  discussionCount: number;
}

interface DiscussionsTrendingProps {
  trendingDiscussions: Discussion[];
  popularTags: { id: string; name: string; slug: string }[];
  contributors: TopContributor[];
}

/**
 * Right sidebar for the Discussions page.
 * Shows trending discussions (top 3 by activity), popular tag chips,
 * and top contributors.
 */
export function DiscussionsTrending({
  trendingDiscussions,
  popularTags,
  contributors,
}: DiscussionsTrendingProps) {
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
      {/* ── Trending Discussions ───────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Trending Discussions</h3>
        </div>
        {trendingDiscussions.length > 0 ? (
          <div className="space-y-2">
            {trendingDiscussions.map((d, idx) => (
              <Link
                key={d.id}
                href={`/discussions/${d.id}`}
                className="flex items-start gap-3 rounded-lg border bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-xs font-medium text-foreground">
                    {d.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {d.replyCount} replies · {d.viewCount} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
            No trending discussions yet.
          </p>
        )}
      </div>

      {/* ── Popular Tags ─────────────────────────────────────────── */}
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
                <TagPill
                  key={tag.id}
                  name={tag.name}
                  active={active}
                  onClick={() => toggleTag(tag.slug)}

                />
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags yet.</p>
        )}
      </div>

      {/* ── Top Contributors ─────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Top Contributors</h3>
        </div>
        {contributors.length > 0 ? (
          <div className="space-y-1.5">
            {contributors.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-2.5 rounded-lg bg-card p-2 ring-1 ring-foreground/10"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {entry.rank}
                </span>
                {entry.image ? (
                  <Image
                    src={entry.image}
                    alt={entry.name ?? "Contributor"}
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {entry.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="truncate text-xs font-medium text-foreground">
                  {entry.name ?? "Unknown"}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {entry.discussionCount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
            No contributors yet.
          </p>
        )}
      </div>

      {/* ── Have a topic? CTA ──────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-semibold text-foreground">Have a topic?</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Start a discussion and get the community talking.
          </p>
          <Link
            href="/discussions/create"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-success bg-success/2 px-2.5 py-1.5 text-xs font-medium text-success/90 transition-colors hover:bg-success/5"
          >
            Start Discussion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
