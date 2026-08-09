"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { BookOpen, CalendarDays, GraduationCap, MessageCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CourseCreateDialog } from "./course-create-dialog";
import type { AdminCourse } from "@/types/admin.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: string): string {
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CoursesTabProps {
  /** Increments when the header "Add Course" button is pressed. */
  createSignal: number;
  onCountChange: (count: number) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CoursesTab({ createSignal, onCountChange }: CoursesTabProps) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listCourses(1, 100);
      setCourses(result.data);
      onCountChange(result.data.length);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (createSignal > 0) setShowCreate(true);
  }, [createSignal]);

  const handleCreate = async (values: {
    code: string;
    name: string;
    department: string;
    semester?: number;
    description?: string;
  }) => {
    try {
      await adminService.createCourse({
        code: values.code,
        name: values.name,
        department: values.department,
        semester: values.semester,
        description: values.description,
      });
      toast.success("Course created successfully");
      setShowCreate(false);
      void fetchCourses();
    } catch {
      toast.error("Failed to create course");
      throw new Error("Failed to create course");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteCourse(deleteTarget.id);
      toast.success("Course deleted successfully");
      setDeleteTarget(null);
      void fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Empty className="border border-dashed bg-card/60">
          <EmptyMedia variant="icon">
            <GraduationCap className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No courses yet</EmptyTitle>
            <EmptyDescription>
              Create your first course so students can attach resources and discussions to it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus data-icon="inline-start" />
              Add your first course
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4">Course</TableHead>
                <TableHead className="px-4">Department</TableHead>
                <TableHead className="px-4">Semester</TableHead>
                <TableHead className="px-4">Created</TableHead>
                <TableHead className="px-4 text-right">Resources</TableHead>
                <TableHead className="px-4 text-right">Discussions</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  <TableCell className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {course.name}
                      </p>
                      <p className="mt-0.5">
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px] tracking-wide"
                        >
                          {course.code}
                        </Badge>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-foreground">
                    {course.department}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {course.semester ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-muted-foreground/70" />
                      {formatDate(course.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="inline-flex items-center justify-end gap-1.5 text-sm tabular-nums text-muted-foreground">
                      <BookOpen className="size-3.5 text-muted-foreground/70" />
                      {course._count.resources ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="inline-flex items-center justify-end gap-1.5 text-sm tabular-nums text-muted-foreground">
                      <MessageCircle className="size-3.5 text-muted-foreground/70" />
                      {course._count.discussions ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(course)}
                      aria-label={`Delete ${course.name}`}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CourseCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Course"
        description="This will fail if the course has associated resources or discussions."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
