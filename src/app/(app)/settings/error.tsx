"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError: Settings]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Settings unavailable</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
      </div>
      {error.digest && (
        <p className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
          {error.digest}
        </p>
      )}
      <Button onClick={reset} size="sm">
        Try Again
      </Button>
    </div>
  );
}
