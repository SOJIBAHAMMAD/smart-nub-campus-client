"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/fields/text-field";
import { OTPField } from "@/components/forms/fields/otp-field";
import {
  useEmailVerification,
  maskEmail,
} from "@/hooks/use-email-verification";
import { useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";

interface VerifyEmailFormProps {
  /** Pre-filled email (e.g., from signup flow) */
  email?: string;
  /** If true, sends OTP automatically on mount (login flow) */
  autoSend?: boolean;
  /** If true, starts countdown without sending (signup flow where backend already sent) */
  skipInitialSend?: boolean;
  /** If true, renders without wrapper (for embedding in onboarding) */
  isEmbedded?: boolean;
  /** Callback after successful verification */
  onSuccess?: () => void;
}

export function VerifyEmailForm({
  email: initialEmail,
  autoSend = false,
  skipInitialSend = false,
  isEmbedded = false,
  onSuccess,
}: VerifyEmailFormProps) {
  const {
    mode,
    email,
    isPending,
    countdown,
    error,
    emailForm,
    otpForm,
    otpValue,
    handleSendCode,
    handleVerifyOTP,
    handleResendOTP,
  } = useEmailVerification({
    initialEmail,
    autoSend,
    skipInitialSend,
  });

  const router = useRouter();
  const autoSubmitRef = useRef(false);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (mode !== "otp" || isPending || !otpValue || otpValue.length !== 6) {
      autoSubmitRef.current = false;
      return;
    }
    if (!autoSubmitRef.current) {
      autoSubmitRef.current = true;
      otpForm.handleSubmit((data) => handleVerifyOTP(data, onSuccess))();
    }
  }, [mode, isPending, otpValue, otpForm, handleVerifyOTP, onSuccess]);

  if (mode === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand dark:text-primary" />
      </div>
    );
  }

  if (mode === "verified") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400 font-medium text-center">
          Your email is already verified. You can proceed.
        </div>
        {!isEmbedded && (
          <Button
            className="w-full"
            onClick={() => router.push(`${ROUTES.LOGIN}?verified=true`)}
          >
            Go to Login
          </Button>
        )}
      </div>
    );
  }

  if (mode === "email") {
    return (
      <form
        onSubmit={emailForm.handleSubmit(handleSendCode)}
        className="space-y-6"
      >
        <TextField
          control={emailForm.control}
          name="email"
          label="Email *"
          placeholder="Enter your account email"
          disabled={isPending}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : (
            "Send Verification Code"
          )}
        </Button>
      </form>
    );
  }

  // OTP mode
  return (
    <form
      onSubmit={otpForm.handleSubmit((data) =>
        handleVerifyOTP(data, onSuccess),
      )}
      className="space-y-6"
    >
      <div className="text-center text-sm text-muted-foreground">
        A verification code has been sent to{" "}
        <span className="font-semibold text-foreground">
          {maskEmail(email)}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <OTPField control={otpForm.control} name="otp" disabled={isPending} />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || otpValue?.length !== 6}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          "Verify Code"
        )}
      </Button>

      <div className="text-center text-sm">
        {countdown > 0 ? (
          <span className="text-muted-foreground">
            Resend code in {countdown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isPending}
            className="text-brand hover:underline font-medium"
          >
            Resend Code
          </button>
        )}
      </div>
    </form>
  );
}
