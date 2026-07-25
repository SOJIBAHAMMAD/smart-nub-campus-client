"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { createQuestion } from "@/actions/qa.actions";
import type { QuestionCategory } from "@/types/qa.types";
import type { Tag } from "@/types/resource.types";
import { toast } from "sonner";

interface QuestionCreateFormProps {
  categories: (QuestionCategory & { _count: { questions: number } })[];
  tags: Tag[];
  courses: { id: string; code: string; name: string }[];
}

const TIPS = [
  "Write a clear, specific title",
  "Include all the information someone would need to answer your question",
  "Add tags to help others find your question",
];

/**
 * Form to create a new question.
 * Fields: title, content (markdown), category, course (optional),
 * tags (multi-select with search, max 5). Submits and redirects
 * to the new question's detail page.
 */
export function QuestionCreateForm({
  categories,
  tags: _tags,
  courses,
}: QuestionCreateFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<TagInputTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
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
    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createQuestion({
        title: title.trim(),
        content: content.trim(),
        categoryId,
        courseId: courseId || undefined,
        tagIds: selectedTagIds.map((t) => t.id),
      });

      if (result.success && result.data) {
        const question = result.data as { id?: string };
        toast.success("Question created successfully!");
        router.push(question.id ? `/qa/${question.id}` : "/qa");
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to create question.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ask a Question</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get help from the NUB community. Be specific and include context.
        </p>
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
          disabled={submitting}
        />
        <p className="text-[10px] text-muted-foreground">
          {title.length}/200 · min 10 characters
        </p>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="content">
          Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your question in detail. You can use markdown."
          rows={10}
          maxLength={5000}
          disabled={submitting}
        />
        <p className="text-[10px] text-muted-foreground">
          {content.length}/5000 · min 10 characters
        </p>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={submitting}
          className="h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Course (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="course">Course (optional)</Label>
        <select
          id="course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          disabled={submitting}
          className="h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
        >
          <option value="">None</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <TagInput
        value={selectedTagIds}
        onChange={setSelectedTagIds}
        maxTags={5}
        placeholder="Search or create tags..."
        label="Tags"
      />

      {/* Tips */}
      <div className="flex gap-2 rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
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

      {/* Submit */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/qa")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Post Question
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
