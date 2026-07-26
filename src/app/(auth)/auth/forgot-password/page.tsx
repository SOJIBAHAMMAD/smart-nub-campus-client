"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/fields/text-field";
import AuthInfo from "../_components/AuthInfo";
import { requestPasswordResetByIdentifier } from "@/actions/auth.action";
import { maskEmail } from "@/hooks/use-email-verification";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/auth/forgot-password.schema";
import ROUTES from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
    message: string | null;
    identifier: string | null;
  }>({
    success: false,
    error: null,
    message: null,
    identifier: null,
  });
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const isSubmitting = isPending || state.success;

  useEffect(() => {
    if (!state.success || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown <= 1) {
        router.push(
          `${ROUTES.RESET_PASSWORD}?identifier=${encodeURIComponent(state.identifier ?? "")}`,
        );
      } else {
        setCountdown((c) => c - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [state.success, countdown, state.identifier, router]);

  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsPending(true);
    setState({ success: false, error: null, message: null, identifier: null });

    try {
      const message = await requestPasswordResetByIdentifier(data.identifier);

      setState({
        success: true,
        error: null,
        message,
        identifier: data.identifier,
      });

      setCountdown(3);
    } catch (error) {
      setState({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        message: null,
        identifier: null,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main>
      <div className="grid overflow-hidden rounded-2xl sm:rounded-[32px] border bg-[url('/images/nub-campus.png')] dark:bg-[url('/images/nub-campus-night.png')] bg-cover bg-center bg-no-repeat text-card-foreground shadow-xl lg:grid-cols-2">
        <AuthInfo variant="forgot-password" />

        <section className="flex items-center justify-center py-5 sm:py-8 px-4 sm:px-6">
          <div className="w-full rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 lg:p-10 shadow-lg text-card-foreground">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-brand dark:text-primary" />
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-bold">
                Forgot Password
              </h2>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Enter your email or student ID and we&apos;ll send you a
                verification code
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {state.success && state.message && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  <p>
                    We sent a verification code to{" "}
                    <span className="font-semibold">
                      {maskEmail(state.identifier ?? "")}
                    </span>
                  </p>
                  {countdown > 0 && (
                    <span className="block mt-1 text-xs opacity-75">
                      Redirecting to reset password in {countdown}s...
                    </span>
                  )}
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
                  inputMode="email"
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
