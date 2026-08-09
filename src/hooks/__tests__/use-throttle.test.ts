import { renderHook, act } from "@testing-library/react";
import { useThrottle } from "../use-throttle";

vi.useFakeTimers();

describe("useThrottle", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("throttles value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 300),
      { initialProps: { value: "hello" } },
    );

    expect(result.current).toBe("hello");

    rerender({ value: "world" });
    expect(result.current).toBe("hello");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("world");
  });

  it("uses the default throttle delay of 1000ms", () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });
});
