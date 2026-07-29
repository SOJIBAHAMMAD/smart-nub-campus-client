"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiscussionCategory } from "@/types/discussion.types";
import { cn } from "@/lib/utils";

export type SortOption = "latest" | "popular" | "unanswered";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "unanswered", label: "Unanswered" },
];

interface DiscussionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
  selectedTags: string[];
  onTagsChange: (slugs: string[]) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  categories: (DiscussionCategory & { _count: { discussions: number } })[];
  tags: { id: string; name: string; slug: string }[];
  showMobileFilters: boolean;
  onToggleMobileFilters: () => void;
}

export function DiscussionFilters({
  search,
  onSearchChange,
  categorySlug,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  sort,
  onSortChange,
  categories,
  tags,
  showMobileFilters,
  onToggleMobileFilters,
}: DiscussionFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search discussions..."
            className="h-9 pl-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Select
            value={sort}
            onValueChange={(v) => onSortChange((v ?? "latest") as SortOption)}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={onToggleMobileFilters}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="sm:hidden"
          onClick={onToggleMobileFilters}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-2 sm:hidden">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              sort === opt.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showMobileFilters && (
        <div className="rounded-xl border bg-card p-4 sm:hidden">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <select
                value={categorySlug ?? ""}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className="mt-1 h-8 w-full rounded-md border bg-transparent px-2 text-xs outline-none ring-1 ring-foreground/10"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Tags</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.slug);
                  return (
                    <button
                      key={tag.id}
                      type="button"
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
          </div>
        </div>
      )}
    </div>
  );
}
