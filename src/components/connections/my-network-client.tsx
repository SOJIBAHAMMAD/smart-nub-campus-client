"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  Send,
  UserX,
  Sparkles,
  Inbox,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import { MyNetworkSidebar, type ConnectionTab } from "./my-network-sidebar";
import { MyNetworkRightPanel } from "./my-network-right-panel";
import { InvitationsSection } from "./invitations-section";
import { PeopleCard, type PeopleCardUser } from "./people-card";
import { PeopleGrid } from "./people-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  ConnectionOverview,
  ConnectionWithUser,
  ConnectionOtherUser,
  PaginationMeta,
  SuggestedPerson,
} from "@/types";
import {
  searchPeopleAction,
  getSuggestionsAction,
  getPendingRequestsAction,
  getSentRequestsAction,
  getBlockedUsersAction,
  getMyConnectionsAction,
  getOverviewAction,
  unblockUserAction,
} from "@/actions/connection.actions";
import { listTagsAction } from "@/actions/resource.actions";
import type { ConnectionFilterState } from "./connection-filters";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import { toast } from "sonner";

type SubTab = "all" | "seniors" | "juniors" | "same" | "favorites";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seniors", label: "Seniors" },
  { id: "juniors", label: "Juniors" },
  { id: "same", label: "Same Semester" },
  { id: "favorites", label: "Favorites" },
];

const EMPTY_STATE: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  all: {
    icon: <Users className="size-8" />,
    title: "No connections yet",
    desc: "Start building your network! Connect with classmates.",
  },
  pending: {
    icon: <Inbox className="size-8" />,
    title: "No pending requests",
    desc: "No pending requests right now.",
  },
  sent: {
    icon: <Send className="size-8" />,
    title: "No sent requests",
    desc: "You haven't sent any connection requests.",
  },
  blocked: {
    icon: <UserX className="size-8" />,
    title: "No blocked users",
    desc: "You haven't blocked anyone.",
  },
  search: {
    icon: <SearchX className="size-8" />,
    title: "No people found",
    desc: "No people found matching your filters.",
  },
  suggestions: {
    icon: <Sparkles className="size-8" />,
    title: "No suggestions",
    desc: "Check back later for people you may know.",
  },
};

interface MyNetworkClientProps {
  initialOverview: ConnectionOverview;
  initialSuggestions: SuggestedPerson[];
  initialPopularSkills: { id: string; name: string; slug: string; count?: number }[];
}

