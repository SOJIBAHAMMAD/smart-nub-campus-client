"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  MessageCircle,
  Loader2,
  ChevronDown,
  CheckCheck,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { VoteControls } from "@/components/ui/vote-controls";
import { AuthorInfo } from "@/components/ui/author-info";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReplyCard } from "@/components/discussions/reply-card";
import { ReplyForm } from "@/components/discussions/reply-form";
import { ReportDialog } from "@/components/discussions/report-dialog";
import { DiscussionEditForm } from "@/components/discussions/discussion-edit-form";
import {
  voteDiscussion,
  bookmarkDiscussion,
  postDiscussionReply,
  voteReply,
  listReplies,
  togglePin,
  toggleLock,
  acceptAnswer,
  reportReply,
} from "@/actions/discussion.actions";
import type {
  Discussion,
  DiscussionReply,
} from "@/types/discussion.types";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";

type ReplySort = "upvotes" | "newest" | "oldest";

interface DiscussionDetailProps {
  discussionId: string;
  initialDiscussion: Discussion;
  currentUserId?: string | null;
  isAdmin?: boolean;
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

export function DiscussionDetail({
  discussionId,
  initialDiscussion,
  currentUserId,
  isAdmin,
}: DiscussionDetailProps) {
  const [discussion, setDiscussion] = useState<Discussion>(initialDiscussion);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replySort, setReplySort] = useState<ReplySort>("upvotes");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState(false);
  const hasJoinedRoom = useRef(false);

  const isAuthor = currentUserId != null && discussion.authorId === currentUserId;
  const bookmarked = discussion.isBookmarked ?? false;
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

  // Join discussion room for real-time updates
  useEffect(() => {
    if (socket && !hasJoinedRoom.current) {
      hasJoinedRoom.current = true;
      socket.emit("discussion:join", { discussionId });
    }
    return () => {
      if (socket && hasJoinedRoom.current) {
        socket.emit("discussion:leave", { discussionId });
      }
    };
  }, [socket, discussionId]);

