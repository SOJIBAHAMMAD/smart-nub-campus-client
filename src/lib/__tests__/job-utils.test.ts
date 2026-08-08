import { describe, expect, it } from "vitest";
import { JobType } from "@/constants/enums";
import {
  EMPLOYMENT_TYPE_LABELS,
  departmentLabel,
  employmentLabel,
  stripHtml,
  isRichHtml,
  escapeHtml,
  textToHtml,
  getDeadlineInfo,
  formatDate,
  timeAgo,
} from "../job-utils";

describe("EMPLOYMENT_TYPE_LABELS", () => {
  it("covers every job type", () => {
    for (const type of [
      JobType.FULL_TIME,
      JobType.PART_TIME,
      JobType.CONTRACT,
      JobType.INTERNSHIP,
      JobType.REMOTE,
    ]) {
      expect(typeof EMPLOYMENT_TYPE_LABELS[type]).toBe("string");
    }
  });
});

describe("departmentLabel", () => {
  it("maps a known department to its label", () => {
    expect(departmentLabel("CSE")).toBe("Computer Science & Engineering");
  });

  it("falls back to the raw value for unknown departments", () => {
    expect(departmentLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("returns null for empty input", () => {
    expect(departmentLabel(null)).toBeNull();
    expect(departmentLabel(undefined)).toBeNull();
  });
});

describe("employmentLabel", () => {
  it("maps a known employment type", () => {
    expect(employmentLabel(JobType.INTERNSHIP)).toBe("Internship");
  });

  it("falls back to the raw value", () => {
    expect(employmentLabel("WEIRD")).toBe("WEIRD");
  });

  it("returns an empty string for empty input", () => {
    expect(employmentLabel(null)).toBe("");
    expect(employmentLabel(undefined)).toBe("");
  });
});

describe("stripHtml", () => {
  it("strips tags from html", () => {
    expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
  });

  it("decodes common html entities", () => {
    expect(stripHtml("a&nbsp;&amp;&lt;b&gt;&quot;c&quot;&#39;d&#39;")).toBe(
      "a &<b>\"c\"'d'",
    );
  });

  it("collapses whitespace", () => {
    expect(stripHtml("<p>one</p>   <p>two</p>")).toBe("one two");
  });

  it("returns an empty string for empty input", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("isRichHtml", () => {
  it("detects rich text html", () => {
    expect(isRichHtml("<p>text</p>")).toBe(true);
    expect(isRichHtml("<ul><li>item</li></ul>")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isRichHtml("Just some plain text")).toBe(false);
  });

  it("ignores html that is not in the supported set", () => {
    expect(isRichHtml("<script>alert(1)</script>")).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(isRichHtml(null)).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml("a&b<c>d\"e'f")).toBe("a&amp;b&lt;c&gt;d&quot;e&#39;f");
  });
});

describe("textToHtml", () => {
  it("wraps paragraphs separated by blank lines", () => {
    expect(textToHtml("first paragraph\n\nsecond paragraph")).toBe(
      "<p>first paragraph</p><p>second paragraph</p>",
    );
  });

  it("converts single newlines to line breaks", () => {
    expect(textToHtml("line1\nline2")).toBe("<p>line1<br/>line2</p>");
  });

  it("escapes html in plain text", () => {
    expect(textToHtml("1 < 2")).toBe("<p>1 &lt; 2</p>");
  });

  it("passes through existing rich html", () => {
    expect(textToHtml("<p>already html</p>")).toBe("<p>already html</p>");
  });
});

describe("getDeadlineInfo", () => {
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  it("returns null for no deadline", () => {
    expect(getDeadlineInfo(null)).toBeNull();
    expect(getDeadlineInfo(undefined)).toBeNull();
  });

  it("returns null for an invalid date", () => {
    expect(getDeadlineInfo("not-a-date")).toBeNull();
  });

  it("marks past deadlines as expired", () => {
    const info = getDeadlineInfo(new Date(Date.now() - 2 * DAY).toISOString());
    expect(info).toEqual({ expired: true, urgent: false, label: "Deadline passed" });
  });

  it("marks deadlines within 24 hours as closing soon", () => {
    const info = getDeadlineInfo(new Date(Date.now() + 5 * HOUR).toISOString());
    expect(info?.urgent).toBe(true);
    expect(info?.expired).toBe(false);
    expect(info?.label).toBe("1 day left");
  });

  it("counts days left for longer horizons", () => {
    const info = getDeadlineInfo(new Date(Date.now() + 2.5 * DAY).toISOString());
    expect(info).toEqual({ expired: false, urgent: true, label: "3 days left" });
  });

  it("is not urgent more than 3 days out", () => {
    const info = getDeadlineInfo(new Date(Date.now() + 10 * DAY).toISOString());
    expect(info).toEqual({ expired: false, urgent: false, label: "10 days left" });
  });
});

describe("formatDate", () => {
  it("formats a valid date", () => {
    expect(formatDate("2024-03-15")).toBe("Mar 15, 2024");
  });

  it("returns null for an invalid date", () => {
    expect(formatDate("not-a-date")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(formatDate(null)).toBeNull();
  });
});

describe("timeAgo", () => {
  const secondsAgo = (seconds: number) =>
    new Date(Date.now() - seconds * 1000).toISOString();

  it("returns just now for very recent timestamps", () => {
    expect(timeAgo(secondsAgo(10))).toBe("just now");
  });

  it("formats minutes", () => {
    expect(timeAgo(secondsAgo(5 * 60))).toBe("5 mins ago");
    expect(timeAgo(secondsAgo(60))).toBe("1 min ago");
  });

  it("formats hours", () => {
    expect(timeAgo(secondsAgo(2 * 60 * 60))).toBe("2 hours ago");
    expect(timeAgo(secondsAgo(60 * 60))).toBe("1 hour ago");
  });

  it("formats days", () => {
    expect(timeAgo(secondsAgo(24 * 60 * 60))).toBe("1 day ago");
  });

  it("formats weeks", () => {
    expect(timeAgo(secondsAgo(10 * 24 * 60 * 60))).toBe("1 week ago");
  });

  it("falls back to a date for very old timestamps", () => {
    expect(timeAgo(secondsAgo(400 * 24 * 60 * 60))).toMatch(
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}$/,
    );
  });

  it("returns null for invalid input", () => {
    expect(timeAgo("not-a-date")).toBeNull();
    expect(timeAgo(null)).toBeNull();
  });
});
