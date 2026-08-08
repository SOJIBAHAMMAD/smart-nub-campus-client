import { renderHook } from "@testing-library/react";
import { useUnmount } from "../use-unmount";

describe("useUnmount", () => {
  it("does not call the callback before unmount", () => {
    const fn = vi.fn();
    renderHook(() => useUnmount(fn));
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the callback on unmount", () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useUnmount(fn));

    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls the latest callback on unmount", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ cb }) => useUnmount(cb),
      { initialProps: { cb: first } },
    );

    rerender({ cb: second });
    unmount();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
