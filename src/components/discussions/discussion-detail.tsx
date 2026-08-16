"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Bookmark,
  Share2,
  Pin,
  Lock,
  CheckCircle,
  Eye,
  MessageCircle,
  ChevronDown,
  CheckCheck,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagPill } from "@/components/ui/tag-pill";
import { VoteControls } from "@/components/ui/vote-controls";
import { AuthorInfo } from "@/components/ui/author-info";
import { SafeHTML } from "@/components/ui/safe-html";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReplyCard } from "@/components/discussions/reply-card";
import { ReplyForm } from "@/components/discussions/reply-form";
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
  listDiscussions,
} from "@/actions/discussion.actions";
import type {
  Discussion,
  DiscussionReply,
  DiscussionListResponse,
} from "@/types/discussion.types";
import { useSocket, useSocketEvent } from "@/hooks/use-socket";
import { env } from "@/env";
import { categoryColor, categoryIcon } from "@/constants/card-constants";

type ReplySort = "upvotes" | "newest" | "oldest";

interface DiscussionDetailProps {
  discussionId: string;
  initialDiscussion: Discussion;
  currentUserId?: string | null;
  isAdmin?: boolean;
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
  const [editingDiscussion, setEditingDiscussion] = useState(false);
  const [relatedDiscussions, setRelatedDiscussions] = useState<Discussion[]>([]);
  const hasJoinedRoom = useRef(false);

