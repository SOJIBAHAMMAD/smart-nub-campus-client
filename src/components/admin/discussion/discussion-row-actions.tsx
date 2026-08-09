"use client";

import {
  ExternalLink,
  Loader2,
  Lock,
  MoreHorizontal,
  Pin,
  Trash2,
} from "lucide-react";
import type { AdminDiscussion } from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiscussionRowActionsProps {
  discussion: AdminDiscussion;
  pinningId: string | null;
  lockingId: string | null;
  onView: (id: string) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onToggleLock: (id: string, isLocked: boolean) => void;
  onDelete: (id: string) => void;
}

/**
 * Row-level moderation menu: open in context, pin/unpin, lock/unlock and
 * delete (delete is confirmed by the page-level ConfirmDialog).
 */
export function DiscussionRowActions({
  discussion,
  pinningId,
  lockingId,
  onView,
  onTogglePin,
  onToggleLock,
  onDelete,
}: DiscussionRowActionsProps) {
  const isPinning = pinningId === discussion.id;
  const isLocking = lockingId === discussion.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Actions for ${discussion.title}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(discussion.id)}>
          <ExternalLink className="size-3.5 mr-2" />
          View Discussion
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onTogglePin(discussion.id, discussion.isPinned)}
          disabled={isPinning}
        >
          {isPinning ? (
            <Loader2 className="size-3.5 mr-2 animate-spin" />
          ) : (
            <Pin className="size-3.5 mr-2" />
          )}
          {discussion.isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleLock(discussion.id, discussion.isLocked)}
          disabled={isLocking}
        >
          {isLocking ? (
            <Loader2 className="size-3.5 mr-2 animate-spin" />
          ) : (
            <Lock className="size-3.5 mr-2" />
          )}
          {discussion.isLocked ? "Unlock" : "Lock"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(discussion.id)}
        >
          <Trash2 className="size-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
