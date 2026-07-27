"use client";

import { useState } from "react";
import { FileText, Download, Pencil, AlertCircle, RotateCw } from "lucide-react";
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
import { MessageReactionBar, EmojiPicker } from "./emoji-picker";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  participants?: { id: string; name: string; image?: string | null }[];
  currentUserId: string;
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
      variant={isOwn ? "default" : "outline"}
      align={isOwn ? "end" : "start"}
    >
      <BubbleContent
        className={cn(
          !isOwn && "bg-muted/70",
          isDeleted && "opacity-60 italic",
          isFailed && "border-destructive/30",
        )}
      >
        {/* Reply preview */}
        {message.replyTo && (
          <div className="mb-2 rounded-md border-l-2 border-primary/40 bg-primary/5 px-2 py-1">
            <span className="text-[10px] font-semibold text-primary">
              {message.replyTo.sender?.name ?? "Someone"}
            </span>
            <p className="line-clamp-2 text-[11px] text-muted-foreground">
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
          <img
            src={message.fileUrl}
            alt={message.fileName ?? "image"}
            onClick={() => onImageClick?.(message.fileUrl!, message.fileName ?? "image")}
            className="max-h-64 w-full cursor-zoom-in rounded-lg object-cover"
            loading="lazy"
          />
        ) : isFile && message.fileUrl ? (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={message.fileName ?? true}
            className="flex items-center gap-2 py-1"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{message.fileName}</span>
              <span className="text-[11px] text-muted-foreground">
                {formatFileSize(message.fileSize)}
              </span>
            </span>
            <Download className="size-4 shrink-0 text-muted-foreground" />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        )}

        <div
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground/80",
            (isImage || isFile) && "absolute bottom-1 right-1.5 rounded bg-black/30 px-1 text-white/90",
          )}
        >
          {message.isEdited && (
            <span className="flex items-center gap-0.5">
              <Pencil className="size-2.5" />
              edited
            </span>
          )}
          <span>{formatClockTime(message.createdAt)}</span>
          {isOwn && !isFailed && (
            <span className={cn(message.isRead && "text-blue-500")}>
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>

        {/* Failed state with retry */}
        {isFailed && isOwn && (
          <div className="mt-1 flex items-center gap-1.5">
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
              className="group/context relative"
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
                <div className="absolute -top-1 right-0 z-20 opacity-0 transition-opacity group-hover/context:opacity-100">
                  <EmojiPicker
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
