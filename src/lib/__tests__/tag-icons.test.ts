import { describe, expect, it } from "vitest";
import { Tag, Network } from "lucide-react";
import { getTagIcon, hasDeviconIcon } from "../tag-icons";

describe("getTagIcon", () => {
  it("resolves known tech tags to devicon classes", () => {
    expect(getTagIcon("React")).toEqual({
      type: "devicon",
      className: "devicon-react-original colored",
    });
  });

  it("normalizes case, spaces and dots", () => {
    expect(getTagIcon("react")).toEqual({
      type: "devicon",
      className: "devicon-react-original colored",
    });
    expect(getTagIcon("Node.js")).toEqual({
      type: "devicon",
      className: "devicon-nodejs-plain colored",
    });
  });

  it("falls back to a lucide icon for mapped non-tech tags", () => {
    const result = getTagIcon("DSA");
    expect(result.type).toBe("lucide");
    expect(result.icon).toBe(Network);
  });

  it("falls back to the generic Tag icon for unknown tags", () => {
    const result = getTagIcon("Unknown Tag");
    expect(result.type).toBe("lucide");
    expect(result.icon).toBe(Tag);
  });
});

describe("hasDeviconIcon", () => {
  it("returns true for known tech tags", () => {
    expect(hasDeviconIcon("React")).toBe(true);
    expect(hasDeviconIcon("Node.js")).toBe(true);
  });

  it("returns false for non-tech tags", () => {
    expect(hasDeviconIcon("DSA")).toBe(false);
  });

  it("returns false for unknown tags", () => {
    expect(hasDeviconIcon("Totally Unknown")).toBe(false);
  });
});
