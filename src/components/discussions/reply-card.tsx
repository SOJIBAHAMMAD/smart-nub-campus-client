"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MessageCircleReply,
  CheckCircle2,
  Edit3,
  X,
  Save,
  Loader2,
} from "lucide-react";
import type { DiscussionReply } from "@/types/discussion.types";
import { ReplyForm } from "@/components/discussions/reply-form";
import { ReportDialog } from "@/components/discussions/report-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorInfo } from "@/components/ui/author-info";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor, RichTextEditorContent } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import { editReply } from "@/actions/discussion.actions";
import { toast } from "sonner";

interface ReplyCardProps {
  reply: DiscussionReply;
  discussionId: string;
  isAuthor: boolean;
  isAdmin: boolean;
  isSolved: boolean;
  solutionReplyId: string | null;
  currentUserId?: string | null;
  onVote: (replyId: string, currentVote: DiscussionReply["userVote"]) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  onAccept: (replyId: string) => Promise<void>;
  onReport?: (replyId: string, reason: string, details?: string) => Promise<void>;
  onDelete?: (replyId: string) => void;
  onReplyUpdated?: () => void;
}

export function ReplyCard({
  reply,
  discussionId,
  isAuthor: isDiscussionAuthor,
  isAdmin,
  isSolved,
  solutionReplyId,
  currentUserId,
  onVote,
  onReply,
  onAccept,
  onReport,
  onDelete,
  onReplyUpdated,
}: ReplyCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [saving, setSaving] = useState(false);

  const upvoted = reply.userVote === "UP";
  const nested = reply.replies ?? [];
  const [showAllNested, setShowAllNested] = useState(false);
  const INITIAL_VISIBLE = 2;
  const visibleNested = showAllNested ? nested : nested.slice(0, INITIAL_VISIBLE);
  const hiddenCount = nested.length - INITIAL_VISIBLE;
  const isReplyAuthor = currentUserId != null && reply.authorId === currentUserId;
  const isAccepted = reply.isAccepted ?? reply.id === solutionReplyId;

  const handleSaveEdit = async () => {
    const trimmed = editContent.replace(/<[^>]*>?/gm, "").trim();
    if (!trimmed || trimmed === reply.content.replace(/<[^>]*>?/gm, "").trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const result = await editReply(discussionId, reply.id, editContent);
      if (result.success) {
        setEditing(false);
        onReplyUpdated?.();
        toast.success("Reply updated.");
      } else {
        toast.error(result.message || "Failed to update reply.");
      }
    } catch {
      toast.error("Failed to update reply.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(reply.content);
    setEditing(false);
  };

  return (
    <Card
      size="sm"
      className={cn(
        "p-3 transition-colors",
        isAccepted && "border-success/40 bg-success/[0.03] ring-1 ring-success/20",
      )}
    >
      <CardContent className="p-0">
        {/* ── Author ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <AuthorInfo
            user={{
              id: reply.author?.id ?? "",
              name: reply.author?.name ?? "Unknown",
              image: reply.author?.image,
            }}
            action={isReplyAuthor ? "· You" : undefined}
            timestamp={reply.createdAt}
            size="sm"
          />
          <div className="flex items-center gap-1">
            {isAccepted && (
              <Badge variant="default" className="h-5 gap-0.5 bg-success/10 text-success text-[10px] px-1.5">
                <CheckCircle2 className="size-2.5" />
                Solution
              </Badge>
            )}
            {reply.isEdited && (
              <Badge variant="ghost" className="h-5 text-[10px] px-1.5 text-muted-foreground">
                Edited
              </Badge>
            )}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        {editing ? (
          <div className="mt-2 space-y-2">
            <RichTextEditor value={editContent} onChange={setEditContent}>
              <RichTextEditorContent className="min-h-[100px]" />
            </RichTextEditor>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/70"
              >
                <X className="size-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="prose prose-sm mt-2 max-w-none text-foreground/80 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: reply.content }}
          />
        )}

        {/* ── Actions ────────────────────────────────────────── */}
        {!editing && (
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

            {/* Accept answer — only discussion author */}
            {isDiscussionAuthor && !isReplyAuthor && (
              <button
                onClick={() => onAccept(reply.id)}
                className={cn(
                  "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors",
                  isAccepted
                    ? "bg-success/10 text-success"
                    : "hover:bg-success/10 hover:text-success",
                )}
                aria-label={isAccepted ? "Unmark as solution" : "Mark as solution"}
              >
                <CheckCircle2 className="size-3.5" />
                {isAccepted ? "Accepted" : "Accept"}
              </button>
            )}

            {/* Edit — only reply author */}
            {isReplyAuthor && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Edit3 className="size-3" />
                Edit
              </button>
            )}

            {/* Report */}
            {onReport && !isReplyAuthor && (
              <ReportDialog
                replyId={reply.id}
                onReport={onReport}
              />
            )}

            {/* Delete — author or admin */}
            {(isReplyAuthor || isAdmin) && onDelete && (
              <button
                onClick={() => onDelete(reply.id)}
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Delete
              </button>
            )}
          </div>
        )}

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
            {visibleNested.map((child) => {
              const isChildAccepted = child.isAccepted ?? child.id === solutionReplyId;
              return (
                <div
                  key={child.id}
                  className={cn(
                    "rounded-lg p-2.5",
                    isChildAccepted ? "bg-success/[0.03] ring-1 ring-success/20" : "bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <AuthorInfo
                      user={{
                        id: child.author?.id ?? "",
                        name: child.author?.name ?? "Unknown",
                        image: child.author?.image,
                      }}
                      timestamp={child.createdAt}
                      size="sm"
                    />
                    <div className="flex items-center gap-1">
                      {isChildAccepted && (
                        <CheckCircle2 className="size-3 text-success" />
                      )}
                      {child.isEdited && (
                        <Badge variant="ghost" className="h-4 text-[9px] px-1 text-muted-foreground">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className="prose prose-sm mt-1.5 max-w-none text-foreground/80 dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: child.content }}
                  />
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
                    {isDiscussionAuthor && !isReplyAuthor && child.authorId !== currentUserId && (
                      <button
                        onClick={() => onAccept(child.id)}
                        className={cn(
                          "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                          isChildAccepted
                            ? "bg-success/10 text-success"
                            : "hover:bg-success/10 hover:text-success",
                        )}
                      >
                        <CheckCircle2 className="size-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {nested.length > INITIAL_VISIBLE && (
              <button
                onClick={() => setShowAllNested((v) => !v)}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                {showAllNested ? (
                  <>
                    <ChevronDown className="size-3 rotate-180" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" />
                    View {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
