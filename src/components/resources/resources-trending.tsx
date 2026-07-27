"use client";

import Link from "next/link";
import { TrendingUp, Tag, Users, FileText, ChevronRight } from "lucide-react";
import { TagPill } from "@/components/ui/tag-pill";
import type { Resource } from "@/types/resource.types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LeaderboardEntry {
  rank: number;
  name: string;
  image?: string | null;
  totalPoints: number;
}

interface ResourcesTrendingProps {
  trendingResources: Resource[];
  contributors: LeaderboardEntry[];
  selectedTags?: string[];
  onTagToggle?: (slug: string) => void;
}

export function ResourcesTrending({
  trendingResources,
  contributors,
  selectedTags = [],
  onTagToggle,
}: ResourcesTrendingProps) {
  // Collect unique tags from trending resources
  const trendingTags = Array.from(
    new Map(
      trendingResources
        .flatMap((r) => r.resourceTags ?? [])
        .filter((rt) => rt.tag)
        .map((rt) => [rt.tag!.id, rt.tag!])
    ).values()
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ── Trending Resources ───────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Trending Resources</h3>
        </div>
        {trendingResources.length > 0 ? (
          <div className="space-y-2">
            {trendingResources.map((resource, idx) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.id}`}
                className="flex items-start gap-3 rounded-lg border bg-card p-2.5 ring-1 ring-foreground/5 transition-all hover:shadow-sm hover:ring-foreground/10"
              >
                <span className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  idx === 0 ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                    : idx === 1 ? "bg-muted text-muted-foreground"
                    : idx === 2 ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    : "bg-primary/10 text-primary"
                )}>
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-xs font-medium text-foreground">
                    {resource.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {resource.upvoteCount} upvotes
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border bg-card p-3 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
            No trending resources yet.
          </p>
        )}
      </div>

      {/* ── Popular Tags ─────────────────────────────────────────── */}
      {onTagToggle && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Tag className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Popular Tags</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.length > 0 ? (
              trendingTags.map((tag) => {
                const active = selectedTags.includes(tag.slug);
                return (
                  <TagPill
                    key={tag.id}
                    name={tag.name}
                    active={active}
                    onClick={() => onTagToggle(tag.slug)}

                  />
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No tags yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Top Contributors ──────────────────────────────────────── */}
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
                    alt={entry.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {entry.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="truncate text-xs font-medium text-foreground">
                  {entry.name ?? "Unknown"}
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

      {/* ── Request Resource ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Need something?</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Can&apos;t find what you need? Request it from the community.
          </p>
          <Link
            href="/resources/upload"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-success bg-success/2 px-2.5 py-1.5 text-xs font-medium text-success/90 transition-colors hover:bg-success/5"
          >
            Request Resource
            <ChevronRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
