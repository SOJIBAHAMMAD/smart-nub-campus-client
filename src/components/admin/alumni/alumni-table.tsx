"use client";

import { GraduationCap, Loader2, Undo2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MentorStatusBadge } from "./mentor-status-badge";
import type { AdminAlumni } from "@/types/admin.types";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AlumniTableProps {
  alumni: AdminAlumni[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  revertingId: string | null;
  onRequestRevert: (id: string) => void;
  onClearFilters: () => void;
}

/** Map a raw department code to a display code or a fallback dash. */
function departmentCode(department: string | null): string {
  return department ?? "—";
}

/** Resolve the human-readable department label when one exists. */
function departmentLabel(department: string | null): string {
  if (!department) return "—";
  return DEPARTMENT_LABELS[department as Department] ?? department;
}

function tableHead() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="min-w-56">Alumni</TableHead>
        <TableHead>Department</TableHead>
        <TableHead className="min-w-40">Career</TableHead>
        <TableHead>Graduated</TableHead>
        <TableHead>Role</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function tableSkeleton() {
  return (
    <TableBody>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14 rounded-full" />
          </TableCell>
          <TableCell>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-3.5 w-16" />
          </TableCell>
          <TableCell>
            <div className="flex flex-col items-start gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function emptyState(hasActiveFilters: boolean, onClearFilters: () => void) {
  return (
    <Empty className="rounded-xl border border-dashed bg-background">
      <EmptyMedia variant="icon">
        <GraduationCap className="size-6" />
      </EmptyMedia>
      <EmptyContent>
        <EmptyTitle>
          {hasActiveFilters
            ? "No alumni match your filters"
            : "No alumni yet"}
        </EmptyTitle>
        <EmptyDescription>
          {hasActiveFilters
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Graduated students will appear here after their transition."}
        </EmptyDescription>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

/**
 * Alumni table with skeleton loading rows, a helpful empty state and the
 * row-level "revert to student" action. Scrolls horizontally on small
 * screens via the table wrapper.
 */
export function AlumniTable({
  alumni,
  isLoading,
  hasActiveFilters,
  revertingId,
  onRequestRevert,
  onClearFilters,
}: AlumniTableProps) {
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="rounded-xl border bg-background">
          <Table>
            {tableHead()}
            {tableSkeleton()}
          </Table>
        </div>
      </TooltipProvider>
    );
  }

  if (alumni.length === 0) {
    return emptyState(hasActiveFilters, onClearFilters);
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border bg-background">
        <Table>
          {tableHead()}
          <TableBody>
            {alumni.map((entry) => {
              const gradYear = entry.student?.graduationYear;
              const isVisible = Boolean(entry.profile?.showInAlumniDirectory);
              const isReverting = revertingId === entry.id;

              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        id={entry.id}
                        name={entry.name}
                        src={entry.image}
                        className="size-9"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {entry.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {entry.student?.department ? (
                      <Badge
                        variant="outline"
                        title={departmentLabel(entry.student.department)}
                        className="max-w-32 truncate font-normal text-muted-foreground"
                      >
                        {departmentCode(entry.student.department)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-foreground">
                      {entry.profile?.jobTitle ?? "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.profile?.currentEmployer ?? "—"}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {gradYear
                        ? `${gradYear}${
                            entry.student?.graduationSemester
                              ? ` · ${entry.student.graduationSemester}`
                              : ""
                          }`
                        : "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-1.5">
                      <MentorStatusBadge
                        isMentor={Boolean(entry.profile?.isMentor)}
                      />
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 rounded-full",
                            isVisible
                              ? "bg-emerald-500"
                              : "bg-muted-foreground/40",
                          )}
                        />
                        {isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRequestRevert(entry.id)}
                            disabled={isReverting}
                            aria-label={`Revert ${entry.name} to student`}
                            className="text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        {isReverting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Undo2 className="size-4" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>Revert to student</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
