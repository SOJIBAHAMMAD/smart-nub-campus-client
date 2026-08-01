import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeStrip } from "@/components/home/welcome-strip";
import { TransitionBanner } from "@/components/alumni/transition-banner";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentActivity } from "@/components/home/recent-activity";
import { ForYou } from "@/components/home/for-you";
import { TrendingResources } from "@/components/home/trending-resources";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import {
  TopContributors,
  TopContributorsSkeleton,
} from "@/components/contributors/top-contributors";
import { resourceService } from "@/services/resource.service";
import { gamificationService } from "@/services/gamification.service";
import { eventService } from "@/services/event.service";
import { discussionService } from "@/services/discussion.service";
import { qaService } from "@/services/qa.service";
import { notificationService } from "@/services/notification.service";
import ROUTES from "@/constants/routes";

export const metadata: Metadata = {
  title: "Home | Smart NUB Campus",
  description:
    "Smart NUB Campus — study resources, project teams, AI assistance, and campus connections at Northern University Bangladesh.",
  openGraph: {
    title: "Smart NUB Campus",
    description:
      "The exclusive academic platform for Northern University Bangladesh students.",
    type: "website",
  },
};

// ── Data sections (server components) ─────────────────────────────────

async function ActivitySection() {
  const notifications = await notificationService
    .listNotifications({ limit: 5 })
    .then((result) => result.data ?? [])
    .catch(() => null);

  if (!notifications) {
    return <RecentActivity activities={[]} error />;
  }

  const activities = notifications.map((n) => {
    let type: "resource" | "question" | "team" | "discussion" | "connection" = "discussion";
    const t = n.type;
    if (t.startsWith("RESOURCE")) type = "resource";
    else if (t.startsWith("QUESTION")) type = "question";
    else if (t.startsWith("TEAM")) type = "team";
    else if (t.startsWith("DISCUSSION")) type = "discussion";
    else if (t.startsWith("CONNECTION")) type = "connection";

    return {
      id: n.id,
      type,
      action: n.title.toLowerCase(),
      target: n.message,
      targetId: n.link?.split("/").pop() ?? n.id,
      user: { name: n.sender?.name ?? "Someone" },
      timestamp: n.createdAt,
    };
  });

  return <RecentActivity activities={activities} />;
}

async function TrendingSection() {
  const resources = await resourceService
    .listResources({ sort: "popular", limit: 4 })
    .then((result) => result.data ?? [])
    .catch(() => null);

  if (!resources) {
    return <TrendingResources resources={[]} error />;
  }

  return <TrendingResources resources={resources} />;
}

async function ForYouSection() {
  const items = await Promise.all([
    discussionService.getTrending(2).catch(() => []),
    qaService.getTrending(2).catch(() => []),
    resourceService.listResources({ sort: "newest", limit: 2 }).catch(() => ({ data: [] })),
  ]).then(
    ([discussions, questions, resources]) => [
      ...discussions.map((d) => ({
        id: d.id,
        type: "discussion" as const,
        title: d.title,
        subtitle: `${d.replyCount} replies · ${d.author?.name ?? "Unknown"}`,
        href: ROUTES.DISCUSSION(d.id),
        tags: d.discussionTags?.slice(0, 2).map((t) => t.tag?.name).filter(Boolean) as string[] | undefined,
      })),
      ...questions.map((q) => ({
        id: q.id,
        type: "question" as const,
        title: q.title,
        subtitle: `${q.answerCount} answers`,
        href: ROUTES.QUESTION(q.id),
        tags: q.questionTags?.slice(0, 2).map((t) => t.tag?.name).filter(Boolean) as string[] | undefined,
      })),
      ...(resources.data ?? []).map((r) => ({
        id: r.id,
        type: "resource" as const,
        title: r.title,
        subtitle: `${r.course?.code ?? "General"} · ${r.upvoteCount} upvotes`,
        href: ROUTES.RESOURCE(r.id),
        tags: r.resourceTags?.slice(0, 2).map((t) => t.tag?.name).filter(Boolean) as string[] | undefined,
      })),
    ],
    () => null,
  );

  if (!items) {
    return <ForYou items={[]} error />;
  }

  return <ForYou items={items} />;
}

async function EventsSection() {
  const events = await eventService
    .listEvents({ status: "UPCOMING", limit: 4 })
    .then((result) => result.data ?? [])
    .catch(() => null);

  if (!events) {
    return <UpcomingEvents events={[]} error />;
  }

  return <UpcomingEvents events={events} />;
}

async function ContributorsSection() {
  const contributors = await gamificationService
    .getLeaderboard({ page: 1, limit: 4 })
    .then((result) =>
      (result.data ?? []).map((c) => ({
        rank: c.rank,
        name: c.user?.name ?? "Unknown",
        image: c.user?.image,
        score: c.totalPoints,
      })),
    )
    .catch(() => null);

  if (!contributors) {
    return <TopContributors contributors={[]} error />;
  }

  return (
    <TopContributors
      contributors={contributors}
      scoreLabel="points"
      viewAllHref={ROUTES.LEADERBOARD}
    />
  );
}

// ── Skeleton loaders ─────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ForYouSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-24" />
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}

function ResourcesSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <WelcomeStrip />

      <div className="mx-auto grid max-w-screen-2xl gap-8 px-6 py-8 xl:px-8 lg:grid-cols-[1fr_340px]">
        {/* ── Left Column: Do ─────────────────────────────── */}
        <div className="space-y-10">
          <Suspense fallback={null}>
            <TransitionBanner />
          </Suspense>

          <QuickActions />

          <Suspense fallback={<ActivitySkeleton />}>
            <ActivitySection />
          </Suspense>

          <Suspense fallback={<ResourcesSkeleton />}>
            <TrendingSection />
          </Suspense>
        </div>

        {/* ── Right Column: Discover ──────────────────────── */}
        <aside className="space-y-8">
          <Suspense fallback={<ForYouSkeleton />}>
            <ForYouSection />
          </Suspense>

          <Suspense fallback={<EventsSkeleton />}>
            <EventsSection />
          </Suspense>

          <Suspense fallback={<TopContributorsSkeleton />}>
            <ContributorsSection />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
