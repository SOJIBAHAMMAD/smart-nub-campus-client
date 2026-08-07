/**
 * Team module constants for the client.
 * Categories mirror the free-form `category` string on TeamRequest.
 */

export const TEAM_CATEGORIES = [
  "Academic Project",
  "Personal Project",
  "Startup",
  "Research",
  "Competition",
  "Other",
] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

/** Difficulty level options. */
export const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Beginner", icon: "🌱" },
  { value: "INTERMEDIATE", label: "Intermediate", icon: "🌿" },
  { value: "ADVANCED", label: "Advanced", icon: "🌳" },
  { value: "EXPERT", label: "Expert", icon: "🏔️" },
] as const;

/** Meeting preference options. */
export const MEETING_PREFERENCE_OPTIONS = [
  { value: "ONLINE", label: "Online", icon: "💻" },
  { value: "IN_PERSON", label: "In-Person", icon: "🤝" },
  { value: "HYBRID", label: "Hybrid", icon: "🔄" },
  { value: "FLEXIBLE", label: "Flexible", icon: "✨" },
] as const;

/** Popular skills shown in the left sidebar (used for quick filtering). */
export const POPULAR_SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "TypeScript",
  "Figma",
  "CSS",
  "UI/UX",
  "Machine Learning",
  "Data Analysis",
] as const;

/**
 * Built-in metadata fields a team leader can ask applicants for.
 * Values are pre-filled from the applicant's profile where available.
 */
export const APPLICATION_FIELD_KEYS = [
  "name",
  "email",
  "github",
  "linkedin",
  "portfolio",
  "website",
  "phone",
  "location",
  "studentId",
  "department",
  "semester",
] as const;

export type ApplicationFieldKey = (typeof APPLICATION_FIELD_KEYS)[number];

export const APPLICATION_FIELD_META: Record<
  ApplicationFieldKey,
  { label: string; placeholder: string; description?: string; inputType: "text" | "email" | "url" | "tel" }
> = {
  name: {
    label: "Full Name",
    placeholder: "Your full name",
    description: "Pre-filled from your account",
    inputType: "text",
  },
  email: {
    label: "Email",
    placeholder: "you@example.com",
    description: "Pre-filled from your account",
    inputType: "email",
  },
  github: {
    label: "GitHub",
    placeholder: "https://github.com/username",
    inputType: "url",
  },
  linkedin: {
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    inputType: "url",
  },
  portfolio: {
    label: "Portfolio",
    placeholder: "https://your-portfolio.com",
    inputType: "url",
  },
  website: {
    label: "Website",
    placeholder: "https://...",
    inputType: "url",
  },
  phone: {
    label: "Phone Number",
    placeholder: "+880 ...",
    inputType: "tel",
  },
  location: {
    label: "Location",
    placeholder: "e.g. Dhaka, Bangladesh",
    inputType: "text",
  },
  studentId: {
    label: "Student ID",
    placeholder: "e.g. NUB-201-0000",
    description: "Pre-filled from your academic profile",
    inputType: "text",
  },
  department: {
    label: "Department",
    placeholder: "e.g. CSE",
    description: "Pre-filled from your academic profile",
    inputType: "text",
  },
  semester: {
    label: "Current Semester",
    placeholder: "e.g. 6th",
    description: "Pre-filled from your academic profile",
    inputType: "text",
  },
};

/** Status badge color classes. OPEN=green, FILLED=yellow, CLOSED=gray. */
export const TEAM_STATUS_BADGE: Record<
  "OPEN" | "FILLED" | "CLOSED",
  { label: string; className: string }
> = {
  OPEN: {
    label: "OPEN",
    className: "bg-success/10 text-success ring-1 ring-success/30",
  },
  FILLED: {
    label: "FILLED",
    className: "bg-warning/10 text-warning ring-1 ring-warning/30",
  },
  CLOSED: {
    label: "CLOSED",
    className: "bg-muted text-muted-foreground ring-1 ring-foreground/10",
  },
};

/** Application status badge color classes. */
export const APPLICATION_STATUS_BADGE: Record<
  "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN",
  { label: string; className: string }
> = {
  PENDING: {
    label: "PENDING",
    className: "bg-warning/10 text-warning ring-1 ring-warning/30",
  },
  ACCEPTED: {
    label: "ACCEPTED",
    className: "bg-success/10 text-success ring-1 ring-success/30",
  },
  REJECTED: {
    label: "REJECTED",
    className: "bg-destructive/10 text-destructive ring-1 ring-destructive/30",
  },
  WITHDRAWN: {
    label: "WITHDRAWN",
    className: "bg-muted text-muted-foreground ring-1 ring-foreground/10",
  },
};

/** Difficulty badge color classes. */
export const DIFFICULTY_BADGE: Record<
  "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
  { label: string; className: string }
> = {
  BEGINNER: {
    label: "Beginner",
    className: "bg-green-500/10 text-green-600 ring-1 ring-green-500/30",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    className: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/30",
  },
  ADVANCED: {
    label: "Advanced",
    className: "bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/30",
  },
  EXPERT: {
    label: "Expert",
    className: "bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/30",
  },
};

/** Meeting preference badge color classes. */
export const MEETING_PREFERENCE_BADGE: Record<
  "ONLINE" | "IN_PERSON" | "HYBRID" | "FLEXIBLE",
  { label: string; className: string }
> = {
  ONLINE: {
    label: "Online",
    className: "bg-cyan-500/10 text-cyan-600 ring-1 ring-cyan-500/30",
  },
  IN_PERSON: {
    label: "In-Person",
    className: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30",
  },
  HYBRID: {
    label: "Hybrid",
    className: "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/30",
  },
  FLEXIBLE: {
    label: "Flexible",
    className: "bg-gray-500/10 text-gray-600 ring-1 ring-gray-500/30",
  },
};

/**
 * Default application form for new teams (and fallback for teams created
 * before this feature): the "why you're a great fit" message plus name/email.
 */
export const DEFAULT_APPLICATION_FORM: import("@/types/team.types").ApplicationFormConfig = {
  fields: [
    { key: "name", required: true },
    { key: "email", required: true },
  ],
  questions: [],
};
