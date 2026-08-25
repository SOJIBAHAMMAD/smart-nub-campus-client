import { describe, expect, it } from "vitest";
import {
  SEARCH_ENTITY_CONFIG,
  SEARCH_ENTITY_ORDER,
  SEARCH_TABS,
  getEntityConfig,
} from "../search-entity-config";
import type { SearchResultItem } from "@/types/search.types";

function makeItem(partial: Partial<SearchResultItem>): SearchResultItem {
  return {
    id: "1",
    title: "Title",
    subtitle: null,
    snippet: null,
    url: null,
    rank: 1,
    type: "resources",
    createdAt: null,
    data: {},
    ...partial,
  };
}

describe("search-entity-config", () => {
  it("covers every backend searchable entity exactly once", () => {
    expect(SEARCH_ENTITY_ORDER).toEqual([
      "resources",
      "discussions",
      "questions",
      "teams",
      "events",
      "courses",
      "jobs",
      "people",
      "mentorship",
    ]);
  });

  it("prefers the server-provided url when present", () => {
    const item = makeItem({
      type: "resources",
      url: "/resources/custom",
    });
    expect(SEARCH_ENTITY_CONFIG.resources.buildRoute(item)).toBe(
      "/resources/custom",
    );
  });

  it("builds detail routes from the id when no url is provided", () => {
    const cases: Array<{
      entity: keyof typeof SEARCH_ENTITY_CONFIG;
      expected: string;
    }> = [
      { entity: "resources", expected: "/resources/42" },
      { entity: "discussions", expected: "/discussions/42" },
      { entity: "questions", expected: "/qa/42" },
      { entity: "teams", expected: "/teams/42" },
      { entity: "events", expected: "/events/42" },
      { entity: "courses", expected: "/courses/42" },
      { entity: "jobs", expected: "/jobs/42" },
    ];

    for (const { entity, expected } of cases) {
      const item = makeItem({ type: entity, id: "42", url: null });
      expect(SEARCH_ENTITY_CONFIG[entity].buildRoute(item)).toBe(expected);
    }
  });

  it("falls back to data.userId for people and mentorship", () => {
    const people = makeItem({
      type: "people",
      id: "result-1",
      data: { userId: "user-9" },
    });
    expect(SEARCH_ENTITY_CONFIG.people.buildRoute(people)).toBe(
      "/profile/user-9",
    );

    const mentorship = makeItem({
      type: "mentorship",
      id: "result-2",
      data: { userId: "user-10" },
    });
    expect(SEARCH_ENTITY_CONFIG.mentorship.buildRoute(mentorship)).toBe(
      "/profile/user-10",
    );
  });

  it("prefers the server-provided url for courses when present", () => {
    const course = makeItem({
      type: "courses",
      url: "/courses/custom",
    });
    expect(SEARCH_ENTITY_CONFIG.courses.buildRoute(course)).toBe(
      "/courses/custom",
    );
  });

  it("treats 'all' as no specific config", () => {
    expect(getEntityConfig("all")).toBeNull();
    expect(getEntityConfig("jobs")).not.toBeNull();
  });

  it("builds SERP tabs with 'All' first", () => {
    expect(SEARCH_TABS[0]).toEqual({ entity: "all", label: "All" });
    expect(SEARCH_TABS.slice(1).map((tab) => tab.entity)).toEqual(
      SEARCH_ENTITY_ORDER,
    );
  });
});
