/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, attachmentName?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Seeded value (e.g. from a quick tool) applied on mount. */
  initialValue?: string;
}

/**
 * Message composer with an auto-expanding textarea, a send button,
 * and an optional file attachment control (for context uploads).
 */
export function ChatInput({
  onSend,
  disabled,
  placeholder = "Type your question...",
  initialValue = "",
}: ChatInputProps) {
  const [value, setValue] = useState(initialValue);
  const [attachment, setAttachment] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Re-apply a new seeded value (e.g. a Popular Prompt click) when
  // the prop changes after mount.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Auto-resize the textarea as content grows.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, attachment ?? undefined);
    setValue("");
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="rounded-2xl border bg-muted/40 p-1.5 shadow-sm ring-1 ring-foreground/5 transition-colors focus-within:border-brand/40 focus-within:bg-card">
      {attachment && (
        <div className="mb-1.5 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1.5 text-xs text-foreground">
          <Paperclip className="size-3.5 text-brand" />
          <span className="truncate">{attachment}</span>
          <button
            onClick={() => setAttachment(null)}
            aria-label="Remove attachment"
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-1.5">
        <label className="flex cursor-pointer items-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Paperclip className="size-5" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAttachment(file.name);
            }}
          />
        </label>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="max-h-50 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-all hover:bg-brand/90 active:translate-y-px",
            (disabled || !value.trim()) && "cursor-not-allowed opacity-50",
          )}
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
