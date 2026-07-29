"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { QuestionDetail } from "@/components/qa/question-detail";
import { getQuestion } from "@/actions/qa.actions";
import { authClient } from "@/lib/auth-client";
import type { Question } from "@/types/qa.types";

/** Loading skeleton for the question detail page. */
function QuestionDetailSkeleton() {
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
 * Question detail page — full-width layout (no PageLayout sidebars).
 * Loads the question by ID and the current user session (for author checks),
 * then renders the full QuestionDetail view.
 */
export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchQuestion() {
      try {
        const result = await getQuestion(questionId);
        if (!cancelled) {
          if (result.success && result.data) {
            const data = result.data as { data?: Question } | Question;
            const q = "data" in data && data.data ? data.data : (data as Question);
            setQuestion(q);
          } else {
            setError(result.message || "Question not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load question.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuestion();
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  if (loading) {
    return <QuestionDetailSkeleton />;
  }

  if (error || !question) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <AlertCircle className="mx-auto size-12 text-destructive/50" />
        <p className="mt-4 text-lg font-medium text-foreground">
          {error || "Question not found."}
        </p>
        <Link
          href="/qa"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-outline bg-success/2 px-4 py-2 text-sm font-medium text-success/90 transition-colors hover:bg-success/5"
        >
          Back to Q&A
        </Link>
      </div>
    );
  }

  return (
    <QuestionDetail
      questionId={questionId}
      initialQuestion={question}
      currentUserId={currentUserId}
    />
  );
}
