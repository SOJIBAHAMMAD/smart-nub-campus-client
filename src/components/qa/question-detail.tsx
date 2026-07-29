"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Pencil,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnswerCard } from "@/components/qa/answer-card";
import { AnswerForm } from "@/components/qa/answer-form";
import {
  voteQuestion,
  bookmarkQuestion,
  postAnswer,
  voteAnswer,
  acceptAnswer,
  listAnswers,
  listQuestions,
} from "@/actions/qa.actions";
import type { Question, Answer, QuestionListResponse } from "@/types/qa.types";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { categoryColor, categoryIcon } from "@/constants/card-constants";

interface QuestionDetailProps {
  questionId: string;
  initialQuestion: Question;
  currentUserId?: string | null;
}

export function QuestionDetail({
  questionId,
  initialQuestion,
  currentUserId,
}: QuestionDetailProps) {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [answerSort, setAnswerSort] = useState<"votes" | "newest" | "oldest">("votes");
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);

  const isAuthor = currentUserId != null && question.authorId === currentUserId;
  const bookmarked = question.isBookmarked ?? false;
  const canVoteQuestion = !isAuthor;
  const answerFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a") {
        e.preventDefault();
        answerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "s") {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  useEffect(() => {
    const slug = initialQuestion.category?.slug;
    if (slug) {
      listQuestions({ category: slug, limit: 5 }).then(
        (res) => {
          if (res.success && res.data) {
            const items = (res.data as QuestionListResponse).data.filter((q) => q.id !== questionId);
            setRelatedQuestions(items);
          }
        },
      );
    }
  }, [initialQuestion.category?.slug, questionId]);

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
    async (answerId: string, type: "UP" | "DOWN") => {
      setAnswers((prev) =>
        prev.map((a) => {
          if (a.id !== answerId) return a;
          const wasUp = a.userVote === "UP";
          const wasDown = a.userVote === "DOWN";
          if (type === "UP") {
            const delta = wasUp ? -1 : wasDown ? 2 : 1;
            return { ...a, userVote: wasUp ? null : "UP", upvoteCount: a.upvoteCount + delta };
          }
          const delta = wasDown ? 1 : wasUp ? -2 : -1;
          return { ...a, userVote: wasDown ? null : "DOWN", upvoteCount: a.upvoteCount + delta };
        }),
      );
      try {
        const result = await voteAnswer(answerId, type);
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

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: question.title, url });
    } else if (typeof navigator !== "undefined") {
      await navigator.clipboard?.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }, [question.title]);

  const tags = question.questionTags ?? [];
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    if (answerSort === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (answerSort === "oldest")
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return b.upvoteCount - a.upvoteCount;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/qa" className="transition-colors hover:text-primary">
          Q&A
        </Link>
        <ChevronLeft className="size-3.5 rotate-180" />
        <span className="truncate text-foreground">{question.title}</span>
      </nav>

      {/* ── Question ────────────────────────────────────────────── */}
      <div className="flex gap-4">
        {/* Sticky vote column */}
        <div className="hidden shrink-0 flex-col items-center gap-1 pt-1 sm:flex">
          <VoteControls
            upvotes={question.upvoteCount}
            activeVote={(question.userVote ?? null) as "UP" | "DOWN" | null}
            onVote={handleQuestionVote}
            orientation="vertical"
            disabled={!canVoteQuestion}
          />
          {question.isAnswered && (
            <CheckCircle className="size-5 text-success" aria-label="Answered" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{question.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {question.category && (
              <Badge
                variant="secondary"
                className={cn(
                  "flex h-5 items-center gap-1 rounded-full px-2 text-[10px] font-semibold",
                  categoryColor(question.category.slug),
                )}
              >
                {(() => {
                  const Icon = categoryIcon(question.category.slug);
                  return <Icon className="size-3" />;
                })()}
                {question.category.name}
              </Badge>
            )}
            {question.isAnswered && (
              <Badge className="h-5 gap-0.5 rounded-full bg-success/10 px-2 text-[10px] font-semibold text-success hover:bg-success/15">
                <CheckCircle className="size-2.5" />
                Answered
              </Badge>
            )}
          </div>

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {question.author && (
              <AuthorInfo
                user={question.author}
                timestamp={question.createdAt}
                size="sm"
              />
            )}
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {question.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {question.answerCount} answers
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <Card>
          <CardContent className="p-5">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

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
          <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4">
            <div className="sm:hidden">
              <VoteControls
                upvotes={question.upvoteCount}
                activeVote={(question.userVote ?? null) as "UP" | "DOWN" | null}
                onVote={handleQuestionVote}
                orientation="horizontal"
                size="sm"
                disabled={!canVoteQuestion}
              />
            </div>

            {isAuthor && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                nativeButton={false}
                render={<Link href={`/qa/${question.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            )}

            <Button
              variant={bookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              className="gap-1"
            >
              <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1"
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Answers ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {question.answerCount} Answer{question.answerCount === 1 ? "" : "s"}
          </h2>
          <div className="flex items-center gap-1">
            {(["votes", "newest", "oldest"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswerSort(opt)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  answerSort === opt
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {opt === "votes" ? "Votes" : opt === "newest" ? "Newest" : "Oldest"}
              </button>
            ))}
          </div>
        </div>

        {loadingAnswers ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-card p-3" />
            ))}
          </div>
        ) : answers.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <MessageCircle className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No answers yet</EmptyTitle>
              <EmptyDescription>
                Be the first to answer this question.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {sortedAnswers.map((answer) => (
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
      <div ref={answerFormRef}>
        <AnswerForm
          placeholder="Write your answer..."
          onSubmit={handlePostAnswer}
        />
      </div>

      {/* ── Cross-link to Discussions ─────────────────────────── */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Want to explore different perspectives?{" "}
        <Link
          href={question.category?.slug ? `/discussions?category=${question.category.slug}` : "/discussions"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Start a discussion about this topic
        </Link>
        .
      </div>

      {/* ── Related questions ─────────────────────────────────── */}
      {relatedQuestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Related Questions</h3>
          <div className="space-y-2">
            {relatedQuestions.map((rq) => (
              <Link
                key={rq.id}
                href={`/qa/${rq.id}`}
                className="group flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                {rq.isAnswered && <CheckCircle className="size-4 shrink-0 text-success" />}
                <span className="flex-1 truncate group-hover:text-primary">{rq.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {rq.upvoteCount} vote{rq.upvoteCount !== 1 ? "s" : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}