  const isAuthor = currentUserId != null && discussion.authorId === currentUserId;
  const bookmarked = discussion.isBookmarked ?? false;
  const replyFormRef = useRef<HTMLDivElement>(null);
  const socketUrl = env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  const { socket } = useSocket({ url: socketUrl });

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a") {
        e.preventDefault();
        replyFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "s") {
        e.preventDefault();
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
        function attachToParent(list: DiscussionReply[]): DiscussionReply[] {
          return list.map((r) => {
            if (r.id === socketReply.parentId) {
              return { ...r, replies: [...(r.replies ?? []), newReply] };
            }
            if (r.replies && r.replies.length > 0) {
              return { ...r, replies: attachToParent(r.replies) };
            }
            return r;
          });
        }
        return attachToParent(prev);
      }
      return [...prev, newReply];
    });
    setDiscussion((prev) => ({ ...prev, replyCount: prev.replyCount + 1 }));
  });

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

  const loadReplies = useCallback(async () => {
    try {
      const res = await listReplies(discussionId, 1, 100);
      if (res.success && res.data) {
        const data = res.data as { replies?: DiscussionReply[] };

        function attachAccepted(reply: DiscussionReply): DiscussionReply {
          return {
            ...reply,
            isAccepted: discussion.solutionReplyId === reply.id,
            replies: (reply.replies ?? [])
              .sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
              )
              .map(attachAccepted),
          };
        }

        setReplies((data.replies ?? []).map(attachAccepted));
      }
    } catch {
    } finally {
      setLoadingReplies(false);
    }
  }, [discussionId, discussion.solutionReplyId]);

  useEffect(() => {
    void loadReplies();
  }, [loadReplies]);

  useEffect(() => {
    const slug = initialDiscussion.category?.slug;
    if (slug) {
      listDiscussions({ category: slug, limit: 5 }).then(
        (res) => {
          if (res.success && res.data) {
            const items = (res.data as DiscussionListResponse).data.filter((d) => d.id !== discussionId);
            setRelatedDiscussions(items);
          }
        },
      );
    }
  }, [initialDiscussion.category?.slug, discussionId]);

  const sortedReplies = useCallback(() => {
    const copy = [...replies];
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
      const original = discussion;
      const wasUp = original.userVote === "UP";
      const wasDown = original.userVote === "DOWN";
      const sameVote = type === "UP" ? wasUp : wasDown;
      if (sameVote) {
        setDiscussion((prev) => ({
          ...prev,
          userVote: null,
          upvoteCount: prev.upvoteCount + (type === "UP" ? -1 : 1),
        }));
      } else {
        const delta =
          type === "UP"
            ? wasDown
              ? 2
              : 1
            : wasUp
              ? -2
              : -1;
        setDiscussion((prev) => ({
          ...prev,
          userVote: type,
          upvoteCount: prev.upvoteCount + delta,
        }));
      }
      try {
        const result = await voteDiscussion(discussionId, type);
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
    async (replyId: string, type: "UP" | "DOWN") => {
      const updateVote = (reply: DiscussionReply) => {
        const wasUp = reply.userVote === "UP";
        const wasDown = reply.userVote === "DOWN";
        const sameVote = type === "UP" ? wasUp : wasDown;
        if (sameVote) {
          return {
            ...reply,
            userVote: null as DiscussionReply["userVote"],
            upvoteCount: reply.upvoteCount + (type === "UP" ? -1 : 1),
          };
        }
        const delta =
          type === "UP"
            ? wasDown
              ? 2
              : 1
            : wasUp
              ? -2
              : -1;
        return {
          ...reply,
          userVote: type,
          upvoteCount: reply.upvoteCount + delta,
        };
      };
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? updateVote(r)
            : { ...r, replies: (r.replies ?? []).map((c) => (c.id === replyId ? updateVote(c) : c)) },
        ),
      );
      try {
        const result = await voteReply(replyId, type);
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
          toast.error(result.message || "Failed to record vote.");
        }
      } catch (err) {
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
              function attachToParent(list: DiscussionReply[]): DiscussionReply[] {
                return list.map((r) => {
                  if (r.id === parentId) {
                    return { ...r, replies: [...(r.replies ?? []), { ...newReply, isAccepted: false }] };
                  }
                  if (r.replies && r.replies.length > 0) {
                    return { ...r, replies: attachToParent(r.replies) };
                  }
                  return r;
                });
              }
              return attachToParent(prev);
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

  const isLocked = discussion.isLocked;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/discussions" />}>
              Discussions
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate max-w-[200px] sm:max-w-[400px]">
              {discussion.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          {discussion.isPinned && (
            <Pin className="mt-1 size-5 shrink-0 text-primary" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {discussion.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {discussion.category && (
            <Badge
              variant="secondary"
              className={cn("flex h-5 items-center gap-1 px-2 text-[10px] font-semibold", categoryColor(discussion.category.slug))}
            >
              {(() => {
                const Icon = categoryIcon(discussion.category.slug);
                return <Icon className="size-3" />;
              })()}
              {discussion.category.name}
            </Badge>
          )}
          {discussion.isSolved && (
            <Badge variant="outline" className="h-5 gap-1 border-success/30 px-1.5 text-[10px] text-success">
              <CheckCircle className="size-2.5" />
              Solved
            </Badge>
          )}
          {discussion.isLocked && (
            <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] text-muted-foreground">
              <Lock className="size-2.5" />
              Locked
            </Badge>
          )}
          <Badge variant="secondary" className="h-5 px-2 text-[10px]">
            {discussion.visibility}
          </Badge>
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
          <Card>
            <CardContent className="p-5 sm:p-6">
              <SafeHTML
                className="prose prose-sm max-w-none dark:prose-invert"
                html={discussion.content}
              />
            </CardContent>
          </Card>

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

          <div className="flex flex-wrap items-center gap-2">
            <VoteControls
              upvotes={discussion.upvoteCount}
              activeVote={(discussion.userVote ?? null) as "UP" | "DOWN" | null}
              onVote={handleVote}
              orientation="horizontal"
            />

            <Button
              variant={bookmarked ? "secondary" : "outline"}
              size="sm"
              onClick={handleBookmark}
              className={cn(bookmarked && "text-primary")}
            >
              <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="size-4" />
              Share
            </Button>

            {isAuthor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingDiscussion(true)}
              >
                <Edit3 className="size-4" />
                Edit
              </Button>
            )}

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm">
                      Admin
                      <ChevronDown className="size-3.5" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={async () => {
                      await togglePin(discussionId);
                      setDiscussion((prev) => ({ ...prev, isPinned: !prev.isPinned }));
                    }}
                  >
                    <CheckCheck className="size-3.5" />
                    {discussion.isPinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await toggleLock(discussionId);
                      setDiscussion((prev) => ({ ...prev, isLocked: !prev.isLocked }));
                    }}
                  >
                    <Lock className="size-3.5" />
                    {discussion.isLocked ? "Unlock" : "Lock"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </>
      )}

      <Separator />

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Replies ({discussion.replyCount})
          </h2>
          <Select
            value={replySort}
            onValueChange={(v) => setReplySort((v ?? "upvotes") as ReplySort)}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upvotes">Most Upvoted</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingReplies ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border bg-card p-3" />
            ))}
          </div>
        ) : sortedReplies().length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground">No replies yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isLocked
                  ? "This discussion is locked."
                  : "Be the first to share your thoughts."}
              </p>
            </CardContent>
          </Card>
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

      {isLocked ? (
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Lock className="size-4" />
          This discussion is locked. New replies are disabled.
        </div>
      ) : (
        <div className="space-y-3" ref={replyFormRef}>
          <Separator />
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">Post a Reply</h3>
            <ReplyForm
              placeholder="Write your reply... (Cmd+Enter to submit)"
              onSubmit={async (content) => {
                await handlePostReply(content);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Cross-link to Q&A ──────────────────────────────────── */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Looking for a definitive answer?{" "}
        <Link
          href={discussion.category?.slug ? `/qa?category=${discussion.category.slug}` : "/qa"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Ask a question about this topic
        </Link>
        .
      </div>

      {/* ── Related discussions ────────────────────────────────── */}
      {relatedDiscussions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Related Discussions</h3>
          <div className="space-y-2">
            {relatedDiscussions.map((rd) => (
              <Link
                key={rd.id}
                href={`/discussions/${rd.id}`} className="group flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="flex-1 truncate group-hover:text-primary">{rd.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {rd.upvoteCount} vote{rd.upvoteCount !== 1 ? "s" : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
