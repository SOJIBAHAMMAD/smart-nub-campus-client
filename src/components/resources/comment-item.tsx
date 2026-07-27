"use client";

import { useState } from "react";
import { MessageCircle, Trash2, MoreHorizontal, Flag, Pencil, Check, X } from "lucide-react";
import type { Comment } from "@/types/resource.types";
import { Button } from "@/components/ui/button";
import { VoteControls } from "@/components/ui/vote-controls";
import { Avatar } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/components/resources/file-type-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string | null;
  onReply?: (parentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onVote?: (commentId: string, type: "UP" | "DOWN") => void;
  onEdit?: (commentId: string, content: string) => void;
  onReport?: (commentId: string) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  currentUserId = null,
  onReply,
  onDelete,
  onVote,
  onEdit,
  onReport,
  depth = 0,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = currentUserId != null && currentUserId === comment.userId;
  const userVote = comment.userCommentVote ?? null;

  function handleEditSave() {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  }

  function handleReplySubmit() {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyInput(false);
    }
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "group/comment",
          depth > 0 && "ml-6 border-l-2 border-border/40 pl-4",
        )}
      >
        <div className="rounded-xl bg-card p-3 ring-1 ring-foreground/5 transition-colors hover:ring-foreground/10 sm:p-4">
          {/* Author + timestamp + actions row */}
          <div className="flex items-start gap-3">
            {/* Vote controls (vertical) */}
            {onVote && (
              <div className="hidden shrink-0 sm:block">
                <VoteControls
                  upvotes={comment.upvoteCount ?? 0}
                  downvotes={comment.downvoteCount ?? 0}
                  activeVote={userVote}
                  onVote={(type) => onVote(comment.id, type)}
                  orientation="vertical"
                  size="sm"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {/* Author info */}
              <div className="flex items-center gap-2">
                <Avatar
                  id={comment.user?.id ?? ""}
                  name={comment.user?.name ?? "Unknown"}
                  src={comment.user?.image}
                  className="size-6"
                />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate text-sm font-medium text-foreground">
                    {comment.user?.name ?? "Unknown"}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="shrink-0 cursor-default text-[11px] text-muted-foreground">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      }
                    />
                    <TooltipContent side="top">
                      {new Date(comment.createdAt).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                  )}
                </div>

                {/* Actions menu */}
                {!isAuthor && onReport && (
                  <div className="ml-auto shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreHorizontal className="size-3.5" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onReport(comment.id)}>
                          <Flag className="size-3.5" />
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                {isAuthor && (
                  <div className="ml-auto shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreHorizontal className="size-3.5" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(comment.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <RichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Edit your comment..."
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleEditSave} disabled={!editContent.trim()}>
                      <Check className="size-3.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                    >
                      <X className="size-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="mt-1.5 text-sm text-foreground/90 leading-relaxed
                    [&_p]:my-1 [&_strong]:font-semibold [&_em]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono
                    [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary/80
                    [&_ul]:my-1 [&_ul]:ms-4 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:ms-4 [&_ol]:list-decimal
                    [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:ps-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              )}

              {/* Actions row (mobile vote + reply + delete) */}
              <div className="mt-2 flex items-center gap-3">
                {/* Mobile vote controls */}
                {onVote && (
                  <div className="sm:hidden">
                    <VoteControls
                      upvotes={comment.upvoteCount ?? 0}
                      downvotes={comment.downvoteCount ?? 0}
                      activeVote={userVote}
                      onVote={(type) => onVote(comment.id, type)}
                      orientation="horizontal"
                      size="sm"
                    />
                  </div>
                )}

                {/* Reply button */}
                {depth < 2 && onReply && (
                  <button
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MessageCircle className="size-3.5" />
                    Reply
                  </button>
                )}

                {/* Delete button (only on mobile where dropdown isn't visible) */}
                {isAuthor && onDelete && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive sm:hidden"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Reply input */}
              {showReplyInput && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Avatar
                      id={currentUserId ?? ""}
                      name="You"
                      className="size-6 shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <RichTextEditor
                        value={replyContent}
                        onChange={setReplyContent}
                        placeholder="Write a reply..."
                        className="text-sm min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                    <Button
                      size="sm"
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
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
          </div>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && depth < 2 && (
          <div className="mt-2">
            <Collapsible>
              <CollapsibleTrigger
                render={
                  <button className="flex items-center gap-1 text-xs text-primary font-medium transition-colors hover:underline ml-1">
                    {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                  </button>
                }
              />
              <CollapsibleContent>
                <div className="mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onDelete={onDelete}
                      onVote={onVote}
                      onEdit={onEdit}
                      onReport={onReport}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
