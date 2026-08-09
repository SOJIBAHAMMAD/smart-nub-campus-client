import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { apiClient } from "@/lib/api-client";
import type { Mock } from "vitest";
import type { SearchResponse } from "@/types/search.types";

const nav = vi.hoisted(() => {
  const state = {
    urlParams: new URLSearchParams(),
    push: vi.fn(),
    replace: vi.fn(),
  };
  return state;
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    prefetch: vi.fn(),
  }),
  useSearchParams: () => nav.urlParams,
  usePathname: () => "/search",
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    put: vi.fn(),
    postForm: vi.fn(),
  },
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "";
  thresholds = [];
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

import { SearchResultsPage } from "../search-results-page";

const SAMPLE_ALL: SearchResponse = {
  query: "database",
  data: {
    people: { items: [], total: 0 },
    resources: {
      items: [
        {
          id: "res-1",
          title: "Database Systems Notes",
          subtitle: "CSE 2103",
          snippet: null,
          url: "/resources/res-1",
          rank: 1,
          type: "resources",
          createdAt: "2026-01-01T00:00:00.000Z",
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
};

const SAMPLE_SCOPED: SearchResponse = {
  query: "database",
  data: {
    people: { items: [], total: 0 },
    resources: { items: [], total: 0 },
    discussions: { items: [], total: 0 },
    questions: { items: [], total: 0 },
    teams: { items: [], total: 0 },
    events: { items: [], total: 0 },
    courses: { items: [], total: 0 },
    jobs: {
      items: Array.from({ length: 10 }, (_, i) => ({
        id: `job-${i}`,
        title: `Database Job ${i}`,
        subtitle: "Tech Corp",
        snippet: null,
        url: `/jobs/job-${i}`,
        rank: i + 1,
        type: "jobs" as const,
        createdAt: null,
        data: {},
      })),
      total: 12,
    },
    mentorship: { items: [], total: 0 },
  },
  meta: { total: 12, bestMatch: null },
};

function envelope(data: SearchResponse) {
  return { success: true, message: "", data };
}

function renderPage() {
  return render(
    <SearchResultsPage
      categories={[{ id: "cat-1", name: "Lecture Notes" }]}
      courses={[{ id: "course-1", code: "CSE2103", name: "Database Systems" }]}
    />,
  );
}

describe("SearchResultsPage", () => {
  beforeEach(() => {
    nav.urlParams = new URLSearchParams();
    nav.push.mockClear();
    nav.replace.mockClear();
    (apiClient.get as Mock).mockReset();
    (apiClient.post as Mock).mockReset();
  });

  it("shows a prompt when there is no query", () => {
    nav.urlParams = new URLSearchParams();
    renderPage();
    expect(screen.getByText(/Type a query above/i)).toBeInTheDocument();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("renders grouped sections on the All tab", async () => {
    nav.urlParams = new URLSearchParams("q=database&entity=all");
    (apiClient.get as Mock).mockResolvedValue({
      data: envelope(SAMPLE_ALL),
    });
    renderPage();

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        "/search?q=database&entity=all&page=1&limit=5",
      );
    });
    await screen.findByText("Database Systems Notes");
    expect(screen.getAllByText("Resources").length).toBeGreaterThan(0);
    expect(screen.getByText("View all 1 resources →")).toBeInTheDocument();
  });

  it("renders scoped results and desktop pagination", async () => {
    nav.urlParams = new URLSearchParams("q=database&entity=jobs");
    (apiClient.get as Mock).mockResolvedValue({
      data: envelope(SAMPLE_SCOPED),
    });
    renderPage();

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        "/search?q=database&entity=jobs&page=1&limit=10",
      );
    });
    await screen.findByText("Database Job 0");
    expect(screen.getByText(/12 results for/)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
  });

  it("navigates to a scoped tab when a tab is clicked", async () => {
    nav.urlParams = new URLSearchParams("q=database&entity=all");
    (apiClient.get as Mock).mockResolvedValue({
      data: envelope(SAMPLE_ALL),
    });
    renderPage();
    await screen.findByText("Database Systems Notes");

    act(() => {
      screen.getByRole("tab", { name: /Resources/ }).click();
    });
    expect(nav.push).toHaveBeenCalledWith("/search?q=database&entity=resources");
  });

  it("applies a department filter from the facet chips", async () => {
    nav.urlParams = new URLSearchParams("q=database&entity=all");
    (apiClient.get as Mock).mockResolvedValue({
      data: envelope(SAMPLE_ALL),
    });
    renderPage();
    await screen.findByText("Database Systems Notes");

    act(() => {
      screen.getByRole("button", { name: "CSE" }).click();
    });
    expect(nav.push).toHaveBeenCalledWith(
      "/search?q=database&department=CSE",
    );
  });

  it("shows an empty state when there are no results", async () => {
    nav.urlParams = new URLSearchParams("q=zzz&entity=all");
    (apiClient.get as Mock).mockResolvedValue({
      data: envelope({
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
      }),
    });
    renderPage();

    await screen.findByText(/No results for "zzz"/);
  });
});
