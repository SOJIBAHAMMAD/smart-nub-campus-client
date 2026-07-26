"use client";

import { NetworkStrength } from "./network-strength";
import { ActiveUsers } from "./active-users";
import { SuggestedPeople } from "./suggested-people";
import { PopularSkills } from "./popular-skills";
import { Separator } from "@/components/ui/separator";
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
    <div className="space-y-6">
      <NetworkStrength overview={overview} />

      <Separator />

      <ActiveUsers onChanged={onChanged} />

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          People You May Know
        </h3>
        <SuggestedPeople people={suggestions} onChanged={onChanged} />
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Popular Skills
        </h3>
        <PopularSkills
          skills={popularSkills}
          onSelect={onSkillSelect}
          active={activeSkills}
        />
      </div>
    </div>
  );
}
