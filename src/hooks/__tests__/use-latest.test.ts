import { renderHook } from "@testing-library/react";
import { useLatest } from "../use-latest";

describe("useLatest", () => {
  it("returns a ref holding the current value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useLatest(value),
      { initialProps: { value: "a" } },
    );

    expect(result.current.current).toBe("a");

    rerender({ value: "b" });
    expect(result.current.current).toBe("b");
  });
});
