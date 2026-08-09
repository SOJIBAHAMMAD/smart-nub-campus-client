import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "../use-media-query";

type ChangeListener = (e: { matches: boolean }) => void;

interface Mql {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

const listenersByQuery = new Map<string, Set<ChangeListener>>();
let queryMatches = new Map<string, boolean>();
let matchMediaMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  listenersByQuery.clear();
  queryMatches.clear();

  matchMediaMock = vi.fn((query: string): Mql => {
    return {
      matches: queryMatches.get(query) ?? false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(
        (_type: string, cb: ChangeListener) => {
          if (!listenersByQuery.has(query)) {
            listenersByQuery.set(query, new Set());
          }
          listenersByQuery.get(query)!.add(cb);
        },
      ),
      removeEventListener: vi.fn((_type: string, cb: ChangeListener) => {
        listenersByQuery.get(query)?.delete(cb);
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: matchMediaMock,
  });
});

function emitChange(query: string, matches: boolean) {
  act(() => {
    listenersByQuery.get(query)?.forEach((cb) => cb({ matches }));
  });
}

describe("useMediaQuery", () => {
  it("returns the initial match state", () => {
    queryMatches.set("(min-width: 600px)", true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when the query does not match", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));
    expect(result.current).toBe(false);
  });

  it("updates when the media query result changes", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));
    expect(result.current).toBe(false);

    emitChange("(min-width: 600px)", true);
    expect(result.current).toBe(true);

    emitChange("(min-width: 600px)", false);
    expect(result.current).toBe(false);
  });

  it("re-registers listeners when the query changes", () => {
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: "(min-width: 600px)" } },
    );

    emitChange("(min-width: 600px)", true);
    expect(result.current).toBe(true);

    rerender({ query: "(min-width: 900px)" });
    expect(result.current).toBe(true);

    emitChange("(min-width: 900px)", false);
    expect(result.current).toBe(false);
  });

  it("removes the change listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 600px)"));

    const mqls = matchMediaMock.mock.results.map((r) => r.value as Mql);
    const effectMql = mqls[mqls.length - 1];

    unmount();
    expect(effectMql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
