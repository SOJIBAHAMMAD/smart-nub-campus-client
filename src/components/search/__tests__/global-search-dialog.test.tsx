import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen, fireEvent } from "@/__tests__/test-utils";
import { apiClient } from "@/lib/api-client";
import { GlobalSearchProvider } from "@/providers/global-search-provider";
import { GlobalSearchDialog } from "../global-search-dialog";
import type { Mock } from "vitest";
import type { SearchResponse } from "@/types/search.types";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
Element.prototype.scrollIntoView = vi.fn();

const BEST_MATCH_ITEM = {
  id: "res-1",
  title: "Database Systems Notes",
  subtitle: "CSE 2103",
  snippet: "A <mark>database</mark> course summary",
  url: "/resources/res-1",
  rank: 1,
  type: "resources" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  data: {},
};

const SAMPLE_RESPONSE: SearchResponse = {
  query: "database",
  data: {
    people: { items: [], total: 0 },
    resources: {
      items: [BEST_MATCH_ITEM, { ...BEST_MATCH_ITEM, id: "res-2", title: "SQL Cheat Sheet", rank: 4 }],
      total: 2,
    },
    discussions: { items: [], total: 0 },
    questions: { items: [], total: 0 },
    teams: { items: [], total: 0 },
    events: { items: [], total: 0 },
    courses: { items: [], total: 0 },
    jobs: {
      items: [
        {
          id: "job-1",
          title: "Junior Database Engineer",
          subtitle: "Tech Corp",
          snippet: null,
          url: "/jobs/job-1",
          rank: 2,
          type: "jobs" as const,
          createdAt: "2026-02-01T00:00:00.000Z",
          data: {},
        },
      ],
      total: 1,
    },
    mentorship: { items: [], total: 0 },
  },
  meta: {
    total: 3,
    bestMatch: BEST_MATCH_ITEM,
  },
};

vi.useFakeTimers();

function renderDialog() {
  return render(
    <GlobalSearchProvider>
      <GlobalSearchDialog />
    </GlobalSearchProvider>,
  );
}

function openDialog() {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
  });
}

async function typeQuery(value: string) {
  const input = screen.getByPlaceholderText(
    "Search resources, people, teams...",
  );
  fireEvent.change(input, { target: { value } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
}

describe("GlobalSearchDialog", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("opens via Ctrl+K and shows the idle Go-to navigation", () => {
    renderDialog();
    openDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Go to")).toBeInTheDocument();
    expect(screen.getByText("Browse Resources")).toBeInTheDocument();
    expect(screen.getByText("Job Board")).toBeInTheDocument();
  });

  it("fetches grouped results and pins the Best match", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: { success: true, message: "", data: SAMPLE_RESPONSE },
    });
    renderDialog();
    openDialog();

    await typeQuery("database");

    expect(apiClient.get).toHaveBeenCalledWith("/search?q=database&limit=5");
    expect(screen.getByText("Best match")).toBeInTheDocument();
    expect(screen.getAllByText("Database Systems Notes").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.getByText("Junior Database Engineer")).toBeInTheDocument();
  });

  it("shows the empty state when there are no results", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: {
        success: true,
        message: "",
        data: {
          query: "zzz",
          data: {
            people: { items: [], total: 0 },
            resources: { items: [], total: 0 },
            discussions: { items: [], total: 0 },
            questions: { items: [], total: 0 },
            teams: { items: [], total: 0 },
            events: { items: [], total: 0 },
            courses: { items: [], total: 0 },
            jobs: { items: [], total: 0 },
            mentorship: { items: [], total: 0 },
          },
          meta: { total: 0, bestMatch: null },
        },
      },
    });
    renderDialog();
    openDialog();

    await typeQuery("zzz");

    expect(screen.getByText(/No results for "zzz"/)).toBeInTheDocument();
  });

  it("selecting a result closes the dialog and records a click", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: { success: true, message: "", data: SAMPLE_RESPONSE },
    });
    renderDialog();
    openDialog();

    await typeQuery("database");

    fireEvent.click(screen.getByText("Junior Database Engineer"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledWith("/search/click", {
      query: "database",
      entity: "jobs",
      resultId: "job-1",
      position: 1,
    });
  });

  it("selecting a result records a recent search", async () => {
    (apiClient.get as Mock).mockResolvedValue({
      data: { success: true, message: "", data: SAMPLE_RESPONSE },
    });
    renderDialog();
    openDialog();

    await typeQuery("database");
    fireEvent.click(screen.getAllByText("Database Systems Notes")[0]);

    // Re-open: the recent should appear in the idle state.
    openDialog();
    expect(screen.getByText("Database Systems Notes")).toBeInTheDocument();
  });

  it("ignores stale responses that arrive after a newer query", async () => {
    const resolvers: Array<(value: unknown) => void> = [];
    (apiClient.get as Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        }),
    );
    renderDialog();
    openDialog();

    await typeQuery("data");
    await typeQuery("database");

    expect(resolvers).toHaveLength(2);

    // Resolve the FIRST (stale) query last, the second one first.
    const staleResponse = {
      data: {
        success: true,
        message: "",
        data: {
          query: "data",
          data: {
            people: { items: [], total: 0 },
            resources: {
              items: [
                {
                  id: "stale",
                  title: "Stale result",
                  subtitle: null,
                  snippet: null,
                  url: "/resources/stale",
                  rank: 1,
                  type: "resources" as const,
                  createdAt: null,
                  data: {},
                },
              ],
              total: 1,
            },
            discussions: { items: [], total: 0 },
            questions: { items: [], total: 0 },
            teams: { items: [], total: 0 },
            events: { items: [], total: 0 },
            courses: { items: [], total: 0 },
            jobs: { items: [], total: 0 },
            mentorship: { items: [], total: 0 },
          },
          meta: { total: 1, bestMatch: null },
        },
      },
    };
    const freshResponse = {
      data: {
        success: true,
        message: "",
        data: SAMPLE_RESPONSE,
      },
    };

    await act(async () => {
      resolvers[1]?.(freshResponse);
    });
    await act(async () => {
      resolvers[0]?.(staleResponse);
    });

    expect(screen.queryByText("Stale result")).not.toBeInTheDocument();
    expect(screen.getByText("Junior Database Engineer")).toBeInTheDocument();
  });
});
