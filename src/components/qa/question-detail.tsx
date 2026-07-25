"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  Eye,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { VoteControls } from "@/components/ui/vote-controls";
import { AuthorInfo } from "@/components/ui/author-info";
import { toast } from "sonner";
import { VoteButtons, type VoteState } from "@/components/qa/vote-buttons";
import { AnswerCard } from "@/components/qa/answer-card";
import { AnswerForm } from "@/components/qa/answer-form";
import {
  voteQuestion,
  bookmarkQuestion,
  postAnswer,
  voteAnswer,
  acceptAnswer,
  listAnswers,
} from "@/actions/qa.actions";
import { formatRelativeTime } from "@/components/resources/file-type-utils";
import type { Question, Answer } from "@/types/qa.types";

interface QuestionDetailProps {
  questionId: string;
  initialQuestion: Question;
  currentUserId?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  academics: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  programming: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  projects: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  career: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  events: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  general: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  internships: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  research: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function categoryColor(slug?: string): string {
  return (slug && CATEGORY_COLORS[slug]) || CATEGORY_COLORS.general;
}

/**
 * Full-width question detail view (no PageLayout).
 * Shows breadcrumb, vote column, header, rendered content, tags, actions
 * (bookmark / share), author card, view count, answers (accepted first),
 * and an answer form.
 */
export function QuestionDetail({
  questionId,
  initialQuestion,
  currentUserId,
}: QuestionDetailProps) {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);

  const isAuthor = currentUserId != null && question.authorId === currentUserId;
  const bookmarked = question.isBookmarked ?? false;
  const userVote = (question.userVote ?? null) as VoteState;
  // Question authors cannot vote on their own question.
  const canVoteQuestion = !isAuthor;

  // Fetches answers for the question (initial load + rollback on error).
  const loadAnswers = useCallback(async () => {
    try {
      const result = await listAnswers(questionId);
      if (result.success && result.data) {
        setAnswers((result.data as Answer[]) ?? []);
      }
    } catch {
      // Empty state handles errors
    } finally {
      setLoadingAnswers(false);
    }
  }, [questionId]);

  useEffect(() => {
    void loadAnswers();
  }, [loadAnswers]);

