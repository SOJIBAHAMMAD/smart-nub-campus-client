"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createResource } from "@/actions/resource.actions";
import { uploadService } from "@/services/upload.service";
import type { ResourceCourse, ResourceCategory } from "@/types/resource.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatFileSize } from "@/components/resources/file-type-utils";

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

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg";

/** Max file size: 50MB. */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type UploadStage = "idle" | "selecting" | "uploading" | "submitting" | "success" | "error";

interface ResourceUploadFormProps {
  /** Available courses for selection. */
  courses?: ResourceCourse[];
  /** Available categories for selection. */
  categories?: ResourceCategory[];
}

/**
 * Upload form for resources with drag-and-drop, file preview, and multi-step flow.
 * Flow: idle → selecting → uploading (file to Cloudinary) → submitting (metadata) → success → redirect
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

  /** Validates and sets the selected file. */
  function handleFileSelect(selectedFile: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|png|jpg|jpeg)$/i)) {
      setError("Unsupported file type. Please upload PDF, DOC, PPT, XLS, ZIP, or image files.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 50MB.");
      return;
    }

    setFile(selectedFile);
    setStage("selecting");

    // Auto-fill title from filename
    if (!title) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
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

  /** Submits the form: uploads file to Cloudinary, then creates resource via API. */
  async function handleSubmit() {
    if (!file || !title.trim() || !courseId || !categoryId || tags.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    setStage("uploading");
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Upload file to Cloudinary
      const uploadResult = await uploadService.upload(file, "resources", "raw");
      setUploadProgress(100);

      // Step 2: Create resource via API
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
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
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
          file && "border-success bg-success/5"
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
                {formatFileSize(file.size)} • {file.type.split("/").pop()?.toUpperCase() ?? "FILE"}
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
              disabled={stage === "uploading" || stage === "submitting"}
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
              className="text-sm min-h-[120px]"
            />
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <Label>
              Course <span className="text-destructive">*</span>
            </Label>
            <Select
              value={courseId}
              onValueChange={(v) => setCourseId(v ?? "")}
              disabled={stage === "uploading" || stage === "submitting"}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} — {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "")}
              disabled={stage === "uploading" || stage === "submitting"}
            >
              <SelectTrigger className="h-9">
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

          {/* Tags */}
          <TagInput
            value={tags}
            onChange={setTags}
            maxTags={10}
            minTags={1}
            required
            placeholder="Type a tag and press Enter"
            label="Tags"
            disabled={stage === "uploading" || stage === "submitting"}
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
            <Button
              variant="ghost"
              onClick={resetForm}
              disabled={stage === "uploading" || stage === "submitting"}
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !file ||
                !title.trim() ||
                !courseId ||
                !categoryId ||
                tags.length === 0 ||
                stage === "uploading" ||
                stage === "submitting"
              }
            >
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
