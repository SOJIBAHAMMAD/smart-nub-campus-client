"use client";

import Link from "next/link";
import { Users, CalendarClock, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { TEAM_STATUS_BADGE } from "@/constants/team";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import type { TeamRequest } from "@/types/team.types";

interface TeamCardProps {
  team: TeamRequest;
  isAuthor?: boolean;
  isMember?: boolean;
  onApply?: (team: TeamRequest) => void;
}

function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay < 0) return "Deadline passed";
  if (diffDay === 0) return "Due today";
  if (diffDay <= 30) return `in ${diffDay} days`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TeamCard({ team, isAuthor, isMember, onApply }: TeamCardProps) {
  const statusBadge = TEAM_STATUS_BADGE[team.status];
  const canApply = team.status === "OPEN" && !isAuthor && !isMember;

  return (
    <Card interactive size="sm">
      {/* ── Header ──────────────────────────────────────────────── */}
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>
            <Link
              href={`/teams/${team.id}`}
              className="hover:text-primary transition-colors"
            >
              {team.title}
            </Link>
          </CardTitle>
          {team.projectName && (
            <CardDescription className="mt-0.5 line-clamp-1">
              {team.projectName}
            </CardDescription>
          )}
        </div>
        <CardAction>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              statusBadge.className,
            )}
          >
            {statusBadge.label}
          </span>
        </CardAction>
      </CardHeader>

      {/* ── Description ─────────────────────────────────────────── */}
      <CardContent>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {team.description}
        </p>
      </CardContent>

      {/* ── Skills ──────────────────────────────────────────────── */}
      {team.teamRequestSkills && team.teamRequestSkills.length > 0 && (
        <CardContent className="-mt-1">
          <div className="flex flex-wrap gap-1.5">
            {team.teamRequestSkills.slice(0, 5).map((skill) => (
              <TagPill
                key={skill.id}
                name={skill.tag?.name ?? "skill"}
                size="xs"
                variant="brand"
              />
            ))}
            {team.teamRequestSkills.length > 5 && (
              <TagPill
                name={`+${team.teamRequestSkills.length - 5}`}
                size="xs"
                variant="default"
                showIcon={false}
              />
            )}
          </div>
        </CardContent>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <CardFooter className="flex-col items-stretch gap-3">
        <div className="flex items-center justify-between gap-2">
          {team.creator && (
            <AuthorInfo
              user={{
                id: team.creator.id,
                name: team.creator.name ?? "Unknown",
                image: team.creator.image,
              }}
              timestamp={team.createdAt}
              size="sm"
            />
          )}

          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {team.currentMemberCount}/{team.lookingForCount}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              {formatDeadline(team.deadline)}
            </span>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Link
            href={`/teams/${team.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            View
            <ArrowRight className="size-3.5" />
          </Link>
          {canApply && (
            <button
              onClick={() => onApply?.(team)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90"
            >
              Apply
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
