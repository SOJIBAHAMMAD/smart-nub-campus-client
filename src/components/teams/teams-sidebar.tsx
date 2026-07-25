"use client";

import Link from "next/link";
import { Plus, Users, Inbox, FolderKanban, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TagPill } from "@/components/ui/tag-pill";
import { POPULAR_SKILLS } from "@/constants/team";

export type TeamsTab = "finder" | "applications" | "teams";

interface TeamsSidebarProps {
  activeTab: TeamsTab;
  onTabChange: (tab: TeamsTab) => void;
  /** Selected skill slugs used to filter the finder (multi-select). */
  selectedSkills?: string[];
  onSkillToggle?: (skill: string) => void;
  /** Clears all selected skills. */
  onSkillsClear?: () => void;
}

const TABS: { id: TeamsTab; label: string; icon: React.ReactNode }[] = [
  { id: "finder", label: "Team Finder", icon: <Users className="size-4" /> },
  { id: "applications", label: "My Applications", icon: <Inbox className="size-4" /> },
  { id: "teams", label: "My Teams", icon: <FolderKanban className="size-4" /> },
];

/**
 * Left sidebar for the Teams page.
 * Contains the create button, primary tabs, a quick guide, and popular skills chips.
 */
export function TeamsSidebar({
  activeTab,
  onTabChange,
  selectedSkills = [],
  onSkillToggle,
  onSkillsClear,
}: TeamsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* ── Create button ────────────────────────────────────────── */}
      <Link
        href="/teams/create"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-10 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 active:translate-y-px"
      >
        <Plus className="size-4" />
        Create
      </Link>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <nav className="space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Quick Guide ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-3 ring-1 ring-foreground/10">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Guide
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Discover and join project teams at NUB. Browse open requests, apply with a
            short message, or create your own team and invite members with the right
            skills.
          </p>
        </CardContent>
      </Card>

      {/* ── Popular Skills ───────────────────────────────────────── */}
      {onSkillToggle && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular Skills
            </h3>
            {selectedSkills.length > 0 && onSkillsClear && (
              <button
                onClick={onSkillsClear}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                Clear ({selectedSkills.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map((skill) => {
              const slug = skill.toLowerCase();
              const active = selectedSkills.includes(slug);
              return (
                <TagPill
                  key={skill}
                  name={skill}
                  active={active}
                  onClick={() => onSkillToggle(slug)}

                />
              );
            })}
          </div>
          {selectedSkills.length > 0 && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Filtering by {selectedSkills.length} skill
              {selectedSkills.length === 1 ? "" : "s"} (any match).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
