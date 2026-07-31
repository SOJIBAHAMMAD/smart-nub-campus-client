"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagPill } from "@/components/ui/tag-pill";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ROUTES from "@/constants/routes";
import { JobType, JobPostStatus, ApplicationStatus, UserRole } from "@/constants/enums";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  applyToJobAction,
  listJobApplicationsAction,
  updateJobApplicationStatusAction,
} from "@/actions/jobs.actions";
import type { JobDetail, JobApplicationsResponse } from "@/types";
import { toast } from "sonner";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  [JobType.FULL_TIME]: "Full-time",
  [JobType.PART_TIME]: "Part-time",
  [JobType.CONTRACT]: "Contract",
  [JobType.INTERNSHIP]: "Internship",
  [JobType.REMOTE]: "Remote",
};

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
  [ApplicationStatus.WITHDRAWN]: "Withdrawn",
};

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function JobDetailClient({
  job,
  userId,
  userRole,
}: {
  job: JobDetail;
  userId?: string;
  userRole?: string;
}) {
  const isOwner = job.postedById === userId;
  const isAdmin = userRole === UserRole.ADMIN;
  const canManage = isOwner || isAdmin;
  const canApply = !isOwner && job.status === JobPostStatus.OPEN && !job.appliedByMe;

  const expired = isExpired(job.deadline);
  const closed = expired || job.status !== JobPostStatus.OPEN;

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [isApplying, startApplying] = useTransition();

  const [applications, setApplications] = useState<JobApplicationsResponse | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  const loadApplications = async () => {
    if (appsLoaded) return;
    setLoadingApps(true);
    try {
      const result = await listJobApplicationsAction(job.id);
      if (result.success && result.data) {
        setApplications(result.data as JobApplicationsResponse);
        setAppsLoaded(true);
      } else {
        toast.error(result.message || "Failed to load applications.");
      }
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApply = () => {
    startApplying(async () => {
      const result = await applyToJobAction(job.id, {
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });
      if (result.success) {
        toast.success("Application submitted successfully!");
        setApplyOpen(false);
        setCoverLetter("");
        setResumeUrl("");
      } else {
        toast.error(result.message || "Failed to submit application.");
      }
    });
  };

  const handleUpdateStatus = async (applicationId: string, status: string) => {
    setPendingStatusId(applicationId);
    try {
      const result = await updateJobApplicationStatusAction(job.id, applicationId, status);
      if (result.success && applications) {
        setApplications({
          ...applications,
          data: applications.data.map((app) =>
            app.id === applicationId
              ? { ...app, status: status as ApplicationStatus }
              : app,
          ),
        });
        toast.success("Application updated.");
      } else {
        toast.error(result.message || "Failed to update application.");
      }
    } catch {
      toast.error("Failed to update application.");
    } finally {
      setPendingStatusId(null);
    }
  };

  const departmentName = departmentLabel(job.department);
  const deadlineLabel = formatDate(job.deadline);
  const postedLabel = formatDate(job.createdAt);
  const employmentLabel = EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <Link
        href={ROUTES.JOBS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to job board
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="gap-3 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-14">
              <Building2 className="size-6 text-primary sm:size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  {job.title}
                </h1>
                {job.isVerified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="size-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.company}
                {job.postedBy?.name ? ` · Posted by ${job.postedBy.name}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <TagPill name={employmentLabel} size="xs" variant="outline" showIcon={false} />
                {departmentName && (
                  <TagPill name={departmentName} size="xs" variant="outline" showIcon={false} />
                )}
                {job.salaryRange && (
                  <TagPill name={job.salaryRange} size="xs" variant="brand" showIcon={false} />
                )}
              </div>
            </div>
            <CardAction className="shrink-0">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                  closed
                    ? "bg-muted text-muted-foreground"
                    : job.status === JobPostStatus.FILLED
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                {closed
                  ? "Closed"
                  : job.status === JobPostStatus.FILLED
                    ? "Filled"
                    : "Open"}
              </span>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-4 text-xs text-muted-foreground sm:px-6 sm:pb-6">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {job._count.applications}{" "}
            {job._count.applications === 1 ? "application" : "applications"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            Posted {postedLabel ?? "recently"}
          </span>
          {deadlineLabel && (
            <span
              className={cn(
                "flex items-center gap-1.5",
                expired ? "text-destructive/80" : "",
              )}
            >
              <CalendarDays className="size-3.5 shrink-0" />
              {expired ? "Deadline passed" : `Deadline ${deadlineLabel}`}
            </span>
          )}
        </CardContent>
      </Card>

      {/* ── Description ────────────────────────────────────────── */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-4" />
              About the role
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5 sm:pb-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Apply / Status ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Your application</CardTitle>
        </CardHeader>
        <CardContent className="pb-5 sm:pb-6">
          {job.appliedByMe ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge
                variant="secondary"
                className="gap-1"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Applied
              </Badge>
              {job.myApplicationStatus && (
                <span className="text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {APPLICATION_STATUS_LABELS[job.myApplicationStatus] ?? job.myApplicationStatus}
                  </span>
                </span>
              )}
            </div>
          ) : canApply ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm text-muted-foreground">
                Interested? Submit your application directly to the poster.
              </p>
              <Button onClick={() => setApplyOpen(true)}>Apply now</Button>
            </div>
          ) : isOwner ? (
            <p className="text-sm text-muted-foreground">
              You posted this job. View applications below to manage candidates.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {closed
                ? "This job post is no longer accepting applications."
                : "Applications are managed by the poster."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Applications (owner/admin) ─────────────────────────── */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Applications
            </CardTitle>
            <CardAction>
              {!appsLoaded && (
                <Button variant="outline" size="sm" onClick={loadApplications}>
                  View applications
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="pb-5 sm:pb-6">
            {loadingApps ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : applications ? (
              applications.data.length === 0 ? (
                <p className="text-sm text-muted-foreground/60">
                  No applications yet. They will appear here once students apply.
                </p>
              ) : (
                <ul className="space-y-3">
                  {applications.data.map((app) => (
                    <li
                      key={app.id}
                      className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <Avatar
                          id={app.applicantId}
                          name={app.applicant.name}
                          src={app.applicant.image}
                          className="size-10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {app.applicant.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {app.applicant.profile?.jobTitle
                              ? app.applicant.profile.jobTitle
                              : "Student"}
                            {app.applicant.student?.department
                              ? ` · ${departmentLabel(app.applicant.student.department)}`
                              : ""}
                          </p>
                          {app.coverLetter && (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {app.coverLetter}
                            </p>
                          )}
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              View resume
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 sm:flex-col sm:items-end">
                        <Badge
                          variant={
                            app.status === ApplicationStatus.ACCEPTED
                              ? "default"
                              : app.status === ApplicationStatus.REJECTED
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
                        </Badge>
                        {app.status === ApplicationStatus.PENDING && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleUpdateStatus(app.id, ApplicationStatus.ACCEPTED)}
                              disabled={pendingStatusId === app.id}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleUpdateStatus(app.id, ApplicationStatus.REJECTED)}
                              disabled={pendingStatusId === app.id}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* ── Apply dialog ───────────────────────────────────────── */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
            <DialogDescription>
              Your application will be sent to {job.company}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cover-letter">Cover letter (optional)</Label>
              <Textarea
                id="cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a good fit for this role?"
                rows={5}
                maxLength={2000}
                disabled={isApplying}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resume-url">Resume / portfolio URL (optional)</Label>
              <Input
                id="resume-url"
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://..."
                disabled={isApplying}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplyOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying && <Loader2 className="size-4 animate-spin" />}
              Submit application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
