import type { LucideIcon } from "lucide-react";
import { Tag } from "lucide-react";
import { techMap } from "@/constants/tech-map";
import { lucideTagMap } from "@/constants/lucide-tag-map";

export type TagIconResult =
  | { type: "devicon"; className: string }
  | { type: "lucide"; icon: LucideIcon };

/**
 * Resolves a tag/skill name to an icon.
 * Uses Devicon for known tech tags, Lucide fallback for everything else.
 *
 * @example
 * getTagIcon("React")       → { type: "devicon", className: "devicon-react-original colored" }
 * getTagIcon("DSA")         → { type: "lucide", icon: Network }
 * getTagIcon("Unknown Tag") → { type: "lucide", icon: Tag }
 */
export function getTagIcon(name: string): TagIconResult {
  const normalized = name.replace(/[ .]/g, "").toLowerCase();

  const deviconClass = techMap[normalized];
  if (deviconClass) {
    return { type: "devicon", className: `${deviconClass} colored` };
  }

  const lucideIcon = lucideTagMap[normalized];
  if (lucideIcon) {
    return { type: "lucide", icon: lucideIcon };
  }

  return { type: "lucide", icon: Tag };
}

/**
 * Returns true if the given tag name has a Devicon icon mapping.
 */
export function hasDeviconIcon(name: string): boolean {
  const normalized = name.replace(/[ .]/g, "").toLowerCase();
  return normalized in techMap;
}
