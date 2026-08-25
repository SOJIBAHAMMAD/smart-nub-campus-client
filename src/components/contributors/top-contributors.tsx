import Link from "next/link";
import { AlertTriangle, Medal, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TopContributor {
  rank: number;
  name: string;
  image?: string | null;
  score: number;
}

interface TopContributorsProps {
  contributors: TopContributor[];
  /**
   * "card" renders its own header (title, optional icon, optional "View all"
   * link) and works standalone. "compact" renders only the ranked list so it
   * can sit inside a sidebar section that already has its own heading.
   */
  variant?: "card" | "compact";
  title?: string;
  icon?: ReactNode;
  /** Unit shown under each score, e.g. "points", "discussions", "questions". */
  scoreLabel?: string;
  /** When provided, renders a "View all" link in the card header. */
  viewAllHref?: string;
  error?: boolean;
  className?: string;
}

const RANK_STYLES = [
  {
    icon: Trophy,
    rank: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-2 ring-amber-500/40",
  },
  {
    icon: Medal,
    rank: "bg-slate-400/15 text-slate-500 dark:text-slate-300",
    ring: "ring-2 ring-slate-400/40",
  },
  {
    icon: Medal,
    rank: "bg-orange-400/15 text-orange-500 dark:text-orange-300",
    ring: "ring-2 ring-orange-400/40",
  },
];

const FALLBACK_RANK = {
  icon: null,
  rank: "bg-muted text-muted-foreground",
  ring: "ring-1 ring-foreground/10",
};

export function TopContributors({
  contributors,
  variant = "card",
  title = "Top Contributors",
  icon,
  scoreLabel,
  viewAllHref,
  error,
  className,
}: TopContributorsProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load contributors.</span>
      </div>
    );
  }

  const compact = variant === "compact";

  return (
    <div className={cn(compact ? "space-y-1.5" : "space-y-3", className)}>
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {icon}
              </div>
            )}
            <h2 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h2>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all &rarr;
            </Link>
          )}
        </div>
      )}

      {contributors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-6 text-center">
          <Users className="mx-auto size-5 text-muted-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">
            No contributors yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contributors.map((contributor, index) => {
            const meta = RANK_STYLES[index] ?? FALLBACK_RANK;
            const RankIcon = meta.icon;
            return (
              <div
                key={contributor.rank}
                className={cn(
                  "flex items-center rounded-lg border border-border/40 bg-card transition-all duration-200 hover:border-primary/20 hover:bg-muted/30",
                  compact ? "gap-2.5 p-2.5" : "gap-3 p-3",
                )}
              >
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full font-bold",
                    compact ? "size-6 text-[10px]" : "size-8 text-xs",
                    meta.rank,
                  )}
                >
                  {RankIcon ? (
                    <RankIcon className={compact ? "size-3.5" : "size-4"} />
                  ) : (
                    contributor.rank
                  )}
                </div>

                <Avatar
                  id={contributor.name}
                  name={contributor.name || "User"}
                  src={contributor.image}
                  className={cn(
                    compact ? "size-6 text-[10px]" : "size-8 text-xs",
                    meta.ring,
                  )}
                />

                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                  {contributor.name || "Unknown"}
                </span>

                <div className="flex shrink-0 flex-col items-end leading-tight">
                  <span
                    className={cn(
                      "font-semibold tabular-nums text-foreground",
                      compact ? "text-[11px]" : "text-xs",
                    )}
                  >
                    {contributor.score.toLocaleString()}
                  </span>
                  {scoreLabel && (
                    <span className="text-[10px] text-muted-foreground">
                      {scoreLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopContributorsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  );
}
