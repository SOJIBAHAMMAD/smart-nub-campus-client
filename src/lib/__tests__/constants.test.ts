import { describe, expect, it } from "vitest";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  JOB_SOURCE_LABELS,
  MAX_SEMESTERS,
  SEMESTER_OPTIONS,
  AVATAR_GRADIENTS,
  gradientIndexFromId,
  getInitials,
} from "../constants";

describe("DEPARTMENTS and DEPARTMENT_LABELS", () => {
  it("lists the known departments", () => {
    expect(DEPARTMENTS).toContain("CSE");
    expect(DEPARTMENTS).toContain("ECSE");
    expect(DEPARTMENTS).toContain("EEE");
    expect(DEPARTMENTS).toContain("BBA");
    expect(DEPARTMENTS).toContain("EBTX");
  });

  it("provides a label for every department", () => {
    for (const dept of DEPARTMENTS) {
      expect(typeof DEPARTMENT_LABELS[dept]).toBe("string");
    }
  });

  it("labels a known department", () => {
    expect(DEPARTMENT_LABELS.CSE).toBe("Computer Science & Engineering");
  });
});

describe("JOB_SOURCE_LABELS", () => {
  it("labels known job sources", () => {
    expect(JOB_SOURCE_LABELS.PLATFORM).toBe("Smart NUB Campus");
    expect(JOB_SOURCE_LABELS.LINKEDIN).toBe("LinkedIn");
    expect(JOB_SOURCE_LABELS.OTHER).toBe("Other");
  });
});

describe("MAX_SEMESTERS and SEMESTER_OPTIONS", () => {
  it("exposes the semester count", () => {
    expect(MAX_SEMESTERS).toBe(12);
  });

  it("builds options from 1 to 12", () => {
    expect(SEMESTER_OPTIONS).toHaveLength(12);
    expect(SEMESTER_OPTIONS[0]).toBe(1);
    expect(SEMESTER_OPTIONS[11]).toBe(12);
  });
});

describe("AVATAR_GRADIENTS and gradientIndexFromId", () => {
  it("exposes gradient options", () => {
    expect(AVATAR_GRADIENTS.length).toBeGreaterThan(0);
    expect(AVATAR_GRADIENTS[0]).toContain("from-brand");
  });

  it("is deterministic for the same id", () => {
    expect(gradientIndexFromId("user-123")).toBe(gradientIndexFromId("user-123"));
  });

  it("returns an index within bounds", () => {
    for (const id of ["a", "user-123", "another-long-user-id"]) {
      const index = gradientIndexFromId(id);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(AVATAR_GRADIENTS.length);
    }
  });
});

describe("getInitials", () => {
  it("uses first and last name initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("ignores middle names", () => {
    expect(getInitials("  John  Michael  Doe  ")).toBe("JD");
  });

  it("uses the first two characters of a single name", () => {
    expect(getInitials("John")).toBe("JO");
  });

  it("returns an empty string for a blank name", () => {
    expect(getInitials("")).toBe("");
  });
});
