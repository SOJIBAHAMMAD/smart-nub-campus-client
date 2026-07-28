"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/forms/fields/password-field";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import { SelectField } from "@/components/forms/fields/select-field";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { createAccount } from "@/actions/account.action";
import { parseStudentId } from "@/lib/student-id-parser";
import {
  createAccountSchema,
  type CreateAccountFormValues,
} from "@/schemas/onboarding/account.schema";
import { OnboardingStepValue } from "@/constants/enums";
import { VerificationRequestData } from "@/types";
import { Gender } from "@/constants/enums";

interface CreateAccountFormProps {
  defaultName: string;
  defaultStudentId: string;
  defaultEmail: string;
  setCurrentStep: (step: OnboardingStepValue) => void;
  setVerificationRequest: (
    verificationRequest: VerificationRequestData,
  ) => void;
}

const genderOptions = [
  { value: Gender.MALE, label: "Male" },
  { value: Gender.FEMALE, label: "Female" },
  { value: Gender.OTHER, label: "Other" },
  { value: Gender.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
] as const satisfies Array<{ value: string; label: string }>;

export function CreateAccountForm({
  defaultName,
  defaultStudentId,
  defaultEmail,
  setCurrentStep,
  setVerificationRequest,
}: CreateAccountFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const studentIdInfo = parseStudentId(defaultStudentId);

  const { control, handleSubmit, setValue, watch } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      gender: undefined,
      password: "",
      image: "",
      imagePublicId: "",
    },
  });

  const onSubmit = useCallback(
    async (values: CreateAccountFormValues) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await createAccount(values);
        sessionStorage.setItem("pending_verification_email", result.user.email);
        sessionStorage.setItem("pending_verification_source", "signup");
        setCurrentStep(result.currentStep);
        setVerificationRequest(result.verificationRequest);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Account creation failed.";
        setError(message);
        setIsSubmitting(false);
      }
    },
    [setCurrentStep, setVerificationRequest],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch("password") ?? "";

  const handlePublicIdChange = useCallback((publicId: string | null) => {
    setValue("imagePublicId", publicId ?? "");
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Verified Information Summary */}
      <div className="rounded-xl border border-success/20 bg-success/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle className="size-4" />
          <span>Verified Information</span>
        </div>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Student ID</dt>
            <dd className="font-medium">{defaultStudentId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Full Name</dt>
            <dd className="font-medium">{defaultName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Department</dt>
            <dd className="font-medium">
              {studentIdInfo.data?.department.fullName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Admission Year</dt>
            <dd className="font-medium">
              {studentIdInfo.data?.admissionYear}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{defaultEmail}</dd>
          </div>
        </dl>
      </div>

      {/* Hidden fields to preserve values for form submission */}
      <Input type="hidden" value={defaultStudentId} />
      <Input type="hidden" value={defaultName} />
      <Input type="hidden" value={defaultEmail} />

      {/* Gender - Required */}
      <div className="space-y-2">
        <Label>
          Gender <span className="text-destructive">*</span>
        </Label>
        <SelectField
          control={control}
          name="gender"
          options={genderOptions}
          placeholder="Select gender"
          disabled={isSubmitting}
          rules={{ required: "Gender is required" }}
        />
      </div>

      {/* Profile Image - Optional */}
      <div className="space-y-2">
        <Label>Profile Image</Label>
        <FileUploadField
          control={control}
          name="image"
          context="avatars"
          type="image"
          accept="image/*"
          maxFiles={1}
          maxSize={5 * 1024 * 1024}
          onPublicIdChange={handlePublicIdChange}
          isOnboarding={true}
        />
      </div>

      {/* Password */}
      <PasswordField
        control={control}
        name="password"
        label={
          <>
            Password <span className="text-destructive">*</span>
          </>
        }
        description="Password must be at least 8 characters with uppercase, lowercase, and numbers."
        autoComplete="new-password"
        placeholder="Create a password"
        showStrength
        disabled={isSubmitting}
      />
      <PasswordRequirements password={passwordValue} />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Create Account & Verify Email"}
      </Button>
    </form>
  );
}
