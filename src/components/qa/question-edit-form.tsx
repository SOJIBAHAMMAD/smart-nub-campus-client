"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  BookOpen,
  Loader2,
  AlertCircle,
  Lightbulb,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { updateQuestion } from "@/actions/qa.actions";
import type { Question, QuestionCategory } from "@/types/qa.types";
import type { Tag } from "@/types/resource.types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorToolbar,
} from "@/components/ui/rich-text-editor";

interface QuestionEditFormProps {
  question: Question;
  categories: (QuestionCategory & { _count: { questions: number } })[];
  tags: Tag[];
  courses: { id: string; code: string; name: string }[];
}

const TIPS = [
  "Write a clear, specific title",
  "Include all the information someone would need to answer your question",
  "Add tags to help others find your question",
];

export function QuestionEditForm({
  question,
  categories: _categories,
  tags: _tags,
  courses: _courses,
}: QuestionEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(question.title);
  const [content, setContent] = useState(question.content);
  const [selectedTagIds, setSelectedTagIds] = useState<TagInputTag[]>(
    (question.questionTags ?? [])
      .map((qt) => qt.tag)
      .filter(Boolean)
      .map((t) => ({ id: t!.id, name: t!.name, slug: t!.slug })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    if (title.trim().length < 10) {
      setError("Title must be at least 10 characters.");
      return;
    }
    if (title.length > 200) {
      setError("Title must be at most 200 characters.");
      return;
    }
    const stripped = content.replace(/<[^>]*>?/gm, "").trim();
    if (stripped.length < 10) {
      setError("Content must be at least 10 characters.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateQuestion(question.id, {
        title: title.trim(),
        content,
        tagIds: selectedTagIds.map((t) => t.id),
      });

      if (result.success) {
        toast.success("Question updated successfully!");
        router.push(`/qa/${question.id}`);
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to update question.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update question.",
      );
    } finally {
      setSaving(false);
    }
  }

  const titlePercent = Math.min((title.length / 200) * 100, 100);
  const strippedLength = content.replace(/<[^>]*>?/gm, "").trim().length;
  const contentPercent = Math.min((strippedLength / 5000) * 100, 100);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "Enter" &&
      strippedLength >= 10 &&
      !saving
    ) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Question</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your question to get better answers.
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., How to implement a B-tree in C++?"
          maxLength={200}
          disabled={saving}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary/50 transition-all"
                style={{ width: `${titlePercent}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {title.length}/200
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5" onKeyDown={handleKeyDown}>
        <div className="flex items-center justify-between">
          <Label htmlFor="content">
            Content <span className="text-destructive">*</span>
          </Label>
          <Badge
            variant="outline"
            className="h-5 gap-1 rounded-full text-[10px]"
          >
            <Keyboard className="size-2.5" />
            Ctrl+Enter
          </Badge>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Describe your question in detail. You can use rich formatting..."
        >
          <RichTextEditorToolbar />
          <RichTextEditorContent className="min-h-62.5" />
        </RichTextEditor>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary/50 transition-all"
                style={{ width: `${contentPercent}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {strippedLength}/5000
          </span>
        </div>
      </div>

      {/* Category (read-only) */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Folder className="size-4" />
          {question.category?.name ?? "Unknown"}
        </div>
      </div>

      {/* Course (read-only) */}
      {question.course && (
        <div className="space-y-1.5">
          <Label>Course</Label>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            {question.course.code} — {question.course.name}
          </div>
        </div>
      )}

      {/* Tags */}
      <TagInput
        value={selectedTagIds}
        onChange={setSelectedTagIds}
        maxTags={5}
        placeholder="Search or create tags..."
        label="Tags"
      />

      {/* Tips */}
      <div className="flex gap-2 rounded-xl border bg-card p-4">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
        <ul className="space-y-1 text-xs text-muted-foreground">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
