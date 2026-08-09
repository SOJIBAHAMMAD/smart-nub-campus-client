"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search, X, XCircle } from "lucide-react";
import type {
  AdminCourse,
  AdminResourceCategory,
  AdminResourceSort,
} from "@/types/admin.types";

export const SORT_OPTIONS: { value: AdminResourceSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "downloads", label: "Most Downloads" },
  { value: "upvotes", label: "Most Upvotes" },
  { value: "reports", label: "Most Reports" },
  { value: "views", label: "Most Views" },
];

interface ResourceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  verifiedFilter: string;
  onVerifiedFilterChange: (value: string) => void;
  courseFilter: string;
  onCourseFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  sort: AdminResourceSort;
  onSortChange: (value: AdminResourceSort) => void;
  courses: AdminCourse[];
  categories: AdminResourceCategory[];
  resultCount?: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

interface FilterChip {
  key: string;
  label: string;
  onClear: () => void;
}

export function ResourceFilters({
  search,
  onSearchChange,
  verifiedFilter,
  onVerifiedFilterChange,
  courseFilter,
  onCourseFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sort,
  onSortChange,
  courses,
  categories,
  resultCount,
  hasActiveFilters,
  onClearFilters,
}: ResourceFiltersProps) {
  const chips: FilterChip[] = [];

  if (search) {
    chips.push({
      key: "search",
      label: `Search "${search}"`,
      onClear: () => onSearchChange(""),
    });
  }
  if (verifiedFilter !== "all") {
    chips.push({
      key: "status",
      label: `Status: ${
        verifiedFilter === "verified" ? "Verified" : "Unverified"
      }`,
      onClear: () => onVerifiedFilterChange("all"),
    });
  }
  if (courseFilter !== "all") {
    const course = courses.find((c) => c.id === courseFilter);
    chips.push({
      key: "course",
      label: `Course: ${course ? course.code : courseFilter}`,
      onClear: () => onCourseFilterChange("all"),
    });
  }
  if (categoryFilter !== "all") {
    const category = categories.find((c) => c.id === categoryFilter);
    chips.push({
      key: "category",
      label: `Category: ${category ? category.name : categoryFilter}`,
      onClear: () => onCategoryFilterChange("all"),
    });
  }
  if (sort !== "newest") {
    const option = SORT_OPTIONS.find((o) => o.value === sort);
    chips.push({
      key: "sort",
      label: `Sort: ${option?.label ?? sort}`,
      onClear: () => onSortChange("newest"),
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative w-full lg:w-auto lg:flex-1 lg:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or uploader..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={verifiedFilter}
            onValueChange={(val) => onVerifiedFilterChange(val ?? "all")}
          >
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={courseFilter}
            onValueChange={(val) => onCourseFilterChange(val ?? "all")}
          >
            <SelectTrigger className="w-44 shrink-0">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                  label={`${c.code} — ${c.name}`}
                >
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(val) => onCategoryFilterChange(val ?? "all")}
          >
            <SelectTrigger className="w-44 shrink-0">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} label={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(val) => onSortChange(val as AdminResourceSort)}
          >
            <SelectTrigger className="w-40 shrink-0">
              <ArrowUpDown className="mr-1 size-3.5" />
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
      </div>

      {(hasActiveFilters || resultCount !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          {resultCount !== undefined && (
            <p
              className="text-xs text-muted-foreground"
              aria-live="polite"
            >
              {resultCount.toLocaleString()}{" "}
              {hasActiveFilters ? "resources found" : "resources"}
            </p>
          )}
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onClear}
                aria-label={`Remove filter ${chip.label}`}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XCircle className="size-3.5" />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