export function MyNetworkClient({
  initialOverview,
  initialSuggestions,
  initialPopularSkills,
}: MyNetworkClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as ConnectionTab) || "all";
  const initialSubTab = (searchParams.get("sub") as SubTab) || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialDept = searchParams.get("dept") || "";
  const initialSem = searchParams.get("sem") || "";
  const initialSkills = (searchParams.get("skills") || "")
    .split(",")
    .filter(Boolean);

  const [tab, setTab] = useState<ConnectionTab>(initialTab);
  const [subTab, setSubTab] = useState<SubTab>(initialSubTab);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState<ConnectionFilterState>({
    department: initialDept,
    semester: initialSem,
    skills: initialSkills,
    search: initialSearch,
  });

  const [overview, setOverview] = useState<ConnectionOverview>(initialOverview);
  const [suggestions, setSuggestions] = useState<PeopleCardUser[]>(
    initialSuggestions as PeopleCardUser[],
  );
  const [popularSkills, setPopularSkills] =
    useState<{ id: string; name: string; slug: string; count?: number }[]>(initialPopularSkills);
  const [activeSkills, setActiveSkills] = useState<string[]>(initialSkills);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [people, setPeople] = useState<PeopleCardUser[]>([]);
  const [connections, setConnections] = useState<ConnectionWithUser[]>([]);
  const [pending, setPending] = useState<ConnectionWithUser[]>([]);
  const [sent, setSent] = useState<ConnectionWithUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapSuggested = useCallback(
    (list: SuggestedPerson[]): PeopleCardUser[] =>
      list.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        image: p.image,
        department: p.department,
        currentSemester: p.currentSemester,
        mutualConnections: p.mutualConnections,
      })),
    [],
  );

  const refreshMeta = useCallback(async () => {
    try {
      const [ov, sug] = await Promise.all([
        getOverviewAction(),
        getSuggestionsAction(),
      ]);
      if (ov.success && ov.data) setOverview(ov.data as ConnectionOverview);
      if (sug.success && sug.data)
        setSuggestions(mapSuggested(sug.data as SuggestedPerson[]));
    } catch {
      /* non-critical */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [_reloadKey, setReloadKey] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "pending") {
        const res = await getPendingRequestsAction();
        setPending((res.data as unknown as ConnectionWithUser[]) ?? []);
      } else if (tab === "sent") {
        const res = await getSentRequestsAction();
        setSent((res.data as unknown as ConnectionWithUser[]) ?? []);
      } else if (tab === "blocked") {
        const res = await getBlockedUsersAction();
        const blockedUsers = (res.data as unknown as ConnectionOtherUser[]) ?? [];
        setPeople(
          blockedUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            student: u.student,
            profile: u.profile,
          })),
        );
      } else {
        const isSearching =
          !!search ||
          !!filters.department ||
          !!filters.semester ||
          filters.skills.length > 0;

        if (isSearching) {
          const res = await searchPeopleAction({
            query: search || undefined,
            department: filters.department || undefined,
            semester: filters.semester || undefined,
            skills: filters.skills.length ? filters.skills : undefined,
            page,
            limit: 12,
          });
          const payload = res.data as unknown as { data: PeopleCardUser[]; meta: PaginationMeta };
          setPeople(payload?.data ?? []);
          setMeta(payload?.meta ?? null);
        } else {
          const filterMap: Record<SubTab, "ALL" | "SENIORS" | "JUNIORS" | "SAME_SEMESTER" | "FAVORITES"> = {
            all: "ALL",
            seniors: "SENIORS",
            juniors: "JUNIORS",
            same: "SAME_SEMESTER",
            favorites: "FAVORITES",
          };
          const res = await getMyConnectionsAction(filterMap[subTab], page, 12);
          const payload = res.data as unknown as { data: ConnectionWithUser[]; meta: PaginationMeta };
          setConnections(payload?.data ?? []);
          setMeta(payload?.meta ?? null);
        }
      }
    } catch (err) {
      console.error("[network] loadData failed:", err);
      setError(
        err instanceof Error
          ? `Failed to load data: ${err.message}`
          : "Failed to load data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [tab, subTab, search, filters, page]);

  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  const handleChanged = useCallback(() => {
    void refreshMeta();
    setReloadKey((k) => k + 1);
    void loadDataRef.current();
  }, [refreshMeta]);

  const handleChangedRef = useRef(handleChanged);
  handleChangedRef.current = handleChanged;

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await listTagsAction();
        const tags = (res.success ? res.data : []) as
          | { id: string; name: string; slug: string; _count?: { resourceTags: number } }[]
          | undefined;
        const mapped = (tags ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
        }));
        setPopularSkills(mapped.slice(0, 8));
      } catch {
        /* non-critical */
      }
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (subTab !== "all") params.set("sub", subTab);
    if (search) params.set("q", search);
    if (filters.department) params.set("dept", filters.department);
    if (filters.semester) params.set("sem", String(filters.semester));
    if (filters.skills.length > 0) params.set("skills", filters.skills.join(","));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [tab, subTab, search, filters, router]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (tab === "all") {
        setPage(1);
        void loadDataRef.current();
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, filters, tab]);

  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  useSocketEvent(socket, "connection:request", () => {
    handleChangedRef.current();
    toast.info("New connection request received!");
  });

  useSocketEvent(socket, "connection:accepted", () => {
    handleChangedRef.current();
    toast.success("Your connection request was accepted!");
  });

  useSocketEvent(socket, "connection:removed", () => {
    handleChangedRef.current();
  });

  const handleFindPeople = () => {
    setTab("all");
    setSubTab("all");
    setSheetOpen(false);
    if (typeof document !== "undefined") {
      setTimeout(() => {
        document.getElementById("network-search")?.focus();
      }, 100);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const res = await unblockUserAction(userId);
      if (res.success) {
        toast.success(res.message);
        handleChanged();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unblock user.");
    }
  };

  const handleSkillSelect = (tagId: string) => {
    setActiveSkills((prev) =>
      prev.includes(tagId) ? prev.filter((s) => s !== tagId) : [...prev, tagId],
    );
    setFilters((f) =>
      f.skills.includes(tagId)
        ? { ...f, skills: f.skills.filter((s) => s !== tagId) }
        : { ...f, skills: [...f.skills, tagId] },
    );
    setTab("all");
  };

  const counts = {
    all: overview.totalConnections,
    pending: overview.pending,
    sent: overview.sent,
    blocked: overview.blocked,
  };

  const isDiscovering =
    tab === "all" &&
    (!!search ||
      !!filters.department ||
      !!filters.semester ||
      filters.skills.length > 0);

  const totalPages = meta?.totalPages ?? 1;
  const showInvitations = tab === "all" && (pending.length > 0 || sent.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_280px]">
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <MyNetworkSidebar
            activeTab={tab}
            onTabChange={(t) => {
              setTab(t);
              setPage(1);
            }}
            counts={counts}
            filters={filters}
            onFiltersChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
            skills={popularSkills}
            onFindPeople={handleFindPeople}
          />
        </div>
      </aside>

      <aside className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            }
          />
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Network Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <MyNetworkSidebar
                activeTab={tab}
                onTabChange={(t) => {
                  setTab(t);
                  setPage(1);
                  setSheetOpen(false);
                }}
                counts={counts}
                filters={filters}
                onFiltersChange={(f) => {
                  setFilters(f);
                  setPage(1);
                }}
                skills={popularSkills}
                onFindPeople={handleFindPeople}
              />
            </div>
          </SheetContent>
        </Sheet>
      </aside>

      <main className="min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-foreground">My Network</h1>
            <p className="text-sm text-muted-foreground">
              Discover and connect with fellow students.
            </p>
          </div>

          {tab === "all" && (
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="network-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people by name, department, or skill..."
                className="pl-9"
              />
            </div>
          )}

          {showInvitations && (
            <InvitationsSection
              pending={pending}
              sent={sent}
              onChanged={handleChanged}
            />
          )}

          {tab === "all" && !isDiscovering && (
            <div className="mb-4">
              <Card className="p-1">
                <Tabs
                  value={subTab}
                  onValueChange={(v) => {
                    setSubTab(v as SubTab);
                    setPage(1);
                  }}
                >
                  <TabsList variant="line" className="w-full">
                    {SUB_TABS.map((st) => (
                      <TabsTrigger key={st.id} value={st.id} className="flex-1">
                        {st.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </Card>
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <ContentSwitch
              tab={tab}
              isDiscovering={isDiscovering}
              people={people}
              connections={connections}
              pending={pending}
              sent={sent}
              subTab={subTab}
              onChanged={handleChanged}
              onUnblock={handleUnblockUser}
            />
          )}

          {meta && totalPages > 1 && !loading && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <MyNetworkRightPanel
            overview={overview}
            suggestions={suggestions}
            popularSkills={popularSkills}
            onSkillSelect={handleSkillSelect}
            activeSkills={activeSkills}
            onChanged={handleChanged}
          />
        </div>
      </aside>
    </div>
  );
}

function ContentSwitch({
  tab,
  isDiscovering,
  people,
  connections,
  pending,
  sent,
  subTab,
  onChanged,
  onUnblock,
}: {
  tab: ConnectionTab;
  isDiscovering: boolean;
  people: PeopleCardUser[];
  connections: ConnectionWithUser[];
  pending: ConnectionWithUser[];
  sent: ConnectionWithUser[];
  subTab: SubTab;
  onChanged: () => void;
  onUnblock: (userId: string) => void;
}) {
  if (tab === "pending") {
    if (pending.length === 0) return <EmptyState kind="pending" />;
    return (
      <PeopleGrid>
        {pending.map((c) => (
          <PeopleCard
            key={c.id}
            user={c.otherUser}
            relationship="pending_incoming"
            connectionId={c.id}
            direction="incoming"
            note={c.note}
            onChanged={onChanged}
          />
        ))}
      </PeopleGrid>
    );
  }

  if (tab === "sent") {
    if (sent.length === 0) return <EmptyState kind="sent" />;
    return (
      <PeopleGrid>
        {sent.map((c) => (
          <PeopleCard
            key={c.id}
            user={c.otherUser}
            relationship="pending_outgoing"
            connectionId={c.id}
            direction="outgoing"
            onChanged={onChanged}
          />
        ))}
      </PeopleGrid>
    );
  }

  if (tab === "blocked") {
    if (people.length === 0) return <EmptyState kind="blocked" />;
    return (
      <PeopleGrid>
        {people.map((p) => (
          <PeopleCard
            key={p.id}
            user={p}
            relationship="blocked"
            onChanged={onChanged}
            onUnblock={() => onUnblock(p.id)}
          />
        ))}
      </PeopleGrid>
    );
  }

  if (isDiscovering) {
    if (people.length === 0) return <EmptyState kind="search" />;
    return (
      <PeopleGrid>
        {people.map((p) => {
          const rel =
            p.connectionStatus === "CONNECTED"
              ? "connected"
              : p.connectionStatus === "PENDING_INCOMING"
                ? "pending_incoming"
                : p.connectionStatus === "PENDING_OUTGOING"
                  ? "pending_outgoing"
                  : "none";
          const dir =
            p.connectionStatus === "PENDING_INCOMING"
              ? "incoming"
              : p.connectionStatus === "PENDING_OUTGOING"
                ? "outgoing"
                : "none";
          return (
            <PeopleCard
              key={p.id}
              user={p}
              relationship={rel}
              connectionId={p.connectionId ?? undefined}
              direction={dir}
              showMutual
              onChanged={onChanged}
            />
          );
        })}
      </PeopleGrid>
    );
  }

  if (connections.length === 0) {
    if (subTab === "favorites")
      return (
        <EmptyState
          kind="all"
          title="No favorites yet"
          desc="Star your close connections to find them here."
        />
      );
    if (subTab !== "all")
      return (
        <EmptyState
          kind="all"
          title="No connections here"
          desc="No connections match this filter yet."
        />
      );
    return <EmptyState kind="all" />;
  }

  return (
    <PeopleGrid>
      {connections.map((c) => (
        <PeopleCard
          key={c.id}
          user={c.otherUser}
          relationship="connected"
          connectionId={c.id}
          direction="none"
          onChanged={onChanged}
        />
      ))}
    </PeopleGrid>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-start gap-3">
            <div className="size-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  kind,
  title,
  desc,
}: {
  kind: keyof typeof EMPTY_STATE;
  title?: string;
  desc?: string;
}) {
  const state = EMPTY_STATE[kind];
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-10 text-center">
      <div className="mb-3 text-muted-foreground">{state.icon}</div>
      <p className="text-sm font-semibold text-foreground">
        {title ?? state.title}
      </p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {desc ?? state.desc}
      </p>
    </div>
  );
}


