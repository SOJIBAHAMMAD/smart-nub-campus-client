import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, render, screen, fireEvent } from "@/__tests__/test-utils";
import { apiClient } from "@/lib/api-client";
import { GlobalSearchProvider } from "@/providers/global-search-provider";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";
import { HeroBanner } from "../hero-banner";
import { WelcomeStrip } from "../welcome-strip";
import type { Mock } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
Element.prototype.scrollIntoView = vi.fn();

vi.useFakeTimers();

const EMPTY_RESPONSE = {
  success: true,
  message: "",
  data: {
    query: "",
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
};

function renderWithDialog(children: React.ReactNode) {
  return render(
    <GlobalSearchProvider>
      <GlobalSearchDialog />
      {children}
    </GlobalSearchProvider>,
  );
}

describe("Home search re-point", () => {
  beforeEach(() => {
    (apiClient.get as Mock).mockReset();
    (apiClient.get as Mock).mockResolvedValue({ data: EMPTY_RESPONSE });
  });

  it("hero banner submits open the global search dialog prefilled with the query", () => {
    renderWithDialog(<HeroBanner />);

    const input = screen.getByPlaceholderText(
      "Search resources, courses, people...",
    );
    fireEvent.change(input, { target: { value: "database" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("database");
  });

  it("welcome strip submits open the global search dialog prefilled with the query", () => {
    renderWithDialog(<WelcomeStrip />);

    const input = screen.getByPlaceholderText(
      "Search resources, courses, people...",
    );
    fireEvent.change(input, { target: { value: "dbms" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("dbms");
  });

  it("hero banner opens the dialog on an empty submit", () => {
    renderWithDialog(<HeroBanner />);

    const input = screen.getByPlaceholderText(
      "Search resources, courses, people...",
    );
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("advancing the debounce fetches results for the prefilled query", () => {
    renderWithDialog(<HeroBanner />);

    const input = screen.getByPlaceholderText(
      "Search resources, courses, people...",
    );
    fireEvent.change(input, { target: { value: "database" } });
    fireEvent.submit(input.closest("form") as HTMLFormElement);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/search?q=database&limit=5");
  });
});
