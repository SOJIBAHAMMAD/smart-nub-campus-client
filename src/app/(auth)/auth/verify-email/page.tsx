"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import AuthInfo from "../_components/AuthInfo";
import { VerifyEmailForm } from "../onboarding/_components/VerifyEmailForm";
import ROUTES from "@/constants/routes";
import { Hyperlink } from "@/components/ui/hyperlink";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [initialEmail, setInitialEmail] = useState<string | undefined>(
    undefined,
  );
  const [autoSend, setAutoSend] = useState(false);
  const [skipInitialSend, setSkipInitialSend] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pending_verification_email");
    const source = sessionStorage.getItem("pending_verification_source");

    if (pendingEmail) {
      setInitialEmail(pendingEmail);
      if (source === "login") {
        sessionStorage.removeItem("pending_verification_source");
        setAutoSend(true);
      } else if (source === "signup") {
        setSkipInitialSend(true);
      }
    }
    setReady(true);
  }, []);

  const handleSuccess = useCallback(() => {
    router.push(`${ROUTES.LOGIN}?verified=true`);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-dvh w-dvw items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand dark:text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="grid overflow-hidden rounded-2xl sm:rounded-[32px] border bg-[url('/images/nub-campus.png')] dark:bg-[url('/images/nub-campus-night.png')] bg-cover bg-center bg-no-repeat text-card-foreground shadow-xl lg:grid-cols-2">
        <AuthInfo variant="verify-email" />

        <section className="flex items-center justify-center py-5 sm:py-8 px-4 sm:px-6">
          <div className="w-full rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 lg:p-10 shadow-lg text-card-foreground">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-brand dark:text-primary" />
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-bold">
                Verify Email
              </h2>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Enter the verification code sent to your email to complete
                account setup.
              </p>
            </div>

            <div className="mt-8">
              <VerifyEmailForm
                email={initialEmail}
                autoSend={autoSend}
                skipInitialSend={skipInitialSend}
                isEmbedded={false}
                onSuccess={handleSuccess}
              />
            </div>

            <div className="mt-6 text-center text-sm">
              Already Verified?{" "}
              <Hyperlink href={ROUTES.LOGIN} className="text-brand">
                Back to Login
              </Hyperlink>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
