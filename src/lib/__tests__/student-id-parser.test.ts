import { describe, expect, it } from "vitest";
import { parseStudentId } from "../student-id-parser";

describe("parseStudentId", () => {
  it("parses a valid student id", () => {
    const result = parseStudentId("41240101001");
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      department: {
        code: "41",
        shortName: "CSE",
        fullName: "Computer Science and Engineering",
      },
      admissionYear: 2024,
      admissionSemester: "SPRING",
      serialNumber: 1001,
    });
  });

  it("parses the summer admission semester", () => {
    const result = parseStudentId("41240201001");
    expect(result.success).toBe(true);
    expect(result.data?.admissionSemester).toBe("SUMMER");
    expect(result.data?.serialNumber).toBe(1001);
  });

  it("returns a 400 error for an invalid format", () => {
    const result = parseStudentId("123");
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error?.status).toBe(400);
    expect(result.message).toBe("Invalid student ID format.");
  });

  it("returns a 400 error for an unknown department code", () => {
    const result = parseStudentId("99240101001");
    expect(result.success).toBe(false);
    expect(result.error?.status).toBe(400);
  });

  it("returns a 400 error for an unknown semester code", () => {
    const result = parseStudentId("41241404001");
    expect(result.success).toBe(false);
    expect(result.error?.status).toBe(400);
  });
});
