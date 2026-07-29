"use client";

import { useState, useCallback, useRef } from "react";
import { Send, Loader2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorToolbar,
} from "@/components/ui/rich-text-editor";

interface AnswerFormProps {
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export function AnswerForm({ placeholder, onSubmit, onCancel }: AnswerFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit() {
    const trimmed = content.replace(/<[^>]*>?/gm, "").trim();
    if (!trimmed) return;
    setSubmitting(true);
    submittingRef.current = true;
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && content.replace(/<[^>]*>?/gm, "").trim() && !submittingRef.current) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [content],
  );

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden h-5 gap-1 rounded-full text-[10px] sm:flex">
              <Keyboard className="size-2.5" />
              Ctrl+Enter
            </Badge>
          </div>
        </div>

        <div onKeyDown={handleKeyDown}>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder={placeholder ?? "Write your answer with rich formatting..."}
          >
            <RichTextEditorToolbar />
            <RichTextEditorContent className="min-h-[150px]" />
          </RichTextEditor>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
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
            Post Your Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
