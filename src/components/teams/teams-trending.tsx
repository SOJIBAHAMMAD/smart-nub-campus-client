"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  Users,
  CalendarClock,
  Timer,
  Flame,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { DIFFICULTY_BADGE } from "@/constants/team";
import type { TeamRequest } from "@/types/team.types";

interface TeamsTrendingProps {
  suggested: TeamRequest[];
}

function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "";
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay < 0) return "passed";
  if (diffDay === 0) return "today";
  if (diffDay === 1) return "tomorrow";
  if (diffDay <= 30) return `${diffDay}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatEndingSoon(deadline?: string | null): string {
  if (!deadline) return "";
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay <= 0) return "ends today";
  if (diffDay === 1) return "ends tomorrow";
  return `ends in ${diffDay} days`;
}

const RANK_STYLES = [
  "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
  "bg-gray-400 text-white shadow-sm shadow-gray-400/30",
  "bg-orange-500 text-white shadow-sm shadow-orange-500/30",
];

export function TeamsTrending({ suggested }: TeamsTrendingProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const endingSoon = suggested.filter((t) => {
    if (t.status !== "OPEN" || !t.deadline) return false;
    const diffMs = new Date(t.deadline).getTime() - now.getTime();
    const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDay > 0 && diffDay <= 7;
  });

  const topThree = suggested.slice(0, 3);
  const rest = suggested.slice(3);

  return (
    <div className="space-y-5">
      {/* ── Top Teams (Hero Style) ──────────────────────────── */}
      {topThree.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="size-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Most Active
            </h3>
          </div>

          {topThree.map((team, idx) => {
            const members =
              team.teamMembers?.map((m) => ({
                id: m.userId,
                name: m.user?.name,
                src: m.user?.image,
              })) ?? [];
            const spotsLeft = team.lookingForCount - team.currentMemberCount;
            const deadlineText = formatDeadline(team.deadline);
            const urgentDeadline =
              team.deadline &&
              Math.ceil(
                (new Date(team.deadline).getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              ) <= 3;

            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className={cn(
                  "group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-muted/80",
                  idx === 0 && "bg-muted/40 ring-1 ring-primary/10",
                )}
              >
                {/* Rank badge */}
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                    RANK_STYLES[idx] ?? "bg-primary/10 text-primary",
                  )}
                >
                  {idx + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {team.title}
                  </p>

                  {/* Category + Difficulty */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {team.category && (
                      <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {team.category}
                      </span>
                    )}
                    {team.difficulty && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          DIFFICULTY_BADGE[team.difficulty].className,
                        )}
                      >
                        {DIFFICULTY_BADGE[team.difficulty].label}
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="mt-1.5 flex items-center gap-2.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Users className="size-3" />
                      {spotsLeft > 0 ? (
                        <>
                          <span
                            className={cn(
                              spotsLeft <= 2 && "text-destructive font-medium",
                            )}
                          >
                            {spotsLeft}
                          </span>{" "}
                          slot{spotsLeft !== 1 && "s"}
                        </>
                      ) : (
                        <span className="font-medium">Full</span>
                      )}
                    </span>
                    {deadlineText && (
                      <span
                        className={cn(
                          "flex items-center gap-0.5",
                          urgentDeadline && "text-destructive font-medium",
                        )}
                      >
                        <CalendarClock className="size-3" />
                        {deadlineText}
                      </span>
                    )}
                    {team._count && team._count.teamApplications > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="font-medium">
                          {team._count.teamApplications}
                        </span>{" "}
                        app{team._count.teamApplications !== 1 && "s"}
                      </span>
                    )}
                  </div>

                  {/* Members */}
                  {members.length > 0 && (
                    <div className="mt-2">
                      <AvatarGroup items={members} max={3} size="size-5" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── More Trending (Compact) ─────────────────────────── */}
      {rest.length > 0 && (
        <div className="space-y-1.5">
          {rest.map((team, idx) => {
            const spotsLeft = team.lookingForCount - team.currentMemberCount;
            const deadlineText = formatDeadline(team.deadline);
            const urgentDeadline =
              team.deadline &&
              Math.ceil(
                (new Date(team.deadline).getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24),
              ) <= 3;

            return (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/80"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[9px] font-bold text-primary">
                  {idx + 4}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[11px] font-medium text-foreground group-hover:text-primary transition-colors">
                    {team.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Users className="size-2.5" />
                    {spotsLeft > 0 ? `${spotsLeft}s` : "Full"}
                  </span>
                  {deadlineText && (
                    <span
                      className={cn(
                        urgentDeadline && "text-destructive font-medium",
                      )}
                    >
                      {deadlineText}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Ending Soon ──────────────────────────────────────── */}
      {endingSoon.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-lg bg-destructive/10">
              <Timer className="size-3.5 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Ending Soon
            </h3>
          </div>

          <div className="space-y-1.5">
            {endingSoon.map((team) => {
              const spotsLeft = team.lookingForCount - team.currentMemberCount;
              const diffMs = new Date(team.deadline!).getTime() - now.getTime();
              const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/80"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                    <span className="text-[10px] font-bold text-destructive">
                      {diffDay}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {team.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <CalendarClock className="size-3 text-destructive" />
                        <span className="font-medium text-destructive">
                          {formatEndingSoon(team.deadline)}
                        </span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Users className="size-3" />
                        {spotsLeft > 0 ? `${spotsLeft} slots` : "Full"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────── */}
      {suggested.length === 0 && (
        <Card>
          <CardContent className="p-4 text-center ring-1 ring-foreground/10">
            <Sparkles className="mx-auto mb-2 size-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No trending teams right now. Be the first to create one!
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Create Your Request ─────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Start a Team
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Looking for teammates? Create a request and find the right people.
          </p>
          <Link
            href="/teams/create"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
          >
            Create Request
            <ChevronRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
