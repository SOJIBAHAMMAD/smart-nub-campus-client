"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagPill } from "@/components/ui/tag-pill";
import { useTags } from "@/hooks/use-tags";
import { addSkill, removeSkill } from "@/actions/profile.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProfileUser, ProfileSkill } from "@/types/profile.types";

interface ProfileSkillsCardProps {
  profileData: ProfileUser;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

export function ProfileSkillsCard({ profileData, isOwnProfile, onProfileUpdate }: ProfileSkillsCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { filteredTags, createTag: createTagAction } = useTags();
  const skills = profileData.skills ?? [];

  const suggestions = filteredTags.filter(
    (tag) => !skills.some((s) => s.id === tag.id),
  );

  const filteredSuggestions = search.trim()
    ? suggestions.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      )
    : suggestions;

  const exactMatch = filteredSuggestions.find(
    (t) => t.name.toLowerCase() === search.trim().toLowerCase(),
  );

  const handleAdd = useCallback(
    (tagId: string, tagName: string) => {
      startTransition(async () => {
        const result = await addSkill(tagId);
        if (result.success) {
          setSearch("");
          toast.success(`Added "${tagName}"`);
          onProfileUpdate();
        } else {
          toast.error(result.message || "Failed to add skill");
        }
      });
    },
    [onProfileUpdate],
  );

  const handleRemove = useCallback(
    (userSkillId: string, tagName: string) => {
      startTransition(async () => {
        const result = await removeSkill(userSkillId);
        if (result.success) {
          toast.success(`Removed "${tagName}"`);
          onProfileUpdate();
        } else {
          toast.error(result.message || "Failed to remove skill");
        }
      });
    },
    [onProfileUpdate],
  );

  const handleCreateAndAdd = useCallback(
    async (tagName: string) => {
      try {
        const created = await createTagAction(tagName);
        handleAdd(created.id, created.name);
      } catch {
        toast.error("Failed to create skill");
      }
    },
    [createTagAction, handleAdd],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      if (exactMatch) {
        handleAdd(exactMatch.id, exactMatch.name);
      } else {
        handleCreateAndAdd(search.trim());
      }
    }
  };

  return (
    <Card id="section-skills">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Skills
          {skills.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {skills.length}
            </Badge>
          )}
        </CardTitle>
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => {
              setIsAdding(!isAdding);
              setSearch("");
            }}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3" />
            {isAdding ? "Done" : "Add"}
          </button>
        )}
      </CardHeader>
      <CardContent className="pb-5 sm:pb-6">
        {/* Skills list */}
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill: ProfileSkill) => (
              <TagPill
                key={skill.id}
                name={skill.name}
                variant="brand"
                size="sm"
                removable={isOwnProfile}
                onRemove={
                  isOwnProfile
                    ? () => handleRemove(skill.userSkillId, skill.name)
                    : undefined
                }
              />
            ))}
          </div>
        ) : !isAdding ? (
          <p className="text-sm text-muted-foreground/60">
            {isOwnProfile
              ? "Add skills to help others discover your expertise."
              : "No skills added yet."}
          </p>
        ) : null}

        {/* Inline tag picker */}
        {isOwnProfile && isAdding && (
          <div ref={containerRef} className="mt-3 space-y-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors",
                "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
                "border-border/60",
              )}
            >
              {isPending && (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or create a skill..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            {filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {filteredSuggestions.slice(0, 20).map((tag) => (
                  <TagPill
                    key={tag.id}
                    name={tag.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdd(tag.id, tag.name)}
                    className="cursor-pointer"
                  />
                ))}
              </div>
            )}

            {search.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleCreateAndAdd(search.trim())}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Press Enter or click to create &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
