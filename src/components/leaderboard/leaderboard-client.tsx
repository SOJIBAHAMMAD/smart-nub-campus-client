"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Star,
  Crown,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Leaderboard } from "@/types/gamification.types";
import type { PaginationMeta } from "@/types/resource.types";
import ROUTES from "@/constants/routes";

interface LeaderboardClientProps {
  initialData: Leaderboard[];
  initialMeta: PaginationMeta | null;
  initialRole: string | null;
  currentPage: number;
}

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "STUDENT", label: "Students" },
  { value: "FACULTY", label: "Faculty" },
  { value: "ADMIN", label: "Administrators" },
] as const;

const PODIUM_STYLES = {
  1: {
    ring: "ring-amber-400/40",
    bg: "bg-gradient-to-b from-amber-500/15 to-amber-500/5",
    iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    avatarRing: "ring-amber-400/50",
    label: "text-amber-600 dark:text-amber-400",
  },
  2: {
    ring: "ring-slate-400/30",
    bg: "bg-gradient-to-b from-slate-400/10 to-slate-400/5",
    iconBg: "bg-slate-400/20 text-slate-500 dark:text-slate-300",
    avatarRing: "ring-slate-400/40",
    label: "text-slate-500 dark:text-slate-300",
  },
  3: {
    ring: "ring-orange-400/30",
    bg: "bg-gradient-to-b from-orange-400/10 to-orange-400/5",
    iconBg: "bg-orange-400/20 text-orange-500 dark:text-orange-300",
    avatarRing: "ring-orange-400/40",
    label: "text-orange-500 dark:text-orange-300",
  },
};

const RANK_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

export function LeaderboardClient({
  initialData,
  initialMeta,
  initialRole,
  currentPage,
}: LeaderboardClientProps) {
  const router = useRouter();
  const topThree = initialData.slice(0, 3);
  const rest = initialData.slice(3);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (initialRole) params.set("role", initialRole);
      router.push(`/leaderboard?${params.toString()}`);
    },
    [router, initialRole],
  );

  const setRole = useCallback(
    (role: string) => {
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      router.push(`/leaderboard?${params.toString()}`);
    },
    [router],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Leaderboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Top contributors ranked by reputation points from resources,
              discussions, Q&A, and community activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <select
              value={initialRole ?? ""}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-primary/30 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/20"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error / Empty */}
        {initialData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-20">
            <Trophy className="size-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No contributors found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Be the first to earn points by contributing to the community.
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="mb-12 flex items-end justify-center gap-4">
              {[2, 1, 3].map((rank) => {
                const entry = topThree[rank - 1];
                if (!entry || !entry.user) return <div key={rank} className="w-40" />;

                const style = PODIUM_STYLES[rank as 1 | 2 | 3];
                const isFirst = rank === 1;

                return (
                  <div
                    key={entry.user.id}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-200 hover:border-primary/20 ${style.bg} ${style.ring} ring-1 ${isFirst ? "w-44 -mt-4" : "w-40"}`}
                  >
                    <div className={`relative ${isFirst ? "mb-1" : ""}`}>
                      <div
                        className={`flex size-14 items-center justify-center rounded-full bg-muted ring-2 ${style.avatarRing} ${isFirst ? "size-16" : ""}`}
                      >
                        {entry.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.user.image}
                            alt={entry.user.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-foreground">
                            {entry.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </span>
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex size-6 items-center justify-center rounded-full ${style.iconBg} ring-2 ring-background`}
                      >
                        {rank === 1 ? (
                          <Crown className="size-3.5" />
                        ) : (
                          <Medal className="size-3.5" />
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="max-w-[9rem] truncate text-sm font-semibold text-foreground">
                        {entry.user.name}
                      </p>
                      <p className={`text-xs font-medium ${style.label}`}>
                        {RANK_LABELS[rank]}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1">
                      <Star className="size-3 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {entry.totalPoints.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Table */}
            {rest.length > 0 && (
              <div className="space-y-1">
                {rest.map((entry) => {
                  if (!entry.user) return null;
                  return (
                    <Link
                      key={entry.user.id}
                      href={ROUTES.USER_PROFILE(entry.user.id)}
                      className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-5 py-3.5 transition-all duration-200 hover:border-primary/20 hover:bg-muted/30"
                    >
                      <div className="flex w-8 shrink-0 items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground/60">
                          #{entry.rank}
                        </span>
                      </div>

                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-1 ring-border/40">
                        {entry.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.user.image}
                            alt={entry.user.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          entry.user.name?.charAt(0)?.toUpperCase() ?? "U"
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {entry.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.rank <= 10 ? "Top 10" : `Rank #${entry.rank}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1">
                        <Star className="size-3 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {initialMeta && initialMeta.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {initialMeta.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= initialMeta.totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
