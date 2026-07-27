"use client";

import { useState, useEffect, useCallback, useRef, useMemo, use } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { TeamsSidebar, type TeamsTab } from "@/components/teams/teams-sidebar";
import { TeamsTrending } from "@/components/teams/teams-trending";
import {
  TeamCard,
  TeamCardGridSkeleton,
  TeamCardListSkeleton,
} from "@/components/teams/team-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { listTeamRequests, getMyTeams, getMyApplications, toggleTeamBookmark } from "@/actions/team.actions";
import { authClient } from "@/lib/auth-client";
import type { TeamRequest, TeamApplication } from "@/types/team.types";
import { cn } from "@/lib/utils";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import { toast } from "sonner";
import Link from "next/link";
import { TEAM_CATEGORIES } from "@/constants/team";

type FilterTab = "all" | "open";
type ViewMode = "grid" | "list";
type SortOption = "newest" | "applications" | "deadline";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "applications", label: "Most Applications" },
  { value: "deadline", label: "Deadline Soon" },
];

interface TeamsClientProps {
  initialTeams: TeamRequest[];
  initialMeta: import("@/types/resource.types").PaginationMeta | null;
  suggested: TeamRequest[];
}

const sessionPromise = authClient.getSession();

export function TeamsClient({
  initialTeams,
  initialMeta,
  suggested,
}: TeamsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = use(sessionPromise);
  const currentUserId = session?.data?.user?.id;

  // ── URL params ────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const skillsParam = searchParams.get("skills") ?? "";
  const selectedSkills = useMemo(
    () =>
      skillsParam
        ? skillsParam.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    [skillsParam],
  );
  const filterTab = (searchParams.get("filter") as FilterTab) ?? "all";
  const category = searchParams.get("category") ?? null;
  const status = searchParams.get("status") ?? null;
  const deadline = searchParams.get("deadline") ?? null;
  const tab = (searchParams.get("tab") as TeamsTab) ?? "finder";
  const viewMode = (searchParams.get("view") as ViewMode) ?? "grid";
  const sort = (searchParams.get("sort") as SortOption) ?? "newest";
  const difficulty = searchParams.get("difficulty") ?? null;
  const meetingPref = searchParams.get("meeting") ?? null;

  // ── State ─────────────────────────────────────────────────────
  const [teams, setTeams] = useState<TeamRequest[]>(initialTeams);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasFetched = useRef(false);
  const [nowTs, setNowTs] = useState(0);
  const [deadlineTs, setDeadlineTs] = useState<Map<string, number | null>>(() => new Map());
  const [myApplications, setMyApplications] = useState<TeamApplication[]>([]);

  // ── Socket.IO ─────────────────────────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  useSocketEvent(socket, "team:application", () => {
    toast.info("New application received for a team!");
  });

  // ── Bookmark handler ───────────────────────────────────────────
  const handleBookmark = useCallback(
    async (teamId: string) => {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, isBookmarked: !t.isBookmarked, bookmarkCount: t.bookmarkCount + (t.isBookmarked ? -1 : 1) }
            : t,
        ),
      );
      const result = await toggleTeamBookmark(teamId);
      if (!result.success) {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamId
              ? { ...t, isBookmarked: !t.isBookmarked, bookmarkCount: t.bookmarkCount + (t.isBookmarked ? -1 : 1) }
              : t,
          ),
        );
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    },
    [],
  );

  // ── URL update helper ─────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("page" in updates)) {
        params.delete("page");
      }
      if ("page" in updates) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // ── Debounced search ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // ── Fetch teams ───────────────────────────────────────────────
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        if (tab === "teams") {
          const result = await getMyTeams();
          if (!cancelled && result.success && result.data) {
            const data = result.data as TeamRequest[];
            setTeams(data);
            setMeta(null);
            setMyApplications([]);
          }
          return;
        }

        if (tab === "applications") {
          const result = await getMyApplications();
          if (!cancelled && result.success && result.data) {
            const apps = result.data as TeamApplication[];
            setMyApplications(apps);
            setTeams(apps.map((a) => a.teamRequest!).filter(Boolean));
            setMeta(null);
          }
          return;
        }

        if (tab === "bookmarked") {
          const result = await listTeamRequests({ bookmarked: true, limit: 50 });
          if (!cancelled && result.success && result.data) {
            const data = result.data as {
              data?: TeamRequest[];
              meta?: import("@/types/resource.types").PaginationMeta;
            };
            setTeams(data.data ?? []);
            setMeta(null);
            setMyApplications([]);
          }
          return;
        }

        const limit = selectedSkills.length > 0 || deadline ? 60 : 12;
        const params: Record<string, unknown> = {
          page,
          limit,
          excludeOwn: false,
          sort,
        };
        if (search) params.search = search;
        if (category) params.category = category;
        if (status) params.status = status;
        if (difficulty) params.difficulty = difficulty;
        if (meetingPref) params.meetingPreference = meetingPref;
        if (filterTab === "open") params.status = "OPEN";

        const result = await listTeamRequests(
          params as Parameters<typeof listTeamRequests>[0],
        );
        if (!cancelled && result.success && result.data) {
          const data = result.data as {
            data?: TeamRequest[];
            meta?: import("@/types/resource.types").PaginationMeta;
          };
          setTeams(data.data ?? []);
          setMeta(data.meta ?? null);
          setMyApplications([]);
          const map = new Map<string, number | null>();
          for (const t of data.data ?? []) {
            map.set(t.id, t.deadline ? Date.parse(t.deadline) : null);
          }
          setDeadlineTs(map);
          setNowTs(Date.now());
        }
      } catch {
        // Empty state handles errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [page, search, selectedSkills, category, status, filterTab, tab, deadline, sort, difficulty, meetingPref]);

  // ── Derived teams ─────────────────────────────────────────────
  const displayTeams = useMemo(() => {
    let list = teams;
    if (tab === "finder") {
      if (selectedSkills.length > 0) {
        list = list.filter((t) =>
          (t.teamRequestSkills ?? []).some((s) => {
            const name = (s.tag?.name ?? "").toLowerCase();
            const slug = (s.tag?.slug ?? "").toLowerCase();
            return selectedSkills.includes(name) || selectedSkills.includes(slug);
          }),
        );
      }
      if (deadline === "week" || deadline === "month") {
        const maxMs = (deadline === "week" ? 7 : 30) * 24 * 60 * 60 * 1000;
        list = list.filter((t) => {
          const ts = deadlineTs.get(t.id);
          if (ts == null) return false;
          const diff = ts - nowTs;
          return diff >= 0 && diff <= maxMs;
        });
      } else if (deadline === "none") {
        list = list.filter((t) => deadlineTs.get(t.id) == null);
      }
    }
    return list;
  }, [teams, tab, currentUserId, selectedSkills, deadline, deadlineTs, nowTs]);

  const toggleSkill = useCallback(
    (slug: string) => {
      const next = selectedSkills.includes(slug)
        ? selectedSkills.filter((s) => s !== slug)
        : [...selectedSkills, slug];
      updateParams({ skills: next.length > 0 ? next.join(",") : null });
    },
    [selectedSkills, updateParams],
  );

  const clearSkills = useCallback(() => {
    updateParams({ skills: null });
  }, [updateParams]);

  const activeFilterCount = [category, status, deadline, difficulty, meetingPref].filter(Boolean).length
    + selectedSkills.length;

  return (
    <PageLayout
      leftSidebar={
        <TeamsSidebar
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t === "finder" ? null : t })}
          selectedSkills={selectedSkills}
          onSkillToggle={toggleSkill}
          onSkillsClear={clearSkills}
          selectedCategory={category}
          onCategoryChange={(c) => updateParams({ category: c })}
          activeFilters={{ difficulty, meetingPreference: meetingPref }}
          onFilterChange={(f) => updateParams({ difficulty: f.difficulty ?? null, meeting: f.meetingPreference ?? null })}
        />
      }
      rightSidebar={
        <TeamsTrending
          suggested={suggested}
        />
      }
    >
      <div className="space-y-4" aria-busy={loading}>
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teams</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find collaborators for your next project.
            </p>
          </div>
          <Link href="/teams/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Create Team</span>
            </Button>
          </Link>
        </div>

        {/* ── Search + Controls Row ────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search teams..."
              className="h-9 pl-9"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex items-center rounded-lg border bg-card p-0.5 ring-1 ring-foreground/10">
            <button
              onClick={() => updateParams({ view: "grid" })}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => updateParams({ view: "list" })}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
            className="h-9 rounded-lg border bg-card px-2 text-xs font-medium text-foreground ring-1 ring-foreground/10 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mobile filter trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-foreground/10 lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 p-4">
                {/* Category filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Category</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {TEAM_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateParams({ category: category === cat ? null : cat })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          category === cat
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground bg-muted hover:text-foreground",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Status</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_TABS.map((ft) => (
                      <button
                        key={ft.id}
                        onClick={() => updateParams({ filter: ft.id === "all" ? null : ft.id })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          filterTab === ft.id
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground bg-muted hover:text-foreground",
                        )}
                      >
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Difficulty</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].map((d) => (
                      <button
                        key={d}
                        onClick={() => updateParams({ difficulty: difficulty === d ? null : d })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                          difficulty === d
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground bg-muted hover:text-foreground",
                        )}
                      >
                        {d.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meeting preference */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Meeting</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["ONLINE", "IN_PERSON", "HYBRID", "FLEXIBLE"].map((m) => (
                      <button
                        key={m}
                        onClick={() => updateParams({ meeting: meetingPref === m ? null : m })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          meetingPref === m
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground bg-muted hover:text-foreground",
                        )}
                      >
                        {m === "IN_PERSON" ? "In-Person" : m.charAt(0) + m.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deadline filter */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Deadline</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "week", label: "This Week" },
                      { value: "month", label: "This Month" },
                      { value: "none", label: "No Deadline" },
                    ].map((d) => (
                      <button
                        key={d.value}
                        onClick={() => updateParams({ deadline: deadline === d.value ? null : d.value })}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          deadline === d.value
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground bg-muted hover:text-foreground",
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear all */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      updateParams({
                        filter: null,
                        category: null,
                        status: null,
                        deadline: null,
                        difficulty: null,
                        meeting: null,
                        skills: null,
                      });
                      setMobileFiltersOpen(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Desktop Filter Tabs ──────────────────────────────── */}
        {tab === "finder" && (
          <div className="flex gap-2">
            {FILTER_TABS.map((ft) => (
              <button
                key={ft.id}
                onClick={() => updateParams({ filter: ft.id === "all" ? null : ft.id })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  filterTab === ft.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {ft.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Active filter pills ─────────────────────────────── */}
        {(selectedSkills.length > 0 || category || filterTab !== "all" || difficulty || meetingPref || deadline) && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedSkills.map((slug) => (
              <span
                key={slug}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30"
              >
                {slug}
                <button
                  onClick={() => toggleSkill(slug)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${slug} filter`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {category && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                {category}
                <button
                  onClick={() => updateParams({ category: null })}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${category} category`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {filterTab !== "all" && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                {FILTER_TABS.find((ft) => ft.id === filterTab)?.label ?? filterTab}
                <button
                  onClick={() => updateParams({ filter: null })}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label="Remove status filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {difficulty && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                {difficulty.toLowerCase()}
                <button
                  onClick={() => updateParams({ difficulty: null })}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${difficulty} difficulty filter`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {meetingPref && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                {meetingPref === "IN_PERSON" ? "In-Person" : meetingPref.charAt(0) + meetingPref.slice(1).toLowerCase()}
                <button
                  onClick={() => updateParams({ meeting: null })}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${meetingPref} meeting preference`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                {deadline === "week" ? "This Week" : deadline === "month" ? "This Month" : "No Deadline"}
                <button
                  onClick={() => updateParams({ deadline: null })}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label="Remove deadline filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              onClick={() =>
                updateParams({
                  filter: null,
                  category: null,
                  status: null,
                  deadline: null,
                  difficulty: null,
                  meeting: null,
                  skills: null,
                })
              }
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Results header ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {tab === "finder" && "Team Requests"}
            {tab === "teams" && "My Teams"}
            {tab === "applications" && "My Applications"}
            {tab === "bookmarked" && "Bookmarked"}
          </h2>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {meta
              ? `${meta.total} result${meta.total === 1 ? "" : "s"}`
              : `${displayTeams.length} item${displayTeams.length === 1 ? "" : "s"}`
            }
          </span>
        </div>

        {/* ── Team Cards ───────────────────────────────────────── */}
        {loading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                : "space-y-3",
            )}
          >
            {Array.from({ length: viewMode === "grid" ? 6 : 4 }).map((_, i) =>
              viewMode === "grid" ? (
                <TeamCardGridSkeleton key={i} />
              ) : (
                <TeamCardListSkeleton key={i} />
              ),
            )}
          </div>
        ) : displayTeams.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search className="size-6" />
              </EmptyMedia>
              <EmptyTitle>No teams found</EmptyTitle>
              <EmptyDescription>
                {tab === "teams"
                  ? "You haven't created any teams yet. Create your first team to get started."
                  : tab === "applications"
                    ? "You haven't applied to any teams yet. Browse available teams to find one that fits."
                    : tab === "bookmarked"
                      ? "You haven't bookmarked any teams yet. Browse teams and save the ones you like."
                      : "Try adjusting your search or filters to find what you're looking for."}
              </EmptyDescription>
            </EmptyHeader>
            {tab === "teams" && (
              <Link href="/teams/create">
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  Create Team
                </Button>
              </Link>
            )}
          </Empty>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                : "space-y-3",
            )}
          >
            {displayTeams.map((team) => {
              const appStatus = tab === "applications"
                ? myApplications.find((a) => a.teamRequestId === team.id)?.status
                : undefined;
              const hasApplied = team.hasApplied ?? (team.teamApplications ?? []).some(
                (a) => a.applicantId === currentUserId && a.status !== "WITHDRAWN",
              );
              return (
                <div key={team.id}>
                  <TeamCard
                    team={team}
                    variant={viewMode}
                    isAuthor={team.creatorId === currentUserId}
                    isMember={(team.teamMembers ?? []).some(
                      (m) => m.userId === currentUserId,
                    )}
                    hasApplied={hasApplied}
                    applicationStatus={appStatus}
                    onBookmark={handleBookmark}
                    onApply={(t) => router.push(`/teams/${t.id}`)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Numbered Pagination ──────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {generatePagination(meta.totalPages, page).map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className="size-8 text-xs"
                  onClick={() => updateParams({ page: String(p) })}
                >
                  {p}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/** Generate pagination page numbers with ellipsis. */
function generatePagination(totalPages: number, currentPage: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}
