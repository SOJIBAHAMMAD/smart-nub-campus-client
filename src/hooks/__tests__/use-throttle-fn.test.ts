import { renderHook, act } from "@testing-library/react";
import { useThrottleFn } from "../use-throttle-fn";

vi.useFakeTimers();

describe("useThrottleFn", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("invokes the function immediately, then throttles subsequent calls", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 100));

    act(() => result.current.run("a"));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");

    act(() => result.current.run("b"));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });

  it("uses the default throttle delay of 1000ms", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn));

    act(() => result.current.run());
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => result.current.run());
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(999));
    expect(fn).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("flush invokes the pending trailing call immediately", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 100));

    act(() => result.current.run("a"));
    act(() => result.current.run("b"));

    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("b");
  });

  it("cancel drops the pending trailing call", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottleFn(fn, 100));

    act(() => result.current.run("a"));
    act(() => result.current.run("b"));

    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancels pending calls on unmount", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useThrottleFn(fn, 100));

    act(() => result.current.run("a"));
    act(() => result.current.run("b"));

    act(() => unmount());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
