import { renderHook, act } from "@testing-library/react";
import { useDebounceFn } from "../use-debounce-fn";

vi.useFakeTimers();

describe("useDebounceFn", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it("delays invocation until the debounce window elapses", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 100));

    act(() => result.current.run("a"));
    act(() => result.current.run("b"));
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("uses the default debounce delay of 1000ms", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn));

    act(() => result.current.run());
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(999));
    expect(fn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("flush invokes the pending call immediately", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 100));

    act(() => result.current.run("hello"));
    expect(fn).not.toHaveBeenCalled();

    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("hello");
  });

  it("cancel drops the pending call", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 100));

    act(() => result.current.run("hello"));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancels pending calls on unmount", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebounceFn(fn, 100));

    act(() => result.current.run("hello"));
    act(() => unmount());
    act(() => vi.advanceTimersByTime(200));
    expect(fn).not.toHaveBeenCalled();
  });
});
