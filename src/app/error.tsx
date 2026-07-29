"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Global error page — catches unhandled errors at the root layout level.
 * This is the outermost error boundary in the Next.js App Router.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
          </div>
          {error.digest && (
            <p className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={reset}>Try Again</Button>
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
