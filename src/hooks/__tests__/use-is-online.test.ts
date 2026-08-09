import { renderHook, act } from "@testing-library/react";
import { useIsOnline } from "../use-is-online";

let online = true;

beforeEach(() => {
  online = true;
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => online,
  });
});

describe("useIsOnline", () => {
  it("returns the current navigator online state", () => {
    const { result } = renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  it("tracks the offline event", () => {
    const { result } = renderHook(() => useIsOnline());
    online = false;
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);
  });

  it("tracks the online event", () => {
    const { result } = renderHook(() => useIsOnline());
    online = false;
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);

    online = true;
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current).toBe(true);
  });

  it("removes listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIsOnline());

    unmount();
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    removeSpy.mockRestore();
  });
});
