import { renderHook, act } from "@testing-library/react";
import { useTags } from "../use-tags";
import { listTags, createTag } from "@/actions/tag.actions";

vi.mock("@/actions/tag.actions", () => ({
  listTags: vi.fn(),
  createTag: vi.fn(),
}));

const mockedListTags = vi.mocked(listTags);
const mockedCreateTag = vi.mocked(createTag);

const tags = [
  {
    id: "1",
    name: "Alpha",
    slug: "alpha",
    totalCount: 2,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Beta",
    slug: "beta",
    totalCount: 5,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

vi.useFakeTimers();

describe("useTags", () => {
  beforeEach(() => {
    mockedListTags.mockReset();
    mockedCreateTag.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("loads tags on mount", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tags).toEqual(tags);
    expect(result.current.filteredTags).toEqual(tags);
  });

  it("keeps tags empty when the fetch fails", async () => {
    mockedListTags.mockResolvedValue({
      success: false,
      message: "Failed to fetch tags.",
      data: [],
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tags).toEqual([]);
  });

  it("filters tags by search with a debounce", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    act(() => result.current.setSearch("beta"));
    expect(result.current.filteredTags).toEqual(tags);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.filteredTags).toEqual([tags[1]]);
  });

  it("returns all tags when search is empty", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    act(() => result.current.setSearch(" "));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.filteredTags).toEqual(tags);
  });

  it("creates a tag and appends it sorted", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });
    mockedCreateTag.mockResolvedValue({
      success: true,
      message: "Tag created.",
      data: { id: "3", name: "Charlie", slug: "charlie" },
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    let created: { id: string; name: string; slug: string } | undefined;

    await act(async () => {
      created = await result.current.createTag("Charlie");
    });

    expect(created).toEqual({ id: "3", name: "Charlie", slug: "charlie" });
    expect(result.current.isCreating).toBe(false);
    expect(result.current.tags.map((t) => t.name)).toEqual([
      "Alpha",
      "Beta",
      "Charlie",
    ]);
    expect(result.current.tags[2]).toEqual(
      expect.objectContaining({
        id: "3",
        name: "Charlie",
        totalCount: 0,
      }),
    );
  });

  it("does not duplicate tags with the same id", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });
    mockedCreateTag.mockResolvedValue({
      success: true,
      message: "Tag created.",
      data: { id: "1", name: "Alpha", slug: "alpha" },
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.createTag("Alpha");
    });

    expect(result.current.tags).toHaveLength(2);
  });

  it("throws when the tag cannot be created", async () => {
    mockedListTags.mockResolvedValue({
      success: true,
      message: "Tags fetched.",
      data: tags,
    });
    mockedCreateTag.mockResolvedValue({
      success: false,
      message: "Tag already exists.",
    });

    const { result } = renderHook(() => useTags({ debounceMs: 0 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    let error: unknown;

    await act(async () => {
      try {
        await result.current.createTag("Alpha");
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("Tag already exists.");
    expect(result.current.isCreating).toBe(false);
  });
});
