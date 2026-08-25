import { renderHook, act, waitFor } from "@testing-library/react";
import { useBattery } from "../use-battery";

interface BatteryMock {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

let battery: BatteryMock;
let listenerMap: Record<string, ((...args: unknown[]) => void)[]>;
let getBattery: ReturnType<typeof vi.fn>;

function installGetBattery() {
  Object.defineProperty(navigator, "getBattery", {
    configurable: true,
    value: getBattery,
  });
}

beforeEach(() => {
  listenerMap = {};
  battery = {
    charging: true,
    chargingTime: 1200,
    dischargingTime: Infinity,
    level: 0.75,
    addEventListener: vi.fn((event: string, cb: () => void) => {
      (listenerMap[event] ??= []).push(cb);
    }),
    removeEventListener: vi.fn(),
  };
  getBattery = vi.fn().mockResolvedValue(battery);
  installGetBattery();
});

describe("useBattery", () => {
  it("reports unsupported when getBattery is unavailable", () => {
    Reflect.deleteProperty(navigator, "getBattery");
    const { result } = renderHook(() => useBattery());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.level).toBe(1);
    expect(result.current.charging).toBe(false);
  });

  it("reflects the battery state when supported", async () => {
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
      expect(result.current.level).toBe(0.75);
    });

    expect(result.current.charging).toBe(true);
    expect(result.current.chargingTime).toBe(1200);
    expect(result.current.dischargingTime).toBe(Infinity);
  });

  it("updates state on battery events", async () => {
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(listenerMap.levelchange?.length).toBeGreaterThan(0);
    });

    battery.level = 0.2;
    battery.charging = false;
    act(() => {
      listenerMap.levelchange.forEach((cb) => cb());
    });

    expect(result.current.level).toBe(0.2);
    expect(result.current.charging).toBe(false);
  });

  it("keeps defaults when getBattery rejects", async () => {
    getBattery.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(getBattery).toHaveBeenCalled();
    });

    expect(result.current.isSupported).toBe(true);
    expect(result.current.level).toBe(1);
    expect(result.current.charging).toBe(false);
  });

  it("removes event listeners on unmount", async () => {
    const { result, unmount } = renderHook(() => useBattery());

    await waitFor(() => {
      expect(result.current.level).toBe(0.75);
    });

    unmount();
    expect(battery.removeEventListener).toHaveBeenCalled();
  });
});
