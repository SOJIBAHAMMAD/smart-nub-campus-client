import {
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import type { ActivityItem, ActivityType } from "@/types/activity.types";

interface ActivityTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Icon chip classes used across home + activity page. */
  chip: string;
}

export const ACTIVITY_TYPE_META: Record<ActivityType, ActivityTypeMeta> = {
  resource: {
    label: "Resource",
    icon: FileText,
    chip: "bg-violet-500/10 text-violet-500",
  },
  discussion: {
    label: "Discussion",
    icon: MessageSquare,
    chip: "bg-amber-500/10 text-amber-500",
  },
  question: {
    label: "Q&A",
    icon: HelpCircle,
    chip: "bg-rose-500/10 text-rose-500",
  },
  team: {
    label: "Team",
    icon: Users,
    chip: "bg-blue-500/10 text-blue-500",
  },
  event: {
    label: "Event",
    icon: Calendar,
    chip: "bg-cyan-500/10 text-cyan-500",
  },
  job: {
    label: "Job",
    icon: Briefcase,
    chip: "bg-teal-500/10 text-teal-500",
  },
};

export const ACTIVITY_FILTERS: {
  value: ActivityType | "all";
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "all", label: "All", icon: MessageSquare },
  { value: "resource", label: "Resources", icon: FileText },
  { value: "discussion", label: "Discussions", icon: MessageSquare },
  { value: "question", label: "Q&A", icon: HelpCircle },
  { value: "team", label: "Teams", icon: Users },
  { value: "event", label: "Events", icon: Calendar },
  { value: "job", label: "Jobs", icon: Briefcase },
];

export function getTargetRoute(type: ActivityType, targetId: string): string {
  switch (type) {
    case "resource":
      return ROUTES.RESOURCE(targetId);
    case "discussion":
      return ROUTES.DISCUSSION(targetId);
    case "question":
      return ROUTES.QUESTION(targetId);
    case "team":
      return ROUTES.TEAM(targetId);
    case "event":
      return ROUTES.EVENT(targetId);
    case "job":
      return ROUTES.JOB(targetId);
  }
}

/** Relative timestamp: "just now", "5m ago", "2h ago", "yesterday", "3d ago". */
export function formatRelativeTime(dateStr: string, now = Date.now()): string {
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/** Absolute timestamp for hover/title tooltips. */
export function formatAbsoluteTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface ActivityTimeGroup {
  label: string;
  items: ActivityItem[];
}

export function groupByTime(
  activities: ActivityItem[],
  now = new Date(),
): ActivityTimeGroup[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const groups: Record<string, ActivityItem[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const item of activities) {
    const date = new Date(item.timestamp);
    if (date >= todayStart) {
      groups["Today"].push(item);
    } else if (date >= yesterdayStart) {
      groups["Yesterday"].push(item);
    } else if (date >= weekStart) {
      groups["This Week"].push(item);
    } else {
      groups["Earlier"].push(item);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
