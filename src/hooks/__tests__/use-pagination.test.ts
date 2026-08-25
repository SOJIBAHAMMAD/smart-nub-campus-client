import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../use-pagination";

const routerMock = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
let pathname = "/";
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => routerMock,
  useSearchParams: () => searchParams,
  useSelectedLayoutSegment: () => null,
}));

beforeEach(() => {
  pathname = "/";
  searchParams = new URLSearchParams();
  routerMock.push.mockClear();
});

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

  it("derives the page from URL search params when syncWithUrl is enabled", () => {
    searchParams = new URLSearchParams("page=3");
    const { result } = renderHook(() =>
      usePagination({ syncWithUrl: true, pageSize: 10 }),
    );
    expect(result.current.page).toBe(3);
    expect(result.current.offset).toBe(20);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it("falls back to the initial page for invalid URL params", () => {
    searchParams = new URLSearchParams("page=abc");
    const { result } = renderHook(() =>
      usePagination({ initialPage: 2, syncWithUrl: true }),
    );
    expect(result.current.page).toBe(2);

    searchParams = new URLSearchParams("page=0");
    const { result: second } = renderHook(() =>
      usePagination({ initialPage: 2, syncWithUrl: true }),
    );
    expect(second.current.page).toBe(2);
  });

  it("uses a custom page param key when syncing with the URL", () => {
    searchParams = new URLSearchParams("cursor=4");
    const { result } = renderHook(() =>
      usePagination({ syncWithUrl: true, pageParam: "cursor" }),
    );
    expect(result.current.page).toBe(4);
  });

  it("setPage pushes the new page to the URL when syncWithUrl is enabled", () => {
    const { result, rerender } = renderHook(() =>
      usePagination({ syncWithUrl: true, pageSize: 10 }),
    );
    act(() => result.current.setPage(5));
    expect(routerMock.push).toHaveBeenCalledWith("/?page=5", { scroll: false });

    searchParams = new URLSearchParams("page=5");
    rerender();
    expect(result.current.page).toBe(5);
  });

  it("removes the page param when resetting to the initial page", () => {
    searchParams = new URLSearchParams("page=7");
    const { result, rerender } = renderHook(() =>
      usePagination({ syncWithUrl: true, initialPage: 1 }),
    );
    act(() => result.current.reset());
    expect(routerMock.push).toHaveBeenCalledWith("/?", { scroll: false });

    searchParams = new URLSearchParams("");
    rerender();
    expect(result.current.page).toBe(1);
  });

  it("clamps pages to 1 when syncing with the URL", () => {
    const { result } = renderHook(() =>
      usePagination({ syncWithUrl: true, pageSize: 10 }),
    );
    act(() => result.current.setPage(-3));
    expect(routerMock.push).toHaveBeenCalledWith("/?", { scroll: false });
    expect(result.current.page).toBe(1);
  });

  it("does not touch the router when syncWithUrl is disabled", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setPage(4));
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(result.current.page).toBe(4);
  });
});
