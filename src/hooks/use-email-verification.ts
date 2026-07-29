"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import {
  sendVerificationSchema,
  verifyEmailSchema,
  type SendVerificationFormValues,
  type VerifyEmailFormValues,
} from "@/schemas/auth/verify-email.schema";

/**
 * Helper function to mask email for display
 * Shows first 2 chars and domain, masks the middle
 * e.g., "example@gmail.com" becomes "ex*****@gmail.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*****@${domain}`;
  return `${local.slice(0, 2)}*****@${domain}`;
}

/**
 * Helper function to extract error message from Better Auth response
 */
export function getAuthErrorMessage(
  message: string | undefined,
  code: string | undefined,
): string {
  const errorMsg = message?.toLowerCase() || "";

  if (
    errorMsg.includes("already verified") ||
    code === "EMAIL_ALREADY_VERIFIED"
  ) {
    return "ALREADY_VERIFIED";
  }
  if (code === "USER_NOT_FOUND" || errorMsg.includes("not found")) {
    return "No account found with this email. Please check your email and try again.";
  }
  return message || "An error occurred. Please try again.";
}

interface UseEmailVerificationOptions {
  /** Pre-filled email (e.g., from signup). Skips the email entry step. */
  initialEmail?: string;
  /** If true, sends OTP automatically on mount (for login flow) */
  autoSend?: boolean;
  /** If true, starts countdown without sending (for signup flow where backend already sent) */
  skipInitialSend?: boolean;
}

type Mode = "loading" | "email" | "otp" | "verified";

export function useEmailVerification(options: UseEmailVerificationOptions = {}) {
  const { initialEmail, autoSend = false, skipInitialSend = false } = options;

  const [mode, setMode] = useState<Mode>("loading");
  const [email, setEmail] = useState(initialEmail || "");
  const [isPending, setIsPending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const emailForm = useForm<SendVerificationFormValues>({
    resolver: zodResolver(sendVerificationSchema),
    defaultValues: { email: initialEmail || "" },
  });

  const otpForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: initialEmail || "", otp: "" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch() is needed for real-time OTP validation
  const otpValue = otpForm.watch("otp");

  const startCountdown = useCallback(() => {
    const expireTime = Date.now() + 30000;
    sessionStorage.setItem("otp_resend_available_at", expireTime.toString());
    setResendAvailableAt(expireTime);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!resendAvailableAt) return;

    const calculateRemaining = () =>
      Math.ceil((resendAvailableAt - Date.now()) / 1000);

    let remaining = calculateRemaining();
    if (remaining <= 0) {
      setCountdown(0);
      setResendAvailableAt(null);
      sessionStorage.removeItem("otp_resend_available_at");
      return;
    }

    setCountdown(remaining);

    const interval = setInterval(() => {
      remaining = calculateRemaining();
      if (remaining <= 0) {
        setCountdown(0);
        setResendAvailableAt(null);
        sessionStorage.removeItem("otp_resend_available_at");
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resendAvailableAt]);

  // Initialize mode based on options
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Check sessionStorage for pending verification
    const storedExpire = sessionStorage.getItem("otp_resend_available_at");
    if (storedExpire) {
      setResendAvailableAt(parseInt(storedExpire, 10));
    }

    const pendingEmail = initialEmail || sessionStorage.getItem("pending_verification_email");

    if (pendingEmail) {
      setEmail(pendingEmail);
      otpForm.setValue("email", pendingEmail);
      setMode("otp");

      if (autoSend) {
        // Login flow: send OTP immediately
        setIsPending(true);
        setError(null);

        authClient.emailOtp
          .sendVerificationOtp({
            email: pendingEmail,
            type: "email-verification",
          })
          .then((response) => {
            const errorMessage = getAuthErrorMessage(
              response.error?.message,
              response.error?.code,
            );

            if (errorMessage === "ALREADY_VERIFIED") {
              setMode("verified");
            } else if (response.error) {
              setError(errorMessage);
            } else {
              startCountdown();
            }
          })
          .catch(() => {
            setError("An unexpected error occurred while sending code.");
          })
          .finally(() => {
            setIsPending(false);
          });
      } else if (skipInitialSend) {
        // Signup flow: OTP already sent by backend, just start countdown
        if (!sessionStorage.getItem("otp_resend_available_at")) {
          startCountdown();
        }
      }
    } else {
      setMode("email");
    }
  }, [initialEmail, autoSend, skipInitialSend, otpForm, startCountdown]);

  const handleSendCode = useCallback(
    async (data: SendVerificationFormValues) => {
      setIsPending(true);
      setError(null);
      try {
        const response = await authClient.emailOtp.sendVerificationOtp({
          email: data.email,
          type: "email-verification",
        });

        const errorMessage = getAuthErrorMessage(
          response.error?.message,
          response.error?.code,
        );

        if (errorMessage === "ALREADY_VERIFIED") {
          setEmail(data.email);
          otpForm.setValue("email", data.email);
          setMode("verified");
        } else if (response.error) {
          setError(errorMessage);
        } else {
          setEmail(data.email);
          otpForm.setValue("email", data.email);
          setMode("otp");
          startCountdown();
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsPending(false);
      }
    },
    [otpForm, startCountdown],
  );

  const handleVerifyOTP = useCallback(
    async (
      data: VerifyEmailFormValues,
      onSuccess?: () => void,
    ) => {
      setIsPending(true);
      setError(null);
      try {
        const response = await authClient.emailOtp.verifyEmail({
          email: data.email,
          otp: data.otp,
        });

        if (response.error) {
          otpForm.setValue("otp", "");
          setError(response.error.message || "Invalid or expired OTP");

          if (response.error.code === "OTP_EXPIRED") {
            setCountdown(0);
          }
        } else {
          sessionStorage.removeItem("pending_verification_email");
          sessionStorage.removeItem("pending_verification_source");
          await onSuccess?.();
        }
      } catch {
        otpForm.setValue("otp", "");
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsPending(false);
      }
    },
    [otpForm],
  );

  const handleResendOTP = useCallback(async () => {
    if (countdown > 0) return;
    setIsPending(true);
    setError(null);
    try {
      const response = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (response.error) {
        setError(response.error.message || "Failed to resend code");
      } else {
        startCountdown();
        otpForm.setValue("otp", "");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  }, [countdown, email, otpForm, startCountdown]);

  return {
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
  };
}
