import { renderHook, act } from "@testing-library/react";
import { useEventListener } from "../use-event-listener";

describe("useEventListener", () => {
  it("listens to window events", () => {
    const handler = vi.fn();
    renderHook(() => useEventListener("click", handler));

    act(() => window.dispatchEvent(new MouseEvent("click")));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("listens to multiple events", () => {
    const handler = vi.fn();
    renderHook(() => useEventListener(["click", "keydown"], handler));

    act(() => window.dispatchEvent(new MouseEvent("click")));
    act(() => window.dispatchEvent(new KeyboardEvent("keydown")));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("listens on a custom target element", () => {
    const handler = vi.fn();
    const el = document.createElement("div");
    renderHook(() => useEventListener("click", handler, { target: el }));

    act(() => el.dispatchEvent(new MouseEvent("click")));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not listen when disabled", () => {
    const handler = vi.fn();
    renderHook(() => useEventListener("click", handler, { enable: false }));

    act(() => window.dispatchEvent(new MouseEvent("click")));
    expect(handler).not.toHaveBeenCalled();
  });

  it("uses the latest handler", () => {
    const el = document.createElement("div");
    const { rerender } = renderHook(
      ({ cb }) => useEventListener("click", cb, { target: el }),
      { initialProps: { cb: vi.fn() } },
    );

    const second = vi.fn();
    rerender({ cb: second });

    act(() => el.dispatchEvent(new MouseEvent("click")));
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", () => {
    const handler = vi.fn();
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useEventListener("click", handler));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function), {
      capture: undefined,
    });
    removeSpy.mockRestore();
  });
});
