import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroBanner } from "@/components/home/hero-banner";
import { QuickAccess } from "@/components/home/quick-access";
import { TrendingResources } from "@/components/home/trending-resources";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { TopContributors } from "@/components/home/top-contributors";
import { resourceService } from "@/services/resource.service";
import { gamificationService } from "@/services/gamification.service";
import { eventService } from "@/services/event.service";

export const metadata: Metadata = {
  title: "Home | Smart NUB Campus",
  description:
    "Smart NUB Campus dashboard — collaborate, learn, share resources and grow together at Northern University Bangladesh.",
  openGraph: {
    title: "Smart NUB Campus",
    description:
      "The exclusive academic platform for Northern University Bangladesh students.",
    type: "website",
  },
};

async function TrendingSection() {
  const result = await resourceService.listResources({
    sort: "popular",
    limit: 3,
  });
  return <TrendingResources resources={result.data ?? []} />;
}

async function EventsSection() {
  const result = await eventService.listEvents({
    status: "UPCOMING",
    limit: 3,
  });
  return <UpcomingEvents events={result.data ?? []} />;
}

async function ContributorsSection() {
  const result = await gamificationService.getLeaderboard(1, 3);
  return <TopContributors contributors={result.data ?? []} />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <QuickAccess />
      <section className="mx-auto max-w-360 px-4 pb-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
            <TrendingSection />
          </Suspense>
          <div className="space-y-8">
            <Suspense
              fallback={<Skeleton className="h-48 w-full rounded-xl" />}
            >
              <EventsSection />
            </Suspense>
            <Suspense
              fallback={<Skeleton className="h-40 w-full rounded-xl" />}
            >
              <ContributorsSection />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
