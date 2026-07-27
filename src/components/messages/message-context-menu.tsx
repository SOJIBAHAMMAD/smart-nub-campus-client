"use client";

import {
  Reply,
  Forward,
  Copy,
  Pencil,
  Trash2,
  CheckCheck,
} from "lucide-react";
import type { Message } from "@/types/message.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  children: React.ReactNode;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onCopy?: (message: Message) => void;
}

export function MessageContextMenu({
  message,
  isOwn,
  children,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onCopy,
}: MessageContextMenuProps) {
  const handleCopy = () => {
    if (message.type === "TEXT" && message.content) {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
    onCopy?.(message);
  };

  const canEdit = isOwn && message.type === "TEXT" && !message.isDeleted;
  const canDelete = isOwn || !isOwn;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children as React.ReactElement} nativeButton={false} />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply className="size-4" />
          Reply
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onForward(message)}>
          <Forward className="size-4" />
          Forward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="size-4" />
          Copy
        </DropdownMenuItem>
        {canEdit && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(message)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canDelete && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(message)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
        {message.isRead && isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <CheckCheck className="size-4 text-blue-500" />
              Read
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
