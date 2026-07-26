import type { Metadata } from "next";
import { ConnectionsClient } from "@/components/connections/connections-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connections | Smart NUB Campus",
  description:
    "Build your academic network — find classmates, form study groups and connect with peers at NUB.",
  openGraph: {
    title: "Connections | Smart NUB Campus",
    description:
      "Build your academic network at Northern University Bangladesh.",
    type: "website",
  },
};
import {
  getOverviewAction,
  getSuggestionsAction,
} from "@/actions/connection.actions";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import type { ConnectionOverview, SuggestedPerson } from "@/types";

/** Default popular skills surfaced in the right sidebar. */
const DEFAULT_POPULAR_SKILLS = [
  { id: "react", name: "React", slug: "react" },
  { id: "python", name: "Python", slug: "python" },
  { id: "dsa", name: "DSA", slug: "dsa" },
  { id: "java", name: "Java", slug: "java" },
  { id: "node", name: "Node.js", slug: "node" },
  { id: "sql", name: "SQL", slug: "sql" },
];

/**
 * Connections page — Server Component.
 * Loads the initial overview + suggestions, then delegates to the client
 * component which manages tabs, search, filters, and optimistic mutations.
 */
export default async function ConnectionsPage() {
  let overview: ConnectionOverview = {
    totalConnections: 0,
    pending: 0,
    sent: 0,
    favorites: 0,
    blocked: 0,
  };
  let suggestions: SuggestedPerson[] = [];

  try {
    const [overviewRes, suggestionsRes] = await Promise.all([
      getOverviewAction(),
      getSuggestionsAction(),
    ]);
    if (overviewRes.success && overviewRes.data) {
      overview = overviewRes.data as ConnectionOverview;
    }
    if (suggestionsRes.success && suggestionsRes.data) {
      suggestions = suggestionsRes.data as SuggestedPerson[];
    }
  } catch {
    // Client handles empty state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <ConnectionsClient
        initialOverview={overview}
        initialSuggestions={suggestions}
        initialPopularSkills={DEFAULT_POPULAR_SKILLS}
      />
    </Suspense>
  );
}
