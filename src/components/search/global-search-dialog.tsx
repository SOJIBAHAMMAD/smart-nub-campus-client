"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock,
  CornerDownLeft,
  GraduationCap,
  Handshake,
  HelpCircle,
  Loader2,
  MessageSquare,
  SearchX,
  Users,
  X,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { searchClientService } from "@/services/search.client.service";
import ROUTES from "@/constants/routes";
import {
  SEARCH_ENTITY_CONFIG,
  SEARCH_ENTITY_ORDER,
} from "./search-entity-config";
import type {
  SearchRecent,
  SearchResponse,
  SearchResultItem,
} from "@/types/search.types";

const SEARCH_DEBOUNCE_MS = 250;

const IDLE_NAV: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Browse Resources", href: ROUTES.RESOURCES, icon: BookOpen },
  { label: "Go to Discussions", href: ROUTES.DISCUSSIONS, icon: MessageSquare },
  { label: "Go to Q&A", href: ROUTES.QA, icon: HelpCircle },
  { label: "Go to Teams", href: ROUTES.TEAMS, icon: Users },
  { label: "Find Events", href: ROUTES.EVENTS, icon: CalendarDays },
  { label: "Job Board", href: ROUTES.JOBS, icon: Briefcase },
  { label: "Alumni Directory", href: ROUTES.ALUMNI, icon: GraduationCap },
  { label: "Mentorship", href: ROUTES.MENTORSHIP, icon: Handshake },
];

function itemValue(item: SearchResultItem): string {
  return `${item.type}:${item.id}`;
}

