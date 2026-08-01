"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import ROUTES from "@/constants/routes";
import { JobSource, JobType } from "@/constants/enums";
import { DEPARTMENT_LABELS, JOB_SOURCE_LABELS } from "@/lib/constants";
import {
  createJobAction,
  importJobAction,
} from "@/actions/jobs.actions";
import { stripHtml, textToHtml } from "@/lib/job-utils";
import type { ParsedJobDraft } from "@/types";
import { toast } from "sonner";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: "Full-time" },
  { value: JobType.PART_TIME, label: "Part-time" },
  { value: JobType.CONTRACT, label: "Contract" },
  { value: JobType.INTERNSHIP, label: "Internship" },
  { value: JobType.REMOTE, label: "Remote" },
];

const EMPLOYMENT_TYPE_VALUES = new Set(EMPLOYMENT_TYPE_OPTIONS.map((o) => o.value));

const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const SOURCE_OPTIONS = Object.entries(JOB_SOURCE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function JobPostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isImporting, setIsImporting] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    employmentType: JobType.FULL_TIME,
    location: "",
    salaryRange: "",
    applicationUrl: "",
    deadline: "",
    department: "",
    source: JobSource.PLATFORM,
    sourceUrl: "",
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyDraft = (draft: ParsedJobDraft) => {
    const employmentType: typeof form.employmentType = EMPLOYMENT_TYPE_VALUES.has(
      draft.employmentType as JobType,
    )
      ? (draft.employmentType as typeof form.employmentType)
      : JobType.FULL_TIME;

    setForm((prev) => ({
      ...prev,
      title: draft.title || prev.title,
      company: draft.company || prev.company,
      description: draft.description
        ? textToHtml(draft.description)
        : prev.description,
      employmentType,
      location: draft.location || prev.location,
      salaryRange: draft.salaryRange || prev.salaryRange,
      applicationUrl: draft.applicationUrl || prev.applicationUrl,
      deadline: draft.deadline || prev.deadline,
      department: draft.department || prev.department,
      source: (draft.source ?? prev.source) as typeof prev.source,
      sourceUrl: draft.sourceUrl || prev.sourceUrl,
    }));
  };

  const handleImport = async () => {
    if (!importInput.trim()) {
      toast.error("Paste a job link or the job description first.");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importJobAction({ input: importInput.trim() });
      if (result.success && result.data) {
        applyDraft(result.data as ParsedJobDraft);
        toast.success(
          "Job details extracted — review and post below.",
        );
      } else {
        toast.error(result.message || "Could not extract job details.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.company.trim()) {
      toast.error("Title and company are required.");
      return;
    }

    startTransition(async () => {
      const description = form.description.trim();
      const result = await createJobAction({
        title: form.title.trim(),
        company: form.company.trim(),
        description: stripHtml(description).length > 0 ? description : undefined,
        employmentType: form.employmentType,
        location: form.location.trim() || undefined,
        salaryRange: form.salaryRange.trim() || undefined,
        applicationUrl: form.applicationUrl.trim() || undefined,
        deadline: form.deadline
          ? new Date(form.deadline).toISOString()
          : null,
        department: form.department || undefined,
        source: form.source,
        sourceUrl: form.sourceUrl.trim() || undefined,
      });

      if (result.success && result.data) {
        toast.success("Job posted successfully!");
        const job = result.data as { id?: string };
        router.push(job.id ? ROUTES.JOB(job.id) : ROUTES.JOBS);
      } else {
        toast.error(result.message || "Failed to post job.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
      <Link
        href={ROUTES.JOBS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to job board
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            Share from another platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="import-input">
              Paste a job link or the full job description
            </Label>
            <Textarea
              id="import-input"
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder="e.g. https://www.linkedin.com/jobs/view/... or paste the description text"
              rows={3}
              maxLength={20000}
              disabled={isImporting}
            />
          </div>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || !importInput.trim()}
          >
            {isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isImporting ? "Extracting..." : "Extract details"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-4" />
            Post a job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>
                  Job title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Junior Software Engineer"
                  maxLength={120}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.company}
                  onChange={(e) => setField("company", e.target.value)}
                  placeholder="e.g. TechSoft Ltd."
                  maxLength={120}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Employment type</Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(v) => setField("employmentType", (v ?? JobType.FULL_TIME) as typeof form.employmentType)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="e.g. Dhaka (remote-friendly)"
                  maxLength={120}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Salary range (optional)</Label>
                <Input
                  value={form.salaryRange}
                  onChange={(e) => setField("salaryRange", e.target.value)}
                  placeholder="e.g. ৳30,000 – ৳50,000"
                  maxLength={80}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Department (optional)</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setField("department", v ?? "")}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any department</SelectItem>
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Application URL (optional)</Label>
                <Input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(e) => setField("applicationUrl", e.target.value)}
                  placeholder="https://..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Job source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) =>
                    setField("source", (v ?? JobSource.PLATFORM) as typeof form.source)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Original post URL (optional)</Label>
                <Input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => setField("sourceUrl", e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Application deadline (optional)</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setField("deadline", e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description (optional)</Label>
                <RichTextEditor
                  value={form.description}
                  onChange={(v) => setField("description", v)}
                  placeholder="Responsibilities, requirements, and how to apply..."
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Supports rich text — headings, bold, lists, links, and more.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(ROUTES.JOBS)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Post job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
