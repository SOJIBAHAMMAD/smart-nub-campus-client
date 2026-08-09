"use client";

import { useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor, RichTextEditorToolbar, RichTextEditorContent } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
  parentId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export function ReplyForm({
  parentId,
  placeholder = "Add a reply...",
  autoFocus: _autoFocus,
  compact,
  initialContent,
  onSubmit,
  onCancel,
}: ReplyFormProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.replace(/<[^>]*>?/gm, "").trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }, [content, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className={cn(compact ? "" : "")} onKeyDown={handleKeyDown}>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        className="min-h-0"
      >
        {!compact && <RichTextEditorToolbar />}
        <RichTextEditorContent
          className={cn(
            compact ? "min-h-[80px]" : "min-h-[120px]",
          )}
        />
      </RichTextEditor>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground">
          {parentId ? "Replying to a comment" : "Share your thoughts"}
          <kbd className="ml-1.5 rounded border bg-muted px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
            {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter
          </kbd>
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={submitting || !content.replace(/<[^>]*>?/gm, "").trim()}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {parentId ? "Reply" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