  // Real-time: new reply
  useSocketEvent(socket, "discussion:reply:new", (data) => {
    if (data.discussionId !== discussionId) return;
    const socketReply = data.reply;
    const newReply: DiscussionReply = {
      id: socketReply.id,
      content: socketReply.content,
      discussionId: socketReply.discussionId,
      authorId: socketReply.authorId,
      parentId: socketReply.parentId,
      isEdited: false,
      isDeleted: false,
      upvoteCount: 0,
      replies: [],
      createdAt: socketReply.createdAt,
      updatedAt: socketReply.createdAt,
    };
    setReplies((prev) => {
      if (socketReply.parentId) {
        return prev.map((r) =>
          r.id === socketReply.parentId
            ? { ...r, replies: [...(r.replies ?? []), newReply] }
            : r,
        );
      }
      return [...prev, newReply];
    });
    setDiscussion((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
  });

  // Real-time: vote update
  useSocketEvent(socket, "discussion:vote:update", (data) => {
    if (data.entityType === "discussion" && data.discussionId === discussionId) {
      setDiscussion((prev) => ({ ...prev, upvoteCount: data.upvoteCount }));
    }
    if (data.entityType === "reply" && data.replyId) {
      setReplies((prev) =>
        prev.map((r) => {
          if (r.id === data.replyId) {
            return { ...r, upvoteCount: data.upvoteCount };
          }
          return {
            ...r,
            replies: (r.replies ?? []).map((c) =>
              c.id === data.replyId ? { ...c, upvoteCount: data.upvoteCount } : c,
            ),
          };
        }),
      );
    }
  });

  // Real-time: reply edited
  useSocketEvent(socket, "discussion:reply:edited", (data) => {
    if (data.discussionId !== discussionId) return;
    const updateReplyInList = (list: DiscussionReply[]): DiscussionReply[] =>
      list.map((r) => {
        if (r.id === data.replyId) {
          return { ...r, content: data.content, isEdited: data.isEdited };
        }
        if (r.replies) {
          return { ...r, replies: updateReplyInList(r.replies) };
        }
        return r;
      });
    setReplies((prev) => updateReplyInList(prev));
  });

  // Fetch replies
  const loadReplies = useCallback(async () => {
    try {
      const res = await listReplies(discussionId, 1, 100);
      if (res.success && res.data) {
        const data = res.data as { replies?: DiscussionReply[] };
        const list = data.replies ?? [];
        const byParent = new Map<string, DiscussionReply[]>();
        for (const r of list) {
          if (r.parentId) {
            const arr = byParent.get(r.parentId) ?? [];
            arr.push(r);
            byParent.set(r.parentId, arr);
          }
        }
        const topLevel = list
          .filter((r) => !r.parentId)
          .map((r) => ({
            ...r,
            isAccepted: discussion.solutionReplyId === r.id,
            replies: (byParent.get(r.id) ?? [])
              .sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
              )
              .map((c) => ({ ...c, isAccepted: discussion.solutionReplyId === c.id })),
          }));
        setReplies(topLevel);
      }
    } catch {
    } finally {
      setLoadingReplies(false);
    }
  }, [discussionId, discussion.solutionReplyId]);

  useEffect(() => {
    void loadReplies();
  }, [loadReplies]);

  // Sort replies: accepted answer always first
  const sortedReplies = useCallback(() => {
    const copy = [...replies];
    // Pin accepted answer to top
    const acceptedIdx = copy.findIndex((r) => r.isAccepted);
    if (acceptedIdx > 0) {
      const [accepted] = copy.splice(acceptedIdx, 1);
      copy.unshift(accepted);
    }
    switch (replySort) {
      case "newest":
        return copy.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return copy.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "upvotes":
      default:
        return copy.sort((a, b) => b.upvoteCount - a.upvoteCount);
    }
  }, [replies, replySort]);

  const handleVote = useCallback(
    async (type: "UP" | "DOWN") => {
      if (type !== "UP") return;
      const original = discussion;
      const wasUp = original.userVote === "UP";
      setDiscussion((prev) => ({
        ...prev,
        userVote: wasUp ? null : "UP",
        upvoteCount: prev.upvoteCount + (wasUp ? -1 : 1),
      }));
      try {
        const result = await voteDiscussion(discussionId, "UP");
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setDiscussion((prev) => ({ ...prev, upvoteCount: data.upvoteCount }));
        } else {
          setDiscussion((prev) => ({
            ...prev,
            userVote: original.userVote,
            upvoteCount: original.upvoteCount,
          }));
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
        setDiscussion((prev) => ({
          ...prev,
          userVote: original.userVote,
          upvoteCount: original.upvoteCount,
        }));
        toast.error(err instanceof Error ? err.message : "Failed to record vote.");
      }
    },
    [discussionId, discussion],
  );

  const handleBookmark = useCallback(async () => {
    const original = discussion;
    setDiscussion((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
    try {
      const result = await bookmarkDiscussion(discussionId);
      if (!result.success) {
        setDiscussion((prev) => ({ ...prev, isBookmarked: original.isBookmarked }));
        toast.error(result.message || "Failed to toggle bookmark.");
      }
    } catch (err) {
      setDiscussion((prev) => ({ ...prev, isBookmarked: original.isBookmarked }));
      toast.error(err instanceof Error ? err.message : "Failed to toggle bookmark.");
    }
  }, [discussionId, discussion]);

  const handleReplyVote = useCallback(
    async (replyId: string, currentVote: DiscussionReply["userVote"]) => {
      setReplies((prev) =>
        prev.map((r) => {
          if (r.id !== replyId) {
            return {
              ...r,
              replies: (r.replies ?? []).map((c) =>
                c.id === replyId
                  ? {
                      ...c,
                      userVote: currentVote === "UP" ? null : "UP",
                      upvoteCount: c.upvoteCount + (currentVote === "UP" ? -1 : 1),
                    }
                  : c,
              ),
            };
          }
          const wasUp = currentVote === "UP";
          return {
            ...r,
            userVote: wasUp ? null : "UP",
            upvoteCount: r.upvoteCount + (wasUp ? -1 : 1),
          };
        }),
      );
      try {
        const result = await voteReply(replyId, "UP");
        if (result.success && result.data) {
          const data = result.data as { upvoteCount: number };
          setReplies((prev) =>
            prev.map((r) =>
              r.id === replyId
                ? { ...r, upvoteCount: data.upvoteCount }
                : {
                    ...r,
                    replies: (r.replies ?? []).map((c) =>
                      c.id === replyId ? { ...c, upvoteCount: data.upvoteCount } : c,
                    ),
                  },
            ),
          );
        } else {
          setReplies((prev) =>
            prev.map((r) => {
              if (r.id !== replyId) {
                return {
                  ...r,
                  replies: (r.replies ?? []).map((c) =>
                    c.id === replyId
                      ? { ...c, userVote: currentVote, upvoteCount: c.upvoteCount + (currentVote === "UP" ? -1 : 1) }
                      : c,
                  ),
                };
              }
              const wasUp = currentVote === "UP";
              return { ...r, userVote: currentVote, upvoteCount: r.upvoteCount + (wasUp ? -1 : 1) };
            }),
          );
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
        setReplies((prev) =>
          prev.map((r) => {
            if (r.id !== replyId) {
              return {
                ...r,
                replies: (r.replies ?? []).map((c) =>
                  c.id === replyId
                    ? { ...c, userVote: currentVote, upvoteCount: c.upvoteCount + (currentVote === "UP" ? -1 : 1) }
                    : c,
                ),
              };
            }
            const wasUp = currentVote === "UP";
            return { ...r, userVote: currentVote, upvoteCount: r.upvoteCount + (wasUp ? -1 : 1) };
          }),
        );
        toast.error(err instanceof Error ? err.message : "Failed to record vote.");
      }
    },
    [],
  );

  const handlePostReply = useCallback(
    async (content: string, parentId?: string) => {
      try {
        const result = await postDiscussionReply(discussionId, { content, parentId });
        if (result.success && result.data) {
          const newReply = result.data as DiscussionReply;
          setReplies((prev) => {
            if (parentId) {
              return prev.map((r) =>
                r.id === parentId
                  ? { ...r, replies: [...(r.replies ?? []), { ...newReply, isAccepted: false }] }
                  : r,
              );
            }
            return [...prev, { ...newReply, isAccepted: false }];
          });
          setDiscussion((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
        } else {
          throw new Error(result.message || "Failed to post reply.");
        }
      } catch {
      }
    },
    [discussionId],
  );

  const handleAcceptAnswer = useCallback(
    async (replyId: string) => {
      const result = await acceptAnswer(discussionId, replyId);
      if (result.success && result.data) {
        const data = result.data as { isSolved: boolean; solutionReplyId: string | null };
        setDiscussion((prev) => ({
          ...prev,
          isSolved: data.isSolved,
          solutionReplyId: data.solutionReplyId,
        }));
        setReplies((prev) =>
          prev.map((r) => ({
            ...r,
            isAccepted: r.id === data.solutionReplyId,
            replies: (r.replies ?? []).map((c) => ({ ...c, isAccepted: c.id === data.solutionReplyId })),
          })),
        );
        toast.success(data.isSolved ? "Answer accepted!" : "Solution unmarked.");
      } else {
        toast.error(result.message || "Failed to accept answer.");
      }
    },
    [discussionId],
  );

  const handleReportReply = useCallback(
    async (replyId: string, reason: string, details?: string) => {
      try {
        await reportReply(discussionId, replyId, { reason, details });
        toast.success("Reply reported.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to report reply.");
      }
    },
    [discussionId],
  );

  const handleShare = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: discussion.title, url: window.location.href });
    } else if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }, [discussion.title]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/discussions" className="transition-colors hover:text-primary">
          Discussions
        </Link>
        <ChevronLeft className="size-3.5 rotate-180" />
        <span className="truncate text-foreground">{discussion.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          {discussion.isPinned && <Pin className="mt-1 size-5 shrink-0 text-primary" />}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{discussion.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {discussion.category && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                categoryColor(discussion.category.slug),
              )}
            >
              {discussion.category.name}
            </span>
          )}
          {discussion.isSolved && (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
              <CheckCircle className="size-3" />
              Solved
            </span>
          )}
          {discussion.isLocked && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Lock className="size-3" />
              Locked
            </span>
          )}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
            {discussion.visibility}
          </span>
        </div>
      </div>

