"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput, type TagInputTag } from "@/components/ui/tag-input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createTeamRequest } from "@/actions/team.actions";
import { createTeamRequestSchema } from "@/schemas/team.schema";
import type { Tag } from "@/types/resource.types";
import { TEAM_CATEGORIES, DIFFICULTY_OPTIONS, MEETING_PREFERENCE_OPTIONS } from "@/constants/team";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUnsavedGuard } from "@/components/ui/unsaved-guard";

interface TeamCreateFormProps {
  tags: Tag[];
}

type FormErrors = Partial<Record<string, string>>;

export function TeamCreateForm({ tags: _tags }: TeamCreateFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [membersNeeded, setMembersNeeded] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [meetingPreference, setMeetingPreference] = useState<string>("FLEXIBLE");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<TagInputTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isDirty =
    title !== "" ||
    description !== "" ||
    projectName !== "" ||
    membersNeeded !== 1 ||
    deadline !== "" ||
    category !== "" ||
    difficulty !== "" ||
    meetingPreference !== "FLEXIBLE" ||
    contactInfo !== "" ||
    selectedSkillIds.length > 0;

  useUnsavedGuard({ when: isDirty });

  const validateField = useCallback(
    (field: string, value: unknown) => {
      try {
        createTeamRequestSchema.shape[field as keyof typeof createTeamRequestSchema.shape]?.parse(value);
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
      skillTagIds: selectedSkillIds.map((t) => t.id),
    };
  }

  async function handleSubmit() {
    setErrors({});

    const values = getFieldValues();
    const parsed = createTeamRequestSchema.safeParse(values);

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
      const result = await createTeamRequest(values);

      if (result.success && result.data) {
        const team = result.data as { id?: string };
        toast.success("Team request created!");
        router.push(team.id ? `/teams/${team.id}` : "/teams");
      } else {
        setErrors({ form: result.message || "Failed to create team request." });
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Failed to create team request.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Team Request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find the right people for your project.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <p className="text-[11px] text-muted-foreground">Choose a descriptive title for your team request</p>
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
        <p className="text-[11px] text-muted-foreground">Explain what you&apos;re looking for in detail (min 10 characters)</p>
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
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Optional: name of the project or course</p>
          <p className="ml-auto text-[10px] text-muted-foreground">{projectName.length}/200</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="membersNeeded">
            Max Team Size <span className="text-destructive">*</span>
          </Label>
          <p className="text-[11px] text-muted-foreground">How many team members do you need? (max 20)</p>
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
          <p className="text-[11px] text-muted-foreground">Optional: set a deadline to create urgency</p>
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
          <p className="text-[11px] text-muted-foreground">Help applicants understand the skill level required</p>
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
          <p className="text-[11px] text-muted-foreground">How will the team collaborate?</p>
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
        <p className="text-[11px] text-muted-foreground">How can applicants reach you? (Discord, WhatsApp, etc.)</p>
        <Input
          id="contactInfo"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Discord, WhatsApp, or other contact info..."
          maxLength={500}
          disabled={submitting}
        />
        <p className="ml-auto text-[10px] text-muted-foreground">{contactInfo.length}/500</p>
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground">Add relevant skills to help teammates find you</p>
        <TagInput
          value={selectedSkillIds}
          onChange={setSelectedSkillIds}
          maxTags={10}
          minTags={1}
          required
          placeholder="Search for skills..."
          label="Required Skills"
        />
      </div>

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
          onClick={() => router.push("/teams")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Create Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
