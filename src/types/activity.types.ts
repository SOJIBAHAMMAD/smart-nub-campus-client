/**
 * Activity feed module types.
 * Mirrors server-side activity aggregation (src/app/module/activity).
 */

import type { UserReference } from "./common.types";

export type ActivityType =
  | "resource"
  | "discussion"
  | "question"
  | "team"
  | "event"
  | "job";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: UserReference | null;
  /** Human-readable action, e.g. "uploaded a resource". */
  action: string;
  /** The object of the action, e.g. a resource title or person's name. */
  target: string;
  /** Route id used to build the target link. */
  targetId: string;
  timestamp: string;
}

export interface ListActivitiesParams {
  limit?: number;
  type?: ActivityType;
  /** ISO timestamp cursor — fetch items created strictly before it. */
  cursor?: string;
}

export interface ActivityFeedResult {
  items: ActivityItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
