import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toHref(value: string): string | null {
  if (!/^https?:\/\//i.test(value.trim())) return null;
  try {
    new URL(value.trim());
    return value.trim();
  } catch {
    return null;
  }
}

export function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(","));
      } else {
        searchParams.set(key, String(value));
      }
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export type ActivityLevel = "hot" | "trending" | "new" | null;

export function getActivityLevel(
  createdAt: string,
  viewCount: number,
  upvoteCount: number,
  replyCount: number,
): ActivityLevel {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const hoursOld = (now - created) / (1000 * 60 * 60);

  if (hoursOld < 24) return "new";
  if (viewCount > 100 && hoursOld < 168) return "hot";
  if ((upvoteCount + replyCount) > 10 && hoursOld < 336) return "trending";
  return null;
}

export const ACTIVITY_BADGE: Record<
  NonNullable<ActivityLevel>,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  hot: {
    label: "Hot",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  trending: {
    label: "Trending",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
};
