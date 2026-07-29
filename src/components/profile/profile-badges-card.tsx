"use client";

import { Award, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProfileUser, ProfileBadge } from "@/types/profile.types";

interface ProfileBadgesCardProps {
  profileData: ProfileUser;
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-amber-700/10 text-amber-700 border-amber-700/30",
  SILVER: "bg-gray-400/10 text-gray-500 border-gray-400/30",
  GOLD: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  PLATINUM: "bg-purple-500/10 text-purple-600 border-purple-500/30",
};

const TIER_ICONS: Record<string, string> = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "💎",
};

export function ProfileBadgesCard({ profileData }: ProfileBadgesCardProps) {
  const badgesSummary = profileData.badges;

  if (!badgesSummary || badgesSummary.total === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="size-4" />
          Badges
          <Badge variant="secondary" className="text-xs">
            {badgesSummary.total}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-5 sm:pb-6">
        <div className="space-y-2">
          {badgesSummary.items.map((userBadge: ProfileBadge) => (
            <div
              key={userBadge.id}
              className="flex items-center gap-3 rounded-lg border p-2.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
                {userBadge.badge.icon ?? TIER_ICONS[userBadge.badge.tier] ?? "🏆"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{userBadge.badge.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${TIER_COLORS[userBadge.badge.tier] ?? ""}`}
                  >
                    {userBadge.badge.tier}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {userBadge.badge.description}
                </p>
              </div>
              {userBadge.badge.points > 0 && (
                <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600">
                  <Trophy className="size-3" />
                  {userBadge.badge.points}
                </span>
              )}
            </div>
          ))}
        </div>
        {badgesSummary.total > 3 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            +{badgesSummary.total - 3} more badge{badgesSummary.total - 3 > 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
