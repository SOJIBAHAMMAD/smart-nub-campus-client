import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

const mocks = vi.hoisted(() => ({
  serverApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/server-api", () => ({
  default: mocks.serverApi,
  serverApi: mocks.serverApi,
}));

import { connectionService } from "@/services/connection.service";
import { TAGS, CONNECTION_MUTATION_TAGS } from "@/lib/cache-tags";

function apiData<T>(data: T) {
  return { success: true, message: "", data };
}

describe("connectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchPeople", () => {
    it("calls GET /connections/search with no query string when unfiltered", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      const result = await connectionService.searchPeople({});

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/connections/search", {
        tags: [TAGS.CONNECTIONS],
      });
      expect(result).toEqual({ data: [], meta: { total: 0 } });
    });

    it("serializes filters including comma-joined skills", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      await connectionService.searchPeople({
        query: "Ali",
        department: "CSE",
        semester: "4",
        skills: ["react", "node"],
        page: 2,
        limit: 10,
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/connections/search?query=Ali&department=CSE&semester=4&skills=react%2Cnode&page=2&limit=10",
        { tags: [TAGS.CONNECTIONS] },
      );
    });
  });

  it("getSuggestions calls GET /connections/suggestions and falls back to []", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(
      apiData([{ id: "u-2" }]),
    );

    const result = await connectionService.getSuggestions();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/connections/suggestions",
      { tags: [TAGS.CONNECTIONS] },
    );
    expect(result).toEqual([{ id: "u-2" }]);

    (mocks.serverApi.get as Mock).mockResolvedValue({
      success: false,
      message: "nope",
    });
    await expect(connectionService.getSuggestions()).resolves.toEqual([]);
  });

  it("getPendingRequests calls GET /connections/pending", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([{ id: "conn-1" }]));

    const result = await connectionService.getPendingRequests();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/connections/pending", {
      tags: [TAGS.CONNECTION_REQUESTS],
    });
    expect(result).toEqual([{ id: "conn-1" }]);
  });

  it("getBlockedUsers calls GET /connections/blocked", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([{ id: "u-9" }]));

    const result = await connectionService.getBlockedUsers();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/connections/blocked", {
      tags: [TAGS.CONNECTIONS],
    });
    expect(result).toEqual([{ id: "u-9" }]);
  });

  it("getSentRequests calls GET /connections/sent", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([{ id: "conn-2" }]));

    const result = await connectionService.getSentRequests();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/connections/sent", {
      tags: [TAGS.CONNECTION_REQUESTS],
    });
    expect(result).toEqual([{ id: "conn-2" }]);
  });

  it("getMyConnections builds a filter and pagination query string", async () => {
    const response = {
      data: [{ id: "conn-3" }],
      meta: { total: 1, page: 2, limit: 12, totalPages: 1 },
    };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await connectionService.getMyConnections("SENIORS", 2, 12);

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/connections?filter=SENIORS&page=2&limit=12",
      { tags: [TAGS.CONNECTIONS] },
    );
    expect(result).toEqual(response);
  });

  it("getMyConnections uses ALL filter by default", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(
      apiData({ data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } }),
    );

    await connectionService.getMyConnections();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/connections?filter=ALL&page=1&limit=12",
      { tags: [TAGS.CONNECTIONS] },
    );
  });

  describe("getOverview", () => {
    it("aggregates counts from the underlying list calls", async () => {
      const all = apiData({
        data: [],
        meta: { total: 4, page: 1, limit: 1, totalPages: 4 },
      });
      const favorites = apiData({
        data: [],
        meta: { total: 2, page: 1, limit: 1, totalPages: 2 },
      });
      const pending = apiData([{ id: "conn-1" }, { id: "conn-2" }]);
      const sent = apiData([{ id: "conn-3" }]);
      const blocked = apiData([{ id: "u-9" }]);

      (mocks.serverApi.get as Mock)
        .mockResolvedValueOnce(all)
        .mockResolvedValueOnce(pending)
        .mockResolvedValueOnce(sent)
        .mockResolvedValueOnce(favorites)
        .mockResolvedValueOnce(blocked);

      const result = await connectionService.getOverview();

      expect(mocks.serverApi.get).toHaveBeenNthCalledWith(
        1,
        "/connections?filter=ALL&page=1&limit=1",
        { tags: [TAGS.CONNECTIONS] },
      );
      expect(mocks.serverApi.get).toHaveBeenNthCalledWith(
        2,
        "/connections/pending",
        { tags: [TAGS.CONNECTION_REQUESTS] },
      );
      expect(mocks.serverApi.get).toHaveBeenNthCalledWith(
        3,
        "/connections/sent",
        { tags: [TAGS.CONNECTION_REQUESTS] },
      );
      expect(mocks.serverApi.get).toHaveBeenNthCalledWith(
        4,
        "/connections?filter=FAVORITES&page=1&limit=1",
        { tags: [TAGS.CONNECTIONS] },
      );
      expect(mocks.serverApi.get).toHaveBeenNthCalledWith(
        5,
        "/connections/blocked",
        { tags: [TAGS.CONNECTIONS] },
      );

      expect(result).toEqual({
        totalConnections: 4,
        pending: 2,
        sent: 1,
        favorites: 2,
        blocked: 1,
      });
    });
  });

  it("sendRequest POSTs the receiverId and note", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.sendRequest("u-2", "Hey!");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/connections/request",
      { receiverId: "u-2", note: "Hey!" },
      { invalidatesTags: CONNECTION_MUTATION_TAGS },
    );
  });

  it("acceptRequest PUTs to the accept route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.acceptRequest("conn-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/connections/conn-1/accept",
      {},
      { invalidatesTags: CONNECTION_MUTATION_TAGS },
    );
  });

  it("rejectRequest PUTs to the reject route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.rejectRequest("conn-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/connections/conn-1/reject",
      {},
      { invalidatesTags: CONNECTION_MUTATION_TAGS },
    );
  });

  it("cancelRequest calls DELETE /connections/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.cancelRequest("conn-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/connections/conn-1", {
      invalidatesTags: CONNECTION_MUTATION_TAGS,
    });
  });

  it("toggleFavorite PUTs to the favorite route", async () => {
    (mocks.serverApi.put as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.toggleFavorite("conn-1");

    expect(mocks.serverApi.put).toHaveBeenCalledWith(
      "/connections/conn-1/favorite",
      {},
      { invalidatesTags: CONNECTION_MUTATION_TAGS },
    );
  });

  it("removeConnection calls DELETE /connections/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.removeConnection("conn-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/connections/conn-1", {
      invalidatesTags: CONNECTION_MUTATION_TAGS,
    });
  });

  it("blockUser POSTs the blockedId", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.blockUser("u-9");

    expect(mocks.serverApi.post).toHaveBeenCalledWith(
      "/connections/block",
      { blockedId: "u-9" },
      { invalidatesTags: CONNECTION_MUTATION_TAGS },
    );
  });

  it("unblockUser calls DELETE /connections/block/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await connectionService.unblockUser("u-9");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/connections/block/u-9", {
      invalidatesTags: CONNECTION_MUTATION_TAGS,
    });
  });

  it("getActiveUsers calls GET with the limit", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData([{ id: "u-1" }]));

    const result = await connectionService.getActiveUsers(8);

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/connections/active?limit=8", {
      tags: [TAGS.CONNECTIONS],
    });
    expect(result).toEqual([{ id: "u-1" }]);
  });

  it("getProfileCompleteness returns the payload or a zeroed fallback", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(
      apiData({ percentage: 60, missingFields: ["skills"] }),
    );

    const result = await connectionService.getProfileCompleteness();

    expect(mocks.serverApi.get).toHaveBeenCalledWith(
      "/connections/profile-completeness",
      { tags: [TAGS.CONNECTIONS] },
    );
    expect(result).toEqual({ percentage: 60, missingFields: ["skills"] });

    (mocks.serverApi.get as Mock).mockResolvedValue({
      success: false,
      message: "nope",
    });
    await expect(connectionService.getProfileCompleteness()).resolves.toEqual({
      percentage: 0,
      missingFields: [],
    });
  });

  it("propagates API errors from getMyConnections", async () => {
    (mocks.serverApi.get as Mock).mockRejectedValue(new Error("Unauthorized"));

    await expect(connectionService.getMyConnections()).rejects.toThrow(
      "Unauthorized",
    );
  });
});
