"use client";

import { useState } from "react";
import { ChevronUp, MessageCircle, Trash2 } from "lucide-react";
import type { Comment } from "@/types/resource.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { formatRelativeTime } from "@/components/resources/file-type-utils";

interface CommentItemProps {
  /** The comment data to display. */
  comment: Comment;
  /** Whether the current user is the author of this comment. */
  isAuthor?: boolean;
  /** Callback when the user wants to reply to this comment. */
  onReply?: (parentId: string, content: string) => void;
  /** Callback when the user wants to delete this comment. */
  onDelete?: (commentId: string) => void;
  /** Depth level for nesting (max 1 for display). */
  depth?: number;
}

/**
 * Single comment with author, content, timestamp, reply button, and upvote.
 * Supports one level of nesting for replies.
 */
export function CommentItem({
  comment,
  isAuthor = false,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={cn("group/comment", depth > 0 && "ml-8 border-l-2 border-border/50 pl-4")}>
      <div className="rounded-lg bg-card p-3 ring-1 ring-foreground/5">
        {/* ── Author + timestamp ──────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {comment.user?.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {comment.user?.name?.charAt(0) ?? "?"}
            </div>
          )}
          <span className="text-xs font-medium text-foreground">
            {comment.user?.name ?? "Unknown"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <p className="mt-2 text-sm text-foreground/90">{comment.content}</p>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="mt-2 flex items-center gap-3">
          {/* Upvote */}
          <button
            onClick={() => setUpvoted(!upvoted)}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              upvoted ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronUp className="size-3.5" />
            <span>{upvoted ? 1 : 0}</span>
          </button>

          {/* Reply (max depth 1) */}
          {depth < 2 && onReply && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="size-3.5" />
              Reply
            </button>
          )}

          {/* Delete (only if author) */}
          {isAuthor && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>

        {/* ── Reply input ─────────────────────────────────────────── */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button
                size="xs"
                onClick={() => {
                  if (replyContent.trim()) {
                    onReply?.(comment.id, replyContent.trim());
                    setReplyContent("");
                    setShowReplyInput(false);
                  }
                }}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setShowReplyInput(false);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Nested replies ────────────────────────────────────────── */}
      {comment.replies && comment.replies.length > 0 && depth < 2 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-primary font-medium transition-colors hover:underline"
          >
            {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isAuthor={isAuthor}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
