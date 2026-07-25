"use client";

import { TagPill } from "@/components/ui/tag-pill";

interface PopularSkillsProps {
  skills: { id: string; name: string; slug: string; count?: number }[];
  onSelect?: (id: string) => void;
  active?: string[];
}

/**
 * Clickable skill chips for skills-based people discovery.
 */
export function PopularSkills({
  skills,
  onSelect,
  active = [],
}: PopularSkillsProps) {
  if (skills.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No popular skills yet.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => {
        const isActive = active.includes(skill.id);
        return (
          <TagPill
            key={skill.id}
            name={skill.name}
            active={isActive}
            onClick={() => onSelect?.(skill.id)}

          />
        );
      })}
    </div>
  );
}
