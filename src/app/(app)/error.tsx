"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * App-specific error page — catches errors within the (app) route group.
 * Renders below the TopNav in the authenticated layout.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          An error occurred while loading this page. Please try again.
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
  );
}
