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

import { eventService } from "@/services/event.service";
import type { Event, EventListResponse } from "@/types/event.types";
import type { PaginationMeta } from "@/types/resource.types";

const EVENT: Event = {
  id: "event-1",
  title: "Career Fair",
  eventDate: "2026-03-01T09:00:00.000Z",
  status: "UPCOMING",
  isFeatured: true,
  audience: "EVERYONE",
  _count: { rsvps: 3 },
  isRsvpd: false,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const META: PaginationMeta = { total: 1, page: 1, limit: 12, totalPages: 1 };

const LIST_RESPONSE: EventListResponse = { data: [EVENT], meta: META };

describe("eventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listEvents", () => {
    it("calls GET /events with no query string by default", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue({
        success: true,
        message: "",
        data: LIST_RESPONSE,
      });

      const result = await eventService.listEvents();

      expect(mocks.serverApi.get).toHaveBeenCalledTimes(1);
      expect(mocks.serverApi.get).toHaveBeenCalledWith("/events", {
        tags: ["events-list"],
      });
      expect(result).toEqual(LIST_RESPONSE);
    });

    it("builds a query string from filters", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue({
        success: true,
        message: "",
        data: LIST_RESPONSE,
      });

      await eventService.listEvents({
        page: 2,
        limit: 10,
        status: "UPCOMING",
        search: "hackathon",
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/events?page=2&limit=10&status=UPCOMING&search=hackathon",
        { tags: ["events-list"] },
      );
    });

    it("propagates API errors", async () => {
      (mocks.serverApi.get as Mock).mockRejectedValue(
        new Error("Failed to load events"),
      );

      await expect(eventService.listEvents()).rejects.toThrow(
        "Failed to load events",
      );
    });
  });

  it("getUpcomingEvents calls GET /events/upcoming with the upcoming tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: [EVENT],
    });

    const result = await eventService.getUpcomingEvents();

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/events/upcoming", {
      tags: ["upcoming-events"],
    });
    expect(result).toEqual([EVENT]);
  });

  it("getEventById calls GET /events/:id with the detail tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: EVENT,
    });

    const result = await eventService.getEventById("event-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/events/event-1", {
      tags: ["event-detail"],
    });
    expect(result).toEqual(EVENT);
  });

  it("toggleRsvp POSTs to the rsvp endpoint", async () => {
    (mocks.serverApi.post as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: { action: "added" },
    });

    const result = await eventService.toggleRsvp("event-1");

    expect(mocks.serverApi.post).toHaveBeenCalledTimes(1);
    expect(mocks.serverApi.post).toHaveBeenCalledWith("/events/event-1/rsvp", {});
    expect(result).toEqual({ action: "added" });
  });

  it("createEvent POSTs the payload to /events", async () => {
    const payload = {
      title: "Networking Night",
      eventDate: "2026-04-01T18:00:00.000Z",
      location: "Hall A",
      isFeatured: false,
    };
    (mocks.serverApi.post as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: EVENT,
    });

    const result = await eventService.createEvent(payload);

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/events", payload);
    expect(result).toEqual(EVENT);
  });

  it("updateEvent PATCHes the payload to /events/:id", async () => {
    (mocks.serverApi.patch as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: EVENT,
    });

    const result = await eventService.updateEvent("event-1", {
      title: "Career Fair 2026",
      isFeatured: true,
    });

    expect(mocks.serverApi.patch).toHaveBeenCalledWith("/events/event-1", {
      title: "Career Fair 2026",
      isFeatured: true,
    });
    expect(result).toEqual(EVENT);
  });

  it("deleteEvent calls DELETE /events/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({
      success: true,
      message: "",
    });

    await eventService.deleteEvent("event-1");

    expect(mocks.serverApi.del).toHaveBeenCalledTimes(1);
    expect(mocks.serverApi.del).toHaveBeenCalledWith("/events/event-1");
  });
});
