"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/forms/fields/text-field";
import { DateField } from "@/components/forms/date-field";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import {
  verificationSchema,
  type VerificationFormValues,
} from "@/schemas/onboarding/verification.schema";
import type { VerificationRequestData } from "@/types";

interface VerifyIdentityFormProps {
  onSubmit: (data: VerificationFormValues) => Promise<void>;
  isSubmitting: boolean;
  defaultValue?: VerificationRequestData | null;
}

export function VerifyIdentityForm({
  onSubmit,
  isSubmitting,
  defaultValue,
}: VerifyIdentityFormProps) {
  const { control, handleSubmit, setValue } = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      name: defaultValue?.name ?? "",
      email: defaultValue?.email ?? "",
      dateOfBirth: defaultValue?.dateOfBirth
        ? new Date(defaultValue.dateOfBirth).toISOString().split("T")[0]
        : "",
      studentId: defaultValue?.studentId ?? "",
      idCardImage: defaultValue?.idCardImage ?? "",
      idCardImagePublicId: defaultValue?.idCardImagePublicId ?? undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <TextField
          control={control}
          name="name"
          label={
            <>
              Full Name <span className="text-destructive">*</span>
            </>
          }
          placeholder="Enter your full name"
          disabled={isSubmitting}
        />
        <TextField
          control={control}
          name="email"
          type="email"
          label={
            <>
              Email Address <span className="text-destructive">*</span>
            </>
          }
          placeholder="Enter your email address"
          autoComplete="email"
          disabled={isSubmitting}
        />
        <DateField
          control={control}
          name="dateOfBirth"
          label={
            <>
              Date of Birth <span className="text-destructive">*</span>
            </>
          }
        />
        <TextField
          control={control}
          name="studentId"
          label={
            <>
              Student ID <span className="text-destructive">*</span>
            </>
          }
          placeholder="Enter your student ID"
          disabled={isSubmitting}
          maxLength={11}
        />
        <div className="space-y-2">
          <FileUploadField
            control={control}
            name="idCardImage"
            context="verification"
            isOnboarding
            existingImageUrl={defaultValue?.idCardImage}
            existingPublicId={defaultValue?.idCardImagePublicId}
            onPublicIdChange={(publicId) =>
              setValue("idCardImagePublicId", publicId ?? "", {
                shouldValidate: true,
              })
            }
            label={
              <>
                Student ID Card <span className="text-destructive">*</span>
              </>
            }
          />
          <p className="text-xs text-muted-foreground">
            Upload a clear image of your student ID card.
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit for Verification"}
      </Button>
    </form>
  );
}
