"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ApplicationFormBuilder } from "@/components/teams/application-form-builder";
import { updateTeamRequest } from "@/actions/team.actions";
import { updateTeamRequestSchema } from "@/schemas/team.schema";
import type { Tag } from "@/types/resource.types";
import type { ApplicationFormConfig, TeamRequest } from "@/types/team.types";
import { TEAM_CATEGORIES, DIFFICULTY_OPTIONS, MEETING_PREFERENCE_OPTIONS, DEFAULT_APPLICATION_FORM } from "@/constants/team";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUnsavedGuard } from "@/components/ui/unsaved-guard";
import Link from "next/link";

interface TeamEditFormProps {
  team: TeamRequest;
  tags?: Tag[];
  onSuccess?: () => void;
}

type FormErrors = Partial<Record<string, string>>;

export function TeamEditForm({ team, tags: _tags, onSuccess }: TeamEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(team.title);
  const [description, setDescription] = useState(team.description);
  const [projectName, setProjectName] = useState(team.projectName ?? "");
  const [membersNeeded, setMembersNeeded] = useState(team.lookingForCount);
  const [deadline, setDeadline] = useState(
    team.deadline ? new Date(team.deadline).toISOString().split("T")[0] : "",
  );
  const [category, setCategory] = useState(team.category ?? "");
  const [difficulty, setDifficulty] = useState<string>(team.difficulty ?? "");
  const [meetingPreference, setMeetingPreference] = useState<string>(team.meetingPreference ?? "FLEXIBLE");
  const [contactInfo, setContactInfo] = useState(team.contactInfo ?? "");

  const [applicationForm, setApplicationForm] = useState<ApplicationFormConfig>(
    team.applicationForm ?? DEFAULT_APPLICATION_FORM,
  );

  const [selectedSkillIds, setSelectedSkillIds] = useState<TagInputTag[]>(
    team.teamRequestSkills?.map((s) => ({
      id: s.tagId,
      name: s.tag?.name ?? s.tagId,
      slug: s.tag?.slug ?? s.tagId,
    })) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const hasChanges = JSON.stringify({
    title, description, projectName, membersNeeded, deadline,
    category, difficulty, meetingPreference, contactInfo,
    applicationForm,
    skillIds: selectedSkillIds.map((t) => t.id),
  }) !== JSON.stringify({
    title: team.title,
    description: team.description,
    projectName: team.projectName ?? "",
    membersNeeded: team.lookingForCount,
    deadline: team.deadline ? new Date(team.deadline).toISOString().split("T")[0] : "",
    category: team.category ?? "",
    difficulty: team.difficulty ?? "",
    meetingPreference: team.meetingPreference ?? "FLEXIBLE",
    contactInfo: team.contactInfo ?? "",
    applicationForm: team.applicationForm ?? DEFAULT_APPLICATION_FORM,
    skillIds: team.teamRequestSkills?.map((s) => s.tagId) ?? [],
  });

  useUnsavedGuard({
    when: hasChanges && !submitting,
    title: "Discard unsaved changes?",
    description: "You have unsaved changes that will be lost if you leave.",
  });

  const validateField = useCallback(
    (field: string, value: unknown) => {
      try {
        updateTeamRequestSchema.shape[field as keyof typeof updateTeamRequestSchema.shape]?.parse(value);
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      } catch (e: unknown) {
        if (e && typeof e === "object" && "issues" in e) {
          const issues = (e as { issues: Array<{ message: string }> }).issues;
          if (issues.length > 0) {
            setErrors((prev) => ({ ...prev, [field]: issues[0].message }));
          }
        }
      }
    },
    [],
  );

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, getFieldValues()[field as keyof ReturnType<typeof getFieldValues>]);
  };

  function getFieldValues() {
    return {
      title: title.trim(),
      description: description.trim(),
      lookingForCount: membersNeeded,
      projectName: projectName.trim() || undefined,
      category: category || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      difficulty: difficulty || undefined,
      meetingPreference: meetingPreference || undefined,
      contactInfo: contactInfo.trim() || undefined,
      applicationForm,
      skillTagIds: selectedSkillIds.map((t) => t.id),
    };
  }

  async function handleSubmit() {
    setErrors({});

    const values = getFieldValues();
    const parsed = updateTeamRequestSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setTouched(
        Object.keys(fieldErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateTeamRequest(team.id, values);

      if (result.success) {
        toast.success("Team request updated!");
        onSuccess?.();
        if (!onSuccess) {
          router.push(`/teams/${team.id}`);
        }
      } else {
        setErrors({ form: result.message || "Failed to update team request." });
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to update team request.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/teams" className="hover:text-foreground transition-colors">
          Teams
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">Edit Team</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Team Request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your team request details.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur("title")}
          placeholder="e.g., Looking for a Backend Developer"
          maxLength={200}
          disabled={submitting}
          className={cn(errors.title && touched.title && "border-destructive")}
        />
        <div className="flex items-center justify-between">
          {touched.title && errors.title && (
            <p className="text-[11px] text-destructive">{errors.title}</p>
          )}
          <p className="ml-auto text-[10px] text-muted-foreground">{title.length}/200</p>
        </div>
      </div>

      {/* Description (RichTextEditor) */}
      <div className="space-y-1.5">
        <Label>
          Description <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe your project, what you're building, and what kind of teammates you need..."
        />
        {touched.description && errors.description && (
          <p className="text-[11px] text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Project Name */}
      <div className="space-y-1.5">
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., Smart Campus App"
          maxLength={200}
          disabled={submitting}
        />
      </div>

      {/* Members + Deadline */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="membersNeeded">
            Max Team Size <span className="text-destructive">*</span>
          </Label>
          <Input
            id="membersNeeded"
            type="number"
            min={1}
            max={20}
            value={membersNeeded}
            onChange={(e) =>
              setMembersNeeded(Math.max(1, Math.min(20, Number(e.target.value) || 1)))
            }
            onBlur={() => handleBlur("lookingForCount")}
            disabled={submitting}
            className={cn(errors.lookingForCount && touched.lookingForCount && "border-destructive")}
          />
          {touched.lookingForCount && errors.lookingForCount && (
            <p className="text-[11px] text-destructive">{errors.lookingForCount}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={submitting}
          className="h-9 w-full rounded-md border bg-transparent px-2.5 text-sm outline-none ring-1 ring-foreground/10 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {TEAM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty + Meeting Preference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Difficulty Level</Label>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(difficulty === opt.value ? "" : opt.value)}
                disabled={submitting}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  difficulty === opt.value
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Meeting Preference</Label>
          <div className="flex flex-wrap gap-1.5">
            {MEETING_PREFERENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMeetingPreference(opt.value)}
                disabled={submitting}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  meetingPreference === opt.value
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5">
        <Label htmlFor="contactInfo">Contact Information</Label>
        <Input
          id="contactInfo"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Discord, WhatsApp, or other contact info..."
          maxLength={500}
          disabled={submitting}
        />
      </div>

      {/* Application Form */}
      <ApplicationFormBuilder
        value={applicationForm}
        onChange={setApplicationForm}
        disabled={submitting}
      />

      {/* Skills */}
      <TagInput
        value={selectedSkillIds}
        onChange={setSelectedSkillIds}
        maxTags={10}
        minTags={1}
        required
        placeholder="Search for skills..."
        label="Required Skills"
      />

      {/* Global error */}
      {errors.form && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/teams/${team.id}`)}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
