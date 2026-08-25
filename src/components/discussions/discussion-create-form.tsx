"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle } from "lucide-react";
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
import { RichTextEditor, RichTextEditorToolbar, RichTextEditorContent } from "@/components/ui/rich-text-editor";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { createDiscussion } from "@/actions/discussion.actions";
import type {
  DiscussionCategory,
  DiscussionVisibility,
} from "@/types/discussion.types";
import type { Tag } from "@/types/resource.types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

const DRAFT_KEY = "discussion-create-draft";

interface DiscussionCreateFormProps {
  categories: (DiscussionCategory & { _count: { discussions: number } })[];
  tags: Tag[];
  courses: { id: string; code: string; name: string }[];
}

const VISIBILITY_OPTIONS: { value: DiscussionVisibility; label: string; hint: string }[] = [
  { value: "PUBLIC", label: "Public", hint: "Visible to all students" },
  { value: "DEPARTMENT", label: "Department Only", hint: "Students in your department" },
  { value: "BATCH", label: "Batch Only", hint: "Students in your batch year" },
];

export function DiscussionCreateForm({
  categories,
  tags: _tags,
  courses,
}: DiscussionCreateFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [visibility, setVisibility] = useState<DiscussionVisibility>("PUBLIC");
  const [selectedTagIds, setSelectedTagIds] = useState<TagInputTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.courseId) setCourseId(draft.courseId);
        if (draft.visibility) setVisibility(draft.visibility);
        toast.info("Draft restored from your last session.");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (submitting) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ title, content, categoryId, courseId, visibility }),
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, [title, content, categoryId, courseId, visibility, submitting]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (title.length > 200) {
      setError("Title must be at most 200 characters.");
      return;
    }
    const textContent = content.replace(/<[^>]*>?/gm, "").trim();
    if (!textContent) {
      setError("Content is required.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDiscussion({
        title: title.trim(),
        content,
        categoryId,
        courseId: courseId || undefined,
        visibility,
        tagIds: selectedTagIds.map((t) => t.id),
      });

      if (result.success && result.data) {
        const discussion = result.data as { id?: string };
        localStorage.removeItem(DRAFT_KEY);
        toast.success("Discussion created successfully!");
        router.push(discussion.id ? `/discussions/${discussion.id}` : "/discussions");
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to create discussion.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create discussion.");
    } finally {
      setSubmitting(false);
    }
  }, [title, content, categoryId, courseId, visibility, selectedTagIds, router]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Start a Discussion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your thoughts, ask questions, and start conversations with the community.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Best resources for DSA?"
              maxLength={200}
              disabled={submitting}
            />
            <p className="text-[10px] text-muted-foreground">{title.length}/200</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Share the details of your discussion..."
              disabled={submitting}
            >
              <RichTextEditorToolbar />
              <RichTextEditorContent />
            </RichTextEditor>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? "")}
                disabled={submitting}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course">Course (optional)</Label>
              <Select
                value={courseId}
                onValueChange={(v) => setCourseId(v ?? "")}
                disabled={submitting}
              >
                <SelectTrigger id="course" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} &mdash; {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput
              value={selectedTagIds}
              onChange={setSelectedTagIds}
              maxTags={5}
              placeholder="Search or create tags..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  disabled={submitting}
                  className={
                    "rounded-lg border p-3 text-left transition-all " +
                    (visibility === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "hover:bg-muted hover:border-border")
                  }
                >
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem(DRAFT_KEY);
            router.push("/discussions");
          }}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Create Discussion
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
