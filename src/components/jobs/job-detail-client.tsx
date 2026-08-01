"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  MapPin,
  Users,
  type LucideIcon,
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
import { JobPostStatus, ApplicationStatus, UserRole, JobSource } from "@/constants/enums";
import { JOB_SOURCE_LABELS } from "@/lib/constants";
import {
  departmentLabel,
  employmentLabel,
  formatDate,
  getDeadlineInfo,
  isRichHtml,
} from "@/lib/job-utils";
import { cn } from "@/lib/utils";
import {
  applyToJobAction,
  listJobApplicationsAction,
  listJobsAction,
  updateJobApplicationStatusAction,
} from "@/actions/jobs.actions";
import type {
  Job,
  JobDetail,
  JobApplicationsResponse,
  JobListResponse,
} from "@/types";
import { toast } from "sonner";
import { JobCard } from "./job-card";
import { JobCardSkeleton } from "@/components/skeletons/job-card-skeleton";

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
  [ApplicationStatus.WITHDRAWN]: "Withdrawn",
};

function StatusPill({ closed, status }: { closed: boolean; status: string }) {
  const filled = !closed && status === JobPostStatus.FILLED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
        closed
          ? "bg-muted text-muted-foreground"
          : filled
            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          closed ? "bg-current" : filled ? "bg-sky-500" : "bg-emerald-500",
        )}
      />
      {closed ? "Closed" : filled ? "Filled" : "Open"}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        {href ? (
          <dd>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm font-medium text-primary hover:underline"
            >
              {value}
            </a>
          </dd>
        ) : (
          <dd className="break-words text-sm font-medium text-foreground">
            {value}
          </dd>
        )}
      </div>
    </div>
  );
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

  const deadlineInfo = getDeadlineInfo(job.deadline);
  const closed = deadlineInfo?.expired || job.status !== JobPostStatus.OPEN;

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeUrlError, setResumeUrlError] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "success" | "error">("idle");
  const [isApplying, startApplying] = useTransition();

  const [applications, setApplications] = useState<JobApplicationsResponse | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);

  const [similarJobs, setSimilarJobs] = useState<Job[] | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Load similar roles from the same department (best-effort, non-blocking).
  useEffect(() => {
    if (!job.department) return;
    let cancelled = false;
    setLoadingSimilar(true);
    listJobsAction({
      department: job.department,
      status: JobPostStatus.OPEN,
      limit: 3,
    })
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          const jobs = (result.data as JobListResponse).data.filter(
            (j) => j.id !== job.id,
          );
          setSimilarJobs(jobs);
        } else {
          setSimilarJobs([]);
        }
      })
      .catch(() => {
        if (!cancelled) setSimilarJobs([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSimilar(false);
      });
    return () => {
      cancelled = true;
    };
  }, [job.id, job.department]);

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

  const validateResumeUrl = (value: string): string => {
    if (!value.trim()) return "";
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Link must start with http:// or https://.";
      }
      return "";
    } catch {
      return "Enter a valid URL, e.g. https://linkedin.com/in/you";
    }
  };

  const handleResumeUrlChange = (value: string) => {
    setResumeUrl(value);
    setResumeUrlError(validateResumeUrl(value));
  };

  const handleApply = () => {
    const urlError = validateResumeUrl(resumeUrl);
    setResumeUrlError(urlError);
    if (urlError) return;

    startApplying(async () => {
      setApplyStatus("idle");
      const result = await applyToJobAction(job.id, {
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      });
      if (result.success) {
        setApplyStatus("success");
        toast.success("Application submitted successfully!");
        setApplyOpen(false);
        setCoverLetter("");
        setResumeUrl("");
        setResumeUrlError("");
        setTimeout(() => setApplyStatus("idle"), 4000);
      } else {
        setApplyStatus("error");
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

  const poster = job.postedBy;

  return (
    <div
      className={cn(
        "mx-auto max-w-5xl space-y-4 p-4 sm:p-6",
        canApply && "pb-24 lg:pb-6",
      )}
    >
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link
              href={ROUTES.JOBS}
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Job Board
            </Link>
          </li>
          <li aria-hidden="true" className="shrink-0">
            <ChevronRight className="size-4 text-muted-foreground/50" />
          </li>
          <li aria-current="page" className="truncate font-medium text-foreground">
            {job.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        {/* ── Main column ─────────────────────────────────────────── */}
        <div className="min-w-0 space-y-4">
          {/* Header */}
          <Card>
            <CardHeader className="gap-3 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar
                  id={job.company}
                  name={job.company}
                  className="size-12 rounded-xl text-sm sm:size-14"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
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
                    <StatusPill closed={closed} status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company}
                    {poster?.name ? ` · Posted by ${poster.name}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <TagPill name={employmentLabel(job.employmentType)} size="xs" variant="outline" showIcon={false} />
                    {departmentName && (
                      <TagPill name={departmentName} size="xs" variant="outline" showIcon={false} />
                    )}
                    {job.salaryRange && (
                      <TagPill name={job.salaryRange} size="xs" variant="brand" showIcon={false} />
                    )}
                    {job.source && job.source !== JobSource.PLATFORM && (
                      <TagPill
                        name={`Shared from ${JOB_SOURCE_LABELS[job.source] ?? job.source}`}
                        size="xs"
                        variant="outline"
                        showIcon={false}
                      />
                    )}
                  </div>
                </div>
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
                    deadlineInfo?.expired ? "text-destructive/80" : "",
                  )}
                >
                  <CalendarDays className="size-3.5 shrink-0" />
                  {deadlineInfo?.expired ? "Deadline passed" : `Due ${deadlineLabel}`}
                  {!deadlineInfo?.expired && deadlineInfo && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        deadlineInfo.urgent
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {deadlineInfo.label}
                    </span>
                  )}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {job.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="size-4" />
                  About the role
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5 sm:pb-6">
                {isRichHtml(job.description) ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert [&_a]:break-all"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {job.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Apply / Status */}
          <Card>
            <CardHeader>
              <CardTitle>Your application</CardTitle>
            </CardHeader>
            <CardContent className="pb-5 sm:pb-6">
              {job.appliedByMe ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1">
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

          {/* Applications (owner/admin) */}
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
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className="space-y-4 lg:sticky lg:top-4 lg:self-start"
          role="complementary"
          aria-label="Job overview"
        >
          {canApply && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setApplyOpen(true)}
                >
                  Apply now
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Free — takes under a minute
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job overview</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <dl className="divide-y divide-border/60">
                <InfoRow
                  icon={BadgeDollarSign}
                  label="Salary"
                  value={job.salaryRange ?? "Not disclosed"}
                />
                {deadlineLabel && (
                  <InfoRow
                    icon={CalendarDays}
                    label="Deadline"
                    value={
                      <span className={deadlineInfo?.expired ? "text-destructive" : ""}>
                        {deadlineInfo?.expired ? "Closed" : deadlineLabel}
                        {deadlineInfo && !deadlineInfo.expired && (
                          <span className="ml-1.5 text-muted-foreground">
                            ({deadlineInfo.label})
                          </span>
                        )}
                      </span>
                    }
                  />
                )}
                <InfoRow
                  icon={Briefcase}
                  label="Employment type"
                  value={employmentLabel(job.employmentType)}
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={job.location ?? "Not specified"}
                />
                {departmentName && (
                  <InfoRow icon={GraduationCap} label="Department" value={departmentName} />
                )}
                <InfoRow
                  icon={Users}
                  label="Applications"
                  value={`${job._count.applications}`}
                />
                <InfoRow
                  icon={Clock}
                  label="Posted"
                  value={postedLabel ?? "Recently"}
                />
              </dl>
            </CardContent>
          </Card>

          {poster && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Posted by</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <div className="flex items-start gap-3">
                  <Avatar
                    id={poster.id}
                    name={poster.name}
                    src={poster.image}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {poster.name}
                    </p>
                    {poster.profile?.jobTitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {poster.profile.jobTitle}
                      </p>
                    )}
                    {poster.profile?.currentEmployer && (
                      <p className="truncate text-xs text-muted-foreground">
                        {poster.profile.currentEmployer}
                      </p>
                    )}
                    {poster.profile?.location && (
                      <p className="truncate text-xs text-muted-foreground">
                        {poster.profile.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {job.sourceUrl && (
            <Card>
              <CardContent className="p-4">
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-4 shrink-0" />
                  View original post
                </a>
                {job.source && job.source !== JobSource.PLATFORM && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Shared from {JOB_SOURCE_LABELS[job.source] ?? job.source}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* ── Similar jobs ──────────────────────────────────────────── */}
      {(loadingSimilar || (similarJobs && similarJobs.length > 0)) && (
        <section
          aria-labelledby="similar-jobs-heading"
          className="pt-2"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="similar-jobs-heading"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
            >
              <Briefcase className="size-5 text-primary" aria-hidden="true" />
              More opportunities
            </h2>
            <Link
              href={ROUTES.JOBS}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all jobs
            </Link>
          </div>
          {loadingSimilar ? (
            <div
              className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              aria-hidden="true"
            >
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : similarJobs && similarJobs.length > 0 ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarJobs.map((j) => (
                <JobCard key={j.id} job={j} view="grid" />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* ── Mobile sticky apply bar ───────────────────────────────── */}
      {canApply && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {job.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {job.company}
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 shrink-0"
              onClick={() => setApplyOpen(true)}
            >
              Apply now
            </Button>
          </div>
        </div>
      )}

      {/* ── Apply dialog ──────────────────────────────────────────── */}
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="cover-letter">Cover letter (optional)</Label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {coverLetter.length}/2000
                </span>
              </div>
              <Textarea
                id="cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a good fit for this role?"
                rows={5}
                maxLength={2000}
                disabled={isApplying}
                aria-describedby="cover-letter-hint"
              />
              <p id="cover-letter-hint" className="text-xs text-muted-foreground">
                Optional — a short note helps the poster understand your fit.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resume-url">Resume / portfolio URL (optional)</Label>
              <Input
                id="resume-url"
                type="url"
                value={resumeUrl}
                onChange={(e) => handleResumeUrlChange(e.target.value)}
                placeholder="https://linkedin.com/in/you"
                disabled={isApplying}
                aria-invalid={resumeUrlError ? true : undefined}
                aria-describedby={
                  resumeUrlError ? "resume-url-error" : "resume-url-hint"
                }
              />
              {resumeUrlError ? (
                <p
                  id="resume-url-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {resumeUrlError}
                </p>
              ) : (
                <p id="resume-url-hint" className="text-xs text-muted-foreground">
                  Optional — share a public link to your resume or portfolio.
                </p>
              )}
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

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {applyStatus === "success"
          ? "Your application was submitted successfully."
          : applyStatus === "error"
            ? "There was a problem submitting your application. Please try again."
            : ""}
      </p>
    </div>
  );
}
