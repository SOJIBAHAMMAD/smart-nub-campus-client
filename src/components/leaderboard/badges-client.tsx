"use client";

import {
  Award,
  GraduationCap,
  Users,
  Heart,
  UserPlus,
  Flag,
  Shield,
  Trophy,
} from "lucide-react";
import type {
  BadgeCategory,
  BadgeTier,
} from "@/types/gamification.types";
import { BadgeIcon } from "@/components/ui/badge-icon";

/**
 * Minimal badge shape shared by both the current-user badges endpoint
 * (UserBadge[]) and the public-profile badges endpoint (ProfileBadge[]).
 * The `badge` object is optional because either source may omit it.
 */
export interface BadgeDisplayItem {
  id: string;
  unlockedAt: string;
  badge?: {
    name: string;
    description: string;
    icon?: string | null;
    category: BadgeCategory;
    tier: BadgeTier;
    points: number;
  };
}

interface BadgesClientProps {
  badges: BadgeDisplayItem[];
  totalPoints: number;
  userName?: string;
}

const CATEGORY_CONFIG: Record<
  BadgeCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  ACADEMIC: {
    label: "Academic",
    icon: GraduationCap,
    description: "Excellence in academic resource sharing",
  },
  COMMUNITY: {
    label: "Community",
    icon: Users,
    description: "Building a strong campus community",
  },
  CONTRIBUTION: {
    label: "Contribution",
    icon: Heart,
    description: "Active participation and contributions",
  },
  NETWORKING: {
    label: "Networking",
    icon: UserPlus,
    description: "Growing your campus connections",
  },
  MILESTONES: {
    label: "Milestones",
    icon: Flag,
    description: "Achieving platform milestones",
  },
  REPUTATION: {
    label: "Reputation",
    icon: Shield,
    description: "Earning trust and recognition",
  },
};

const TIER_STYLES: Record<
  BadgeTier,
  { border: string; bg: string; text: string; label: string }
> = {
  BRONZE: {
    border: "border-amber-700/25",
    bg: "bg-amber-700/5",
    text: "text-amber-700 dark:text-amber-500",
    label: "Bronze",
  },
  SILVER: {
    border: "border-slate-400/25",
    bg: "bg-slate-400/5",
    text: "text-slate-500 dark:text-slate-300",
    label: "Silver",
  },
  GOLD: {
    border: "border-yellow-500/25",
    bg: "bg-yellow-500/5",
    text: "text-yellow-600 dark:text-yellow-400",
    label: "Gold",
  },
  PLATINUM: {
    border: "border-purple-500/25",
    bg: "bg-purple-500/5",
    text: "text-purple-600 dark:text-purple-400",
    label: "Platinum",
  },
};

export function BadgesClient({
  badges,
  totalPoints,
  userName,
}: BadgesClientProps) {
  const grouped = badges.reduce(
    (acc, ub) => {
      const category = ub.badge?.category ?? "REPUTATION";
      if (!acc[category]) acc[category] = [];
      acc[category].push(ub);
      return acc;
    },
    {} as Record<BadgeCategory, BadgeDisplayItem[]>,
  );

  const categories = Object.keys(grouped) as BadgeCategory[];
  const totalBadgePoints = badges.reduce(
    (sum, ub) => sum + (ub.badge?.points ?? 0),
    0,
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {userName ? `${userName}'s Badges` : "My Badges"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {userName
              ? `Achievements ${userName} has earned by contributing to the Smart NUB Campus community.`
              : "Achievements earned by contributing to the Smart NUB Campus community."}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {badges.length}
                </p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalBadgePoints.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Points from Badges
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Reputation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 py-20">
            <Award className="size-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              No badges yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Contribute resources, join discussions, and help peers to earn
              badges.
            </p>
          </div>
        ) : (
          /* Badges by category */
          <div className="space-y-10">
            {categories.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const categoryBadges = grouped[category];

              return (
                <section key={category}>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {config.label}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {categoryBadges.length} badge
                      {categoryBadges.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryBadges.map((userBadge) => {
                      const badge = userBadge.badge;
                      if (!badge) return null;
                      const tier = TIER_STYLES[badge.tier];

                      return (
                        <div
                          key={userBadge.id}
                          className={`group rounded-xl border p-4 transition-all duration-200 hover:border-primary/20 hover:bg-muted/30 ${tier.border} ${tier.bg}`}
                        >
                          <div className="flex items-start gap-3">
                            <BadgeIcon
                              icon={badge.icon}
                              tier={badge.tier}
                              size="md"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium text-foreground">
                                  {badge.name}
                                </span>
                                <span
                                  className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${tier.border} ${tier.text}`}
                                >
                                  {tier.label}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {badge.description}
                              </p>
                              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                                {badge.points > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Trophy className="size-3 text-amber-500" />
                                    {badge.points} pts
                                  </span>
                                )}
                                <span>
                                  Unlocked {formatTimeAgo(userBadge.unlockedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "just now";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
