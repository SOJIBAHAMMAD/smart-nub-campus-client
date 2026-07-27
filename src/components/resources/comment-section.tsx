"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUpDown, TrendingUp, Clock, History } from "lucide-react";
import { CommentItem } from "@/components/resources/comment-item";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  listResourceComments,
  addResourceComment,
  deleteResourceComment,
  voteComment,
  editResourceComment,
} from "@/actions/resource.actions";
import type { Comment } from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SortOption = "newest" | "oldest" | "most_upvoted";

interface CommentSectionProps {
  resourceId: string;
  currentUserId?: string | null;
}

export function CommentSection({ resourceId, currentUserId = null }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      try {
        const result = await listResourceComments(resourceId, 1, 50);
        if (!cancelled && result.success && result.data) {
          const data = result.data as { comments?: Comment[] };
          setComments(data.comments ?? []);
        }
      } catch {
        // Empty state handled by checking comments.length
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchComments();
    return () => { cancelled = true; };
  }, [resourceId]);

  async function handleSubmitComment() {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const result = await addResourceComment(resourceId, {
        content: newComment.trim(),
      });
      if (result.success && result.data) {
        setComments((prev) => [result.data as Comment, ...prev]);
        setNewComment("");
      } else {
        toast.error(result.message || "Failed to post comment.");
      }
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, content: string) {
    try {
      const result = await addResourceComment(resourceId, {
        content,
        parentId,
      });
      if (result.success && result.data) {
        const reply = result.data as Comment;
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies ?? []), reply] };
            }
            if (c.replies?.some((r) => r.id === parentId)) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === parentId
                    ? { ...r, replies: [...(r.replies ?? []), reply] }
                    : r
                ),
              };
            }
            return c;
          })
        );
      } else {
        toast.error(result.message || "Failed to post reply.");
      }
    } catch {
      toast.error("Failed to post reply.");
    }
  }

  async function handleDelete(commentId: string) {
    try {
      const result = await deleteResourceComment(commentId);
      if (result.success) {
        setComments((prev) =>
          prev
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: (c.replies ?? []).filter((r) => r.id !== commentId),
            }))
        );
        toast.success("Comment deleted.");
      }
    } catch {
      toast.error("Failed to delete comment.");
    }
  }

  async function handleVote(commentId: string, type: "UP" | "DOWN") {
    try {
      const result = await voteComment(commentId, type);
      if (result.success && result.data) {
        const data = result.data as { upvoteCount: number; downvoteCount: number; action: string };
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                upvoteCount: data.upvoteCount,
                downvoteCount: data.downvoteCount,
                userCommentVote: data.action === "removed" ? null : type,
              };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        upvoteCount: data.upvoteCount,
                        downvoteCount: data.downvoteCount,
                        userCommentVote: data.action === "removed" ? null : type,
                      }
                    : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch {
      toast.error("Failed to record vote.");
    }
  }

  async function handleEdit(commentId: string, content: string) {
    try {
      const result = await editResourceComment(commentId, content);
      if (result.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content, updatedAt: new Date().toISOString() };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? { ...r, content, updatedAt: new Date().toISOString() }
                    : r
                ),
              };
            }
            return c;
          })
        );
        toast.success("Comment updated.");
      }
    } catch {
      toast.error("Failed to update comment.");
    }
  }

  function countAllComments(): number {
    return comments.reduce((acc, c) => {
      let count = 1;
      if (c.replies) {
        count += c.replies.length;
        for (const r of c.replies) {
          if (r.replies) count += r.replies.length;
        }
      }
      return acc + count;
    }, 0);
  }

  function getSortedComments(): Comment[] {
    const sorted = [...comments];
    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "most_upvoted":
        return sorted.sort(
          (a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0)
        );
      default:
        return sorted;
    }
  }

  const sortIcons: Record<SortOption, React.ReactNode> = {
    newest: <Clock className="size-3.5" />,
    oldest: <History className="size-3.5" />,
    most_upvoted: <TrendingUp className="size-3.5" />,
  };

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    most_upvoted: "Top",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            {countAllComments()} Comment{countAllComments() !== 1 ? "s" : ""}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted">
                {sortIcons[sortBy]}
                {sortLabels[sortBy]}
              </button>
            }
          />
          <DropdownMenuContent align="end">
            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => setSortBy(option)}
              >
                {sortIcons[option]}
                {sortLabels[option]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* New comment input */}
      <div className="rounded-xl border bg-card p-3 ring-1 ring-foreground/5 sm:p-4">
        <div className="flex gap-3">
          <Avatar
            id={currentUserId ?? ""}
            name="You"
            className="size-8 shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <RichTextEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Share your thoughts on this resource..."
              className="text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "Posting..." : "Comment"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-card p-4 ring-1 ring-foreground/5">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3.5 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <MessageCircle className="size-10" />
            </EmptyMedia>
            <EmptyTitle>No comments yet</EmptyTitle>
            <p className="text-sm text-muted-foreground">
              Be the first to share your thoughts on this resource.
            </p>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {getSortedComments().map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onDelete={(id) => setDeleteTarget(id)}
              onVote={handleVote}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteTarget != null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  handleDelete(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
