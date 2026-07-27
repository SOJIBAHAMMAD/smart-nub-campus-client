"use client";

import { useState } from "react";
import { FileText, Download, Pencil, AlertCircle, RotateCw, Check, CheckCheck } from "lucide-react";
import type { Message } from "@/types/message.types";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Message as MessageRoot,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble";
import { cn } from "@/lib/utils";
import { formatClockTime, formatFileSize } from "./time";
import { MessageContextMenu } from "./message-context-menu";
import { MessageReactionBar, QuickReactionPicker } from "./emoji-picker";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(
  text: string,
  query: string,
  activeMatchGlobalIndex: number,
  firstMatchIndexInMessage: number,
): React.ReactNode[] {
  if (!query) return [text];
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);
  let matchCount = 0;
  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      const localIndex = matchCount;
      const globalIndex = firstMatchIndexInMessage + localIndex;
      const isActive = globalIndex === activeMatchGlobalIndex;
      matchCount++;
      return (
        <mark
          key={i}
          className={cn(
            "rounded-sm px-0.5 font-semibold",
            isActive
              ? "bg-amber-300 text-amber-900 dark:bg-amber-600 dark:text-amber-100"
              : "bg-yellow-200 text-yellow-900 dark:bg-yellow-700/50 dark:text-yellow-200",
          )}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  participants?: { id: string; name: string; image?: string | null }[];
  currentUserId: string;
  /** Whether to show read receipts. Respects the recipient's readReceipts preference. */
  showReadReceipts?: boolean;
  searchHighlight?: { query: string; activeMatchGlobalIndex: number; firstMatchIndexInMessage: number } | null;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onImageClick?: (url: string, alt?: string) => void;
  onRetry?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  participants = [],
  currentUserId,
  showReadReceipts = true,
  searchHighlight,
  onReply,
  onForward,
  onEdit,
  onDelete,
  onReaction,
  onImageClick,
  onRetry,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const sender = participants.find((p) => p.id === message.senderId);
  const isImage = message.type === "IMAGE";
  const isFile = message.type === "FILE";
  const isDeleted = message.isDeleted;
  const isFailed = message.status === "failed";
  const isSending = message.status === "sending";

  const bubbleContent = (
    <Bubble
      variant={isOwn ? "tinted" : "outline"}
      align={isOwn ? "end" : "start"}
    >
      <BubbleContent
        className={cn(
          "relative",
          isDeleted && "opacity-60 italic",
          isFailed && "border-destructive/30",
        )}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <div className="mb-2 rounded-md border-l-2 border-primary/40 bg-primary/5 px-2 py-1.5">
            <span className="text-[10px] font-semibold text-primary">
              {message.replyTo.sender?.name ?? "Someone"}
            </span>
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {message.replyTo.content}
            </p>
          </div>
        )}

        {/* Forwarded indicator */}
        {message.isForwarded && (
          <p className="mb-1 text-[10px] text-muted-foreground/70 italic">
            Forwarded
          </p>
        )}

        {isImage && message.fileUrl ? (
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={message.fileUrl}
              alt={message.fileName ?? "Shared image"}
              onClick={() => onImageClick?.(message.fileUrl!, message.fileName ?? "image")}
              className="max-h-64 w-full cursor-zoom-in object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
              <span>{formatClockTime(message.createdAt)}</span>
              {isOwn && showReadReceipts && (
                <span className={cn(message.isRead ? "text-blue-400" : "text-white/70")}>
                  {message.isRead ? <CheckCheck className="size-3" /> : <Check className="size-3" />}
                </span>
              )}
            </div>
          </div>
        ) : isFile && message.fileUrl ? (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={message.fileName ?? true}
            className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
            aria-label={`Download ${message.fileName ?? "file"}${message.fileSize ? `, ${formatFileSize(message.fileSize)}` : ""}`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium">{message.fileName}</span>
              <span className="text-[11px] text-muted-foreground">
                {formatFileSize(message.fileSize)}
              </span>
            </span>
            <Download className="size-4 shrink-0 text-muted-foreground" />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {searchHighlight && message.content
              ? highlightText(
                  message.content,
                  searchHighlight.query,
                  searchHighlight.activeMatchGlobalIndex,
                  searchHighlight.firstMatchIndexInMessage,
                )
              : message.content}
          </p>
        )}

        {/* Timestamp + read receipts (text messages only, image has overlay) */}
        {!isImage && (
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground/70">
            {message.isEdited && (
              <span className="flex items-center gap-0.5">
                <Pencil className="size-2.5" />
                edited
              </span>
            )}
            <time dateTime={message.createdAt}>{formatClockTime(message.createdAt)}</time>
            {isOwn && !isFailed && showReadReceipts && (
              <span className={cn(message.isRead ? "text-blue-500" : "text-muted-foreground/50")} aria-label={message.isRead ? "Read" : "Sent"}>
                {message.isRead ? <CheckCheck className="size-3" /> : <Check className="size-3" />}
              </span>
            )}
          </div>
        )}

        {/* Failed state with retry */}
        {isFailed && isOwn && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] text-destructive">
              <AlertCircle className="size-3" />
              Failed to send
            </span>
            {onRetry && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(message);
                }}
                className="size-5 text-destructive hover:text-destructive"
                aria-label="Retry sending"
              >
                <RotateCw className="size-3" />
              </Button>
            )}
          </div>
        )}

        {/* Sending indicator */}
        {isSending && isOwn && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Sending...</span>
          </div>
        )}
      </BubbleContent>

      {/* Reactions */}
      {!isDeleted && message.reactions && message.reactions.length > 0 && (
        <MessageReactionBar
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggleReaction={(emoji) => onReaction?.(message.id, emoji)}
        />
      )}
    </Bubble>
  );

  return (
    <MessageRoot align={isOwn ? "end" : "start"}>
      {!isOwn && (
        <MessageAvatar>
          {showSender && sender && (
            <Avatar id={sender.id} name={sender.name} src={sender.image} className="size-8" />
          )}
        </MessageAvatar>
      )}

      <MessageContent className={isOwn ? "items-end" : "items-start"}>
        {!isOwn && showSender && sender && (
          <MessageHeader>
            <span className="text-xs font-semibold text-emerald-600">{sender.name}</span>
          </MessageHeader>
        )}

        {onReply || onForward || onDelete ? (
          <MessageContextMenu
            message={message}
            isOwn={isOwn}
            onReply={onReply ?? (() => {})}
            onForward={onForward ?? (() => {})}
            onEdit={onEdit}
            onDelete={onDelete}
          >
            <div
              className="group/context relative w-fit"
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onMouseEnter={() => {
                if (onReaction) setShowReactionPicker(true);
              }}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {bubbleContent}

              {/* Quick reaction button on hover */}
              {showReactionPicker && onReaction && !isDeleted && (
                <div className={cn(
                  "absolute -top-2 z-20 opacity-0 transition-opacity group-hover/context:opacity-100",
                  isOwn ? "right-0" : "left-0",
                )}>
                  <QuickReactionPicker
                    onSelect={(emoji) => {
                      onReaction(message.id, emoji);
                      setShowReactionPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
          </MessageContextMenu>
        ) : (
          <div className="relative">{bubbleContent}</div>
        )}
      </MessageContent>
    </MessageRoot>
  );
}
