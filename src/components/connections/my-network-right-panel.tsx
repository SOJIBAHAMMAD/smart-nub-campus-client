"use client";

import { NetworkStrength } from "./network-strength";
import { ActiveUsers } from "./active-users";
import { SuggestedPeople } from "./suggested-people";
import { PopularSkills } from "./popular-skills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Sparkles, Zap } from "lucide-react";
import type { PeopleCardUser } from "./people-card";
import type { ConnectionOverview as Overview } from "@/types";

interface MyNetworkRightPanelProps {
  overview: Overview;
  suggestions: PeopleCardUser[];
  popularSkills: { id: string; name: string; slug: string; count?: number }[];
  onSkillSelect?: (id: string) => void;
  activeSkills?: string[];
  onChanged?: () => void;
}

export function MyNetworkRightPanel({
  overview,
  suggestions,
  popularSkills,
  onSkillSelect,
  activeSkills = [],
  onChanged,
}: MyNetworkRightPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="border-l-2 border-l-primary/40">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Network Strength</h3>
          </div>
          <NetworkStrength overview={overview} />
        </CardContent>
      </Card>

      <Card className="border-l-2 border-l-emerald-500/40">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Zap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Active on Campus</h3>
          </div>
          <ActiveUsers onChanged={onChanged} />
        </CardContent>
      </Card>

      <Card className="border-l-2 border-l-violet-500/40">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10">
              <Users className="size-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">People You May Know</h3>
          </div>
          <SuggestedPeople people={suggestions} onChanged={onChanged} />
        </CardContent>
      </Card>

      <Card className="border-l-2 border-l-amber-500/40">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Popular Skills</h3>
          </div>
          <PopularSkills
            skills={popularSkills}
            onSelect={onSkillSelect}
            active={activeSkills}
          />
        </CardContent>
      </Card>
    </div>
  );
}
