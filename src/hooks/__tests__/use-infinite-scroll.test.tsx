import { render, act } from "@testing-library/react";
import { useInfiniteScroll } from "../use-infinite-scroll";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  root: Element | Document | null = null;
  rootMargin: string = "";
  thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(
    public callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? "";
    const threshold = options?.threshold;
    this.thresholds = Array.isArray(threshold)
      ? threshold
      : threshold != null
        ? [threshold]
        : [];
    MockIntersectionObserver.instances.push(this);
  }
}

function TestSentinel({
  hasMore,
  isLoading,
  loadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
}) {
  const { sentinelRef } = useInfiniteScroll({ hasMore, isLoading, loadMore });
  return <div ref={sentinelRef} data-testid="sentinel" />;
}

function lastObserver() {
  const observers = MockIntersectionObserver.instances;
  return observers[observers.length - 1];
}

function intersect(observer: MockIntersectionObserver, isIntersecting: boolean) {
  act(() => {
    observer.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
  });
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useInfiniteScroll", () => {
  it("observes the sentinel and calls loadMore when it intersects", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn();

    const { unmount } = render(
      <TestSentinel hasMore isLoading={false} loadMore={loadMore} />,
    );

    const observer = lastObserver();
    expect(observer.observe).toHaveBeenCalled();
    expect(observer.rootMargin).toBe("200px");

    intersect(observer, true);
    expect(loadMore).toHaveBeenCalledTimes(1);

    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("does not call loadMore while loading", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn();

    render(<TestSentinel hasMore isLoading loadMore={loadMore} />);

    intersect(lastObserver(), true);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it("does not call loadMore when hasMore is false", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn();

    render(
      <TestSentinel hasMore={false} isLoading={false} loadMore={loadMore} />,
    );

    intersect(lastObserver(), true);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it("does not call loadMore when the sentinel is not intersecting", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn();

    render(
      <TestSentinel hasMore isLoading={false} loadMore={loadMore} />,
    );

    intersect(lastObserver(), false);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it("re-runs loadMore when intersecting again after loading finishes", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    const loadMore = vi.fn();

    const { rerender } = render(
      <TestSentinel hasMore isLoading loadMore={loadMore} />,
    );

    intersect(lastObserver(), true);
    expect(loadMore).not.toHaveBeenCalled();

    rerender(<TestSentinel hasMore isLoading={false} loadMore={loadMore} />);
    intersect(lastObserver(), true);
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
