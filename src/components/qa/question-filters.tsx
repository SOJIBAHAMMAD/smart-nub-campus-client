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
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { QuestionCategory } from "@/types/qa.types";
import { cn } from "@/lib/utils";

export type QASortOption = "latest" | "trending" | "most_answered" | "unanswered";

const SORT_OPTIONS: { value: QASortOption; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "most_answered", label: "Most Answered" },
  { value: "unanswered", label: "Unanswered" },
];

interface QuestionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
  sort: QASortOption;
  onSortChange: (sort: QASortOption) => void;
  categories: (QuestionCategory & { _count: { questions: number } })[];
  mobileFiltersOpen: boolean;
  onOpenMobileFilters: () => void;
  onCloseMobileFilters: () => void;
}

export function QuestionFilters({
  search,
  onSearchChange,
  categorySlug,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
  mobileFiltersOpen,
  onOpenMobileFilters,
  onCloseMobileFilters,
}: QuestionFiltersProps) {
  return (
    <div className="space-y-3">
      {/* ── Search + sort row ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search questions..."
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

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Select
              value={sort}
              onValueChange={(v) => onSortChange(v as QASortOption)}
            >
              <SelectTrigger className="h-9 w-36">
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
          </div>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={onOpenMobileFilters}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* ── Sort tabs (mobile) ─────────────────────────────────── */}
      <div className="flex gap-2 sm:hidden">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              sort === opt.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Active filter badges ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categorySlug && (
          <Badge variant="secondary" className="h-6 gap-1 rounded-full pr-1">
            {categories?.find((c) => c.slug === categorySlug)?.name ?? categorySlug}
            <button
              onClick={() => onCategoryChange(null)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
              aria-label="Remove category filter"
            >
              <X className="size-3" />
            </button>
          </Badge>
        )}
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={(open) => { if (!open) onCloseMobileFilters(); }}>
        <SheetContent side="bottom" showCloseButton>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your question list</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Sort</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSortChange(opt.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      sort === opt.value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    !categorySlug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.slug === categorySlug ? null : cat.slug)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                      categorySlug === cat.slug
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}