import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Leaderboard } from "@/types/gamification.types";

interface TopContributorsProps {
  contributors: Leaderboard[];
  error?: boolean;
}

/** Top contributors section — renders top users by reputation (server-fetched). */
export function TopContributors({ contributors, error }: TopContributorsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Top Contributors
        </h2>
        <Link
          href="/leaderboard"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {/* ── Error state ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Failed to load contributors.</span>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!error && contributors.length === 0 && (
        <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No contributors yet.
        </p>
      )}

      {/* ── Contributor cards ─────────────────────────────────────── */}
      {!error && contributors.length > 0 && (
        <div className="space-y-2">
          {contributors.map((contributor) => (
            <Card key={contributor.user?.id ?? contributor.rank} size="sm">
              <CardContent className="flex items-center gap-3 py-3">
                {/* Rank */}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {contributor.rank}
                </span>
                {/* Name */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {contributor.user?.name ?? "Unknown"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {contributor.totalPoints} pts
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
