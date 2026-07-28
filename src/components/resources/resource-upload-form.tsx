"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createResource } from "@/actions/resource.actions";
import { uploadService } from "@/services/upload.service";
import type { ResourceCourse, ResourceCategory } from "@/types/resource.types";
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

/** Accepted file types for resource upload. */
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const ACCEPTED_EXTENSIONS =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg";

/** Max file size: 50MB. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type UploadStage =
  | "idle"
  | "selecting"
  | "uploading"
  | "submitting"
  | "success"
  | "error";

interface ResourceUploadFormProps {
  courses?: ResourceCourse[];
  categories?: ResourceCategory[];
}

/**
 * Upload form for resources with drag-and-drop, file preview, and multi-step flow.
 * Category uses clickable pills. Course uses a searchable combobox grouped by department.
 */
export function ResourceUploadForm({
  courses = [],
  categories = [],
}: ResourceUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<UploadStage>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<TagInputTag[]>([]);

  // Course combobox
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  const selectedCourse = courses.find((c) => c.id === courseId);

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
      .map(
        ([dept, crs]) =>
          [
            dept,
            crs.filter(
              (c) =>
                c.code.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q),
            ),
          ] as [string, ResourceCourse[]],
      )
      .filter(([, crs]) => crs.length > 0);
  }, [courseGroups, courseSearch]);

  /** Validates and sets the selected file. */
  function handleFileSelect(selectedFile: File) {
    setError(null);

    if (
      !ACCEPTED_TYPES.includes(selectedFile.type) &&
      !selectedFile.name.match(
        /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|png|jpg|jpeg)$/i,
      )
    ) {
      setError(
        "Unsupported file type. Please upload PDF, DOC, PPT, XLS, ZIP, or image files.",
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    setFile(selectedFile);
    setStage("selecting");

    if (!title) {
      const name = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setTitle(name);
    }
  }

  /** Handles drag-and-drop events. */
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  /** Handles file drop. */
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  /** Submits the form. */
  async function handleSubmit() {
    if (
      !file ||
      !title.trim() ||
      !courseId ||
      !categoryId ||
      tags.length === 0
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setStage("uploading");
    setUploadProgress(0);
    setError(null);

    try {
      const uploadResult = await uploadService.upload(file, "resources", "raw");
      setUploadProgress(100);

      setStage("submitting");
      const result = await createResource({
        title: title.trim(),
        description: description.trim() || undefined,
        fileUrl: uploadResult.url,
        filePublicId: uploadResult.publicId,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        courseId,
        categoryId,
        tags: tags.map((t) => t.name),
      });

      if (result.success) {
        setStage("success");
        toast.success("Resource uploaded successfully!");
        const resourceId = (result.data as { id?: string })?.id;
        router.push(resourceId ? `/resources/${resourceId}` : "/resources");
      } else {
        setStage("error");
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to create resource.");
      }
    } catch (err) {
      setStage("error");
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    }
  }

  /** Resets the form to initial state. */
  function resetForm() {
    setFile(null);
    setTitle("");
    setDescription("");
    setCourseId("");
    setCategoryId("");
    setTags([]);
    setStage("idle");
    setError(null);
    setUploadProgress(0);
  }

  const isBusy = stage === "uploading" || stage === "submitting";
  const canSubmit =
    file &&
    title.trim() &&
    courseId &&
    categoryId &&
    tags.length > 0 &&
    !isBusy;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── File Drop Zone ────────────────────────────────────────── */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          file && "border-success bg-success/5",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="size-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} •{" "}
                {file.type.split("/").pop()?.toUpperCase() ?? "FILE"}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setStage("idle");
              }}
              className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Drag & drop your file here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse • PDF, DOC, PPT, XLS, ZIP, Images • Max 50MB
            </p>
          </>
        )}
      </div>

      {/* ── Upload Progress ───────────────────────────────────────── */}
      {stage === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Uploading file...
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Form Fields ───────────────────────────────────────────── */}
      {(file || stage === "idle") && (
        <div className="space-y-5">
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
              disabled={isBusy}
            />
            <p className="text-[10px] text-muted-foreground">
              {title.length}/200
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe what's in this resource..."
              className="min-h-30 text-sm"
            />
          </div>

          {/* ── Category (pills) ──────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              What type of resource is this?
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(active ? "" : cat.id)}
                    disabled={isBusy}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-all",
                      active
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-card text-muted-foreground ring-foreground/10 hover:bg-muted hover:text-foreground",
                      isBusy && "opacity-50",
                    )}
                  >
                    {active && <Check className="size-3.5" />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Course (searchable combobox) ──────────────────────── */}
          <div className="space-y-2">
            <Label>
              Course <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Search by course code or name
            </p>
            <Popover open={courseOpen} onOpenChange={setCourseOpen}>
              <PopoverTrigger
                disabled={isBusy}
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-lg border bg-card px-3 py-1.5 text-sm ring-1 ring-foreground/10 transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  isBusy && "opacity-50",
                  !selectedCourse && "text-muted-foreground",
                )}
              >
                {selectedCourse ? (
                  <span>
                    <span className="font-medium">{selectedCourse.code}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      {selectedCourse.name}
                    </span>
                  </span>
                ) : (
                  <span>Search courses...</span>
                )}
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
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
                        {deptCourses.map((course) => {
                          const active = course.id === courseId;
                          return (
                            <CommandItem
                              key={course.id}
                              value={course.id}
                              onSelect={() => {
                                setCourseId(active ? "" : course.id);
                                setCourseOpen(false);
                                setCourseSearch("");
                              }}
                              className="cursor-pointer"
                            >
                              <span className="font-medium">{course.code}</span>
                              <span className="ml-1.5 text-muted-foreground">
                                {course.name}
                              </span>
                              {active && (
                                <Check className="ml-auto size-4 text-primary" />
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            disabled={isBusy}
          />

          {/* ── Error message ──────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Submit ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={resetForm} disabled={isBusy}>
              Reset
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {stage === "submitting" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Success State ─────────────────────────────────────────── */}
      {stage === "success" && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle className="mx-auto size-10 text-success" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Resource uploaded successfully!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Redirecting to the resource page...
          </p>
        </div>
      )}
    </div>
  );
}
