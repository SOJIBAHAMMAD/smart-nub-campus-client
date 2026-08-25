import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  Briefcase,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import ROUTES from "@/constants/routes";
import { JobPostStatus, JobSource } from "@/constants/enums";
import { JOB_SOURCE_LABELS } from "@/lib/constants";
import {
  departmentLabel,
  employmentLabel,
  getDeadlineInfo,
  stripHtml,
  timeAgo,
} from "@/lib/job-utils";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

function StatusPill({ job }: { job: Job }) {
  const deadline = getDeadlineInfo(job.deadline);
  const closed = deadline?.expired || job.status === JobPostStatus.CLOSED;
  const filled = !closed && job.status === JobPostStatus.FILLED;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
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

function DeadlineLabel({ job }: { job: Job }) {
  const info = getDeadlineInfo(job.deadline);
  if (!info) return null;

  if (info.expired) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
        <Clock className="size-3" aria-hidden="true" />
        Deadline passed
      </span>
    );
  }

  if (job.status !== JobPostStatus.OPEN) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium",
        info.urgent ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <Clock className="size-3" aria-hidden="true" />
      {info.label}
    </span>
  );
}

/** Shared link label so the whole card announces as one action. */
function cardAriaLabel(job: Job): string {
  const location = job.location ? ` in ${job.location}` : "";
  return `View details for ${job.title} at ${job.company}${location}`;
}

function GridCard({ job }: { job: Job }) {
  const posted = timeAgo(job.createdAt);

  return (
    <Link
      href={ROUTES.JOB(job.id)}
      aria-label={cardAriaLabel(job)}
      className="block h-full outline-none"
    >
      <Card
        size="sm"
        interactive
        className="group relative flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/40"
      >
        <CardHeader className="flex-row items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <Avatar
            id={job.company}
            name={job.company}
            className="size-11 rounded-lg text-xs"
          />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {job.company}
              {job.postedBy?.name ? ` · ${job.postedBy.name}` : ""}
            </p>
          </div>
          <CardAction className="pt-0.5">
            <StatusPill job={job} />
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
          {job.salaryRange ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BadgeDollarSign
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="truncate">{job.salaryRange}</span>
            </p>
          ) : null}

          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3 shrink-0" aria-hidden="true" />
              {employmentLabel(job.employmentType)}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <span className="text-muted-foreground/50">·</span>
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                {job.location}
              </span>
            )}
            {posted && (
              <span className="inline-flex items-center gap-1">
                <span className="text-muted-foreground/50">·</span>
                {posted}
              </span>
            )}
          </p>

          {job.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {stripHtml(job.description)}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            {departmentLabel(job.department) && (
              <TagPill
                name={departmentLabel(job.department)!}
                size="xs"
                variant="outline"
                showIcon={false}
              />
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
              <Users className="size-3" aria-hidden="true" />
              {job._count.applications}{" "}
              {job._count.applications === 1 ? "application" : "applications"}
            </span>
            <span className="flex items-center gap-2">
              <DeadlineLabel job={job} />
              {job.appliedByMe && (
                <Badge variant="secondary" className="text-[10px]">
                  Applied
                </Badge>
              )}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            View details
            <ArrowRight
              className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListRow({ job }: { job: Job }) {
  const posted = timeAgo(job.createdAt);

  return (
    <Link
      href={ROUTES.JOB(job.id)}
      aria-label={cardAriaLabel(job)}
      className="block outline-none"
    >
      <Card
        size="sm"
        interactive
        className="group w-full transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/40"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
          <Avatar
            id={job.company}
            name={job.company}
            className="hidden size-11 shrink-0 rounded-lg text-xs sm:flex"
          />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {job.company}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span>{employmentLabel(job.employmentType)}</span>
              {job.location && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{job.location}</span>
                </>
              )}
              {posted && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span>{posted}</span>
                </>
              )}
            </p>
          </div>

          {job.salaryRange && (
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <BadgeDollarSign
                  className="size-3.5"
                  aria-hidden="true"
                />
                {job.salaryRange}
              </span>
            </div>
          )}

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <DeadlineLabel job={job} />
              <StatusPill job={job} />
            </div>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="size-3" aria-hidden="true" />
              {job._count.applications}
            </span>
          </div>

          {job.appliedByMe && (
            <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
              Applied
            </Badge>
          )}

          <ArrowRight
            className="hidden size-4 shrink-0 text-muted-foreground/60 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary md:block"
            aria-hidden="true"
          />
        </div>
      </Card>
    </Link>
  );
}

export function JobCard({
  job,
  view = "grid",
}: {
  job: Job;
  view?: "grid" | "list";
}) {
  return view === "list" ? <ListRow job={job} /> : <GridCard job={job} />;
}
