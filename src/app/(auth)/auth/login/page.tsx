"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/forms/fields/text-field";
import { PasswordField } from "@/components/forms/fields/password-field";
import AuthInfo from "../_components/AuthInfo";
import isStudentId from "@/lib/isStudentId";
import { authClient } from "@/lib/auth-client";
import { getEmailByStudentId } from "@/actions/auth.action";
import { loginSchema, type LoginFormValues } from "@/schemas/auth/login.schema";
import ROUTES from "@/constants/routes";
import { Hyperlink } from "@/components/ui/hyperlink";

function LoginFormContent() {
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{
    success: boolean;
    error: string | null;
  }>({
    success: false,
    error: null,
  });
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const isVerified = params.get("verified") === "true";
  const passwordReset = params.get("passwordReset") === "true";

  useEffect(() => {
    if (isVerified) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isVerified, router]);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    setState({ success: false, error: null });

    try {
      const isStudentIdGiven = isStudentId(data.identifier);
      let email = data.identifier;

      if (isStudentIdGiven) {
        email = await getEmailByStudentId(data.identifier);
      }

      const response = await authClient.signIn.email({
        email,
        password: data.password,
        rememberMe: data.remember,
      });

      if (response.error) {
        if (
          response.error.code === "EMAIL_NOT_VERIFIED" ||
          response.error.status === 403
        ) {
          setUnverifiedEmail(email);
        } else if (response.error.status === 429) {
          setState({
            success: false,
            error: "Too many login attempts. Please try again later.",
          });
        } else {
          setState({
            success: false,
            error: response.error.message!,
          });
        }
        return;
      }

      if (!response.data || !response.data.user) {
        setState({
          success: false,
          error: "Invalid student ID or Password. Please try again.",
        });
        return;
      }

      setState({ success: true, error: null });

      // Respect the ?redirect= param set by proxy, or go to home.
      // If no redirect param, the proxy will redirect ADMIN users to /admin.
      const redirectParam = params.get("redirect");
      router.push(redirectParam || ROUTES.HOME);
    } catch (error) {
      setState({
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
      console.error("Login error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main>
      <div className="grid overflow-hidden rounded-2xl sm:rounded-[32px] border bg-[url('/images/nub-campus.png')] dark:bg-[url('/images/nub-campus-night.png')] bg-cover bg-center bg-no-repeat text-card-foreground shadow-xl lg:grid-cols-2">
        {/* Left Section: Branding & Features */}
        <AuthInfo variant="login" />

        {/* Right Section: Login Form */}
        <section className="flex items-center justify-center py-5 sm:py-8 px-4 sm:px-6">
          <div className="w-full rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 lg:p-10 shadow-lg text-card-foreground">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-brand dark:text-primary" />
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-bold">
                Welcome Back
              </h2>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Login to access your Smart NUB Campus account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {isVerified && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  Email verified! You can now sign in.
                </div>
              )}

              {passwordReset && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 font-medium">
                  Password reset successful! You can now log in with your new
                  password.
                </div>
              )}

              {state.error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {state.error}
                </div>
              )}

              {unverifiedEmail && (
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
                  <p className="mb-2 font-medium">
                    Your email is not verified.
                  </p>
                  <p className="mb-3">
                    You must verify your email before logging in.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-500 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                    onClick={() => {
                      sessionStorage.setItem(
                        "pending_verification_email",
                        unverifiedEmail,
                      );
                      sessionStorage.setItem(
                        "pending_verification_source",
                        "login",
                      );
                      router.push(ROUTES.VERIFY_EMAIL);
                    }}
                  >
                    Verify Email Now
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <TextField
                  control={control}
                  name="identifier"
                  label={
                    <>
                      Student ID or Email{" "}
                      <span className="text-destructive">*</span>
                    </>
                  }
                  placeholder="Enter your student ID or email"
                  autoComplete="username"
                  inputMode="email"
                  disabled={isPending}
                />

                <PasswordField
                  control={control}
                  name="password"
                  label={
                    <>
                      Password <span className="text-destructive">*</span>
                    </>
                  }
                  autoComplete="current-password"
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name="remember"
                    render={({ field }) => (
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        disabled={isPending}
                      />
                    )}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <div className="text-right text-sm">
                  <Hyperlink
                    href={ROUTES.FORGOT_PASSWORD}
                    className="text-brand"
                  >
                    Forgot your password?
                  </Hyperlink>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Hyperlink href={ROUTES.ONBOARDING} className="text-brand">
                  Verify your identity
                </Hyperlink>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormContent />
    </Suspense>
  );
}
