import { describe, expect, it } from "vitest";
import { loginSchema } from "../auth/login.schema";
import { forgotPasswordSchema } from "../auth/forgot-password.schema";
import { resetPasswordSchema } from "../auth/reset-password.schema";
import {
  sendVerificationSchema,
  verifyEmailSchema,
} from "../auth/verify-email.schema";

describe("loginSchema", () => {
  it("accepts a valid identifier, password and remember flag", () => {
    expect(
      loginSchema.safeParse({
        identifier: "student@example.com",
        password: "password123",
        remember: true,
      }).success,
    ).toBe(true);
  });

  it("accepts a student id as the identifier", () => {
    expect(
      loginSchema.safeParse({
        identifier: "41240101001",
        password: "password123",
        remember: false,
      }).success,
    ).toBe(true);
  });

  it("rejects an empty identifier", () => {
    const result = loginSchema.safeParse({
      identifier: "",
      password: "password123",
      remember: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      identifier: "student@example.com",
      password: "short",
      remember: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-boolean remember flag", () => {
    expect(
      loginSchema.safeParse({
        identifier: "student@example.com",
        password: "password123",
        remember: "yes",
      }).success,
    ).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts an email or student id", () => {
    expect(forgotPasswordSchema.safeParse({ identifier: "a@b.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ identifier: "41240101001" }).success).toBe(true);
  });

  it("rejects an empty identifier", () => {
    expect(forgotPasswordSchema.safeParse({ identifier: "" }).success).toBe(false);
  });

  it("rejects an identifier longer than 100 characters", () => {
    expect(forgotPasswordSchema.safeParse({ identifier: "x".repeat(101) }).success).toBe(false);
  });

  it("accepts an identifier of exactly 100 characters", () => {
    expect(forgotPasswordSchema.safeParse({ identifier: "x".repeat(100) }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  const valid = {
    identifier: "student@example.com",
    otp: "123456",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  };

  it("accepts a valid payload", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an otp that is not exactly 6 digits", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, otp: "12345" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...valid, otp: "12345a" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ ...valid, otp: "1234567" }).success).toBe(false);
  });

  it("rejects a password without an uppercase letter", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...valid,
        password: "strongpass1",
        confirmPassword: "strongpass1",
      }).success,
    ).toBe(false);
  });

  it("rejects a password without a number", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...valid,
        password: "StrongPass",
        confirmPassword: "StrongPass",
      }).success,
    ).toBe(false);
  });

  it("rejects a password that is too short", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...valid,
        password: "Stro1",
        confirmPassword: "Stro1",
      }).success,
    ).toBe(false);
  });

  it("rejects when passwords do not match", () => {
    expect(
      resetPasswordSchema.safeParse({
        ...valid,
        confirmPassword: "Different1",
      }).success,
    ).toBe(false);
  });

  it("rejects an empty identifier", () => {
    expect(resetPasswordSchema.safeParse({ ...valid, identifier: "" }).success).toBe(false);
  });
});

describe("sendVerificationSchema", () => {
  it("accepts a valid email", () => {
    expect(sendVerificationSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(sendVerificationSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(sendVerificationSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  const valid = { email: "a@b.com", otp: "123456" };

  it("accepts a valid email and 6-digit otp", () => {
    expect(verifyEmailSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(verifyEmailSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects an otp that is not 6 digits", () => {
    expect(verifyEmailSchema.safeParse({ ...valid, otp: "12" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ ...valid, otp: "abcdef" }).success).toBe(false);
  });
});
