"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/forms/fields/password-field";
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

  const { control, handleSubmit, setValue } = useForm<CreateAccountFormValues>({
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

  const handlePublicIdChange = useCallback((publicId: string | null) => {
    setValue("imagePublicId", publicId ?? "");
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Student ID - Read only */}
      <div className="space-y-2">
        <Label>Student ID</Label>
        <Input value={defaultStudentId} disabled className="bg-muted/50" />
      </div>

      {/* Full Name - Read only */}
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={defaultName} disabled className="bg-muted/50" />
      </div>

      {/* Department - Read only */}
      <div className="space-y-2">
        <Label>Department</Label>
        <Input
          value={studentIdInfo.data?.department.fullName}
          disabled
          className="bg-muted/50"
        />
      </div>

      {/* Admission Year - Read only */}
      <div className="space-y-2">
        <Label>Admission Year</Label>
        <Input
          value={studentIdInfo.data?.admissionYear}
          disabled
          className="bg-muted/50"
        />
      </div>

      {/* Email - Read only */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          value={defaultEmail}
          type="email"
          disabled
          className="bg-muted/50"
        />
      </div>

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
        label="Password *"
        description="Password must be at least 8 characters with uppercase, lowercase, and numbers."
        showStrength
        disabled={isSubmitting}
      />

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
