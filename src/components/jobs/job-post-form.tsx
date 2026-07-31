"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { JobType } from "@/constants/enums";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { createJobAction } from "@/actions/jobs.actions";
import { toast } from "sonner";

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: JobType.FULL_TIME, label: "Full-time" },
  { value: JobType.PART_TIME, label: "Part-time" },
  { value: JobType.CONTRACT, label: "Contract" },
  { value: JobType.INTERNSHIP, label: "Internship" },
  { value: JobType.REMOTE, label: "Remote" },
];

const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENT_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export function JobPostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.company.trim()) {
      toast.error("Title and company are required.");
      return;
    }

    startTransition(async () => {
      const result = await createJobAction({
        title: form.title.trim(),
        company: form.company.trim(),
        description: form.description.trim() || undefined,
        employmentType: form.employmentType,
        location: form.location.trim() || undefined,
        salaryRange: form.salaryRange.trim() || undefined,
        applicationUrl: form.applicationUrl.trim() || undefined,
        deadline: form.deadline
          ? new Date(form.deadline).toISOString()
          : null,
        department: form.department || undefined,
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
                <Textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Responsibilities, requirements, and how to apply..."
                  rows={6}
                  maxLength={4000}
                  disabled={isPending}
                />
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
