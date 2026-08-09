"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, User } from "lucide-react";
import { TextField } from "@/components/forms/fields/text-field";
import { BirthDateField } from "@/components/forms/birth-date-field";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  verificationSchema,
  type VerificationFormValues,
} from "@/schemas/onboarding/verification.schema";
import {
  VerificationRequestType,
  type VerificationRequestType as VerificationRequestTypeValue,
} from "@/constants/enums";
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
  const { control, handleSubmit, setValue } =
    useForm<VerificationFormValues>({
      resolver: zodResolver(verificationSchema),
      defaultValues: {
        name: defaultValue?.name ?? "",
        email: defaultValue?.email ?? "",
        dateOfBirth: defaultValue?.dateOfBirth
          ? (() => {
              const d = new Date(defaultValue.dateOfBirth);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd}`;
            })()
          : "",
        studentId: defaultValue?.studentId ?? "",
        idCardImage: defaultValue?.idCardImage ?? "",
        idCardImagePublicId: defaultValue?.idCardImagePublicId ?? undefined,
        requestType:
          defaultValue?.requestType ?? VerificationRequestType.STUDENT,
        graduationYear: defaultValue?.graduationYear
          ? String(defaultValue.graduationYear)
          : "",
        degreeTitle: defaultValue?.degreeTitle ?? "",
      },
    });

  const requestType = useWatch({ control, name: "requestType" });
  const isAlumni = requestType === VerificationRequestType.ALUMNI;

  const handleRequestTypeChange = (type: VerificationRequestTypeValue) => {
    setValue("requestType", type, { shouldValidate: true });
    if (type === VerificationRequestType.STUDENT) {
      setValue("graduationYear", "", { shouldValidate: true });
      setValue("degreeTitle", "", { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role selection */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          I am verifying as
        </legend>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleRequestTypeChange(VerificationRequestType.STUDENT)}
            aria-pressed={!isAlumni}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              !isAlumni
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <User className="size-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRequestTypeChange(VerificationRequestType.ALUMNI)}
            aria-pressed={isAlumni}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isAlumni
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GraduationCap className="size-4" />
            Alumni
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isAlumni
            ? "Alumni: already graduated — you'll confirm your degree details and join the alumni community after approval."
            : "Student: currently enrolled — your identity will be verified against your student record."}
        </p>
      </fieldset>

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
        <BirthDateField
          control={control}
          name="dateOfBirth"
          label={
            <>
              Date of Birth <span className="text-destructive">*</span>
            </>
          }
          disabled={isSubmitting}
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

        {isAlumni && (
          <>
            <TextField
              control={control}
              name="graduationYear"
              type="text"
              inputMode="numeric"
              maxLength={4}
              label={
                <>
                  Graduation Year <span className="text-destructive">*</span>
                </>
              }
              placeholder="e.g. 2024"
              description="The year you completed your degree."
              disabled={isSubmitting}
            />
            <TextField
              control={control}
              name="degreeTitle"
              label={
                <>
                  Degree Title <span className="text-destructive">*</span>
                </>
              }
              placeholder="e.g. B.Sc. in Computer Science & Engineering"
              description="The degree you were awarded by Northern University Bangladesh."
              disabled={isSubmitting}
            />
          </>
        )}

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
        {isSubmitting
          ? "Submitting..."
          : isAlumni
            ? "Submit Alumni Verification"
            : "Submit for Verification"}
      </Button>
    </form>
  );
}
