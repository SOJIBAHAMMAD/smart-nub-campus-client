"use client";

import { useState, useEffect } from "react";
import { MessageCircle, ArrowUpDown } from "lucide-react";
import { CommentItem } from "@/components/resources/comment-item";
import { Button } from "@/components/ui/button";
import { listResourceComments, addResourceComment, deleteResourceComment } from "@/actions/resource.actions";
import type { Comment } from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "most_upvoted";

interface CommentSectionProps {
  /** The resource ID to fetch and post comments for. */
  resourceId: string;
  /** The current user's ID, or null if not logged in. */
  currentUserId?: string | null;
}

/**
 * Comments section for the resource detail page.
 * Fetches and renders comments with add, sort, and reply functionality.
 */
export function CommentSection({ resourceId, currentUserId = null }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  /** Fetch comments for the resource. */
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

  /** Submit a new top-level comment. */
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

  /** Handle reply to a comment. */
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

  /** Handle comment deletion. */
  async function handleDelete(commentId: string) {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
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
      }
    } catch {
      // Error silently handled
    }
  }

  /** Count all comments including replies. */
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

  /** Sort comments based on selected option. */
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
        return sorted;
      default:
        return sorted;
    }
  }

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    most_upvoted: "Most Upvoted",
  };

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Comments ({countAllComments()})
          </h2>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted"
          >
            <ArrowUpDown className="size-3" />
            {sortLabels[sortBy]}
          </button>
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border bg-card py-1 shadow-md ring-1 ring-foreground/10">
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-3 py-1.5 text-xs transition-colors",
                      sortBy === option
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {sortLabels[option]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New comment input ─────────────────────────────────────── */}
      <div className="flex gap-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={5000}
          className="flex-1 resize-none rounded-xl border bg-card px-3 py-2.5 text-sm outline-none ring-1 ring-foreground/10 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{newComment.length}/5000</span>
        <Button
          size="sm"
          onClick={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {/* ── Comments list ─────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center ring-1 ring-foreground/10">
          <MessageCircle className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {getSortedComments().map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={(parentId, content) => handleReply(parentId, content)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
