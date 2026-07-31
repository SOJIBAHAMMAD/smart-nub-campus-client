import Link from "next/link";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { Badge } from "@/components/ui/badge";
import ROUTES from "@/constants/routes";
import { JobType, JobPostStatus, JobSource } from "@/constants/enums";
import { DEPARTMENT_LABELS, JOB_SOURCE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  [JobType.FULL_TIME]: "Full-time",
  [JobType.PART_TIME]: "Part-time",
  [JobType.CONTRACT]: "Contract",
  [JobType.INTERNSHIP]: "Internship",
  [JobType.REMOTE]: "Remote",
};

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

function formatDeadline(deadline: string | null | undefined): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function JobCard({ job }: { job: Job }) {
  const employmentLabel = EMPLOYMENT_TYPE_LABELS[job.employmentType] ?? job.employmentType;
  const departmentName = departmentLabel(job.department);
  const expired = isExpired(job.deadline);
  const deadlineLabel = formatDeadline(job.deadline);

  return (
    <Card
      size="sm"
      interactive
      className="relative flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CardHeader className="flex-row items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={ROUTES.JOB(job.id)}
            className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {job.company}
            {job.postedBy?.name ? ` · by ${job.postedBy.name}` : ""}
          </p>
        </div>
        <CardAction className="pt-0.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              expired || job.status === JobPostStatus.CLOSED
                ? "bg-muted text-muted-foreground"
                : job.status === JobPostStatus.FILLED
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            )}
          >
            {expired || job.status === JobPostStatus.CLOSED
              ? "Closed"
              : job.status === JobPostStatus.FILLED
                ? "Filled"
                : "Open"}
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="size-3 shrink-0" />
            {employmentLabel}
            {job.location ? (
              <>
                <span className="text-muted-foreground/50">·</span>
                <MapPin className="size-3 shrink-0" />
                {job.location}
              </>
            ) : null}
          </span>
        </p>

        {job.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
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

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {job._count.applications}{" "}
            {job._count.applications === 1 ? "application" : "applications"}
          </span>
          {deadlineLabel && (
            <span
              className={cn(
                "text-[11px]",
                expired ? "text-muted-foreground/60" : "text-muted-foreground",
              )}
            >
              {expired ? "Deadline passed" : `Due ${deadlineLabel}`}
            </span>
          )}
          {job.appliedByMe && (
            <Badge variant="secondary" className="text-[10px]">
              Applied
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
