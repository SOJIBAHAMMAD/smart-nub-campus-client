"use client";

import { useState } from "react";
import { Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface AnswerFormProps {
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Form to post an answer to a question.
 * Supports a markdown preview toggle and submits the raw content.
 */
export function AnswerForm({ placeholder, onSubmit, onCancel }: AnswerFormProps) {
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
      setPreview(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Eye className="size-3.5" />
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="min-h-24 rounded-md border bg-muted/30 p-3 text-sm text-foreground">
            {content.trim() ? content : <span className="text-muted-foreground">Nothing to preview.</span>}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder ?? "Write your answer..."}
            rows={5}
            maxLength={5000}
            disabled={submitting}
            className="w-full resize-none"
          />
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Post Your Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
