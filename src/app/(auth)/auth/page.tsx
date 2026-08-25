import Link from "next/link";
import { ShieldCheck, User, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthInfo from "./_components/AuthInfo";
import ROUTES from "@/constants/routes";

export default function AuthPage() {
  return (
    <main>
      <div className="grid overflow-hidden rounded-2xl sm:rounded-[32px] border bg-campus text-card-foreground shadow-xl lg:grid-cols-2">
        {/* Left Section: Branding & Features */}
        <AuthInfo variant="default" />
        {/* Right Section: Interactive Onboarding Actions */}
        <section className="flex items-center justify-center py-5 sm:py-8 px-4 sm:px-6">
          <div className="w-full rounded-2xl sm:rounded-3xl border bg-card p-4 sm:p-8 lg:p-10 shadow-lg text-card-foreground">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-brand dark:text-primary" />
              </div>
              <h2 className="mt-3 sm:mt-5 text-2xl sm:text-4xl font-bold">
                Get Started
              </h2>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Join Smart NUB Campus in a few simple steps
              </p>
            </div>

            <div className="mt-5 sm:mt-8 space-y-4 sm:space-y-6">
              {/* New Student Card */}
              <Card className="rounded-2xl pb-4 sm:rounded-3xl bg-brand/5 hover:bg-brand/6 border-border [--card-spacing:--spacing(3)] sm:[--card-spacing:--spacing(6)]">
                <CardHeader className="flex flex-row gap-3 sm:gap-5 items-start">
                  <div className="flex h-11 w-11 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-brand-light dark:bg-primary/20">
                    <User className="h-5 w-5 sm:h-8 sm:w-8 text-brand dark:text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base leading-tight">
                      I&apos;m a New Student
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                      Verify your student identity for admin approval.
                    </CardDescription>
                    <Button
                      variant="default"
                      nativeButton={false}
                      className="mt-2.5 sm:mt-5 group w-full sm:w-auto px-5 sm:px-10"
                      render={
                        <Link href={ROUTES.ONBOARDING}>
                          Verify My Identity{" "}
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300 h-4 w-4" />
                        </Link>
                      }
                    />
                  </div>
                </CardHeader>
              </Card>

              {/* Verified Student Card */}
              <Card className="rounded-2xl pb-4 sm:rounded-3xl bg-success/1 hover:bg-success/4 border-border [--card-spacing:--spacing(3)] sm:[--card-spacing:--spacing(6)]">
                <CardHeader className="flex flex-row gap-3 sm:gap-5 items-start">
                  <div className="flex h-11 w-11 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-success-bg dark:bg-success/20">
                    <ShieldCheck className="h-5 w-5 sm:h-8 sm:w-8 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base leading-tight">
                      I&apos;m a Verified Student
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                      Already verified? Login to access the platform.
                    </CardDescription>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      className="mt-2.5 sm:mt-5 border border-success w-full sm:w-auto px-5 sm:px-10"
                      render={
                        <Link href={ROUTES.LOGIN}>
                          Login to My Account{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      }
                    />
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Support Footer */}
            <div className="mt-6 sm:mt-10 border-t border-border pt-5 sm:pt-8 flex gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-border bg-card text-sm font-medium shrink-0">
                ?
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">
                  Need help getting started?
                </p>
                <a
                  href="mailto:support@nub.ac.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send us an email"
                  title="Send us an email"
                  className="text-xs sm:text-sm text-brand dark:text-primary hover:underline"
                >
                  support@nub.ac.bd
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
