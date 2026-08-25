"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Pencil,
  Check,
  X,
  Briefcase,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Sparkles,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserRole } from "@/constants/enums";
import {
  updateProfile,
  createEmploymentAction,
  updateEmploymentAction,
  deleteEmploymentAction,
} from "@/actions/profile.actions";
import { getDirectoryMemberAction } from "@/actions/alumni.actions";
import type { EmploymentRecord } from "@/types";

interface ProfileCareerCardProps {
  currentUserId?: string;
  userRole?: string;
  onProfileUpdate: () => void;
}

interface CareerFormState {
  currentEmployer: string;
  jobTitle: string;
  industry: string;
  showInAlumniDirectory: boolean;
  isMentor: boolean;
  mentorshipTopics: string;
}

interface EmploymentFormState {
  employer: string;
  title: string;
  industry: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const EMPTY_CAREER_FORM: CareerFormState = {
  currentEmployer: "",
  jobTitle: "",
  industry: "",
  showInAlumniDirectory: true,
  isMentor: false,
  mentorshipTopics: "",
};

const EMPTY_EMPLOYMENT_FORM: EmploymentFormState = {
  employer: "",
  title: "",
  industry: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatMonthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ProfileCareerCard({
  currentUserId,
  userRole,
  onProfileUpdate,
}: ProfileCareerCardProps) {
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<CareerFormState>(EMPTY_CAREER_FORM);
  const [employment, setEmployment] = useState<EmploymentRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [employmentDialogOpen, setEmploymentDialogOpen] = useState(false);
  const [editingEmployment, setEditingEmployment] = useState<EmploymentRecord | null>(null);
  const [employmentForm, setEmploymentForm] = useState<EmploymentFormState>(
    EMPTY_EMPLOYMENT_FORM,
  );
  const [employmentBusy, setEmploymentBusy] = useState(false);

  const isAlumni = userRole === UserRole.ALUMNI;

  const loadMember = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const result = await getDirectoryMemberAction(currentUserId);
      if (result.success && result.data) {
        const data = result.data as {
          profile?: {
            currentEmployer?: string | null;
            jobTitle?: string | null;
            industry?: string | null;
            showInAlumniDirectory?: boolean;
            isMentor?: boolean;
            mentorshipTopics?: string[];
          } | null;
          alumniEmployment?: EmploymentRecord[];
        };
        const profile = data.profile;
        setCareer({
          currentEmployer: profile?.currentEmployer ?? "",
          jobTitle: profile?.jobTitle ?? "",
          industry: profile?.industry ?? "",
          showInAlumniDirectory: profile?.showInAlumniDirectory ?? true,
          isMentor: profile?.isMentor ?? false,
          mentorshipTopics: (profile?.mentorshipTopics ?? []).join(", "),
        });
        setEmployment(data.alumniEmployment ?? []);
      }
    } catch {
      // Directory unavailable — show editable fields with defaults
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isAlumni) {
      loadMember();
    }
  }, [isAlumni, loadMember]);

  const handleSaveCareer = () => {
    startTransition(async () => {
      const topics = career.mentorshipTopics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      const result = await updateProfile({
        currentEmployer: career.currentEmployer.trim() || undefined,
        jobTitle: career.jobTitle.trim() || undefined,
        industry: career.industry.trim() || undefined,
        showInAlumniDirectory: career.showInAlumniDirectory,
        isMentor: career.isMentor,
        mentorshipTopics: topics,
      });

      if (result.success) {
        setIsEditing(false);
        onProfileUpdate();
        toast.success("Career profile updated.");
      } else {
        toast.error(result.message || "Failed to save career profile.");
      }
    });
  };

  const handleCancelCareer = () => {
    loadMember();
    setIsEditing(false);
  };

  const openEmploymentDialog = (record: EmploymentRecord | null) => {
    setEditingEmployment(record);
    setEmploymentForm(
      record
        ? {
            employer: record.employer,
            title: record.title,
            industry: record.industry ?? "",
            startDate: formatDate(record.startDate),
            endDate: formatDate(record.endDate),
            isCurrent: record.isCurrent,
            description: record.description ?? "",
          }
        : EMPTY_EMPLOYMENT_FORM,
    );
    setEmploymentDialogOpen(true);
  };

  const handleSaveEmployment = () => {
    if (!employmentForm.employer.trim() || !employmentForm.title.trim()) {
      toast.error("Employer and job title are required.");
      return;
    }
    if (!employmentForm.startDate) {
      toast.error("Start date is required.");
      return;
    }

    const startDate = new Date(employmentForm.startDate);
    const endDate = employmentForm.isCurrent
      ? null
      : employmentForm.endDate
        ? new Date(employmentForm.endDate)
        : undefined;

    if (employmentForm.isCurrent) {
      if (employmentForm.endDate) {
        toast.error("End date cannot be set for a current role.");
        return;
      }
    } else if (endDate && endDate <= startDate) {
      toast.error("End date must be after the start date.");
      return;
    }

    setEmploymentBusy(true);
    const payload = {
      employer: employmentForm.employer.trim(),
      title: employmentForm.title.trim(),
      industry: employmentForm.industry.trim() || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : endDate,
      isCurrent: employmentForm.isCurrent,
      description: employmentForm.description.trim() || undefined,
    };

    startTransition(async () => {
      try {
        const result = editingEmployment
          ? await updateEmploymentAction(editingEmployment.id, payload)
          : await createEmploymentAction(payload);
        if (!result.success) {
          toast.error(result.message || "Failed to save employment record.");
          return;
        }
        if (result.data) {
          const saved = result.data as EmploymentRecord;
          setEmployment((prev) =>
            editingEmployment
              ? prev.map((r) => (r.id === saved.id ? saved : r))
              : [saved, ...prev],
          );
        }
        setEmploymentDialogOpen(false);
        onProfileUpdate();
        toast.success(
          editingEmployment
            ? "Employment record updated."
            : "Employment record added.",
        );
      } finally {
        setEmploymentBusy(false);
      }
    });
  };

  const handleDeleteEmployment = (record: EmploymentRecord) => {
    if (!window.confirm("Delete this employment record?")) return;
    setEmploymentBusy(true);
    startTransition(async () => {
      try {
        const result = await deleteEmploymentAction(record.id);
        if (!result.success) {
          toast.error(result.message || "Failed to remove employment record.");
          return;
        }
        setEmployment((prev) => prev.filter((r) => r.id !== record.id));
        onProfileUpdate();
        toast.success("Employment record removed.");
      } finally {
        setEmploymentBusy(false);
      }
    });
  };

  if (!isAlumni) return null;

  return (
    <Card id="section-career">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-4" />
          Career &amp; Experience
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIsEditing(true)}
            aria-label="Edit career profile"
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-5 pb-5 sm:pb-6">
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading career profile...
          </div>
        ) : (
          <>
            {/* ── Career fields ─────────────────────────────────── */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="career-jobTitle">Job title</Label>
                    <Input
                      id="career-jobTitle"
                      value={career.jobTitle}
                      onChange={(e) =>
                        setCareer((prev) => ({ ...prev, jobTitle: e.target.value }))
                      }
                      placeholder="e.g. Software Engineer"
                      disabled={isPending}
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="career-currentEmployer">Current employer</Label>
                    <Input
                      id="career-currentEmployer"
                      value={career.currentEmployer}
                      onChange={(e) =>
                        setCareer((prev) => ({
                          ...prev,
                          currentEmployer: e.target.value,
                        }))
                      }
                      placeholder="e.g. XYZ Ltd."
                      disabled={isPending}
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="career-industry">Industry</Label>
                  <Input
                    id="career-industry"
                    value={career.industry}
                    onChange={(e) =>
                      setCareer((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    placeholder="e.g. Software / IT"
                    disabled={isPending}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Eye className="size-3.5" />
                    Alumni directory preferences
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Show in alumni directory
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Other students and alumni can find you. Contact details are
                        never shown.
                      </p>
                    </div>
                    <Switch
                      checked={career.showInAlumniDirectory}
                      onCheckedChange={(checked) =>
                        setCareer((prev) => ({
                          ...prev,
                          showInAlumniDirectory: checked,
                        }))
                      }
                      disabled={isPending}
                      aria-label="Show in alumni directory"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Sparkles className="size-3.5 text-amber-500" />
                        Available as a mentor
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Students can reach out to you for guidance.
                      </p>
                    </div>
                    <Switch
                      checked={career.isMentor}
                      onCheckedChange={(checked) =>
                        setCareer((prev) => ({ ...prev, isMentor: checked }))
                      }
                      disabled={isPending}
                      aria-label="Available as a mentor"
                    />
                  </div>

                  {career.isMentor && (
                    <div className="space-y-1.5">
                      <Label htmlFor="career-topics">Mentorship topics</Label>
                      <Input
                        id="career-topics"
                        value={career.mentorshipTopics}
                        onChange={(e) =>
                          setCareer((prev) => ({
                            ...prev,
                            mentorshipTopics: e.target.value,
                          }))
                        }
                        placeholder="Comma-separated, e.g. Career planning, CV review, CSE"
                        disabled={isPending}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        Up to 10 topics, comma-separated.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelCareer}
                    disabled={isPending}
                  >
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveCareer} disabled={isPending}>
                    <Check className="size-3.5" />
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {career.jobTitle || career.currentEmployer ? (
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <Briefcase className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {[career.jobTitle, career.currentEmployer]
                        .filter(Boolean)
                        .join(" at ")}
                    </span>
                  </p>
                ) : (
                  <p className="text-muted-foreground/60">
                    Add your current job title and employer.
                  </p>
                )}
                {career.industry && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="size-3.5 shrink-0" />
                    {career.industry}
                  </p>
                )}
              </div>
            )}

            {/* ── Employment records ────────────────────────────── */}
            <div className="border-t border-border/50 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Experience</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => openEmploymentDialog(null)}
                >
                  <Plus className="size-3.5" />
                  Add role
                </Button>
              </div>

              {employment.length > 0 ? (
                <ul className="space-y-3">
                  {employment.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                          {record.title}
                          {record.isCurrent && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {record.employer}
                          {record.industry ? ` \u00b7 ${record.industry}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatMonthYear(record.startDate) ?? "Unknown"} {"\u2013"}{" "}
                          {record.isCurrent
                            ? "Present"
                            : formatMonthYear(record.endDate) ?? "Unknown"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEmploymentDialog(record)}
                          aria-label={`Edit ${record.title} at ${record.employer}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteEmployment(record)}
                          disabled={employmentBusy}
                          aria-label={`Delete ${record.title} at ${record.employer}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground/60">
                  No employment history yet. Add your roles to build your alumni
                  profile.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* ── Employment dialog ──────────────────────────────────── */}
      <Dialog
        open={employmentDialogOpen}
        onOpenChange={setEmploymentDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployment ? "Edit role" : "Add role"}
            </DialogTitle>
            <DialogDescription>
              Add a job or role to your career history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="emp-title">Job title *</Label>
                <Input
                  id="emp-title"
                  value={employmentForm.title}
                  onChange={(e) =>
                    setEmploymentForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Software Engineer"
                  maxLength={200}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-employer">Employer *</Label>
                <Input
                  id="emp-employer"
                  value={employmentForm.employer}
                  onChange={(e) =>
                    setEmploymentForm((prev) => ({
                      ...prev,
                      employer: e.target.value,
                    }))
                  }
                  placeholder="e.g. XYZ Ltd."
                  maxLength={200}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-industry">Industry</Label>
              <Input
                id="emp-industry"
                value={employmentForm.industry}
                onChange={(e) =>
                  setEmploymentForm((prev) => ({
                    ...prev,
                    industry: e.target.value,
                  }))
                }
                placeholder="e.g. Software / IT"
                maxLength={100}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="emp-start">Start date *</Label>
                <Input
                  id="emp-start"
                  type="date"
                  value={employmentForm.startDate}
                  onChange={(e) =>
                    setEmploymentForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-end">End date</Label>
                <Input
                  id="emp-end"
                  type="date"
                  value={employmentForm.endDate}
                  onChange={(e) =>
                    setEmploymentForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  disabled={employmentForm.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div>
                <Label htmlFor="emp-current" className="text-sm font-medium">
                  I currently work here
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marks this role as present.
                </p>
              </div>
              <Switch
                id="emp-current"
                checked={employmentForm.isCurrent}
                onCheckedChange={(checked) =>
                  setEmploymentForm((prev) => ({
                    ...prev,
                    isCurrent: checked,
                    endDate: checked ? "" : prev.endDate,
                  }))
                }
                aria-label="I currently work here"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emp-description">Description</Label>
              <Textarea
                id="emp-description"
                value={employmentForm.description}
                onChange={(e) =>
                  setEmploymentForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What did you work on? (optional)"
                maxLength={1000}
                className="min-h-20 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmploymentDialogOpen(false)}
              disabled={employmentBusy}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEmployment} disabled={employmentBusy}>
              {employmentBusy ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
