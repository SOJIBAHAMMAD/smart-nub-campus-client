import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@/__tests__/test-utils";
import { GlobalSearchProvider } from "../global-search-provider";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useRef } from "react";
import {
  SEARCH_RECENTS_KEY,
  SEARCH_RECENTS_MAX,
} from "../global-search-provider";

function Harness() {
  const {
    isOpen,
    toggle,
    open,
    query,
    setQuery,
    recents,
    addRecent,
    removeRecent,
    clearRecents,
  } = useGlobalSearch();
  const counter = useRef(0);

  const addDistinctRecent = () => {
    counter.current += 1;
    const n = counter.current;
    addRecent({
      query: `query-${n}`,
      entity: "resources",
      label: `Item ${n}`,
      url: `/resources/${n}`,
    });
  };

  return (
    <div>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => open("database")}>open-with-query</button>
      <span data-testid="open-state">{isOpen ? "open" : "closed"}</span>
      <input
        data-testid="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={addDistinctRecent}>add-distinct</button>
      <button
        onClick={() =>
          addRecent({
            query: "database",
            entity: "resources",
            label: "Database notes",
            url: "/resources/1",
          })
        }
      >
        add-recent
      </button>
      <button
        onClick={() =>
          addRecent({
            query: "db",
            entity: "jobs",
            label: "DB job",
            url: "/jobs/2",
          })
        }
      >
        add-recent-2
      </button>
      <button onClick={() => removeRecent("database", "/resources/1")}>
        remove-recent
      </button>
      <button onClick={clearRecents}>clear-recents</button>
      <span data-testid="recents-count">{recents.length}</span>
      <ul>
        {recents.map((r) => (
          <li key={`${r.query}:${r.url}`} data-testid="recent">
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderHarness() {
  return render(
    <GlobalSearchProvider>
      <Harness />
    </GlobalSearchProvider>,
  );
}

describe("GlobalSearchProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("is closed by default", () => {
    renderHarness();
    expect(screen.getByTestId("open-state")).toHaveTextContent("closed");
  });

  it("toggles with Cmd+K", () => {
    renderHarness();
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true }),
      );
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("open");

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
      );
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("closed");
  });

  it("opens with '/' when not typing in a field", () => {
    renderHarness();
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("open");
  });

  it("open(initialQuery) prefills the query and keeps it after open", () => {
    renderHarness();
    act(() => {
      screen.getByText("open-with-query").click();
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("open");
    expect(screen.getByTestId("search-input")).toHaveValue("database");
  });

  it("clears the query when opened again without an initial query", () => {
    renderHarness();
    act(() => {
      screen.getByText("open-with-query").click();
    });
    act(() => {
      screen.getByText("toggle").click();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("open");
    expect(screen.getByTestId("search-input")).toHaveValue("");
  });

  it("does NOT open with '/' while typing in an input", () => {
    renderHarness();
    const input = screen.getByTestId("search-input");
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "/", bubbles: true }),
      );
    });
    expect(screen.getByTestId("open-state")).toHaveTextContent("closed");
  });

  it("adds recents, persists them, and caps at SEARCH_RECENTS_MAX", () => {
    renderHarness();
    for (let i = 0; i < SEARCH_RECENTS_MAX + 3; i++) {
      act(() => {
        screen.getByText("add-distinct").click();
      });
    }
    expect(screen.getByTestId("recents-count")).toHaveTextContent(
      String(SEARCH_RECENTS_MAX),
    );

    const stored = JSON.parse(
      window.localStorage.getItem(SEARCH_RECENTS_KEY) ?? "[]",
    );
    expect(stored).toHaveLength(SEARCH_RECENTS_MAX);
    // Most recent entry comes first.
    expect(stored[0].url).toBe("/resources/9");
  });

  it("dedupes identical recent queries", () => {
    renderHarness();
    act(() => {
      screen.getByText("add-recent").click();
    });
    act(() => {
      screen.getByText("add-recent").click();
    });
    expect(screen.getByTestId("recents-count")).toHaveTextContent("1");
  });

  it("removes a single recent", () => {
    renderHarness();
    act(() => {
      screen.getByText("add-recent").click();
    });
    act(() => {
      screen.getByText("add-recent-2").click();
    });
    expect(screen.getByTestId("recents-count")).toHaveTextContent("2");

    act(() => {
      screen.getByText("remove-recent").click();
    });
    expect(screen.getByTestId("recents-count")).toHaveTextContent("1");
    expect(screen.queryByText("Database notes")).not.toBeInTheDocument();
    expect(screen.getByText("DB job")).toBeInTheDocument();
  });

  it("clears all recents", () => {
    renderHarness();
    act(() => {
      screen.getByText("add-recent").click();
    });
    act(() => {
      screen.getByText("clear-recents").click();
    });
    expect(screen.getByTestId("recents-count")).toHaveTextContent("0");
    expect(window.localStorage.getItem(SEARCH_RECENTS_KEY)).toEqual("[]");
  });
});
