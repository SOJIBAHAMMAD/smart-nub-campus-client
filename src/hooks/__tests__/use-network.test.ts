import { renderHook, act } from "@testing-library/react";
import { useNetwork } from "../use-network";

let online = true;
let connection: {
  rtt: number;
  type: string;
  saveData: boolean;
  downlink: number;
  downlinkMax: number;
  effectiveType: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
};
let connectionListeners: Record<string, ((...args: unknown[]) => void)[]>;

beforeEach(() => {
  online = true;
  connectionListeners = {};

  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => online,
  });

  connection = {
    rtt: 50,
    type: "4g",
    saveData: false,
    downlink: 10,
    downlinkMax: 20,
    effectiveType: "4g",
    addEventListener: vi.fn((event: string, cb: () => void) => {
      (connectionListeners[event] ??= []).push(cb);
    }),
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => connection,
  });
});

describe("useNetwork", () => {
  it("returns the initial network state including connection info", () => {
    const { result } = renderHook(() => useNetwork());
    expect(result.current.online).toBe(true);
    expect(result.current.rtt).toBe(50);
    expect(result.current.type).toBe("4g");
    expect(result.current.downlink).toBe(10);
    expect(result.current.effectiveType).toBe("4g");
    expect(result.current.saveData).toBe(false);
  });

  it("tracks the offline event", () => {
    const { result } = renderHook(() => useNetwork());
    online = false;
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current.online).toBe(false);
  });

  it("tracks the online event", () => {
    const { result } = renderHook(() => useNetwork());
    online = false;
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current.online).toBe(false);

    online = true;
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current.online).toBe(true);
  });

  it("updates connection info when the connection changes", () => {
    const { result } = renderHook(() => useNetwork());

    connection.rtt = 200;
    connection.effectiveType = "3g";
    connection.type = "3g";
    act(() => connectionListeners.change.forEach((cb) => cb()));

    expect(result.current.rtt).toBe(200);
    expect(result.current.effectiveType).toBe("3g");
    expect(result.current.type).toBe("3g");
  });

  it("returns only the online state when connection is unavailable", () => {
    Reflect.deleteProperty(navigator, "connection");
    const { result } = renderHook(() => useNetwork());
    expect(result.current.online).toBe(true);
    expect(result.current.rtt).toBeUndefined();
    expect(result.current.effectiveType).toBeUndefined();
  });
});
