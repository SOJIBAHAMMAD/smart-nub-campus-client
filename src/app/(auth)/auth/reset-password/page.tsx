"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/fields/text-field";
import { OTPField } from "@/components/forms/fields/otp-field";
import { PasswordField } from "@/components/forms/fields/password-field";
import { PasswordRequirements } from "@/components/forms/password-requirements";
import AuthInfo from "../_components/AuthInfo";
import { resetPasswordByIdentifier } from "@/actions/auth.action";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schemas/auth/reset-password.schema";
import ROUTES from "@/constants/routes";
import { Hyperlink } from "@/components/ui/hyperlink";

function ResetPasswordFormContent() {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
  }>({
    success: false,
    error: null,
  });
  const router = useRouter();
  const params = useSearchParams();
  const prefilledIdentifier = params.get("identifier") ?? "";
  const isSubmitting = isPending || state.success;

  const { control, handleSubmit, watch } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      identifier: prefilledIdentifier,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsPending(true);
    setState({ success: false, error: null });

    try {
      await resetPasswordByIdentifier(data.identifier, data.otp, data.password);

      setState({ success: true, error: null });
      setTimeout(() => {
        router.push(`${ROUTES.LOGIN}?passwordReset=true`);
      }, 1500);
    } catch (error) {
      setState({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main>
      <div className="grid overflow-hidden rounded-2xl sm:rounded-[32px] border bg-[url('/images/nub-campus.png')] dark:bg-[url('/images/nub-campus-night.png')] bg-cover bg-center bg-no-repeat text-card-foreground shadow-xl lg:grid-cols-2">
        <AuthInfo variant="reset-password" />

        <section className="flex items-center justify-center py-5 sm:py-8 px-4 sm:px-6">
          <div className="w-full rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 lg:p-10 shadow-lg text-card-foreground">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-brand dark:text-primary" />
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-bold">
                Reset Password
              </h2>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Enter the code sent to your email and set a new password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {state.success && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  Password reset successful! Redirecting to login...
                </div>
              )}

              {state.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              <div className="space-y-4">
                <TextField
                  control={control}
                  name="identifier"
                  label={
                    <>
                      Email or Student ID{" "}
                      <span className="text-destructive">*</span>
                    </>
                  }
                  placeholder="Enter your email or student ID"
                  autoComplete="username"
                  disabled={true}
                />

                <OTPField
                  control={control}
                  name="otp"
                  label={
                    <>
                      Verification Code{" "}
                      <span className="text-destructive">*</span>
                    </>
                  }
                  description="Enter the 6-digit code sent to your email"
                  disabled={isSubmitting}
                />

                <PasswordField
                  control={control}
                  name="password"
                  label={
                    <>
                      New Password <span className="text-destructive">*</span>
                    </>
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  showStrength
                  disabled={isSubmitting}
                />
                <PasswordRequirements password={passwordValue} />

                <PasswordField
                  control={control}
                  name="confirmPassword"
                  label={
                    <>
                      Confirm Password{" "}
                      <span className="text-destructive">*</span>
                    </>
                  }
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="text-center text-sm">
                <Hyperlink href={ROUTES.FORGOT_PASSWORD} className="text-brand">
                  Back to Forgot Password
                </Hyperlink>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
