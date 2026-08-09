import { renderHook } from "@testing-library/react";
import { getOS, useOs } from "../use-os";

function setNavigator(userAgent: string, platform?: string) {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    get: () => userAgent,
  });
  Object.defineProperty(navigator, "platform", {
    configurable: true,
    get: () => platform ?? "",
  });
}

describe("getOS", () => {
  it("returns undetermined when getValueInEffect is true", () => {
    expect(getOS({ getValueInEffect: true })).toBe("undetermined");
  });

  it("detects windows", () => {
    setNavigator(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Win32",
    );
    expect(getOS({ getValueInEffect: false })).toBe("windows");
  });

  it("detects macos", () => {
    setNavigator(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "MacIntel",
    );
    expect(getOS({ getValueInEffect: false })).toBe("macos");
  });

  it("detects android", () => {
    setNavigator(
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
      "Linux armv8l",
    );
    expect(getOS({ getValueInEffect: false })).toBe("android");
  });

  it("detects ios", () => {
    setNavigator(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      "iPhone",
    );
    expect(getOS({ getValueInEffect: false })).toBe("ios");
  });

  it("detects chromeos", () => {
    setNavigator(
      "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36",
      "CrOS x86_64",
    );
    expect(getOS({ getValueInEffect: false })).toBe("chromeos");
  });

  it("detects linux", () => {
    setNavigator(
      "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36",
      "Linux x86_64",
    );
    expect(getOS({ getValueInEffect: false })).toBe("linux");
  });

  it("returns undetermined for unknown platforms", () => {
    setNavigator("Some Unknown Browser", "Unknown Platform");
    expect(getOS({ getValueInEffect: false })).toBe("undetermined");
  });
});

describe("useOs", () => {
  beforeEach(() => {
    setNavigator(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Win32",
    );
  });

  it("detects the OS in an effect by default", () => {
    const { result } = renderHook(() => useOs());
    expect(result.current).toBe("windows");
  });

  it("computes the OS synchronously when getValueInEffect is false", () => {
    const { result } = renderHook(() => useOs({ getValueInEffect: false }));
    expect(result.current).toBe("windows");
  });
});
