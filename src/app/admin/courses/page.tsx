"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import type { AdminCourse } from "@/types/admin.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "courses" | "resource-categories" | "discussion-categories" | "question-categories";

const tabs: { key: Tab; label: string }[] = [
  { key: "courses", label: "Courses" },
  { key: "resource-categories", label: "Resource Categories" },
  { key: "discussion-categories", label: "Discussion Categories" },
  { key: "question-categories", label: "Question Categories" },
];

// ── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", department: "CSE", semester: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.listCourses(1, 100);
      setCourses(result.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreate = async () => {
    if (!form.code || !form.name) {
      toast.error("Code and name are required");
      return;
    }
    try {
      await adminService.createCourse({
        code: form.code,
        name: form.name,
        department: form.department,
        semester: form.semester ? Number(form.semester) : undefined,
        description: form.description || undefined,
      });
      toast.success("Course created");
      setShowCreate(false);
      setForm({ code: "", name: "", department: "CSE", semester: "", description: "" });
      fetchCourses();
    } catch {
      toast.error("Failed to create course");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteCourse(id);
      toast.success("Course deleted");
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="size-4 mr-1" /> Add Course
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Semester</th>
              <th className="px-4 py-3 font-medium">Resources</th>
              <th className="px-4 py-3 font-medium">Discussions</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3">
                  <Badge variant="secondary">{course.code}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{course.name}</td>
                <td className="px-4 py-3 text-sm">{course.department}</td>
                <td className="px-4 py-3 text-sm">{course.semester ?? "—"}</td>
                <td className="px-4 py-3 text-sm">{course._count.resources}</td>
                <td className="px-4 py-3 text-sm">{course._count.discussions}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setDeleteTarget(course.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
            <DialogDescription>Create a new course entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input placeholder="e.g. CSE101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Intro to Programming" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(val) => setForm({ ...form, department: val ?? "CSE" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["CSE", "ECSE", "EEE", "BBA", "MBA", "ENGLISH", "MAE", "CIVIL"].map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Input type="number" placeholder="e.g. 1" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Course"
        description="This will fail if the course has associated resources or discussions."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
      />
    </div>
  );
}

// ── Generic Category Tab ─────────────────────────────────────────────────────

interface CategoryTabProps<T extends { id: string; name: string; slug: string; _count: Record<string, number> }> {
  fetcher: () => Promise<{ data: T[] }>;
  creator: (data: { name: string; icon?: string }) => Promise<T>;
  deleter: (id: string) => Promise<void>;
  countKey: string;
  createLabel: string;
}

function CategoryTab<T extends { id: string; name: string; slug: string; _count: Record<string, number> }>({
  fetcher,
  creator,
  deleter,
  countKey,
  createLabel,
}: CategoryTabProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      setItems(result.data);
    } catch {
      toast.error(`Failed to load ${createLabel.toLowerCase()}s`);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, createLabel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await creator({ name: name.trim() });
      toast.success(`${createLabel} created`);
      setShowCreate(false);
      setName("");
      fetchData();
    } catch {
      toast.error(`Failed to create ${createLabel.toLowerCase()}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleter(id);
      toast.success(`${createLabel} deleted`);
      fetchData();
    } catch {
      toast.error(`Failed to delete ${createLabel.toLowerCase()}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="size-4 mr-1" /> Add {createLabel}
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-700/50 text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Count</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{item.slug}</td>
                <td className="px-4 py-3 text-sm">{item._count[countKey] ?? 0}</td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => setDeleteTarget(item.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No {createLabel.toLowerCase()}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add {createLabel}</DialogTitle>
            <DialogDescription>Create a new {createLabel.toLowerCase()} category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder={`e.g. ${createLabel} Name`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete ${createLabel}`}
        description={`Are you sure you want to delete this ${createLabel.toLowerCase()}?`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget); }}
      />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courses &amp; Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage courses, resource categories, discussion categories, and question categories
        </p>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      {activeTab === "courses" && <CoursesTab />}

      {activeTab === "resource-categories" && (
        <CategoryTab
          fetcher={() => adminService.listResourceCategories()}
          creator={(data) => adminService.createResourceCategory(data)}
          deleter={(id) => adminService.deleteResourceCategory(id)}
          countKey="resources"
          createLabel="Resource Category"
        />
      )}

      {activeTab === "discussion-categories" && (
        <CategoryTab
          fetcher={() => adminService.listDiscussionCategories()}
          creator={(data) => adminService.createDiscussionCategory(data)}
          deleter={(id) => adminService.deleteDiscussionCategory(id)}
          countKey="discussions"
          createLabel="Discussion Category"
        />
      )}

      {activeTab === "question-categories" && (
        <CategoryTab
          fetcher={() => adminService.listQuestionCategories()}
          creator={(data) => adminService.createQuestionCategory(data)}
          deleter={(id) => adminService.deleteQuestionCategory(id)}
          countKey="questions"
          createLabel="Question Category"
        />
      )}
    </div>
  );
}
