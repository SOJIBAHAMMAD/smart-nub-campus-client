"use client";

import { useState, useCallback } from "react";
import { Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor, RichTextEditorToolbar, RichTextEditorContent } from "@/components/ui/rich-text-editor";
import { updateDiscussion } from "@/actions/discussion.actions";
import type { Discussion } from "@/types/discussion.types";
import { toast } from "sonner";

interface DiscussionEditFormProps {
  discussion: Discussion;
  onSaved: (updated: Discussion) => void;
  onCancel: () => void;
}

export function DiscussionEditForm({
  discussion,
  onSaved,
  onCancel,
}: DiscussionEditFormProps) {
  const [title, setTitle] = useState(discussion.title);
  const [content, setContent] = useState(discussion.content);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const textContent = content.replace(/<[^>]*>?/gm, "").trim();
    if (!textContent) {
      toast.error("Content is required.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateDiscussion(discussion.id, {
        title: title.trim(),
        content,
      });
      if (result.success && result.data) {
        onSaved(result.data as Discussion);
        toast.success("Discussion updated.");
      } else {
        toast.error(result.message || "Failed to update discussion.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update discussion.");
    } finally {
      setSaving(false);
    }
  }, [discussion.id, title, content, onSaved]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={saving}
        />
        <p className="text-[10px] text-muted-foreground">{title.length}/200</p>
      </div>

      <div className="space-y-1.5">
        <Label>Content</Label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          disabled={saving}
        >
          <RichTextEditorToolbar />
          <RichTextEditorContent />
        </RichTextEditor>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !title.trim() || !content.replace(/<[^>]*>?/gm, "").trim()}
          size="sm"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
          size="sm"
        >
          <X className="size-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
