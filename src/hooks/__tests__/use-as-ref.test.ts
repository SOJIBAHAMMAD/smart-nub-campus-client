import { renderHook } from "@testing-library/react";
import { useAsRef } from "../use-as-ref";

describe("useAsRef", () => {
  it("keeps the ref updated with the latest props", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAsRef({ value }),
      { initialProps: { value: 1 } },
    );

    expect(result.current.current).toEqual({ value: 1 });

    rerender({ value: 2 });
    expect(result.current.current).toEqual({ value: 2 });
  });
});
