import { describe, expect, it } from "vitest";
import {
  cn,
  toHref,
  buildQueryString,
  getActivityLevel,
  ACTIVITY_BADGE,
} from "../utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });

  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("returns an empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("toHref", () => {
  it("accepts http and https urls", () => {
    expect(toHref("https://example.com")).toBe("https://example.com");
    expect(toHref("http://example.com/path?q=1")).toBe("http://example.com/path?q=1");
  });

  it("trims surrounding whitespace", () => {
    expect(toHref("  https://example.com  ")).toBe("https://example.com");
  });

  it("rejects non-http schemes", () => {
    expect(toHref("javascript:alert(1)")).toBeNull();
    expect(toHref("ftp://example.com")).toBeNull();
  });

  it("rejects invalid urls", () => {
    expect(toHref("not a url")).toBeNull();
    expect(toHref("https://")).toBeNull();
  });

  it("rejects empty strings", () => {
    expect(toHref("")).toBeNull();
  });
});

describe("buildQueryString", () => {
  it("returns an empty string for no params", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("skips undefined, null and empty values", () => {
    expect(buildQueryString({ a: "1", b: undefined, c: null, d: "" })).toBe("?a=1");
  });

  it("serializes arrays as comma-separated values", () => {
    expect(buildQueryString({ tags: ["a", "b"] })).toBe("?tags=a%2Cb");
  });

  it("encodes numbers and booleans", () => {
    expect(buildQueryString({ page: 2, active: true })).toBe("?page=2&active=true");
  });

  it("combines multiple params", () => {
    expect(buildQueryString({ page: "1", search: "hello world" })).toBe(
      "?page=1&search=hello+world",
    );
  });
});

describe("getActivityLevel", () => {
  const hoursAgo = (hours: number) =>
    new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  it("marks content newer than 24h as new", () => {
    expect(getActivityLevel(hoursAgo(2), 0, 0, 0)).toBe("new");
  });

  it("marks high-view content within a week as hot", () => {
    expect(getActivityLevel(hoursAgo(48), 150, 0, 0)).toBe("hot");
  });

  it("marks engaged content within two weeks as trending", () => {
    expect(getActivityLevel(hoursAgo(48), 5, 6, 5)).toBe("trending");
  });

  it("returns null for old content", () => {
    expect(getActivityLevel(hoursAgo(24 * 30), 500, 50, 50)).toBeNull();
  });

  it("does not mark low-view content as hot even if recent", () => {
    expect(getActivityLevel(hoursAgo(48), 50, 0, 0)).toBeNull();
  });
});

describe("ACTIVITY_BADGE", () => {
  it("provides labels and class names for every level", () => {
    expect(ACTIVITY_BADGE.new.label).toBe("New");
    expect(ACTIVITY_BADGE.hot.label).toBe("Hot");
    expect(ACTIVITY_BADGE.trending.label).toBe("Trending");
    expect(typeof ACTIVITY_BADGE.hot.className).toBe("string");
  });
});
