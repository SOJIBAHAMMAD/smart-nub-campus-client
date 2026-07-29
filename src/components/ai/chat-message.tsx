/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, ThumbsUp, ThumbsDown, Check, Bot, User } from "lucide-react";
import type { AIMessage } from "@/types/ai.types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: AIMessage;
  onFeedback?: (messageId: string, isHelpful: boolean) => void;
}

/** Format an ISO timestamp into a short "h:mm AM" label. */
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * A single chat bubble in a chat-app style thread.
 * User messages are right-aligned with a brand bubble + avatar;
 * AI messages are left-aligned with a branded bot avatar, name,
 * timestamp, markdown rendering, and copy / like / dislike actions.
 */
export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isUser = message.role === "USER";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(
    message.isHelpful ?? null,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable in insecure contexts; ignore.
    }
  };

  const handleFeedback = (value: boolean) => {
    setFeedback(value);
    onFeedback?.(message.id, value);
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3",
        isUser ? "flex-row-reverse" : "",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
          isUser ? "bg-brand" : "bg-gradient-to-br from-brand to-brand-hover",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={cn(
          "flex min-w-0 max-w-[78%] flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Name + time */}
        <div
          className={cn(
            "flex items-center gap-2 px-1 text-xs text-muted-foreground",
            isUser && "flex-row-reverse",
          )}
        >
          <span className="font-medium text-foreground">
            {isUser ? "You" : "AI Assistant"}
          </span>
          <span className="tabular-nums">{formatTime(message.createdAt)}</span>
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ring-1 ring-foreground/5",
            isUser
              ? "rounded-tr-sm bg-brand text-white"
              : "rounded-tl-sm bg-card text-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-pre:rounded-lg prose-pre:bg-muted prose-pre:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions (only for AI messages) */}
        {!isUser && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={handleCopy}
              aria-label="Copy message"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <Check className="size-3.5 text-primary" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => handleFeedback(true)}
              aria-label="Like message"
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-muted hover:text-foreground",
                feedback === true && "text-primary",
              )}
            >
              <ThumbsUp className="size-3.5" />
              {feedback === true ? "Liked" : "Like"}
            </button>
            <button
              onClick={() => handleFeedback(false)}
              aria-label="Dislike message"
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-muted hover:text-foreground",
                feedback === false && "text-destructive",
              )}
            >
              <ThumbsDown className="size-3.5" />
              {feedback === false ? "Disliked" : "Dislike"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
