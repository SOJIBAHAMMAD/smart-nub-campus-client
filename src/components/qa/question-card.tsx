"use client";

import Link from "next/link";
import { Bookmark, MessageCircle, Eye, CheckCircle } from "lucide-react";
import type { Question } from "@/types/qa.types";
import { type VoteState } from "@/components/qa/vote-buttons";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { AuthorInfo } from "@/components/ui/author-info";
import { Metric } from "@/components/ui/metric";
import { VoteControls } from "@/components/ui/vote-controls";
import { categoryColor } from "@/constants/card-constants";

interface QuestionCardProps {
  question: Question;
  onVote: (questionId: string, currentVote: VoteState) => void;
  onBookmark: (questionId: string, currentBookmarked: boolean) => void;
}

export function QuestionCard({
  question,
  onVote,
  onBookmark,
}: QuestionCardProps) {
  const bookmarked = question.isBookmarked ?? false;
  const tags = question.questionTags ?? [];
  const canVote = question.authorId !== undefined;

  return (
    <Card data-interactive className="group">
      <CardContent className="flex gap-4 py-4">
        {/* Vote column */}
        <div className="flex shrink-0 flex-col items-center">
          <VoteControls
            upvotes={question.upvoteCount}
            orientation="vertical"
            activeVote={(question.userVote ?? null) as VoteState}
            onVote={() =>
              onVote(
                question.id,
                (question.userVote ?? null) as VoteState,
              )
            }
            disabled={!canVote}
          />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Title + bookmark row */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/qa/${question.id}`}
              className="text-[15px] font-semibold text-foreground transition-colors group-hover/link:text-primary line-clamp-2"
            >
              {question.title}
            </Link>
            <button
              onClick={() => onBookmark(question.id, bookmarked)}
              aria-label="Bookmark"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bookmark
                className={cn(
                  "size-4",
                  bookmarked && "fill-primary text-primary",
                )}
              />
            </button>
          </div>

          {/* Category + course + author row */}
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
            {question.course && (
              <span className="text-[10px] text-muted-foreground">
                {question.course.code}
              </span>
            )}
            {question.author && (
              <AuthorInfo
                user={question.author}
                timestamp={question.createdAt}
                size="sm"
              />
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((qt) => (
                <TagPill
                  key={qt.id}
                  name={qt.tag?.name ?? ""}
                  href={`/qa?tag=${qt.tag?.slug ?? ""}`}
                  size="xs"
                />
              ))}
            </div>
          )}

          {/* Footer metrics */}
          <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3">
            <Metric
              icon={MessageCircle}
              value={question.answerCount}
              label="answers"
            />
            <Metric
              icon={Eye}
              value={question.viewCount}
              label="views"
            />
            {question.isAnswered && (
              <Metric
                icon={CheckCircle}
                value=""
                className="text-success"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
