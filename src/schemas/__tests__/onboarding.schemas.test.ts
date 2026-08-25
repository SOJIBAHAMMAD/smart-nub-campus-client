import { describe, expect, it } from "vitest";
import { createAccountSchema } from "../onboarding/account.schema";
import { verificationSchema } from "../onboarding/verification.schema";

describe("createAccountSchema", () => {
  const valid = {
    gender: "MALE",
    password: "StrongPass1",
  };

  it("accepts a valid payload without images", () => {
    expect(createAccountSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts every supported gender", () => {
    for (const gender of [
      "MALE",
      "FEMALE",
      "OTHER",
      "PREFER_NOT_TO_SAY",
    ]) {
      expect(createAccountSchema.safeParse({ ...valid, gender }).success).toBe(true);
    }
  });

  it("accepts a valid url image and public id", () => {
    expect(
      createAccountSchema.safeParse({
        ...valid,
        image: "https://example.com/avatar.png",
        imagePublicId: "avatars/abc123",
      }).success,
    ).toBe(true);
  });

  it("accepts empty strings for image fields", () => {
    expect(
      createAccountSchema.safeParse({
        ...valid,
        image: "",
        imagePublicId: "",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown gender", () => {
    expect(createAccountSchema.safeParse({ ...valid, gender: "UNKNOWN" }).success).toBe(false);
  });

  it("rejects a weak password", () => {
    expect(createAccountSchema.safeParse({ ...valid, password: "weakpass" }).success).toBe(false);
    expect(createAccountSchema.safeParse({ ...valid, password: "WEAKPASS1" }).success).toBe(false);
    expect(createAccountSchema.safeParse({ ...valid, password: "weakPass" }).success).toBe(false);
  });

  it("rejects an image that is not a url", () => {
    expect(createAccountSchema.safeParse({ ...valid, image: "not-a-url" }).success).toBe(false);
  });
});

describe("verificationSchema", () => {
  const validStudent = {
    name: "Jane Doe",
    email: "jane@example.com",
    dateOfBirth: "2002-05-14",
    studentId: "41240101001",
    idCardImage: "https://cloud.example.com/id-card.jpg",
    requestType: "STUDENT",
  };

  it("accepts a valid student payload", () => {
    expect(verificationSchema.safeParse(validStudent).success).toBe(true);
  });

  it("accepts an alumni payload with graduation year and degree title", () => {
    expect(
      verificationSchema.safeParse({
        ...validStudent,
        requestType: "ALUMNI",
        graduationYear: "2024",
        degreeTitle: "B.Sc in Computer Science and Engineering",
      }).success,
    ).toBe(true);
  });

  it("rejects an alumni payload without a graduation year", () => {
    const result = verificationSchema.safeParse({
      ...validStudent,
      requestType: "ALUMNI",
      degreeTitle: "B.Sc in Computer Science and Engineering",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an alumni payload without a degree title", () => {
    const result = verificationSchema.safeParse({
      ...validStudent,
      requestType: "ALUMNI",
      graduationYear: "2024",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a student id that is not 11 digits", () => {
    expect(
      verificationSchema.safeParse({ ...validStudent, studentId: "4124010100" }).success,
    ).toBe(false);
    expect(
      verificationSchema.safeParse({ ...validStudent, studentId: "41240101001a" }).success,
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(verificationSchema.safeParse({ ...validStudent, email: "nope" }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(verificationSchema.safeParse({ ...validStudent, name: "" }).success).toBe(false);
  });

  it("rejects a graduation year outside 1950-2100", () => {
    expect(
      verificationSchema.safeParse({
        ...validStudent,
        requestType: "ALUMNI",
        graduationYear: "1800",
        degreeTitle: "Degree",
      }).success,
    ).toBe(false);
  });

  it("rejects a non-numeric graduation year", () => {
    expect(
      verificationSchema.safeParse({
        ...validStudent,
        requestType: "ALUMNI",
        graduationYear: "abcd",
        degreeTitle: "Degree",
      }).success,
    ).toBe(false);
  });
});
