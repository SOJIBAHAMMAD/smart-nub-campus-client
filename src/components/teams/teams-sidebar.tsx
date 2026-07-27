"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { Plus, Users, Inbox, FolderKanban, Lightbulb, Bookmark, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TagPill } from "@/components/ui/tag-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { getPopularSkills, getCategoryCounts } from "@/actions/team.actions";
import { DIFFICULTY_OPTIONS, MEETING_PREFERENCE_OPTIONS } from "@/constants/team";
import type { TeamCategoryCount, TeamPopularSkill } from "@/types/team.types";

export type TeamsTab = "finder" | "applications" | "teams" | "bookmarked";

interface TeamsSidebarProps {
  activeTab: TeamsTab;
  onTabChange: (tab: TeamsTab) => void;
  selectedSkills?: string[];
  onSkillToggle?: (skill: string) => void;
  onSkillsClear?: () => void;
  selectedCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  activeFilters?: { difficulty?: string | null; meetingPreference?: string | null };
  onFilterChange?: (filters: { difficulty?: string | null; meetingPreference?: string | null }) => void;
}

const TABS: { id: TeamsTab; label: string; icon: React.ReactNode }[] = [
  { id: "finder", label: "Team Finder", icon: <Users className="size-4" /> },
  { id: "applications", label: "My Applications", icon: <Inbox className="size-4" /> },
  { id: "teams", label: "My Teams", icon: <FolderKanban className="size-4" /> },
  { id: "bookmarked", label: "Bookmarked", icon: <Bookmark className="size-4" /> },
];

export function TeamsSidebar({
  activeTab,
  onTabChange,
  selectedSkills = [],
  onSkillToggle,
  onSkillsClear,
  selectedCategory,
  onCategoryChange,
  activeFilters,
  onFilterChange,
}: TeamsSidebarProps) {
  const [skills, setSkills] = useState<TeamPopularSkill[]>([]);
  const [categories, setCategories] = useState<TeamCategoryCount[]>([]);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [skillsRes, catsRes] = await Promise.all([
          getPopularSkills(),
          getCategoryCounts(),
        ]);
        if (skillsRes.success && skillsRes.data) {
          setSkills(skillsRes.data as TeamPopularSkill[]);
        }
        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data as TeamCategoryCount[]);
        }
      } catch {
        // Fallback to static data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const sortedSkills = [...skills].sort((a, b) => {
    const aSelected = selectedSkills.includes(a.name.toLowerCase());
    const bSelected = selectedSkills.includes(b.name.toLowerCase());
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const displayedSkills = skillsExpanded ? sortedSkills : sortedSkills.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* ── Create button ────────────────────────────────────── */}
      <Link
        href="/teams/create"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-10 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 active:translate-y-px"
      >
        <Plus className="size-4" />
        Create
      </Link>

      {/* ── Tabs ─────────────────────────────────────────────── */}
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

      {/* ── Quick Guide ─────────────────────────────────────── */}
      <Card>
        <CardContent className="p-3 ring-1 ring-foreground/10">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Guide
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Browse open team requests, apply with a message, or create your own team
            and find members with the right skills.
          </p>
        </CardContent>
      </Card>

      {/* ── Popular Skills (Dynamic) ─────────────────────────── */}
      {onSkillToggle && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skills
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
          {loading ? (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {displayedSkills.map((skill) => {
                  const slug = skill.name.toLowerCase();
                  const active = selectedSkills.includes(slug);
                  return (
                    <TagPill
                      key={skill.tagId}
                      name={skill.name}
                      active={active}
                      onClick={() => onSkillToggle(slug)}
                    />
                  );
                })}
              </div>
              {skills.length > 10 && (
                <button
                  onClick={() => setSkillsExpanded(!skillsExpanded)}
                  className="mt-2 flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
                >
                  {skillsExpanded ? "Show less" : `Show all ${skills.length}`}
                  {skillsExpanded ? (
                    <ChevronDown className="size-3 transition-transform" />
                  ) : (
                    <ChevronRight className="size-3" />
                  )}
                </button>
              )}
              {selectedSkills.length > 0 && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Filtering by {selectedSkills.length} skill
                  {selectedSkills.length === 1 ? "" : "s"} (any match).
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Categories (Dynamic, Collapsible) ───────────────── */}
      {categories.length > 0 && onCategoryChange && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            {selectedCategory && (
              <button
                onClick={() => onCategoryChange(null)}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {(categoriesExpanded ? categories : categories.slice(0, 6)).map((cat) => {
              const active = selectedCategory === cat.category;
              return (
                <button
                  key={cat.category}
                  onClick={() => onCategoryChange(active ? null : cat.category)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="truncate">{cat.category}</span>
                  <span className={cn("shrink-0 ml-2 tabular-nums", active ? "text-primary/70" : "text-foreground/40")}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
          {categories.length > 6 && (
            <button
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              className="mt-2 flex items-center gap-0.5 text-[10px] font-medium text-primary hover:underline"
            >
              {categoriesExpanded ? "Show less" : `Show all ${categories.length}`}
              {categoriesExpanded ? (
                <ChevronDown className="size-3 transition-transform" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Difficulty Levels ──────────────────────────────── */}
      {onFilterChange && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Difficulty
          </h3>
          <div className="space-y-1">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const active = activeFilters?.difficulty === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    onFilterChange({ difficulty: active ? null : opt.value })
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Meeting Preference ─────────────────────────────── */}
      {onFilterChange && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Meeting Preference
          </h3>
          <div className="space-y-1">
            {MEETING_PREFERENCE_OPTIONS.map((opt) => {
              const active = activeFilters?.meetingPreference === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    onFilterChange({ meetingPreference: active ? null : opt.value })
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
