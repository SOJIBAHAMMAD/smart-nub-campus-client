"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  AlertCircle,
  Lightbulb,
  Save,
  Trash2,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { createQuestion } from "@/actions/qa.actions";
import type { QuestionCategory } from "@/types/qa.types";
import type { Tag } from "@/types/resource.types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorToolbar,
} from "@/components/ui/rich-text-editor";

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

export function QuestionCreateForm({
  categories,
  tags: _tags,
  courses,
}: QuestionCreateFormProps) {
  const router = useRouter();

  const DRAFT_KEY = "qa:draft";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<TagInputTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setTitle(draft.title ?? "");
        setContent(draft.content ?? "");
        setCategoryId(draft.categoryId ?? "");
        setCourseId(draft.courseId ?? "");
        if (draft.title || draft.content) {
          toast.info("Draft restored from your last session.");
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    if (!title && !content) return;
    draftTimer.current = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, content, categoryId, courseId }),
      );
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1000);
    return () => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
    };
  }, [title, content, categoryId, courseId]);

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setTitle("");
    setContent("");
    setCategoryId("");
    setCourseId("");
    setSelectedTagIds([]);
    setDraftSaved(false);
  }

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
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createQuestion({
        title: title.trim(),
        content,
        categoryId,
        courseId: courseId || undefined,
        tagIds: selectedTagIds.map((t) => t.id),
      });

      if (result.success && result.data) {
        localStorage.removeItem(DRAFT_KEY);
        const question = result.data as { id?: string };
        toast.success("Question created successfully!");
        router.push(question.id ? `/qa/${question.id}` : "/qa");
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to create question.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create question.",
      );
    } finally {
      setSubmitting(false);
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
      !submitting
    ) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/qa" />}>Q&A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ask a Question</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ask a Question</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get help from the NUB community. Be specific and include context.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {draftSaved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="size-3" />
              Draft saved
            </span>
          )}
          {(title || content) && (
            <button
              onClick={clearDraft}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              aria-label="Clear draft"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
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
          disabled={submitting}
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

      {/* Category */}
      <div className="space-y-1.5">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={categoryId}
          onValueChange={(v) => setCategoryId(v ?? "")}
          disabled={submitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
                {cat._count?.questions > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-4 rounded-full px-1.5 text-[10px]"
                  >
                    {cat._count.questions}
                  </Badge>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course (optional) */}
      <div className="space-y-1.5">
        <Label>Course (optional)</Label>
        <Select
          value={courseId}
          onValueChange={(v) => setCourseId(v ?? "")}
          disabled={submitting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
