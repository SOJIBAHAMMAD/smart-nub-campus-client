import { z } from "zod";

export const updateProfileSchema = z
  .object({
    bio: z.string().trim().max(500, "Bio must be at most 500 characters").optional(),
    coverImage: z.string().url("Invalid cover image URL").optional(),
    githubUrl: z.string().url("Invalid GitHub URL").optional(),
    linkedinUrl: z.string().url("Invalid LinkedIn URL").optional(),
    portfolioUrl: z.string().url("Invalid portfolio URL").optional(),
    websiteUrl: z.string().url("Invalid website URL").optional(),
    location: z.string().trim().max(100, "Location must be at most 100 characters").optional(),
    phoneNumber: z.string().trim().max(20, "Phone number must be at most 20 characters").optional(),
    currentSemester: z.number().int().min(1).max(16).optional(),
    batchYear: z.number().int().min(2000).max(2030).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
