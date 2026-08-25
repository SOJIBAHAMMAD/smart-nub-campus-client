import { describe, expect, it } from "vitest";
import {
  TAGS,
  RESOURCE_MUTATION_TAGS,
  TEAM_MUTATION_TAGS,
  DISCUSSION_MUTATION_TAGS,
  QA_MUTATION_TAGS,
  CONNECTION_MUTATION_TAGS,
} from "../cache-tags";

describe("TAGS", () => {
  it("uses stable string values", () => {
    expect(TAGS.RESOURCES).toBe("resources");
    expect(TAGS.RESOURCE_DETAIL).toBe("resource-detail");
    expect(TAGS.TEAMS_LIST).toBe("teams-list");
    expect(TAGS.DISCUSSIONS).toBe("discussions");
    expect(TAGS.QA).toBe("qa");
    expect(TAGS.CONNECTIONS).toBe("connections");
    expect(TAGS.JOBS).toBe("jobs");
    expect(TAGS.PROFILE).toBe("user-profile");
    expect(TAGS.ACTIVITIES).toBe("activities");
  });

  it("has no duplicate tag values", () => {
    const values = Object.values(TAGS);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("mutation tags", () => {
  it("includes the list, detail, and activity tags for resources", () => {
    expect(RESOURCE_MUTATION_TAGS).toContain(TAGS.RESOURCES);
    expect(RESOURCE_MUTATION_TAGS).toContain(TAGS.RESOURCES_TRENDING);
    expect(RESOURCE_MUTATION_TAGS).toContain(TAGS.ACTIVITIES);
  });

  it("includes the list, detail, and activity tags for teams", () => {
    expect(TEAM_MUTATION_TAGS).toContain(TAGS.TEAMS_LIST);
    expect(TEAM_MUTATION_TAGS).toContain(TAGS.TEAM_DETAIL);
    expect(TEAM_MUTATION_TAGS).toContain(TAGS.ACTIVITIES);
  });

  it("includes the list, detail, trending, and activity tags for discussions", () => {
    expect(DISCUSSION_MUTATION_TAGS).toContain(TAGS.DISCUSSIONS);
    expect(DISCUSSION_MUTATION_TAGS).toContain(TAGS.DISCUSSION_DETAIL);
    expect(DISCUSSION_MUTATION_TAGS).toContain(TAGS.DISCUSSIONS_TRENDING);
    expect(DISCUSSION_MUTATION_TAGS).toContain(TAGS.ACTIVITIES);
  });

  it("includes the list, detail, trending, and activity tags for qa", () => {
    expect(QA_MUTATION_TAGS).toContain(TAGS.QA);
    expect(QA_MUTATION_TAGS).toContain(TAGS.QA_DETAIL);
    expect(QA_MUTATION_TAGS).toContain(TAGS.QA_TRENDING);
    expect(QA_MUTATION_TAGS).toContain(TAGS.ACTIVITIES);
  });

  it("includes the connections and requests tags", () => {
    expect(CONNECTION_MUTATION_TAGS).toContain(TAGS.CONNECTIONS);
    expect(CONNECTION_MUTATION_TAGS).toContain(TAGS.CONNECTION_REQUESTS);
  });
});
