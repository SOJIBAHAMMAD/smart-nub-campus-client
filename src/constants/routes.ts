const ROUTES = {
  // ── Public / Auth ──────────────────────────────────────────────────────────
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "/auth/login",
  ONBOARDING: "/auth/onboarding",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // ── Core Platform ──────────────────────────────────────────────────────────
  RESOURCES: "/resources",
  TEAMS: "/teams",
  DISCUSSIONS: "/discussions",
  QA: "/qa",
  AI: "/ai",
  MY_NETWORK: "/my-network",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  MY_PROFILE: "/profile",
  LEADERBOARD: "/leaderboard",
  BADGES: "/badges",
  ACTIVITIES: "/activity",

  // ── Alumni ─────────────────────────────────────────────────────────────────
  ALUMNI: "/alumni",
  JOBS: "/jobs",
  NEW_JOB: "/jobs/new",
  MENTORSHIP: "/mentorship",
  MENTORSHIP_REQUESTS: "/mentorship/requests",
  MENTORSHIP_RELATIONSHIPS: "/mentorship/relationships",
  MENTORSHIP_RELATIONSHIP: (id: string) => `/mentorship/relationships/${id}`,
  ALUMNI_MEMBER: (id: string) => `/alumni/${id}`,
  JOB: (id: string) => `/jobs/${id}`,
  JOB_EDIT: (id: string) => `/jobs/${id}/edit`,

  // ── Info Pages ─────────────────────────────────────────────────────────────
  ABOUT: "/about",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // ── Parameterized Routes ───────────────────────────────────────────────────
  RESOURCE: (id: string) => `/resources/${id}`,
  TEAM: (id: string) => `/teams/${id}`,
  DISCUSSION: (id: string) => `/discussions/${id}`,
  QUESTION: (id: string) => `/qa/${id}`,
  EVENT: (id: string) => `/events/${id}`,
  USER_PROFILE: (id: string) => `/profile/${id}`,
  USER_BADGES: (id: string) => `/badges/${id}`,
  CONVERSATION: (id: string) => `/messages/${id}`,
} as const;

export default ROUTES;
