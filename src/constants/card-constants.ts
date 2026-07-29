import {
  GraduationCap,
  Code,
  FolderKanban,
  Briefcase,
  Calendar,
  Globe,
  Building,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

/**
 * Shared constants used across card components.
 * Eliminates duplication between Q&A, discussions, and other modules.
 */

/** Color classes per category slug — used by Q&A and Discussion cards. */
export const CATEGORY_COLORS: Record<string, string> = {
  academics: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  programming: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  projects: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  career: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  events: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  general: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  internships: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  research: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  academics: GraduationCap,
  programming: Code,
  projects: FolderKanban,
  career: Briefcase,
  events: Calendar,
  general: Globe,
  internships: Building,
  research: FlaskConical,
};

export function categoryColor(slug?: string): string {
  return (slug && CATEGORY_COLORS[slug]) || CATEGORY_COLORS.general;
}

export function categoryIcon(slug?: string): LucideIcon {
  return (slug && CATEGORY_ICONS[slug]) || CATEGORY_ICONS.general;
}
