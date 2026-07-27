"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users,
  CalendarClock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Eye,
  MapPin,
  Globe,
  Zap,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  TEAM_STATUS_BADGE,
  DIFFICULTY_BADGE,
  MEETING_PREFERENCE_BADGE,
} from "@/constants/team";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { AvatarGroup } from "@/components/ui/avatar-group";
import type { TeamRequest } from "@/types/team.types";

interface TeamCardProps {
  team: TeamRequest;
  variant?: "grid" | "list";
  isAuthor?: boolean;
  isMember?: boolean;
  hasApplied?: boolean;
  applicationStatus?: string;
  onApply?: (team: TeamRequest) => void;
  onBookmark?: (teamId: string) => void;
}

function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay < 0) return "Deadline passed";
  if (diffDay === 0) return "Due today";
  if (diffDay === 1) return "Tomorrow";
  if (diffDay <= 30) return `in ${diffDay} days`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDeadlineUrgency(deadline?: string | null): "urgent" | "soon" | "normal" {
  if (!deadline) return "normal";
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay <= 3) return "urgent";
  if (diffDay <= 7) return "soon";
  return "normal";
}

export function TeamCard({
  team,
  variant = "grid",
  isAuthor,
  isMember,
  hasApplied = false,
  applicationStatus,
  onApply,
  onBookmark,
}: TeamCardProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const statusBadge = TEAM_STATUS_BADGE[team.status];
  const canApply = team.status === "OPEN" && !isAuthor && !isMember && !hasApplied;
  const deadlineUrgency = getDeadlineUrgency(team.deadline);

  const memberAvatars =
    team.teamMembers?.map((m) => ({
      id: m.userId,
      name: m.user?.name,
      src: m.user?.image,
    })) ?? [];

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      await onBookmark?.(team.id);
    } finally {
      setIsBookmarking(false);
    }
  };

  if (variant === "list") {
    const accentColor =
      team.status === "OPEN"
        ? "border-l-green-500"
        : team.status === "FILLED"
          ? "border-l-yellow-500"
          : "border-l-red-500";

    return (
      <Card interactive size="sm" className={cn("group border-l-2", accentColor)}>
        <div className="flex items-start gap-4 p-4">
          {/* ── Left: Creator Avatar ──────────────────────────── */}
          {team.creator && (
            <div className="hidden sm:block">
              <AuthorInfo
                user={{
                  id: team.creator.id,
                  name: team.creator.name ?? "Unknown",
                  image: team.creator.image,
                }}
                timestamp={team.createdAt}
                size="md"
              />
            </div>
          )}

          {/* ── Center: Content ────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-sm">
                  <Link
                    href={`/teams/${team.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {team.title}
                  </Link>
                </CardTitle>
                {team.projectName && (
                  <CardDescription className="mt-0.5 line-clamp-1 text-xs">
                    {team.projectName}
                  </CardDescription>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusBadge.className,
                  )}
                >
                  {statusBadge.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleBookmark}
                  aria-label={team.isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  {team.isBookmarked ? (
                    <BookmarkCheck className="size-4 text-brand animate-in zoom-in duration-200" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* ── Description ──────────────────────────────────── */}
            <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
              {team.description}
            </p>

            {/* ── Meta Row ─────────────────────────────────────── */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              {team.difficulty && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                    DIFFICULTY_BADGE[team.difficulty].className,
                  )}
                >
                  {DIFFICULTY_BADGE[team.difficulty].label}
                </span>
              )}

              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  MEETING_PREFERENCE_BADGE[team.meetingPreference].className,
                )}
              >
                {team.meetingPreference === "ONLINE" ? (
                  <Globe className="size-3" />
                ) : team.meetingPreference === "IN_PERSON" ? (
                  <MapPin className="size-3" />
                ) : (
                  <Zap className="size-3" />
                )}
                {MEETING_PREFERENCE_BADGE[team.meetingPreference].label}
              </span>

              {/* Members + progress */}
              <span className="flex items-center gap-1.5">
                <Users className="size-3" />
                {team.currentMemberCount}/{team.lookingForCount}
                <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (team.currentMemberCount / team.lookingForCount) * 100)}%`,
                    }}
                  />
                </div>
              </span>

              {team._count && (
                <span className="flex items-center gap-1">
                  {team._count.teamApplications} apps
                </span>
              )}

              <span
                className={cn(
                  "flex items-center gap-1",
                  deadlineUrgency === "urgent" && "text-destructive font-medium",
                  deadlineUrgency === "soon" && "text-warning font-medium",
                )}
              >
                <CalendarClock className="size-3" />
                {formatDeadline(team.deadline)}
              </span>

              {team.viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {team.viewCount}
                </span>
              )}
            </div>

            {/* ── Skills ──────────────────────────────────────── */}
            {team.teamRequestSkills && team.teamRequestSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {team.teamRequestSkills.slice(0, 4).map((skill) => (
                  <TagPill
                    key={skill.id}
                    name={skill.tag?.name ?? "skill"}
                    size="xs"
                    variant="brand"
                  />
                ))}
                {team.teamRequestSkills.length > 4 && (
                  <TagPill
                    name={`+${team.teamRequestSkills.length - 4}`}
                    size="xs"
                    variant="default"
                    showIcon={false}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── Right: Actions ────────────────────────────────── */}
          <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
            <Link
              href={`/teams/${team.id}`}
              className="flex items-center gap-1 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
            >
              View
              <ArrowRight className="size-3.5" />
            </Link>
            {hasApplied ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  applicationStatus === "ACCEPTED" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  applicationStatus === "REJECTED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  applicationStatus === "PENDING" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                  !applicationStatus && "bg-muted text-muted-foreground",
                )}
              >
                {applicationStatus ?? "Applied"}
              </span>
            ) : canApply ? (
              <Button
                size="sm"
                className="gap-1.5 text-xs active:scale-[0.99]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onApply?.(team);
                }}
              >
                Apply
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
    );
  }

  // ── Grid variant ──────────────────────────────────────────────
  return (
    <Card interactive size="sm" className="group flex flex-col active:scale-[0.99] transition-transform duration-100">
      {/* ── Header ──────────────────────────────────────────── */}
      <CardHeader>
        <div className="min-w-0">
          <CardTitle className="text-sm">
            <Link
              href={`/teams/${team.id}`}
              className="hover:text-primary transition-colors"
            >
              {team.title}
            </Link>
          </CardTitle>
          {team.projectName && (
            <CardDescription className="mt-0.5 line-clamp-1 text-xs">
              {team.projectName}
            </CardDescription>
          )}
        </div>
        <CardAction>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleBookmark}
              aria-label={team.isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {team.isBookmarked ? (
                <BookmarkCheck className="size-4 text-brand animate-in zoom-in duration-200" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </Button>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                statusBadge.className,
              )}
            >
              {statusBadge.label}
            </span>
          </div>
        </CardAction>
      </CardHeader>

      {/* ── Description ─────────────────────────────────────── */}
      <CardContent>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {team.description}
        </p>
      </CardContent>

      {/* ── Meta Badges ─────────────────────────────────────── */}
      <CardContent className="-mt-1">
        <div className="flex flex-wrap gap-1.5">
          {team.difficulty && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                DIFFICULTY_BADGE[team.difficulty].className,
              )}
            >
              {DIFFICULTY_BADGE[team.difficulty].label}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              MEETING_PREFERENCE_BADGE[team.meetingPreference].className,
            )}
          >
            {MEETING_PREFERENCE_BADGE[team.meetingPreference].label}
          </span>
        </div>
      </CardContent>

      {/* ── Skills ──────────────────────────────────────────── */}
      {team.teamRequestSkills && team.teamRequestSkills.length > 0 && (
        <CardContent className="-mt-1">
          <div className="flex flex-wrap gap-1.5">
            {team.teamRequestSkills.slice(0, 3).map((skill) => (
              <TagPill
                key={skill.id}
                name={skill.tag?.name ?? "skill"}
                size="xs"
                variant="brand"
              />
            ))}
            {team.teamRequestSkills.length > 3 && (
              <TagPill
                name={`+${team.teamRequestSkills.length - 3}`}
                size="xs"
                variant="default"
                showIcon={false}
              />
            )}
          </div>
        </CardContent>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <CardFooter className="mt-auto flex-col items-stretch gap-3">
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

          {memberAvatars.length > 0 && (
            <AvatarGroup items={memberAvatars} max={3} size="size-5" />
          )}
        </div>

        {/* ── Progress + Meta ─────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {team.currentMemberCount}/{team.lookingForCount} members
            </span>
            <span
              className={cn(
                "flex items-center gap-1",
                deadlineUrgency === "urgent" && "text-destructive font-medium",
                deadlineUrgency === "soon" && "text-warning font-medium",
              )}
            >
              <CalendarClock className="size-3" />
              {formatDeadline(team.deadline)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(100, (team.currentMemberCount / team.lookingForCount) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {hasApplied ? (
            <span
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium",
                applicationStatus === "ACCEPTED" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                applicationStatus === "REJECTED" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                applicationStatus === "PENDING" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                !applicationStatus && "bg-muted text-muted-foreground",
              )}
            >
              {applicationStatus ?? "Applied"}
            </span>
          ) : canApply ? (
            <Button
              size="sm"
              className="flex-1 gap-1.5 active:scale-[0.99]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onApply?.(team);
              }}
            >
              Apply
            </Button>
          ) : (
            <Link
              href={`/teams/${team.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
            >
              View
              <ArrowRight className="size-3.5" />
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 active:scale-[0.99]"
            onClick={handleBookmark}
          >
            {team.isBookmarked ? (
              <BookmarkCheck className="size-3.5 text-brand" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
            {team.bookmarkCount > 0 && team.bookmarkCount}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// ── Skeletons ──────────────────────────────────────────────────

export function TeamCardGridSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
      <CardContent>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardContent>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex -space-x-1">
            <Skeleton className="size-5 rounded-full ring-2 ring-background" />
            <Skeleton className="size-5 rounded-full ring-2 ring-background" />
          </div>
        </div>
        <div className="w-full space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="flex w-full gap-2">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function TeamCardListSkeleton() {
  return (
    <Card size="sm">
      <div className="flex items-start gap-4 p-4">
        <Skeleton className="hidden size-10 shrink-0 rounded-full sm:block" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
        </div>
        <div className="hidden shrink-0 space-y-2 sm:block">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
