"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Bookmark, Upload, BookOpen, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import type { ResourceCategory } from "@/types/resource.types";
import { cn } from "@/lib/utils";

type TabOption = "all" | "bookmarks" | "uploads";

interface ResourcesSidebarProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
  selectedCategorySlug: string | null;
  onCategoryChange: (slug: string | null) => void;
  selectedTags: string[];
  onTagToggle: (slug: string) => void;
  categories?: (ResourceCategory & { _count: { resources: number } })[];
  courses?: { id: string; code: string; name: string; department: string; _count: { resources: number } }[];
  allTags?: { id: string; name: string; slug: string; _count: { resourceTags: number } }[];
  selectedCourseId?: string | null;
  onCourseChange?: (courseId: string | null) => void;
}

const tabs: { id: TabOption; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Resources", icon: <BookOpen className="size-4" /> },
  { id: "bookmarks", label: "My Bookmarks", icon: <Bookmark className="size-4" /> },
  { id: "uploads", label: "My Uploads", icon: <Upload className="size-4" /> },
];

export function ResourcesSidebar({
  activeTab,
  onTabChange,
  selectedCategorySlug,
  onCategoryChange,
  selectedTags,
  onTagToggle,
  categories = [],
  courses = [],
  allTags = [],
  selectedCourseId,
  onCourseChange,
}: ResourcesSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);
  const visibleTags = showAllTags
    ? allTags
    : [
        ...allTags.filter((t) => selectedTags.includes(t.slug)),
        ...allTags.filter((t) => !selectedTags.includes(t.slug)),
      ].slice(0, 10);

  const courseGroups = groupCoursesByDepartment(courses);

  return (
    <div className="space-y-6">
      {/* ── Upload button ────────────────────────────────────────── */}
      <Link
        href="/resources/upload"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand px-10 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 active:translate-y-px"
      >
        <Plus className="size-4" />
        Upload Resource
      </Link>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <nav className="space-y-1">
        {tabs.map((tab) => (
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
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h3>
          {selectedCategorySlug && (
            <button
              onClick={() => onCategoryChange(null)}
              className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80"
            >
              <X className="size-2.5" />
              Clear
            </button>
          )}
        </div>
        {categories.length > 0 ? (
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
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                    selectedCategorySlug === cat.slug
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {cat._count.resources}
                </span>
              </button>
            ))}
            {categories.length > 8 && (
              <button
                onClick={() => setShowAllCategories((v) => !v)}
                className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showAllCategories ? "Show less" : `Show more (${categories.length - 8})`}
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showAllCategories && "rotate-180")}
                />
              </button>
            )}
          </nav>
        ) : (
          <p className="text-xs text-muted-foreground">No categories found.</p>
        )}
      </div>

      {/* ── Courses (grouped by department) ──────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Courses
          </h3>
          {selectedCourseId && onCourseChange && (
            <button
              onClick={() => onCourseChange(null)}
              className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80"
            >
              <X className="size-2.5" />
              Clear
            </button>
          )}
        </div>
        {courseGroups.length > 0 ? (
          <div className="space-y-1">
            {courseGroups.map((group) => (
              <DepartmentGroup
                key={group.department}
                department={group.department}
                courses={group.courses}
                selectedCourseId={selectedCourseId}
                onSelect={(id) => onCourseChange?.(selectedCourseId === id ? null : id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No courses found.</p>
        )}
      </div>

      {/* ── Tags (multi-select) ──────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h3>
          {selectedTags.length > 0 && (
            <button
              onClick={() => selectedTags.forEach((t) => onTagToggle(t))}
              className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80"
            >
              <X className="size-2.5" />
              Clear
            </button>
          )}
        </div>
        {allTags.length > 0 ? (
          <>
            <div className="flex flex-col gap-0.5">
              {visibleTags.map((tag) => {
                const active = selectedTags.includes(tag.slug);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onTagToggle(tag.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="truncate">#{tag.name}</span>
                    {active && <Check className="size-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {allTags.length > 10 && (
              <button
                onClick={() => setShowAllTags((v) => !v)}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showAllTags ? "Show less" : `Show more (${allTags.length - 10})`}
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showAllTags && "rotate-180")}
                />
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No tags available.</p>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

interface CourseGroup {
  department: string;
  courses: { id: string; code: string; name: string; department: string; _count: { resources: number } }[];
}

function groupCoursesByDepartment(
  courses: { id: string; code: string; name: string; department: string; _count: { resources: number } }[],
): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const course of courses) {
    const dept = course.department || "Other";
    let group = map.get(dept);
    if (!group) {
      group = { department: dept, courses: [] };
      map.set(dept, group);
    }
    group.courses.push(course);
  }
  return Array.from(map.values());
}

// ── Department Group (collapsible) ──────────────────────────────────

function DepartmentGroup({
  department,
  courses,
  selectedCourseId,
  onSelect,
}: {
  department: string;
  courses: { id: string; code: string; name: string; _count: { resources: number } }[];
  selectedCourseId?: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasSelection = courses.some((c) => c.id === selectedCourseId);

  return (
    <div className="rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
          hasSelection ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <span>{department}</span>
        <div className="flex items-center gap-1">
          <span className="tabular-nums opacity-60">{courses.length}</span>
          {expanded ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="ml-1 space-y-0.5 border-l pl-2">
          {courses.map((course) => {
            const active = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                onClick={() => onSelect(course.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="truncate">{course.code}</span>
                <span
                  className={cn(
                    "shrink-0 ml-1 tabular-nums text-[10px]",
                    active ? "text-primary/70" : "opacity-50",
                  )}
                >
                  {course._count.resources}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
