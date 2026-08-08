import { renderHook } from "@testing-library/react";
import { useMemoizedFn } from "../use-memoized-fn";

describe("useMemoizedFn", () => {
  it("returns a stable function reference across renders", () => {
    const { result, rerender } = renderHook(
      ({ fn }) => useMemoizedFn(fn),
      { initialProps: { fn: () => 1 } },
    );

    const first = result.current;
    rerender({ fn: () => 2 });
    expect(result.current).toBe(first);
  });

  it("always calls the latest function", () => {
    const { result, rerender } = renderHook(
      ({ fn }) => useMemoizedFn(fn),
      { initialProps: { fn: () => 1 } },
    );

    const first = result.current as unknown as () => number;
    expect(first()).toBe(1);

    rerender({ fn: () => 2 });
    expect(first()).toBe(2);
  });

  it("forwards arguments to the underlying function", () => {
    const { result } = renderHook(() =>
      useMemoizedFn((a: number, b: number) => a + b),
    );
    expect(result.current(1, 2)).toBe(3);
  });
});
