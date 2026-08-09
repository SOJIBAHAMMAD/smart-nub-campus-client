import { renderHook } from "@testing-library/react";
import { useLazyRef } from "../use-lazy-ref";

describe("useLazyRef", () => {
  it("initializes the ref only once", () => {
    const factory = vi.fn(() => 42);
    const { result, rerender } = renderHook(() => useLazyRef(factory));

    expect(result.current.current).toBe(42);

    rerender();
    expect(result.current.current).toBe(42);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("does not call the factory again after unmount and remount of the same instance", () => {
    const factory = vi.fn(() => "value");
    const { result, rerender } = renderHook(() => useLazyRef(factory));

    expect(result.current.current).toBe("value");
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
