"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X } from "lucide-react";
import type { Message } from "@/types/message.types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EmojiPickerPopover } from "./emoji-picker";

interface MessageInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
  onSendFile?: (file: File) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  participants?: { id: string; name: string }[];
  className?: string;
}

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
  const composingRef = useRef(false);

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
      // Guard against firing while an IME composition is in progress.
      if (e.nativeEvent.isComposing || composingRef.current) return;
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
    ? (participants.find((p) => p.id === replyTo.senderId)?.name ?? "Someone")
    : "";

  return (
    <div className={cn("border-t bg-background", className)}>
      {/* Reply-to banner */}
      {replyTo && (
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
          <div className="min-w-0 flex-1 border-l-2 border-primary/40 pl-2.5">
            <p className="text-[10px] font-semibold text-primary">
              Replying to {replySender}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyTo.type === "IMAGE"
                ? "📷 Image"
                : replyTo.type === "FILE"
                  ? `📎 ${replyTo.fileName ?? "File"}`
                  : replyTo.content}
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
          aria-hidden="true"
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          className="size-9 shrink-0"
        >
          <Paperclip className="size-4" />
        </Button>

        <div className="relative flex-1">
          <Textarea
            ref={taRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onBlur={() => {
              if (typingFiredRef.current) {
                typingFiredRef.current = false;
                onTypingStop?.();
              }
            }}
            rows={1}
            placeholder="Type a message..."
            aria-label="Type a message"
            className="min-h-10 resize-none rounded-xl bg-muted/50 py-2.5 pr-3 scrollbar-none [&::-webkit-scrollbar]:hidden"
          />
        </div>

        <EmojiPickerPopover onSelect={insertEmoji} side="top" />

        <Button
          type="button"
          size="icon"
          disabled={disabled || uploading || !value.trim()}
          onClick={submit}
          aria-label="Send message"
          className={cn(
            "size-9 shrink-0 rounded-full transition-all duration-200",
            value.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
