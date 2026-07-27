"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { updateResource } from "@/actions/resource.actions";
import type { Resource, ResourceCourse, ResourceCategory } from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatFileSize } from "@/components/resources/file-type-utils";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ResourceEditFormProps {
  resource: Resource;
  courses?: ResourceCourse[];
  categories?: ResourceCategory[];
}

export function ResourceEditForm({
  resource,
  courses = [],
  categories = [],
}: ResourceEditFormProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description ?? "");
  const [categoryId, setCategoryId] = useState(resource.categoryId);
  const [tags, setTags] = useState<TagInputTag[]>(
    (resource.resourceTags ?? [])
      .map((rt) => rt.tag)
      .filter(Boolean)
      .map((t) => ({ id: t!.id, name: t!.name, slug: t!.slug })),
  );

  const [courseOpen, setCourseOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const selectedCourse = courses.find((c) => c.id === resource.courseId);

  const courseGroups = useMemo(() => {
    const map = new Map<string, ResourceCourse[]>();
    for (const course of courses) {
      const dept = course.department || "Other";
      const arr = map.get(dept) ?? [];
      arr.push(course);
      map.set(dept, arr);
    }
    return Array.from(map.entries());
  }, [courses]);

  const filteredCourseGroups = useMemo(() => {
    if (!courseSearch) return courseGroups;
    const q = courseSearch.toLowerCase();
    return courseGroups
      .map(([dept, crs]) => [
        dept,
        crs.filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q),
        ),
      ] as [string, ResourceCourse[]])
      .filter(([, crs]) => crs.length > 0);
  }, [courseGroups, courseSearch]);

  async function handleSubmit() {
    if (!title.trim() || !categoryId || tags.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await updateResource(resource.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
        tags: tags.map((t) => t.name),
      });

      if (result.success) {
        toast.success("Resource updated successfully!");
        router.push(`/resources/${resource.id}`);
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to update resource.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update resource.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Current file (read-only) */}
      <div className="rounded-xl border bg-muted/30 p-4 ring-1 ring-foreground/5">
        <Label className="text-muted-foreground">Current File</Label>
        <div className="mt-2 flex items-center gap-3">
          <FileText className="size-8 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{resource.title}</p>
            <p className="text-xs text-muted-foreground">
              {resource.fileType.split("/").pop()?.toUpperCase()} •{" "}
              {formatFileSize(resource.fileSize)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          To replace the file, delete this resource and upload a new one.
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
          placeholder="e.g., Data Structure Final Preparation Notes"
          maxLength={200}
          disabled={saving}
        />
        <p className="text-[10px] text-muted-foreground">{title.length}/200</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe what's in this resource..."
          className="min-h-[120px] text-sm"
        />
      </div>

      {/* Category (pills) */}
      <div className="space-y-2">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">What type of resource is this?</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(active ? "" : cat.id)}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-all",
                  active
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-card text-muted-foreground ring-foreground/10 hover:bg-muted hover:text-foreground",
                  saving && "opacity-50",
                )}
              >
                {active && <Check className="size-3.5" />}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course (read-only combobox) */}
      <div className="space-y-2">
        <Label>Course</Label>
        <Popover open={courseOpen} onOpenChange={setCourseOpen}>
          <PopoverTrigger
            disabled
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border bg-card px-3 py-1.5 text-sm ring-1 ring-foreground/10 opacity-70",
              !selectedCourse && "text-muted-foreground",
            )}
          >
            {selectedCourse ? (
              <span>
                <span className="font-medium">{selectedCourse.code}</span>
                <span className="ml-1.5 text-muted-foreground">{selectedCourse.name}</span>
              </span>
            ) : (
              <span>Unknown course</span>
            )}
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type to search..."
                value={courseSearch}
                onValueChange={setCourseSearch}
              />
              <CommandList>
                <CommandEmpty>No courses found.</CommandEmpty>
                {filteredCourseGroups.map(([dept, deptCourses]) => (
                  <CommandGroup key={dept} heading={dept}>
                    {deptCourses.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={course.id}
                        className="cursor-pointer"
                      >
                        <span className="font-medium">{course.code}</span>
                        <span className="ml-1.5 text-muted-foreground">{course.name}</span>
                        {course.id === resource.courseId && (
                          <Check className="ml-auto size-4 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Course cannot be changed after upload.
        </p>
      </div>

      {/* Tags */}
      <TagInput
        value={tags}
        onChange={setTags}
        maxTags={10}
        minTags={1}
        required
        placeholder="Type a tag and press Enter"
        label="Tags"
        disabled={saving}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !title.trim() || !categoryId || tags.length === 0}>
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
