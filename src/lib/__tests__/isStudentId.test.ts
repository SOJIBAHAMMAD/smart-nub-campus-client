import { describe, expect, it } from "vitest";
import isStudentId from "../isStudentId";

describe("isStudentId", () => {
  it("accepts a valid 11-digit student id", () => {
    expect(isStudentId("41240101001")).toBe(true);
  });

  it("accepts student ids from other departments", () => {
    expect(isStudentId("45180101001")).toBe(true);
  });

  it("accepts all admission semesters", () => {
    expect(isStudentId("41240101001")).toBe(true);
    expect(isStudentId("41240201001")).toBe(true);
    expect(isStudentId("41240301001")).toBe(true);
  });

  it("rejects ids that are not 11 digits", () => {
    expect(isStudentId("4124010100")).toBe(false);
    expect(isStudentId("412401010011")).toBe(false);
  });

  it("rejects ids containing non-digit characters", () => {
    expect(isStudentId("4124010100a")).toBe(false);
  });

  it("rejects ids with an unknown department code", () => {
    expect(isStudentId("99240101001")).toBe(false);
  });

  it("rejects ids with an unknown admission semester code", () => {
    expect(isStudentId("41241404001")).toBe(false);
  });
});
