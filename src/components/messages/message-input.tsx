"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X } from "lucide-react";
import type { Message } from "@/types/message.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./emoji-picker";

interface MessageInputProps {
  /** Whether a send is currently in-flight. */
  disabled?: boolean;
  /** Called with the trimmed text when the user sends a message. */
  onSend: (text: string) => void;
  /** Called with the uploaded file + its remote URL when an attachment is sent. */
  onSendFile?: (file: File) => void;
  /** Emitted (debounced) when the user starts typing. */
  onTypingStart?: () => void;
  /** Emitted when the user stops typing (blur / empty / send). */
  onTypingStop?: () => void;
  /** Message currently being replied to. */
  replyTo?: Message | null;
  /** Cancel reply callback. */
  onCancelReply?: () => void;
  /** Participants for showing reply preview name. */
  participants?: { id: string; name: string }[];
  className?: string;
}

/**
 * The composer at the bottom of the chat thread. Supports an
 * auto-expanding textarea, file attachment, emoji picker, and reply-to banner.
 * Enter sends; Shift+Enter inserts a newline.
 */
export function MessageInput({
  disabled,
  onSend,
  onSendFile,
  onTypingStart,
  onTypingStop,
  replyTo,
  onCancelReply,
  participants = [],
  className,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const typingFiredRef = useRef(false);

  const resize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);
    resize();
    if (next.trim().length > 0) {
      if (!typingFiredRef.current) {
        typingFiredRef.current = true;
        onTypingStart?.();
      }
    } else if (typingFiredRef.current) {
      typingFiredRef.current = false;
      onTypingStop?.();
    }
  };

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    typingFiredRef.current = false;
    onTypingStop?.();
    requestAnimationFrame(resize);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      onSendFile?.(file);
    } finally {
      setUploading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setValue((v) => v + emoji);
    taRef.current?.focus();
    requestAnimationFrame(resize);
  };

  const replySender = replyTo
    ? participants.find((p) => p.id === replyTo.senderId)?.name ?? "Someone"
    : "";

  return (
    <div className={cn("border-t bg-background", className)}>
      {/* Reply-to banner */}
      {replyTo && (
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
          <div className="min-w-0 flex-1 border-l-2 border-primary/40 pl-2">
            <p className="text-[10px] font-semibold text-primary">
              Replying to {replySender}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyTo.type === "IMAGE" ? "📷 Image" : replyTo.type === "FILE" ? `📎 ${replyTo.fileName ?? "File"}` : replyTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelReply}
            className="size-6 shrink-0"
            aria-label="Cancel reply"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          className="size-8"
        >
          <Paperclip className="size-4" />
        </Button>

        <div className="relative flex-1">
          <Textarea
            ref={taRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (typingFiredRef.current) {
                typingFiredRef.current = false;
                onTypingStop?.();
              }
            }}
            rows={1}
            placeholder="Type a message..."
            className="max-h-40 min-h-10 resize-none py-2 pr-2"
          />
        </div>

        <EmojiPicker onSelect={insertEmoji} />

        <Button
          type="button"
          size="icon"
          disabled={disabled || uploading || !value.trim()}
          onClick={submit}
          aria-label="Send message"
          className="size-8"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
