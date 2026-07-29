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
import { Badge } from "@/components/ui/badge";
import { AuthorInfo } from "@/components/ui/author-info";
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
  onVote: (replyId: string, type: "UP" | "DOWN") => void;
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
  const downvoted = reply.userVote === "DOWN";
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
        "relative transition-all",
        isAccepted && "border-success/40 bg-success/[0.03] ring-1 ring-success/20",
      )}
    >
      {isAccepted && (
        <div className="absolute left-0 top-0 h-full w-0.5 bg-success rounded-l-lg" />
      )}
      <CardContent className="p-3">
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

        {!editing && (
          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <button
              onClick={() => onVote(reply.id, "UP")}
              className={cn(
                "flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors",
                upvoted
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary",
              )}
              aria-label="Upvote reply"
            >
              <ChevronUp className="size-3.5" />
            </button>
            <span
              className={cn(
                "min-w-3 text-center text-xs font-semibold tabular-nums",
                upvoted && "text-primary",
                downvoted && "text-destructive",
              )}
            >
              {reply.upvoteCount}
            </span>
            <button
              onClick={() => onVote(reply.id, "DOWN")}
              className={cn(
                "flex items-center rounded-md px-1 py-0.5 text-xs font-medium transition-colors",
                downvoted
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-muted hover:text-destructive",
              )}
              aria-label="Downvote reply"
            >
              <ChevronDown className="size-3.5" />
            </button>

            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <MessageCircleReply className="size-3.5" />
              Reply
            </button>

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

            {isReplyAuthor && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Edit3 className="size-3" />
                Edit
              </button>
            )}

            {onReport && !isReplyAuthor && (
              <ReportDialog
                replyId={reply.id}
                onReport={onReport}
              />
            )}

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

        {nested.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-border/50 pl-3">
            {visibleNested.map((child) => (
              <ReplyCard
                key={child.id}
                reply={child}
                discussionId={discussionId}
                isAuthor={isDiscussionAuthor}
                isAdmin={isAdmin}
                isSolved={isSolved}
                solutionReplyId={solutionReplyId}
                currentUserId={currentUserId}
                onVote={onVote}
                onReply={onReply}
                onAccept={onAccept}
                onReport={onReport}
                onDelete={onDelete}
                onReplyUpdated={onReplyUpdated}
              />
            ))}
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
