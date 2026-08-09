"use client";

import { format } from "date-fns";
import { Briefcase, XCircle } from "lucide-react";
import type { ListAdminJobsResponse } from "@/types/admin.types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobRowActions } from "./job-row-actions";
import { JobStatusBadge } from "./job-status-badge";
import { JobVerifiedBadge } from "./job-verified-badge";

interface JobsTableProps {
  isLoading: boolean;
  data: ListAdminJobsResponse | null;
  hasActiveFilters: boolean;
  verifyingId: string | null;
  onClearFilters: () => void;
  onVerifyToggle: (id: string, isVerified: boolean) => void;
  onDelete: (id: string) => void;
}

/** Structural loading placeholder so the table layout stays stable. */
function JobsTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead scope="col">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead scope="col">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead className="w-28" scope="col">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableHead>
              <TableHead className="w-28" scope="col">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableHead>
              <TableHead className="w-36" scope="col">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead className="w-32" scope="col">
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead className="w-10" scope="col" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="max-w-md space-y-1.5">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-7 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="mx-auto h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="mx-auto h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface JobsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

function JobsEmptyState({ hasActiveFilters, onClearFilters }: JobsEmptyStateProps) {
  return (
    <Empty className="min-h-96 rounded-none border-0 p-12 sm:p-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase className="size-6" />
        </EmptyMedia>
        <EmptyTitle>
          {hasActiveFilters
            ? "No jobs match your filters"
            : "No job posts yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "Try adjusting your search or filters, or clear them to see every job post."
            : "Job posts shared by alumni will appear here."}
        </EmptyDescription>
      </EmptyHeader>
      {hasActiveFilters && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <XCircle className="size-3.5 mr-1" />
            Clear filters
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

/** Posted-by cell: gradient avatar + name with email tooltip. */
function JobPoster({ job }: { job: ListAdminJobsResponse["data"][number] }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        id={job.postedBy.id}
        name={job.postedBy.name}
        src={job.postedBy.image}
        className="size-7 text-[10px]"
      />
      <Tooltip>
        <TooltipTrigger>
          <span className="block max-w-28 truncate text-sm font-medium text-foreground">
            {job.postedBy.name}
          </span>
        </TooltipTrigger>
        <TooltipContent>{job.postedBy.email}</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function JobsTable({
  isLoading,
  data,
  hasActiveFilters,
  verifyingId,
  onClearFilters,
  onVerifyToggle,
  onDelete,
}: JobsTableProps) {
  if (isLoading) return <JobsTableSkeleton />;

  if (!data || data.data.length === 0) {
    return (
      <JobsEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead scope="col">Job</TableHead>
              <TableHead scope="col">Posted by</TableHead>
              <TableHead className="text-center" scope="col">
                Status
              </TableHead>
              <TableHead className="text-center" scope="col">
                Applications
              </TableHead>
              <TableHead scope="col">Posted</TableHead>
              <TableHead scope="col">Verified</TableHead>
              <TableHead className="w-10" scope="col" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((job) => (
              <TableRow key={job.id} className="group">
                <TableCell>
                  <div className="max-w-md min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {job.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.company}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {job.employmentType.replace(/_/g, " ").toLowerCase()}
                      {job.department ? ` · ${job.department}` : ""}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <JobPoster job={job} />
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <JobStatusBadge status={job.status} />
                  </div>
                </TableCell>

                <TableCell>
                  <span className="block text-center text-sm tabular-nums text-muted-foreground">
                    {job._count.applications}
                  </span>
                </TableCell>

                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(job.createdAt), "MMM d, yyyy")}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <JobVerifiedBadge isVerified={job.isVerified} />
                </TableCell>

                <TableCell>
                  <JobRowActions
                    job={job}
                    verifyingId={verifyingId}
                    onVerifyToggle={onVerifyToggle}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
