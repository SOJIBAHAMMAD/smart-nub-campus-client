import type { Metadata } from "next";
import { Suspense } from "react";
import { eventService } from "@/services/event.service";
import { PageLayoutSkeleton } from "@/components/skeletons/page-layout-skeleton";
import { EventsListClient } from "@/components/events/events-list-client";
import type { Event } from "@/types/event.types";
import type { PaginationMeta } from "@/types/resource.types";

export const metadata: Metadata = {
  title: "Events | Smart NUB Campus",
  description:
    "Browse upcoming campus events at Northern University Bangladesh — workshops, seminars, and more.",
  openGraph: {
    title: "Events | Smart NUB Campus",
    description: "Browse upcoming campus events at NUB.",
    type: "website",
  },
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;
  const search = typeof params.search === "string" ? params.search : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;

  let events: Event[] = [];
  let meta: PaginationMeta | null = null;

  try {
    const result = await eventService.listEvents({
      page,
      limit: 12,
      search,
      status: status as
        | "UPCOMING"
        | "ONGOING"
        | "COMPLETED"
        | "CANCELLED"
        | undefined,
      type: type === "reunion" ? "reunion" : undefined,
    });
    events = result.data ?? [];
    meta = result.meta ?? null;
  } catch {
    // Client component handles empty state gracefully
  }

  return (
    <Suspense fallback={<PageLayoutSkeleton />}>
      <EventsListClient
        initialEvents={events}
        initialMeta={meta}
        initialFilters={{ search: search ?? "", status: status ?? null, page, type: type === "reunion" ? "reunion" : null }}
      />
    </Suspense>
  );
}