  const handleQuestionVote = useCallback(
    async (type: "UP" | "DOWN") => {
      const wasUp = question.userVote === "UP";
      const wasDown = question.userVote === "DOWN";
      setQuestion((prev) => {
        if (type === "UP") {
          const delta = wasUp ? -1 : wasDown ? 2 : 1;
          return { ...prev, userVote: wasUp ? null : "UP", upvoteCount: prev.upvoteCount + delta };
        }
        const delta = wasDown ? 1 : wasUp ? -2 : -1;
        return { ...prev, userVote: wasDown ? null : "DOWN", upvoteCount: prev.upvoteCount + delta };
      });
      try {
        const result = await voteQuestion(questionId, type);
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setQuestion((prev) => ({ ...prev, upvoteCount: data.upvoteCount }));
        } else {
          void loadAnswers();
          toast.error(result.message || "Failed to record vote.");
        }
      } catch {
        void loadAnswers();
      }
    },
    [questionId, question.userVote, loadAnswers],
  );

  const handleBookmark = useCallback(async () => {
    setQuestion((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    try {
      const result = await bookmarkQuestion(questionId);
      if (!result.success) {
        setQuestion((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
        toast.error(result.message || "Failed to toggle bookmark.");
      }
    } catch {
      setQuestion((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    }
  }, [questionId]);

  const handleAnswerVote = useCallback(
    async (answerId: string, currentVote: VoteState) => {
      setAnswers((prev) =>
        prev.map((a) => {
          if (a.id !== answerId) return a;
          const wasUp = currentVote === "UP";
          if (currentVote === null) {
            return { ...a, userVote: "UP", upvoteCount: a.upvoteCount + 1 };
          }
          if (wasUp) {
            return { ...a, userVote: null, upvoteCount: a.upvoteCount - 1 };
          }
          return { ...a, userVote: "UP", upvoteCount: a.upvoteCount + 2 };
        }),
      );
      try {
        const result = await voteAnswer(answerId, "UP");
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setAnswers((prev) =>
            prev.map((a) => (a.id === answerId ? { ...a, upvoteCount: data.upvoteCount } : a)),
          );
        } else {
          void loadAnswers();
          toast.error(result.message || "Failed to record vote.");
        }
      } catch {
        void loadAnswers();
      }
    },
    [loadAnswers],
  );

  const handleAccept = useCallback(
    async (answerId: string) => {
      try {
        const result = await acceptAnswer(questionId, answerId);
        if (result.success) {
          toast.success("Answer accepted!");
          setAnswers((prev) =>
            prev.map((a) => ({ ...a, isAccepted: a.id === answerId })),
          );
          setQuestion((prev) => ({ ...prev, isAnswered: true }));
        } else {
          toast.error(result.message || "Failed to accept answer.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to accept answer.");
      }
    },
    [questionId],
  );

  const handlePostAnswer = useCallback(
    async (content: string) => {
      try {
        const result = await postAnswer(questionId, content);
        if (result.success && result.data) {
          const newAnswer = result.data as Answer;
          setAnswers((prev) => [...prev, newAnswer]);
          setQuestion((prev) => ({ ...prev, answerCount: prev.answerCount + 1 }));
          toast.success("Answer posted!");
        } else {
          throw new Error(result.message || "Failed to post answer.");
        }
      } finally {
      }
    },
    [questionId],
  );

  const tags = question.questionTags ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/qa" className="transition-colors hover:text-primary">
          Q&A
        </Link>
        <ChevronLeft className="size-3.5 rotate-180" />
        <span className="truncate text-foreground">{question.title}</span>
      </nav>

      {/* ── Header + vote column ──────────────────────────────── */}
      <div className="flex gap-4">
        {/* Sticky vote column */}
        <div className="hidden shrink-0 flex-col items-center gap-1 pt-1 sm:flex">
          <VoteButtons
            voteCount={question.upvoteCount}
            userVote={userVote}
             onVote={() => handleQuestionVote("UP")}
            orientation="vertical"
            disabled={!canVoteQuestion}
          />
          {question.isAnswered && (
            <CheckCircle className="size-5 text-success" aria-label="Answered" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground">{question.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {question.category && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  categoryColor(question.category.slug),
                )}
              >
                {question.category.name}
              </span>
            )}
            {question.isAnswered && (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                <CheckCircle className="size-3" />
                Answered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Meta ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Asked {formatRelativeTime(question.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="size-3.5" />
          {question.viewCount} views
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="size-3.5" />
          {question.answerCount} answers
        </span>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {question.content}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((qt) => (
                <TagPill
                  key={qt.id}
                  name={qt.tag?.name ?? "tag"}
                  href={`/qa?tag=${qt.tag?.slug ?? ""}`}
                  size="sm"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
            <VoteControls
              upvotes={question.upvoteCount}
              activeVote={(question.userVote ?? null) as "UP" | "DOWN" | null}
              onVote={handleQuestionVote}
              orientation="horizontal"
              disabled={!canVoteQuestion}
            />

            <button
              onClick={handleBookmark}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                bookmarked
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </button>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: question.title, url: window.location.href });
                } else if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Author card ────────────────────────────────────────── */}
      {question.author && (
        <AuthorInfo
          user={{ id: question.authorId, name: question.author.name ?? "Unknown", image: question.author.image }}
          timestamp={question.createdAt}
          size="md"
        />
      )}

      {/* ── Answers ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          {question.answerCount} Answer{question.answerCount === 1 ? "" : "s"}
        </h2>

        {loadingAnswers ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-card p-3 ring-1 ring-foreground/10" />
            ))}
          </div>
        ) : answers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center ring-1 ring-foreground/10">
              <MessageCircle className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium text-foreground">No answers yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Be the first to answer this question.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isQuestionAuthor={isAuthor}
                onVote={handleAnswerVote}
                onAccept={handleAccept}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Answer form ────────────────────────────────────────── */}
      <AnswerForm
        placeholder="Write your answer..."
        onSubmit={handlePostAnswer}
      />
    </div>
  );
}
