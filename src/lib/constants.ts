/**
 * Shared constants for the Smart NUB Campus client.
 * Departments mirror the Prisma `Department` enum on the server.
 */
export const DEPARTMENTS = [
  "CSE",
  "ECSE",
  "EEE",
  "EEEE",
  "BBA",
  "MBA",
  "ENGLISH",
  "MAE",
  "BANGLA",
  "MAB",
  "LLB",
  "MPH",
  "BPH",
  "ME",
  "CIVIL",
  "BTX",
  "EBTX",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

/** Human-readable labels for department enum values. */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  CSE: "Computer Science & Engineering",
  ECSE: "Electronics & Computer Systems Engineering",
  EEE: "Electrical & Electronics Engineering",
  EEEE: "Electrical & Electronic Engineering",
  BBA: "Bachelor of Business Administration",
  MBA: "Master of Business Administration",
  ENGLISH: "English",
  MAE: "Mechanical & Aerospace Engineering",
  BANGLA: "Bangla",
  MAB: "Master of Business Administration (Bangla)",
  LLB: "Bachelor of Laws",
  MPH: "Master of Public Health",
  BPH: "Bachelor of Public Health",
  ME: "Mechanical Engineering",
  CIVIL: "Civil Engineering",
  BTX: "Biotechnology",
  EBTX: "Electronics & Biotechnology",
};

/** Total semesters in an undergraduate program (used for the semester dropdown). */
export const MAX_SEMESTERS = 12;

export const SEMESTER_OPTIONS = Array.from(
  { length: MAX_SEMESTERS },
  (_, i) => i + 1,
);

/** Default avatar gradient accent classes keyed by a hash of the name. */
export const AVATAR_GRADIENTS = [
  "from-brand to-brand/60",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-indigo-500",
];

/** Derive a stable gradient index from a string (e.g. a user id or name). */
export function gradientIndexFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_GRADIENTS.length;
}

/** Get the initials from a full name (max 2 characters). */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
