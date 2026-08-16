import type { LucideIcon } from "lucide-react";
import { Tag } from "lucide-react";
import { techMap } from "@/constants/tech-map";
import { lucideTagMap } from "@/constants/lucide-tag-map";

/**
 * Normalizes a tag/skill name for icon lookup.
 * Lowercases and strips whitespace, dots, and hyphens so names like
 * "Data Structures", "Node.js", and "Machine Learning" resolve to the
 * same key as their map entries ("data-structures", "nodejs", "machine-learning").
 */
const normalize = (name: string) => name.toLowerCase().replace(/[\s.\-]/g, "");

const normalizedLucideTagMap = Object.fromEntries(
  Object.entries(lucideTagMap).map(([key, icon]) => [normalize(key), icon]),
) as Record<string, LucideIcon>;

export type TagIconResult =
  | { type: "devicon"; className: string }
  | { type: "lucide"; icon: LucideIcon };

/**
 * Resolves a tag/skill name to an icon.
 * Uses Devicon for known tech tags, Lucide fallback for everything else.
 *
 * @example
 * getTagIcon("React")            → { type: "devicon", className: "devicon-react-original colored" }
 * getTagIcon("DSA")              → { type: "lucide", icon: Network }
 * getTagIcon("Data Structures")  → { type: "lucide", icon: Network }
 * getTagIcon("Unknown Tag")      → { type: "lucide", icon: Tag }
 */
export function getTagIcon(name: string): TagIconResult {
  const normalized = normalize(name);

  const deviconClass = techMap[normalized];
  if (deviconClass) {
    return { type: "devicon", className: `${deviconClass} colored` };
  }

  const lucideIcon = normalizedLucideTagMap[normalized];
  if (lucideIcon) {
    return { type: "lucide", icon: lucideIcon };
  }

  return { type: "lucide", icon: Tag };
}

/**
 * Returns true if the given tag name has a Devicon icon mapping.
 */
export function hasDeviconIcon(name: string): boolean {
  return normalize(name) in techMap;
}
