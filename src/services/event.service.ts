import serverApi from "@/lib/server-api";
import { buildQueryString } from "@/lib/utils";
import type {
  Event,
  ListEventsParams,
  EventListResponse,
} from "@/types/event.types";

export const eventService = {
  async listEvents(params: ListEventsParams = {}): Promise<EventListResponse> {
    const query = buildQueryString(params);
    const response = await serverApi.get<EventListResponse>(`/events${query}`, {
      tags: ["events-list"],
    });
    return response.data!;
  },

  async getUpcomingEvents(): Promise<Event[]> {
    const response = await serverApi.get<Event[]>("/events/upcoming", {
      tags: ["upcoming-events"],
    });
    return response.data!;
  },

  async getEventById(id: string): Promise<Event> {
    const response = await serverApi.get<Event>(`/events/${id}`, {
      tags: ["event-detail"],
    });
    return response.data!;
  },

  async toggleRsvp(eventId: string): Promise<{ action: "added" | "removed" }> {
    const response = await serverApi.post<{ action: "added" | "removed" }>(
      `/events/${eventId}/rsvp`,
      {},
    );
    return response.data!;
  },

  async createEvent(data: {
    title: string;
    description?: string;
    eventDate: string;
    location?: string;
    imageUrl?: string;
    status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
    isFeatured?: boolean;
  }): Promise<Event> {
    const response = await serverApi.post<Event>("/events", data);
    return response.data!;
  },

  async updateEvent(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      eventDate: string;
      location: string;
      imageUrl: string;
      status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
      isFeatured: boolean;
    }>,
  ): Promise<Event> {
    const response = await serverApi.patch<Event>(`/events/${id}`, data);
    return response.data!;
  },

  async deleteEvent(id: string): Promise<void> {
    await serverApi.del(`/events/${id}`);
  },
};
