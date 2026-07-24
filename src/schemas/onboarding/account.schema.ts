import { Gender } from "@/constants/enums";
import { z } from "zod";

export const createAccountSchema = z.object({
  gender: z.enum(Gender),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  image: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
