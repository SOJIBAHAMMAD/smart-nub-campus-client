/**
 * Centralized cache tag constants for Next.js revalidation.
 *
 * All `invalidatesTags` and `tags` usage MUST reference these constants
 * to avoid typo-related cache bugs. Import from this file only.
 *
 * @example
 * ```ts
 * import { TAGS } from "@/lib/cache-tags";
 * serverApi.get("/resources", { tags: [TAGS.RESOURCES] });
 * serverApi.post("/resources", data, { invalidatesTags: [TAGS.RESOURCES] });
 * ```
 */

export const TAGS = {
  /** Resource list + categories + courses (all read together). */
  RESOURCES: "resources",

  /** Single resource detail page. */
  RESOURCE_DETAIL: "resource-detail",

  /** Trending resources sidebar. */
  RESOURCES_TRENDING: "resources-trending",

  /** Leaderboard / gamification. */
  LEADERBOARD: "leaderboard",

  /** Team requests list (finder, my teams, my applications). */
  TEAMS_LIST: "teams-list",

  /** Single team request detail page. */
  TEAM_DETAIL: "team-detail",

  /** Discussion list + categories + tags. */
  DISCUSSIONS: "discussions",

  /** Single discussion detail page. */
  DISCUSSION_DETAIL: "discussion-detail",

  /** Trending discussions sidebar. */
  DISCUSSIONS_TRENDING: "discussions-trending",

  /** Q&A list + categories + tags. */
  QA: "qa",

  /** Single question detail page. */
  QA_DETAIL: "qa-detail",

  /** Top/trending questions sidebar. */
  QA_TRENDING: "qa-trending",

  /** Connections list + suggestions + overview. */
  CONNECTIONS: "connections",

  /** Shared tag pool (cross-module). */
  TAGS: "tags",

  /** Connection requests (pending/sent). */
  CONNECTION_REQUESTS: "connection-requests",

  /** User profile detail. */
  PROFILE: "user-profile",

  /** User gamification stats. */
  PROFILE_STATS: "profile-stats",

  /** User badges. */
  PROFILE_BADGES: "profile-badges",

  /** Alumni transition status (home banner). */
  ALUMNI_TRANSITION_STATUS: "alumni-transition-status",

  /** Alumni directory list (cards + filters). */
  ALUMNI_DIRECTORY: "alumni-directory",

  /** Single alumni directory member detail. */
  ALUMNI_DIRECTORY_DETAIL: "alumni-directory-detail",

  /** Alumni directory facet stats (sidebar counts). */
  ALUMNI_DIRECTORY_STATS: "alumni-directory-stats",

  /** Job posts list (cards + filters). */
  JOBS: "jobs",

  /** Single job post detail. */
  JOB_DETAIL: "job-detail",

  /** Mentorship mentor directory. */
  MENTORS: "mentors",

  /** Mentorship requests (incoming + outgoing). */
  MENTORSHIP_REQUESTS: "mentorship-requests",

  /** Campus-wide activity feed (home + /activity). */
  ACTIVITIES: "activities",
} as const;

/** All tags that should be invalidated when any resource is created/updated/deleted. */
export const RESOURCE_MUTATION_TAGS = [TAGS.RESOURCES, TAGS.RESOURCES_TRENDING, TAGS.ACTIVITIES] as const;

/** All tags that should be invalidated when a team request is created/updated/deleted. */
export const TEAM_MUTATION_TAGS = [TAGS.TEAMS_LIST, TAGS.TEAM_DETAIL, TAGS.ACTIVITIES] as const;

/** All tags that should be invalidated when a discussion is created/updated/deleted. */
export const DISCUSSION_MUTATION_TAGS = [TAGS.DISCUSSIONS, TAGS.DISCUSSION_DETAIL, TAGS.DISCUSSIONS_TRENDING, TAGS.ACTIVITIES] as const;

/** All tags that should be invalidated when a question/answer is created/updated/deleted. */
export const QA_MUTATION_TAGS = [TAGS.QA, TAGS.QA_DETAIL, TAGS.QA_TRENDING, TAGS.ACTIVITIES] as const;

/** All tags that should be invalidated when a connection is created/updated/deleted. */
export const CONNECTION_MUTATION_TAGS = [TAGS.CONNECTIONS, TAGS.CONNECTION_REQUESTS] as const;
