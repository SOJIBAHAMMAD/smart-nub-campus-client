/**
 * Cache tag constants for server-side data fetching.
 * Used with serverApi.get() and serverApi.post() for automatic cache invalidation.
 */

export const CacheTags = {
  // Resources
  RESOURCES_LIST: "resources-list",
  RESOURCE_DETAIL: "resource-detail",
  RESOURCE_CATEGORIES: "resource-categories",

  // Teams
  TEAMS_LIST: "teams-list",
  TEAM_DETAIL: "team-detail",

  // Discussions
  DISCUSSIONS_LIST: "discussions-list",
  DISCUSSION_DETAIL: "discussion-detail",
  DISCUSSION_CATEGORIES: "discussion-categories",

  // Q&A
  QUESTIONS_LIST: "questions-list",
  QUESTION_DETAIL: "question-detail",
  QUESTION_CATEGORIES: "question-categories",

  // Connections
  CONNECTIONS_LIST: "connections-list",
  CONNECTION_REQUESTS: "connection-requests",

  // Messages
  CONVERSATIONS_LIST: "conversations-list",
  MESSAGES_LIST: "messages-list",

  // AI
  AI_SESSIONS: "ai-sessions",
  AI_MESSAGES: "ai-messages",

  // Events
  EVENTS_LIST: "events-list",
  EVENT_DETAIL: "event-detail",

  // Gamification
  BADGES_LIST: "badges-list",
  LEADERBOARD: "leaderboard",
  USER_BADGES: "user-badges",
  REPUTATION_LOG: "reputation-log",

  // Notifications
  NOTIFICATIONS_LIST: "notifications-list",
  UNREAD_COUNT: "unread-count",

  // User
  USER_PROFILE: "user-profile",
} as const;

export type CacheTagKey = keyof typeof CacheTags;
