import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../use-pagination";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
}));

describe("usePagination", () => {
  it("returns initial state with page=1 and pageSize=12", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(12);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.offset).toBe(0);
  });

  it("setPage changes the page", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it("nextPage increments the page", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it("prevPage decrements the page but not below 1", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => result.current.setPage(3));
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(2);
  });

  it("computes offset correctly", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    expect(result.current.offset).toBe(0);

    act(() => result.current.setPage(3));
    expect(result.current.offset).toBe(24);

    act(() => result.current.setPage(1));
    expect(result.current.offset).toBe(0);
  });

  it("reset returns to initial state", () => {
    const { result } = renderHook(() => usePagination({ pageSize: 12 }));
    act(() => result.current.setPage(10));
    act(() => result.current.reset());
    expect(result.current.page).toBe(1);
    expect(result.current.offset).toBe(0);
    expect(result.current.hasPrevPage).toBe(false);
  });
});
