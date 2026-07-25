"use client";

import { useState } from "react";
import { ChevronUp, MessageCircleReply, Flag } from "lucide-react";
import type { DiscussionReply } from "@/types/discussion.types";
import { ReplyForm } from "@/components/discussions/reply-form";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import { cn } from "@/lib/utils";

interface ReplyCardProps {
  reply: DiscussionReply;
  isAuthor: boolean;
  isAdmin: boolean;
  onVote: (replyId: string, currentVote: DiscussionReply["userVote"]) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onReport?: (replyId: string) => void;
  onDelete?: (replyId: string) => void;
}

export function ReplyCard({
  reply,
  isAuthor,
  isAdmin,
  onVote,
  onReply,
  onReport,
  onDelete,
}: ReplyCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const upvoted = reply.userVote === "UP";
  const nested = reply.replies ?? [];

  return (
    <Card size="sm" className="p-3">
      <CardContent className="p-0">
        {/* ── Author ─────────────────────────────────────────── */}
        <AuthorInfo
          user={{
            id: reply.author?.id ?? "",
            name: reply.author?.name ?? "Unknown",
            image: reply.author?.image,
          }}
          action={isAuthor ? "· Author" : undefined}
          timestamp={reply.createdAt}
          size="sm"
        />

        {/* ── Content ────────────────────────────────────────── */}
        <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">
          {reply.content}
        </p>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
          <button
            onClick={() => onVote(reply.id, reply.userVote)}
            className={cn(
              "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
              upvoted ? "bg-primary/10 text-primary" : "hover:bg-muted",
            )}
            aria-label="Upvote reply"
          >
            <ChevronUp className="size-3.5" />
            {reply.upvoteCount}
          </button>
          <button
            onClick={() => setShowReplyForm((v) => !v)}
            className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <MessageCircleReply className="size-3.5" />
            Reply
          </button>
          {onReport && (
            <button
              onClick={() => onReport(reply.id)}
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
              aria-label="Report reply"
            >
              <Flag className="size-3.5" />
            </button>
          )}
          {(isAuthor || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(reply.id)}
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Delete
            </button>
          )}
        </div>

        {/* ── Nested reply form ──────────────────────────────── */}
        {showReplyForm && (
          <ReplyForm
            parentId={reply.id}
            autoFocus
            compact
            placeholder={`Reply to ${reply.author?.name ?? "user"}...`}
            onSubmit={async (content) => {
              await onReply(reply.id, content);
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        )}

        {/* ── Nested replies (1 level) ──────────────────────── */}
        {nested.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-border/50 pl-3">
            {nested.map((child) => (
              <div key={child.id} className="rounded-lg bg-muted/40 p-2.5">
                <AuthorInfo
                  user={{
                    id: child.author?.id ?? "",
                    name: child.author?.name ?? "Unknown",
                    image: child.author?.image,
                  }}
                  timestamp={child.createdAt}
                  size="sm"
                />
                <p className="mt-1.5 whitespace-pre-line text-xs text-foreground/80">
                  {child.content}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                  <button
                    onClick={() => onVote(child.id, child.userVote)}
                    className={cn(
                      "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                      child.userVote === "UP"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                    )}
                    aria-label="Upvote reply"
                  >
                    <ChevronUp className="size-3" />
                    {child.upvoteCount}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
