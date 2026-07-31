import Link from "next/link";
import { Trophy, Medal, AlertTriangle, Star } from "lucide-react";
import type { Leaderboard } from "@/types/gamification.types";

interface TopContributorsProps {
  contributors: Leaderboard[];
  error?: boolean;
}

const rankStyles = [
  {
    icon: Trophy,
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Medal,
    bg: "bg-slate-400/10 text-slate-500 dark:text-slate-300",
  },
  {
    icon: Medal,
    bg: "bg-orange-400/10 text-orange-500 dark:text-orange-300",
  },
];

export function TopContributors({
  contributors,
  error,
}: TopContributorsProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load contributors.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Top Contributors
        </h2>
        <Link
          href="/leaderboard"
          className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all &rarr;
        </Link>
      </div>

      {contributors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-8 text-center">
          <Star className="mx-auto size-6 text-muted-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">
            No contributors yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contributors.map((contributor, index) => {
            const rankStyle = rankStyles[index] ?? {
              icon: null,
              bg: "bg-muted text-muted-foreground",
            };
            const RankIcon = rankStyle.icon;
            return (
              <div
                key={contributor.user?.id ?? contributor.rank}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-3 transition-all duration-200 hover:border-primary/20 hover:bg-muted/30"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankStyle.bg}`}
                >
                  {RankIcon ? (
                    <RankIcon className="size-4" />
                  ) : (
                    contributor.rank
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-1 ring-border/40">
                    {contributor.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {contributor.user?.name ?? "Unknown"}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="size-2.5 text-amber-500" />
                      {contributor.totalPoints.toLocaleString()} points
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