function recentValue(recent: SearchRecent): string {
  return `recent:${recent.url}:${recent.query}`;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function GlobalSearchDialog() {
  const router = useRouter();
  const {
    isOpen,
    close,
    query,
    setQuery,
    recents,
    addRecent,
    removeRecent,
    clearRecents,
  } = useGlobalSearch();

  const [data, setData] = React.useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestSeq = React.useRef(0);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const activeQuery = debouncedQuery.trim();

  // Focus the palette input as soon as the dialog opens.
  React.useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      document
        .querySelector<HTMLInputElement>('[data-slot="command-input"]')
        ?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Immediately clear results when the input becomes blank (e.g. on reopen
  // after a selection), without waiting for the debounce delay.
  React.useEffect(() => {
    if (isBlank(query)) {
      requestSeq.current += 1;
      setData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [query]);

  // Fetch results for the (debounced) query. Guards against stale responses
  // by ignoring any response whose request sequence is out of date.
  React.useEffect(() => {
    if (isBlank(activeQuery)) {
      requestSeq.current += 1;
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const seq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);

    searchClientService
      .search({ q: activeQuery, limit: 5 })
      .then((result) => {
        if (requestSeq.current !== seq) return;
        setData(result);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (requestSeq.current !== seq) return;
        setError(
          err instanceof Error ? err.message : "Search failed. Try again.",
        );
        setData(null);
        setIsLoading(false);
      });
  }, [activeQuery]);

  const buildRoute = (item: SearchResultItem): string | null =>
    SEARCH_ENTITY_CONFIG[item.type]?.buildRoute(item) ?? null;

  const handleOpenFromNav = (href: string) => {
    close();
    router.push(href);
  };

  const handleSelectResult = (
    item: SearchResultItem,
    queryUsed: string,
    position?: number,
  ) => {
    const route = buildRoute(item);
    if (!route) return;
    close();
    addRecent({
      query: queryUsed,
      entity: item.type,
      label: item.title ?? item.subtitle ?? item.id,
      url: route,
      resultId: item.id,
    });
    void searchClientService.recordClick({
      query: queryUsed,
      entity: item.type,
      resultId: item.id,
      ...(position ? { position } : {}),
    });
    router.push(route);
  };

  const handleSelectRecent = (recent: SearchRecent) => {
    close();
    void searchClientService.recordClick({
      query: recent.query,
      entity: recent.entity === "all" ? "resources" : recent.entity,
      resultId: recent.resultId,
    });
    router.push(recent.url);
  };

  const showIdle = isBlank(query);
  const showLoading = !showIdle && isLoading && !data;
  const showError = !showIdle && !!error;
  const showEmpty =
    !showIdle && !isLoading && !error && data && data.meta.total === 0;

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title="Global search"
      description="Search resources, discussions, teams, events and people across the campus"
      showCloseButton
      className="w-[calc(100%-1.5rem)] max-w-2xl sm:top-[18%]"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search resources, people, teams..."
          value={query}
          onValueChange={setQuery}
        />

        <CommandList>
          {showIdle && (
            <>
              {recents.length > 0 && (
                <>
                  <CommandGroup heading="Recent">
                    {recents.map((recent) => (
                      <CommandItem
                        key={recentValue(recent)}
                        value={recentValue(recent)}
                        onSelect={() => handleSelectRecent(recent)}
                      >
                        <Clock className="opacity-60" />
                        <span className="min-w-0 flex-1 truncate">
                          {recent.label}
                        </span>
                        <CommandShortcut>
                          <button
                            type="button"
                            className="rounded p-0.5 hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecent(recent.query, recent.url);
                            }}
                            aria-label={`Remove ${recent.label} from recent searches`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </CommandShortcut>
                      </CommandItem>
                    ))}
                    <CommandItem
                      value="clear-recents"
                      onSelect={clearRecents}
                      className="text-xs text-muted-foreground"
                    >
                      <span className="ml-6">Clear recent searches</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
              <CommandGroup heading="Go to">
                {IDLE_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.href}
                      value={`nav:${item.href}`}
                      onSelect={() => handleOpenFromNav(item.href)}
                    >
                      <Icon className="opacity-60" />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      <CornerDownLeft className="size-3 opacity-40" />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {showLoading && (
            <CommandEmpty className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="size-4 animate-spin" />
              <span>Searching campus...</span>
            </CommandEmpty>
          )}

          {showError && (
            <CommandEmpty className="py-8 text-destructive">{error}</CommandEmpty>
          )}

          {showEmpty && (
            <CommandEmpty>
              No results for &quot;{activeQuery}&quot;. Try a different spelling
              or fewer keywords.
            </CommandEmpty>
          )}

          {!showIdle && !showLoading && !showError && !showEmpty && data && (
            <>
              {data.meta.bestMatch && (
                <CommandGroup heading="Best match">
                  <SearchResultRow
                    item={data.meta.bestMatch}
                    onSelect={() =>
                      handleSelectResult(data.meta.bestMatch!, activeQuery, 1)
                    }
                  />
                </CommandGroup>
              )}

              {SEARCH_ENTITY_ORDER.map((entity) => {
                const group = data.data[entity];
                if (!group || group.items.length === 0) return null;
                const config = SEARCH_ENTITY_CONFIG[entity];
                return (
                  <CommandGroup key={entity} heading={config.pluralLabel}>
                    {group.items
                      .filter(
                        (item) => item.id !== data.meta.bestMatch?.id,
                      )
                      .map((item, index) => (
                        <SearchResultRow
                          key={itemValue(item)}
                          item={item}
                          onSelect={() =>
                            handleSelectResult(item, activeQuery, index + 1)
                          }
                        />
                      ))}
                  </CommandGroup>
                );
              })}
            </>
          )}

          {!showIdle && data && data.meta.total > 0 && (
            <CommandItem
              value="view-all-results"
              onSelect={() => {
                close();
                router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(activeQuery)}`);
              }}
              className="justify-between"
            >
              <span>View all {data.meta.total} results on the search page</span>
              <ArrowRight className="size-4 opacity-60" />
            </CommandItem>
          )}
        </CommandList>

        <div className="flex items-center justify-between border-t px-3 py-1.5 text-[11px] text-muted-foreground">
          <span className="hidden items-center gap-1 sm:flex">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>navigate</span>
            <Kbd>↵</Kbd>
            <span>select</span>
          </span>
          <span className="flex items-center gap-1 sm:ml-auto">
            <Kbd>esc</Kbd>
            <span>close</span>
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border bg-muted px-1 py-0.5 font-sans text-[10px] font-medium text-foreground/80">
      {children}
    </kbd>
  );
}

function SearchResultRow({
  item,
  onSelect,
}: {
  item: SearchResultItem;
  onSelect: () => void;
}) {
  const config = SEARCH_ENTITY_CONFIG[item.type];
  const Icon = config?.icon ?? SearchX;
  const route = config?.buildRoute(item);

  return (
    <CommandItem
      value={itemValue(item)}
      onSelect={onSelect}
      disabled={!route}
      className={cn(!route && "cursor-default opacity-60")}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md bg-muted",
        )}
      >
        <Icon className="size-4 text-foreground/70" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {item.title ?? item.subtitle ?? "Untitled"}
        </span>
        {item.snippet && (
          <span className="truncate text-xs text-muted-foreground">
            {stripTags(item.snippet)}
          </span>
        )}
      </span>
      {route && <CornerDownLeft className="size-3 shrink-0 opacity-40" />}
    </CommandItem>
  );
}

/** Strip HTML fragments that ts_headline may have inserted. */
function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}
