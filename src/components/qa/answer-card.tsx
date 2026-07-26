"use client";

import { CheckCircle } from "lucide-react";
import type { Answer } from "@/types/qa.types";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import { VoteControls } from "@/components/ui/vote-controls";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
  onVote: (answerId: string, currentVote: "UP" | "DOWN" | null) => void;
  onAccept: (answerId: string) => void;
}

export function AnswerCard({
  answer,
  isQuestionAuthor,
  onVote,
  onAccept,
}: AnswerCardProps) {
  const userVote = (answer.userVote ?? null) as "UP" | "DOWN" | null;

  return (
    <Card
      className={cn(
        "flex-row !p-0",
        answer.isAccepted && "border-success/40 bg-success/5",
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-0.5 border-r border-border/40 px-2 py-4">
        <VoteControls
          upvotes={answer.upvoteCount}
          activeVote={userVote}
          onVote={(type) => onVote(answer.id, type)}
          orientation="vertical"
        />
      </div>

      <CardContent className="flex min-w-0 flex-1 flex-col gap-3 py-4">
        {answer.isAccepted && (
          <div className="flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <CheckCircle className="size-3.5" />
            ACCEPTED ANSWER
          </div>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert">
          {answer.content}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
          {answer.author && (
            <AuthorInfo
              user={{
                id: answer.authorId,
                name: answer.author.name ?? "Unknown",
                image: answer.author.image,
              }}
              timestamp={answer.createdAt}
              size="sm"
            />
          )}

          {isQuestionAuthor && (
            <button
              onClick={() => onAccept(answer.id)}
              disabled={answer.isAccepted}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                answer.isAccepted
                  ? "cursor-default bg-success/10 text-success"
                  : "bg-muted text-muted-foreground hover:bg-success/10 hover:text-success",
              )}
            >
              {answer.isAccepted ? "Accepted" : "Accept Answer"}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
