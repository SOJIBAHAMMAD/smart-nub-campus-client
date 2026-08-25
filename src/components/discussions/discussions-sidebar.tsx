"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bookmark, MessageCircle, Pin, ChevronDown, Sparkles } from "lucide-react";
import type { DiscussionCategory } from "@/types/discussion.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TagPill } from "@/components/ui/tag-pill";

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
  { id: "all", label: "All Discussions", icon: <MessageCircle className="size-4" /> },
  { id: "mine", label: "My Discussions", icon: <Pin className="size-4" /> },
  { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="size-4" /> },
  { id: "replies", label: "My Replies", icon: <MessageCircle className="size-4" /> },
];

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
      <Button className="w-full gap-1.5" render={<Link href="/discussions/create" />} nativeButton={false}>
        <Plus className="size-4" />
        Start Discussion
      </Button>

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
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-0.5">
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
                </div>
              </ScrollArea>
            </nav>
            {categories.length > COLLAPSED_LIMIT && (
              <button
                onClick={() => setShowAllCategories((v) => !v)}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showAllCategories ? "Show less" : `Show all (${categories.length})`}
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
                <TagPill
                  key={tag.id}
                  name={tag.name}
                  active={active}
                  onClick={() =>
                    onTagsChange(
                      active
                        ? selectedTags.filter((s) => s !== tag.slug)
                        : [...selectedTags, tag.slug],
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Have a topic?</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Start a discussion and get the community talking.
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full" render={<Link href="/discussions/create" />} nativeButton={false}>
            Start Discussion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
