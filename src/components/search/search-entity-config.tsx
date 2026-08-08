import {
  BookOpen,
  Briefcase,
  CalendarDays,
  GraduationCap,
  Handshake,
  HelpCircle,
  MessageSquare,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import type {
  SearchEntity,
  SearchEntityFilter,
  SearchResultItem,
} from "@/types/search.types";

export interface SearchEntityConfig {
  entity: SearchEntity;
  label: string;
  pluralLabel: string;
  icon: LucideIcon;
  /** Build the detail route for a result. Falls back to the server-provided url. */
  buildRoute: (item: SearchResultItem) => string | null;
}

export const SEARCH_ENTITY_ORDER: SearchEntity[] = [
  "resources",
  "discussions",
  "questions",
  "teams",
  "events",
  "courses",
  "jobs",
  "people",
  "mentorship",
];

export const SEARCH_ENTITY_CONFIG: Record<SearchEntity, SearchEntityConfig> = {
  resources: {
    entity: "resources",
    label: "Resource",
    pluralLabel: "Resources",
    icon: BookOpen,
    buildRoute: (item) =>
      item.url ?? (item.id ? ROUTES.RESOURCE(item.id) : null),
  },
  discussions: {
    entity: "discussions",
    label: "Discussion",
    pluralLabel: "Discussions",
    icon: MessageSquare,
    buildRoute: (item) =>
      item.url ?? (item.id ? ROUTES.DISCUSSION(item.id) : null),
  },
  questions: {
    entity: "questions",
    label: "Question",
    pluralLabel: "Questions",
    icon: HelpCircle,
    buildRoute: (item) => item.url ?? (item.id ? ROUTES.QUESTION(item.id) : null),
  },
  teams: {
    entity: "teams",
    label: "Team",
    pluralLabel: "Teams",
    icon: Users,
    buildRoute: (item) => item.url ?? (item.id ? ROUTES.TEAM(item.id) : null),
  },
  events: {
    entity: "events",
    label: "Event",
    pluralLabel: "Events",
    icon: CalendarDays,
    buildRoute: (item) => item.url ?? (item.id ? ROUTES.EVENT(item.id) : null),
  },
  courses: {
    entity: "courses",
    label: "Course",
    pluralLabel: "Courses",
    icon: GraduationCap,
    buildRoute: (item) => item.url ?? null,
  },
  jobs: {
    entity: "jobs",
    label: "Job",
    pluralLabel: "Jobs",
    icon: Briefcase,
    buildRoute: (item) => item.url ?? (item.id ? ROUTES.JOB(item.id) : null),
  },
  people: {
    entity: "people",
    label: "Person",
    pluralLabel: "People",
    icon: User,
    buildRoute: (item) => {
      if (item.url) return item.url;
      const userId =
        (item.data?.userId as string | undefined) ??
        (item.data?.id as string | undefined) ??
        item.id;
      return userId ? ROUTES.USER_PROFILE(userId) : null;
    },
  },
  mentorship: {
    entity: "mentorship",
    label: "Mentorship",
    pluralLabel: "Mentorship",
    icon: Handshake,
    buildRoute: (item) => {
      if (item.url) return item.url;
      const userId =
        (item.data?.userId as string | undefined) ??
        (item.data?.id as string | undefined) ??
        item.id;
      return userId ? ROUTES.USER_PROFILE(userId) : null;
    },
  },
};

export interface SearchTabConfig {
  entity: SearchEntityFilter;
  label: string;
}

/** Tabs for the SERP page: "All" first, then each searchable entity. */
export const SEARCH_TABS: SearchTabConfig[] = [
  { entity: "all", label: "All" },
  ...SEARCH_ENTITY_ORDER.map((entity) => ({
    entity: entity as SearchEntityFilter,
    label: SEARCH_ENTITY_CONFIG[entity].pluralLabel,
  })),
];

export function getEntityConfig(
  entity: SearchEntityFilter,
): SearchEntityConfig | null {
  return entity === "all" ? null : SEARCH_ENTITY_CONFIG[entity];
}
