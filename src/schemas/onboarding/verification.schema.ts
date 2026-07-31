import { z } from "zod";
import { VerificationRequestType } from "@/constants/enums";

const yearRule = z
  .string()
  .regex(/^\d{4}$/, "Graduation year must be a 4-digit year")
  .refine(
    (value) => {
      const year = Number(value);
      return year >= 1950 && year <= 2100;
    },
    { message: "Graduation year must be between 1950 and 2100" },
  )
  .optional()
  .or(z.literal(""));

export const verificationSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    studentId: z
      .string()
      .min(11, "Student ID must be 11 digits")
      .max(11, "Student ID must be 11 digits")
      .regex(/^\d{11}$/, "Student ID must contain only digits"),
    idCardImage: z.string().min(1, "Please upload your student ID card"),
    idCardImagePublicId: z.string().optional(),
    requestType: z.nativeEnum(VerificationRequestType),
    graduationYear: yearRule,
    degreeTitle: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.requestType !== VerificationRequestType.ALUMNI ||
      (Boolean(data.graduationYear) && Boolean(data.degreeTitle)),
    {
      message:
        "Graduation year and degree title are required for alumni verification.",
      path: ["graduationYear"],
    },
  );

export type VerificationFormValues = z.infer<typeof verificationSchema>;
