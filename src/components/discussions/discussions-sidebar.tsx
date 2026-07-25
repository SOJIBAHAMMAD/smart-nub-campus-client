"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, MessageCircle, Pin, ChevronDown } from "lucide-react";
import type { DiscussionCategory } from "@/types/discussion.types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DiscussionTab = "all" | "mine" | "bookmarks" | "replies";

const COLLAPSED_LIMIT = 6;

interface DiscussionsSidebarProps {
  activeTab: DiscussionTab;
  onTabChange: (tab: DiscussionTab) => void;
  selectedCategorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
  selectedTags: string[];
  onTagsChange: (slugs: string[]) => void;
  categories?: (DiscussionCategory & { _count: { discussions: number } })[];
  tags?: { id: string; name: string; slug: string }[];
}

const TABS: { id: DiscussionTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <MessageCircle className="size-4" /> },
  { id: "mine", label: "My Discussions", icon: <Pin className="size-4" /> },
  { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="size-4" /> },
  { id: "replies", label: "My Replies", icon: <MessageCircle className="size-4" /> },
];

/**
 * Left sidebar for the Discussions page.
 * Contains the Start button, tab navigation, category list with counts,
 * and a "Have a topic?" call-to-action.
 */
export function DiscussionsSidebar({
  activeTab,
  onTabChange,
  selectedCategorySlug,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  categories = [],
  tags = [],
}: DiscussionsSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="space-y-6">
      {/* ── Start button ─────────────────────────────────────────── */}
      <Link
        href="/discussions/create"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-10 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 active:translate-y-px"
      >
        <Plus className="size-4" />
        Start
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

      {/* ── Categories ───────────────────────────────────────────── */}
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
                    {cat._count.discussions}
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

      {/* ── Tags (multi-select, AND) ───────────────────────────── */}
      {tags.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </h3>
            {selectedTags.length > 0 && (
              <button
                onClick={() => onTagsChange([])}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                Clear ({selectedTags.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() =>
                    onTagsChange(
                      active
                        ? selectedTags.filter((s) => s !== tag.slug)
                        : [...selectedTags, tag.slug],
                    )
                  }
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Have a topic? CTA ───────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-semibold text-foreground">Have a topic?</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Click Start above to create a discussion and get the conversation going.
          </p>
          <Link
            href="/discussions/create"
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-success bg-success/2 px-2.5 py-1.5 text-xs font-medium text-success/90 transition-colors hover:bg-success/5"
          >
            Start Discussion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
