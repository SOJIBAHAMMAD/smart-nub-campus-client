"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, MessageCircle, CheckCircle, Users, ChevronDown } from "lucide-react";
import type { QuestionCategory } from "@/types/qa.types";
import {
  TopContributors,
  type TopContributor,
} from "@/components/contributors/top-contributors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type QATab = "all" | "answered" | "unanswered" | "bookmarked";

const COLLAPSED_LIMIT = 6;

interface QASidebarProps {
  activeTab: QATab;
  onTabChange: (tab: QATab) => void;
  selectedCategorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
  categories?: (QuestionCategory & { _count: { questions: number } })[];
  contributors?: TopContributor[];
}

const TABS: { id: QATab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <MessageCircle className="size-4" /> },
  { id: "answered", label: "Answered", icon: <CheckCircle className="size-4" /> },
  { id: "unanswered", label: "Unanswered", icon: <MessageCircle className="size-4" /> },
  { id: "bookmarked", label: "Bookmarked", icon: <Bookmark className="size-4" /> },
];

/**
 * Left sidebar for the Q&A page.
 * Contains the Ask button, tab navigation, category list with counts,
 * and top contributors.
 */
export function QASidebar({
  activeTab,
  onTabChange,
  selectedCategorySlug,
  onCategoryChange,
  categories = [],
  contributors = [],
}: QASidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="space-y-6">
      {/* ── Ask button ─────────────────────────────────────────── */}
      <Button
        variant="default"
        className="w-full gap-1.5"
        nativeButton={false}
        render={<Link href="/qa/ask" />}
      >
        <Plus className="size-4" />
        Ask a Question
      </Button>

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

      {/* ── Categories ──────────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h3>
        {categories.length > 0 ? (
          <>
            <nav className="space-y-0.5">
              <button
                onClick={() => onCategoryChange(null)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
                  selectedCategorySlug === null
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>All Categories</span>
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.slug)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
                    selectedCategorySlug === cat.slug
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {cat._count.questions}
                  </span>
                </button>
              ))}
            </nav>
            {categories.length > COLLAPSED_LIMIT && (
              <button
                onClick={() => setShowAllCategories((v) => !v)}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showAllCategories ? "Show less" : "Show more"}
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    showAllCategories && "rotate-180",
                  )}
                />
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No categories found.</p>
        )}
      </div>

      {/* ── Top Contributors ─────────────────────────────────────── */}
      {contributors.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Contributors
            </h3>
          </div>
          <TopContributors
            contributors={contributors}
            variant="compact"
            scoreLabel="questions"
          />
        </div>
      )}
    </div>
  );
}
