import type { Metadata } from "next";
import { MyNetworkClient } from "@/components/connections/my-network-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "My Network | Smart NUB Campus",
  description:
    "Build your academic network — find classmates, form study groups and connect with peers at NUB.",
  openGraph: {
    title: "My Network | Smart NUB Campus",
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

const DEFAULT_POPULAR_SKILLS = [
  { id: "react", name: "React", slug: "react" },
  { id: "python", name: "Python", slug: "python" },
  { id: "dsa", name: "DSA", slug: "dsa" },
  { id: "java", name: "Java", slug: "java" },
  { id: "node", name: "Node.js", slug: "node" },
  { id: "sql", name: "SQL", slug: "sql" },
];

export default async function MyNetworkPage() {
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
      <MyNetworkClient
        initialOverview={overview}
        initialSuggestions={suggestions}
        initialPopularSkills={DEFAULT_POPULAR_SKILLS}
      />
    </Suspense>
  );
}
