"use client";

import { useState, useEffect, useCallback } from "react";
import { VerificationStepper } from "./VerificationStepper";
import { OnboardingInfo } from "./OnboardingInfo";
import { VerifyIdentityForm } from "./VerifyIdentityForm";
import { AdminReviewStatus } from "./AdminReviewStatus";
import { CreateAccountForm } from "./CreateAccountForm";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { CheckCircleIcon } from "@/components/ui/icons/check-circle";
import { Button } from "@/components/ui/button";
import { OnboardingStepValue } from "@/constants/enums";
import type { VerificationRequestData } from "@/types";
import { createVerificationRequest } from "@/actions/verification.action";
import {
  getCurrentStep,
  completeOnboarding,
} from "@/actions/onboarding.action";
import Link from "next/link";
import ROUTES from "@/constants/routes";

interface OnboardingFlowProps {
  initialStep: OnboardingStepValue;
  initialVerificationRequest: VerificationRequestData | null;
}

export function OnboardingFlow({
  initialStep,
  initialVerificationRequest,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<OnboardingStepValue>(initialStep);
  const [verificationRequest, setVerificationRequest] =
    useState<VerificationRequestData | null>(initialVerificationRequest);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle verification form submission
  const handleSubmitIdentity = useCallback(
    async (formData: {
      name: string;
      email: string;
      dateOfBirth: string;
      studentId: string;
      idCardImage: string;
      idCardImagePublicId?: string | null;
      requestType: string;
      graduationYear?: string;
      degreeTitle?: string;
    }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Backend sets the onboarding_step cookie and returns full state
        const response = await createVerificationRequest({
          name: formData.name,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          studentId: formData.studentId,
          idCardImage: formData.idCardImage,
          idCardImagePublicId: formData.idCardImagePublicId,
          requestType: formData.requestType as
            | "STUDENT"
            | "ALUMNI",
          graduationYear: formData.graduationYear
            ? Number(formData.graduationYear)
            : undefined,
          degreeTitle: formData.degreeTitle || undefined,
        });
        setCurrentStep(response.currentStep);
        setVerificationRequest(response.verificationRequest);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to submit verification. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  // Poll for status updates when in admin-review
  // Polling is necessary because admin reviews happen asynchronously on a different device
  useEffect(() => {
    if (currentStep !== OnboardingStepValue.ADMIN_REVIEW) return;

    let consecutiveErrors = 0;

    const pollStatus = async () => {
      try {
        const data = await getCurrentStep();
        consecutiveErrors = 0;

        // Update verification request data if available (backend now always includes it)
        if (data.verificationRequest) {
          setVerificationRequest(data.verificationRequest);
        }

        // Check if admin has approved — backend transitions to ACCOUNT_CREATION
        if (data.currentStep === OnboardingStepValue.ACCOUNT_CREATION) {
          setCurrentStep(OnboardingStepValue.ACCOUNT_CREATION);
        }
      } catch {
        consecutiveErrors += 1;
        if (consecutiveErrors >= 5) {
          setError(
            "Unable to check review status. Please check your connection and refresh the page.",
          );
        }
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const handleRetry = () => {
    setCurrentStep(OnboardingStepValue.VERIFICATION_FORM);
    setError(null);
  };

  const handleEmailVerified = useCallback(async () => {
    try {
      await completeOnboarding(verificationRequest?.email || "");
      setCurrentStep(OnboardingStepValue.COMPLETED);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete onboarding. Please try again.",
      );
    }
  }, [verificationRequest]);

  if (error && currentStep === OnboardingStepValue.VERIFICATION_FORM) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Stepper */}
      <VerificationStepper currentStep={currentStep} />

      {/* Main content - 2 column layout */}
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[1fr_1.5fr]">
        {/* Left column - Info */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          <OnboardingInfo
            step={currentStep}
            verificationStatus={verificationRequest?.status}
          />
        </div>

        {/* Right column - Form / Status */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
          {currentStep === OnboardingStepValue.VERIFICATION_FORM && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Personal Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in your details to begin the verification process.
                </p>
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <VerifyIdentityForm
                onSubmit={handleSubmitIdentity}
                isSubmitting={isSubmitting}
                defaultValue={verificationRequest}
              />
            </div>
          )}

          {currentStep === OnboardingStepValue.ADMIN_REVIEW && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Review Status
                </h2>
                <p className="text-sm text-muted-foreground">
                  Track the status of your verification request.
                </p>
              </div>
              <AdminReviewStatus
                status={verificationRequest?.status ?? "PENDING"}
                note={verificationRequest?.note}
                onRetry={handleRetry}
              />
            </div>
          )}

          {currentStep === OnboardingStepValue.ACCOUNT_CREATION && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Create Your Account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Set up your account credentials to get started.
                </p>
              </div>
              <CreateAccountForm
                defaultName={verificationRequest?.name ?? ""}
                defaultStudentId={verificationRequest?.studentId ?? ""}
                defaultEmail={verificationRequest?.email ?? ""}
                setCurrentStep={setCurrentStep}
                setVerificationRequest={setVerificationRequest}
              />
            </div>
          )}

          {currentStep === OnboardingStepValue.VERIFY_EMAIL && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Verify Your Email
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code sent to your email to complete
                  account setup.
                </p>
              </div>
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <VerifyEmailForm
                email={verificationRequest?.email}
                skipInitialSend
                isEmbedded
                onSuccess={handleEmailVerified}
              />
            </div>
          )}

          {currentStep === OnboardingStepValue.COMPLETED && (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <CheckCircleIcon className="text-success" size={64} />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Onboarding Complete!
                </h3>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                  Your account has been created successfully. Welcome to Smart
                  NUB Campus!
                </p>
              </div>
              <Button>
                <Link href={ROUTES.LOGIN}>Go to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {currentStep !== OnboardingStepValue.COMPLETED && (
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-brand font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  );
}
