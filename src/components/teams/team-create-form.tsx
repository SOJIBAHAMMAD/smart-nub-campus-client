"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagPill } from "@/components/ui/tag-pill";
import { createTeamRequest } from "@/actions/team.actions";
import type { Tag } from "@/types/resource.types";
import { TEAM_CATEGORIES } from "@/constants/team";
import { toast } from "sonner";

interface TeamCreateFormProps {
  /** Available skill tags for the multi-select. */
  tags: Tag[];
}

/**
 * Form to create a new team request.
 * Fields: title, description, project name, members needed, deadline, category, skills.
 * Skills are selected from existing tags (searchable multi-select). Submit validates
 * and redirects to the new team detail page.
 */
export function TeamCreateForm({ tags }: TeamCreateFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [membersNeeded, setMembersNeeded] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tags by search input (client side)
  const filteredTags = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, skillSearch]);

  const selectedTags = tags.filter((t) => selectedSkillIds.includes(t.id));

  function toggleSkill(id: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (title.length > 200) {
      setError("Title must be at most 200 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (membersNeeded < 1 || membersNeeded > 20) {
      setError("Members needed must be between 1 and 20.");
      return;
    }
    if (selectedSkillIds.length === 0) {
      setError("Please select at least one skill.");
      return;
    }

    // Validate deadline is a future date
    let deadlineISO: string | undefined;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (Number.isNaN(deadlineDate.getTime())) {
        setError("Invalid deadline date.");
        return;
      }
      if (deadlineDate.getTime() <= Date.now()) {
        setError("Deadline must be a future date.");
        return;
      }
      deadlineISO = deadlineDate.toISOString();
    }

    setSubmitting(true);
    try {
      const result = await createTeamRequest({
        title: title.trim(),
        description: description.trim(),
        lookingForCount: membersNeeded,
        projectName: projectName.trim() || undefined,
        category: category || undefined,
        deadline: deadlineISO,
        skillTagIds: selectedSkillIds,
      });

      if (result.success && result.data) {
        const team = result.data as { id?: string };
        toast.success("Team request created successfully!");
        router.push(team.id ? `/teams/${team.id}` : "/teams");
      } else {
        const fieldError = result.errorSources?.[0]?.message;
        setError(fieldError || result.message || "Failed to create team request.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Team Request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a request to find teammates with the right skills.
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
          placeholder="e.g., Looking for Backend Developer"
          maxLength={200}
          disabled={submitting}
        />
        <p className="text-[10px] text-muted-foreground">{title.length}/200</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project and what you're looking for..."
          rows={4}
          maxLength={2000}
          disabled={submitting}
          className="w-full resize-none rounded-md border bg-transparent px-2.5 py-1.5 text-sm outline-none ring-1 ring-foreground/10 transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
        />
        <p className="text-[10px] text-muted-foreground">{description.length}/2000</p>
      </div>

      {/* Project Name */}
      <div className="space-y-1.5">
        <Label htmlFor="projectName">Project Name (optional)</Label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., Smart Campus App"
          maxLength={200}
          disabled={submitting}
        />
      </div>

      {/* Max Team Size + Deadline */}
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
            disabled={submitting}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deadline">Deadline (optional)</Label>
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
        <Label htmlFor="category">Category (optional)</Label>
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

      {/* Required Skills */}
      <div className="space-y-1.5">
        <Label>
          Required Skills <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <TagPill
              key={tag.id}
              name={tag.name}
              variant="brand"
              removable
              onRemove={() => toggleSkill(tag.id)}
            />
          ))}
        </div>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              onFocus={() => setShowSkillDropdown(true)}
              onBlur={() => setTimeout(() => setShowSkillDropdown(false), 150)}
              placeholder="Search skills..."
              className="h-9 pl-9"
              disabled={submitting}
            />
          </div>
          {showSkillDropdown && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-card p-1 shadow-lg ring-1 ring-foreground/10">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => {
                  const active = selectedSkillIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleSkill(tag.id);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      <span className="truncate">{tag.name}</span>
                      {active && <Check className="size-3.5 text-primary" />}
                    </button>
                  );
                })
              ) : (
                <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
                  No matching skills.
                </p>
              )}
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Select at least one skill. {selectedSkillIds.length} selected.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
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
