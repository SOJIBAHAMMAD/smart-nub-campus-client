"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConversationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Conversation] render error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-lg font-semibold">Conversation not found.</h2>
      <pre className="max-w-xl overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
        {error.message}
        {error.digest ? `\n\nDigest: ${error.digest}` : ""}
      </pre>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
