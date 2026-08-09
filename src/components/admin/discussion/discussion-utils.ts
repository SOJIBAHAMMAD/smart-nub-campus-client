import type { ComponentType } from "react";
import { Activity, Archive, CheckCircle, Lock, Pin } from "lucide-react";
import type {
  AdminDiscussion,
  AdminDiscussionSort,
  AdminDiscussionStatus,
} from "@/types/admin.types";

/**
 * Singular moderation status derived from a discussion's flags.
 * Priority order: ARCHIVED > PINNED > CLOSED (locked) > SOLVED > ACTIVE.
 * Colors match the existing app vocabulary (Pinned = primary/blue,
 * Locked = muted/gray, Solved = success/green).
 */
export type DiscussionStatus =
  | "ACTIVE"
  | "CLOSED"
  | "PINNED"
  | "SOLVED"
  | "ARCHIVED";

export interface DiscussionStatusMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind classes applied to the outline badge. */
  className: string;
  /** Human description used in the badge tooltip. */
  description: string;
}

export const DISCUSSION_STATUS_META: Record<
  DiscussionStatus,
  DiscussionStatusMeta
> = {
  ACTIVE: {
    label: "Active",
    icon: Activity,
    className: "border-success/30 text-success",
    description: "Open and accepting replies",
  },
  CLOSED: {
    label: "Locked",
    icon: Lock,
    className: "text-muted-foreground",
    description: "Locked — no new replies",
  },
  PINNED: {
    label: "Pinned",
    icon: Pin,
    className: "border-primary/30 text-primary",
    description: "Pinned to the top of the community",
  },
  SOLVED: {
    label: "Solved",
    icon: CheckCircle,
    className: "border-success/30 text-success",
    description: "Marked as solved",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className:
      "border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-400",
    description: "Archived or removed from the community",
  },
};

export function getDiscussionStatus(d: AdminDiscussion): DiscussionStatus {
  if (d.isDeleted) return "ARCHIVED";
  if (d.isPinned) return "PINNED";
  if (d.isLocked) return "CLOSED";
  if (d.isSolved) return "SOLVED";
  return "ACTIVE";
}

/** Flags not represented by the primary status badge (shown as hint icons). */
export function getSecondaryFlags(d: AdminDiscussion): DiscussionStatus[] {
  const primary = getDiscussionStatus(d);
  const flags: DiscussionStatus[] = [];
  if (d.isPinned && primary !== "PINNED") flags.push("PINNED");
  if (d.isLocked && primary !== "CLOSED") flags.push("CLOSED");
  if (d.isSolved && primary !== "SOLVED") flags.push("SOLVED");
  return flags;
}

/** Plain-text excerpt of the discussion body for quick in-row triage. */
export function getDiscussionExcerpt(content: string, maxLength = 140): string {
  const text = (content ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export const SORT_OPTIONS: { value: AdminDiscussionSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Upvoted" },
  { value: "replies", label: "Most Replies" },
];

export const STATUS_OPTIONS: {
  value: AdminDiscussionStatus;
  label: string;
}[] = [
  { value: "all", label: "All Discussions" },
  { value: "pinned", label: "Pinned" },
  { value: "locked", label: "Locked" },
  { value: "solved", label: "Solved" },
];
