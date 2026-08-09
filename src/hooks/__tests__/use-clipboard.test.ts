import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "../use-clipboard";

let permissionState: string;
const clipboardWriteText = vi.fn();
const clipboardReadText = vi.fn();
const execCommand = vi.fn();

async function flushPermissions() {
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  });
}

vi.useFakeTimers();

describe("useClipboard", () => {
  beforeEach(() => {
    permissionState = "granted";
    clipboardWriteText.mockReset().mockResolvedValue(undefined);
    clipboardReadText.mockReset().mockResolvedValue("from-clipboard");
    execCommand.mockReset().mockReturnValue(true);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: { writeText: clipboardWriteText, readText: clipboardReadText },
    });

    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      writable: true,
      value: {
        query: vi.fn().mockImplementation(() =>
          Promise.resolve({ state: permissionState, onchange: null }),
        ),
      },
    });

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: execCommand,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("reports support when the Clipboard API is available", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.isSupported).toBe(true);
  });

  it("reports no support when the Clipboard API is unavailable and legacy is off", () => {
    Reflect.deleteProperty(navigator, "clipboard");
    const { result } = renderHook(() => useClipboard());
    expect(result.current.isSupported).toBe(false);
  });

  it("supports legacy mode when the Clipboard API is unavailable", () => {
    Reflect.deleteProperty(navigator, "clipboard");
    const { result } = renderHook(() => useClipboard({ legacy: true }));
    expect(result.current.isSupported).toBe(true);
  });

  it("copies text with the Clipboard API and resets the copied flag", async () => {
    const { result } = renderHook(() =>
      useClipboard({ copiedDuring: 500 }),
    );
    await flushPermissions();

    await act(async () => {
      await result.current.copy("hello world");
    });

    expect(clipboardWriteText).toHaveBeenCalledWith("hello world");
    expect(result.current.text).toBe("hello world");
    expect(result.current.copied).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.copied).toBe(false);
  });

  it("copies the source when no argument is passed", async () => {
    const { result } = renderHook(() =>
      useClipboard({ source: "source-value" }),
    );
    await flushPermissions();

    await act(async () => {
      await result.current.copy();
    });

    expect(clipboardWriteText).toHaveBeenCalledWith("source-value");
  });

  it("is a no-op when there is nothing to copy", async () => {
    const { result } = renderHook(() => useClipboard());
    await flushPermissions();

    await act(async () => {
      await result.current.copy();
    });

    expect(clipboardWriteText).not.toHaveBeenCalled();
    expect(execCommand).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });

  it("falls back to document.execCommand when the Clipboard API write fails", async () => {
    clipboardWriteText.mockRejectedValue(new Error("not allowed"));
    const { result } = renderHook(() => useClipboard());
    await flushPermissions();

    await act(async () => {
      await result.current.copy("legacy copy");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.text).toBe("legacy copy");
    expect(result.current.copied).toBe(true);
  });

  it("uses legacy copy when the write permission is not granted", async () => {
    permissionState = "denied";
    const { result } = renderHook(() => useClipboard());
    await flushPermissions();

    await act(async () => {
      await result.current.copy("denied copy");
    });

    expect(clipboardWriteText).not.toHaveBeenCalled();
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.text).toBe("denied copy");
  });

  it("clears the pending timeout on unmount", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() =>
      useClipboard({ copiedDuring: 5000 }),
    );
    await flushPermissions();

    await act(async () => {
      await result.current.copy("x");
    });
    expect(clearTimeoutSpy).not.toHaveBeenCalled();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