      {editingDiscussion ? (
        <Card>
          <CardContent className="p-5">
            <DiscussionEditForm
              discussion={discussion}
              onSaved={(updated) => {
                setDiscussion(updated);
                setEditingDiscussion(false);
              }}
              onCancel={() => setEditingDiscussion(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Content — rendered as HTML */}
          <Card>
            <CardContent className="p-5">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: discussion.content }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {discussion.discussionTags && discussion.discussionTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {discussion.discussionTags.map((dt) => (
                <TagPill
                  key={dt.id}
                  name={dt.tag?.name ?? "tag"}
                  href={`/discussions?tag=${dt.tag?.slug ?? ""}`}
                  size="sm"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <VoteControls
              upvotes={discussion.upvoteCount}
              activeVote={(discussion.userVote ?? null) as "UP" | "DOWN" | null}
              onVote={handleVote}
              orientation="horizontal"
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
              onClick={handleShare}
              className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70"
            >
              <Share2 className="size-4" />
              Share
            </button>

            {/* Author can edit discussion */}
            {isAuthor && (
              <button
                onClick={() => setEditingDiscussion(true)}
                className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70"
              >
                <Edit3 className="size-4" />
                Edit
              </button>
            )}

            {/* Admin actions */}
            {isAdmin && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdminMenu((v) => !v)}
            >
              Admin
              <ChevronDown className="size-3.5" />
            </Button>
            {showAdminMenu && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border bg-card p-1 shadow-lg ring-1 ring-foreground/10">
                <AdminToggle
                  label={discussion.isPinned ? "Unpin" : "Pin"}
                  onToggle={async () => {
                    await togglePin(discussionId);
                    setDiscussion((prev) => ({ ...prev, isPinned: !prev.isPinned }));
                  }}
                />
                <AdminToggle
                  label={discussion.isLocked ? "Unlock" : "Lock"}
                  onToggle={async () => {
                    await toggleLock(discussionId);
                    setDiscussion((prev) => ({ ...prev, isLocked: !prev.isLocked }));
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}

      {/* Author info + stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <AuthorInfo
          user={discussion.author ?? { id: "", name: "Unknown" }}
          timestamp={discussion.createdAt}
          size="md"
        />
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="size-4" />
            {discussion.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-4" />
            {discussion.replyCount} replies
          </span>
        </div>
      </div>

      {/* Replies section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Replies ({discussion.replyCount})
          </h2>
          <select
            value={replySort}
            onChange={(e) => setReplySort(e.target.value as ReplySort)}
            className="h-8 rounded-md border bg-transparent px-2 text-xs outline-none ring-1 ring-foreground/10"
          >
            <option value="upvotes">Most Upvoted</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loadingReplies ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-card p-3 ring-1 ring-foreground/10" />
            ))}
          </div>
        ) : sortedReplies().length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center ring-1 ring-foreground/10">
            <MessageCircle className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm font-medium text-foreground">No replies yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {discussion.isLocked
                ? "This discussion is locked."
                : "Be the first to reply."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedReplies().map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                discussionId={discussionId}
                isAuthor={isAuthor}
                isAdmin={!!isAdmin}
                isSolved={discussion.isSolved}
                solutionReplyId={discussion.solutionReplyId ?? null}
                currentUserId={currentUserId}
                onVote={handleReplyVote}
                onReply={async (parentId, content) => {
                  await handlePostReply(content, parentId);
                }}
                onAccept={handleAcceptAnswer}
                onReport={handleReportReply}
                onReplyUpdated={() => loadReplies()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      {discussion.isLocked ? (
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Lock className="size-4" />
          This discussion is locked. New replies are disabled.
        </div>
      ) : (
        <div>
          {!showReplyForm ? (
            <Button onClick={() => setShowReplyForm(true)} className="w-full sm:w-auto">
              <MessageCircle className="size-4" />
              Add a Reply
            </Button>
          ) : (
            <ReplyForm
              placeholder="Write your reply..."
              onSubmit={async (content) => {
                await handlePostReply(content);
                setShowReplyForm(false);
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AdminToggle({
  label,
  onToggle,
}: {
  label: string;
  onToggle: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await onToggle();
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
      {label}
    </button>
  );
}
