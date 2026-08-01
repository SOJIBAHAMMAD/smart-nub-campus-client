"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Tag, Users, Sparkles } from "lucide-react";
import type { Discussion } from "@/types/discussion.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagPill } from "@/components/ui/tag-pill";
import {
  TopContributors,
  type TopContributor,
} from "@/components/contributors/top-contributors";

interface DiscussionsTrendingProps {
  trendingDiscussions: Discussion[];
  popularTags: { id: string; name: string; slug: string }[];
  contributors: TopContributor[];
}

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
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
            <TrendingUp className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Trending</h3>
        </div>
        {trendingDiscussions.length > 0 ? (
          <div className="space-y-2">
            {trendingDiscussions.map((d, idx) => (
              <Link
                key={d.id}
                href={`/discussions/${d.id}`}
                className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-colors group-hover:bg-primary/20">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-primary">
                    {d.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {d.replyCount} replies &middot; {d.viewCount} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">No trending discussions yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
            <Tag className="size-3.5 text-primary" />
          </div>
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

      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Top Contributors</h3>
        </div>
        <TopContributors
          contributors={contributors}
          variant="compact"
          scoreLabel="discussions"
        />
      </div>

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex flex-col items-start gap-3 p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Share your knowledge</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Start a discussion and earn contributor points.
            </p>
          </div>
          <Button variant="default" size="sm" className="w-full" render={<Link href="/discussions/create" />} nativeButton={false}>
            Write a Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
