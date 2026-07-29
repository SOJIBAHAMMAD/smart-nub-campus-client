import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

vi.useFakeTimers();

describe("useDebounce", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "hello" } },
    );

    expect(result.current).toBe("hello");

    rerender({ value: "world" });
    expect(result.current).toBe("hello");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("world");
  });

  it("uses default delay of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("b");
  });
});
