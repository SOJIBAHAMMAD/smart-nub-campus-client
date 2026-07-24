import { FileText, Download } from "lucide-react";
import type { Message } from "@/types/message.types";
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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  participants?: { id: string; name: string; image?: string | null }[];
  onAttachmentClick?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  participants = [],
  onAttachmentClick,
}: MessageBubbleProps) {
  const sender = participants.find((p) => p.id === message.senderId);
  const isImage = message.type === "IMAGE";
  const isFile = message.type === "FILE";

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

        <Bubble
          variant={isOwn ? "default" : "outline"}
          align={isOwn ? "end" : "start"}
        >
          <BubbleContent
            className={cn(
              !isOwn && "bg-muted/70",
            )}
          >
            {message.replyTo && (
              <div className="mb-1 border-l-2 border-emerald-500/60 pl-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {message.replyTo.sender?.name ?? "Someone"}
                </span>
                : {message.replyTo.content}
              </div>
            )}

            {isImage && message.fileUrl ? (
              <img
                src={message.fileUrl}
                alt={message.fileName ?? "image"}
                onClick={() => onAttachmentClick?.(message)}
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
                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
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
              <span>{formatClockTime(message.createdAt)}</span>
              {isOwn && (
                <span className={cn(message.isRead && "text-blue-500")}>
                  {message.isRead ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </MessageRoot>
  );
}
