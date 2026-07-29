"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { DiscussionDetail } from "@/components/discussions/discussion-detail";
import { getDiscussion } from "@/actions/discussion.actions";
import { authClient } from "@/lib/auth-client";
import type { Discussion } from "@/types/discussion.types";

/** Loading skeleton for the discussion detail page. */
function DiscussionDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="h-7 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-xl border bg-card p-5 ring-1 ring-foreground/10" />
      <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg border bg-card p-3 ring-1 ring-foreground/10" />
        ))}
      </div>
    </div>
  );
}

/**
 * Discussion detail page — full-width layout (no PageLayout sidebars).
 * Loads the discussion by ID and the current user session (for admin checks),
 * then renders the full DiscussionDetail view.
 */
export default function DiscussionDetailPage() {
  const params = useParams();
  const discussionId = params.id as string;
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;
  // The Better Auth session user type does not expose `role` directly;
  // read it defensively for the admin-only action UI.
  const isAdmin =
    ((session?.user as { role?: string } | undefined)?.role ?? "STUDENT") ===
    "ADMIN";

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDiscussion() {
      try {
        const result = await getDiscussion(discussionId);
        if (!cancelled) {
          if (result.success && result.data) {
            const data = result.data as { data?: Discussion } | Discussion;
            const disc =
              "data" in data && data.data ? data.data : (data as Discussion);
            setDiscussion(disc);
          } else {
            setError(result.message || "Discussion not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load discussion.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDiscussion();
    return () => {
      cancelled = true;
    };
  }, [discussionId]);

  if (loading) {
    return <DiscussionDetailSkeleton />;
  }

  if (error || !discussion) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <AlertCircle className="mx-auto size-12 text-destructive/50" />
        <p className="mt-4 text-lg font-medium text-foreground">
          {error || "Discussion not found."}
        </p>
        <Link
          href="/discussions"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-outline bg-success/2 px-4 py-2 text-sm font-medium text-success/90 transition-colors hover:bg-success/5"
        >
          Back to Discussions
        </Link>
      </div>
    );
  }

  return (
    <DiscussionDetail
      discussionId={discussionId}
      initialDiscussion={discussion}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}
