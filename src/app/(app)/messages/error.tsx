"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console for debugging.
    console.error("[Messages] render error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-lg font-semibold">Something went wrong in Messages.</h2>
      <pre className="max-w-xl overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
      </pre>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
