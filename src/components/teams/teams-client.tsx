"use client";

import { useState, useEffect, useCallback, useRef, useMemo, use } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, X, Loader2, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { TeamsSidebar, type TeamsTab } from "@/components/teams/teams-sidebar";
import { TeamsTrending } from "@/components/teams/teams-trending";
import { TeamCard } from "@/components/teams/team-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listTeamRequests } from "@/actions/team.actions";
import { authClient } from "@/lib/auth-client";
import type { TeamRequest } from "@/types/team.types";
import { cn } from "@/lib/utils";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import { toast } from "sonner";

type FilterTab = "all" | "open";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All Requests" },
  { id: "open", label: "Looking for Members" },
];

function TeamCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded-full bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TeamsClientProps {
  initialTeams: TeamRequest[];
  initialMeta: import("@/types/resource.types").PaginationMeta | null;
  suggested: TeamRequest[];
}

/**
 * Interactive Teams page. Uses PageLayout with TeamsSidebar (left) and TeamsTrending (right).
 * Supports three primary tabs (Team Finder / My Applications / My Teams), search, filter tabs,
 * skill filtering, and pagination.
 */
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

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = searchParams.get("search") ?? "";
  const skillsParam = searchParams.get("skills") ?? "";
  // Memoize so the reference is stable across renders — an unmemoized array here
  // would re-trigger the fetch effect on every render (infinite loop).
  const selectedSkills = useMemo(
    () =>
      skillsParam
        ? skillsParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [skillsParam],
  );
  const filterTab = (searchParams.get("filter") as FilterTab) ?? "all";
  const category = searchParams.get("category") ?? null;
  const status = searchParams.get("status") ?? null;
  const deadline = searchParams.get("deadline") ?? null;
  const tab = (searchParams.get("tab") as TeamsTab) ?? "finder";

  const [teams, setTeams] = useState<TeamRequest[]>(initialTeams);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const [applyTeam, setApplyTeam] = useState<TeamRequest | null>(null);
  const hasFetched = useRef(false);
  // "Now" timestamp, refreshed in an effect to avoid Date.now() during render.
  const [nowTs, setNowTs] = useState(0);
  // Precomputed deadline timestamps (ms) keyed by team id, populated in the
  // fetch effect (post-render) to avoid impure Date calls during render.
  const [deadlineTs, setDeadlineTs] = useState<Map<string, number | null>>(
    () => new Map(),
  );

  // ── Socket.IO for real-time team updates ────────────────────────────────
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // When someone applies to a team, show notification
  useSocketEvent(socket, "team:application", (_data) => {
    toast.info(`New application received for team!`);
  });

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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Debounced search → update URL when the input differs from the URL value.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // Fetch teams when URL params change (skip the first render — data comes from server)
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        // Build query params. Include the user's own requests so newly created
        // teams appear immediately; tab filtering is applied client-side.
        // Use a larger page when client-side skill filtering is active so the
        // filtered result set is meaningful.
        const limit = selectedSkills.length > 0 || deadline ? 60 : 12;
        const params: Record<string, unknown> = {
          page,
          limit,
          excludeOwn: false,
        };
        if (search) params.search = search;
        if (category) params.category = category;
        if (status) params.status = status;
        if (filterTab === "open") params.status = "OPEN";
        // NOTE: multi-skill filtering is applied client-side (OR match) because the
        // server list endpoint currently accepts a single `skill` slug.

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
          // Cache deadline timestamps post-render (avoids Date calls during render).
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
    return () => {
      cancelled = true;
    };
  }, [
    page,
    search,
    selectedSkills,
    category,
    status,
    filterTab,
    tab,
    deadline,
  ]);

  // Derive the displayed teams (tab + skills + deadline filters) via useMemo.
  // NOTE: "My Teams" / "My Applications" are derived client-side because the
  // server list endpoint does not yet expose per-user membership/application context.
  const displayTeams = useMemo(() => {
    let list = teams;
    if (tab === "teams" || tab === "applications") {
      list = teams.filter(
        (t) =>
          currentUserId != null &&
          (t.creatorId === currentUserId ||
            (t.teamMembers ?? []).some((m) => m.userId === currentUserId)),
      );
    }
    // Multi-skill filter (OR: team must have at least one selected skill).
    // Match against both the tag name and slug (lowercased).
    if (selectedSkills.length > 0) {
      list = list.filter((t) =>
        (t.teamRequestSkills ?? []).some((s) => {
          const name = (s.tag?.name ?? "").toLowerCase();
          const slug = (s.tag?.slug ?? "").toLowerCase();
          return selectedSkills.includes(name) || selectedSkills.includes(slug);
        }),
      );
    }
    // Deadline filter (client-side; server list endpoint has no deadline param).
    // Timestamps (`nowTs`, `deadlineTs`) are computed in effects to avoid Date
    // calls during render.
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

  return (
    <PageLayout
      leftSidebar={
        <TeamsSidebar
          activeTab={tab}
          onTabChange={(t) => updateParams({ tab: t === "finder" ? null : t })}
          selectedSkills={selectedSkills}
          onSkillToggle={toggleSkill}
          onSkillsClear={clearSkills}
        />
      }
      rightSidebar={
        <TeamsTrending
          suggested={suggested}
          category={category}
          onCategoryChange={(c) => updateParams({ category: c })}
          status={status}
          onStatusChange={(s) => updateParams({ status: s })}
          deadline={deadline}
          onDeadlineChange={(d) => updateParams({ deadline: d })}
        />
      }
    >
      <div className="space-y-4">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover and join project teams at NUB.
          </p>
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for teams..."
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

        {/* ── Filter tabs ─────────────────────────────────────────── */}
        {tab === "finder" && (
          <div className="flex gap-2">
            {FILTER_TABS.map((ft) => (
              <button
                key={ft.id}
                onClick={() =>
                  updateParams({ filter: ft.id === "all" ? null : ft.id })
                }
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

        {/* ── Active skill filters ────────────────────────────────── */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Skills:</span>
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
            <button
              onClick={clearSkills}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Tab heading ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {tab === "finder" && "Open Team Requests"}
            {tab === "teams" && "My Teams"}
            {tab === "applications" && "My Applications"}
          </h2>
          {meta && (
            <span className="text-xs text-muted-foreground">
              {meta.total} result{meta.total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* ── Team Cards ──────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : displayTeams.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center ring-1 ring-foreground/10">
            <AlertCircle className="mx-auto size-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No team requests found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tab === "teams"
                ? "You haven't created any teams yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isAuthor={team.creatorId === currentUserId}
                isMember={(team.teamMembers ?? []).some(
                  (m) => m.userId === currentUserId,
                )}
                onApply={(t) => setApplyTeam(t)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────── */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= meta.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ── Apply confirmation modal (kept minimal; full apply flow on detail page) ── */}
      {applyTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setApplyTeam(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-xl ring-1 ring-foreground/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Loader2 className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Redirecting to apply...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open the team to submit your application.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => router.push(`/teams/${applyTeam.id}`)}
            >
              Go to Team
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
