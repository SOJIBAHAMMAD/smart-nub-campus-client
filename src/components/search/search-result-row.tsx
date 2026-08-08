"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { SEARCH_ENTITY_CONFIG } from "./search-entity-config";
import { searchClientService } from "@/services/search.client.service";
import type { SearchResultItem } from "@/types/search.types";

interface SearchResultRowProps {
  item: SearchResultItem;
  query: string;
  /** Render a richer variant for the "Best match" highlight. */
  bestMatch?: boolean;
}

/** Strip HTML fragments that ts_headline may have inserted. */
function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

function metaParts(item: SearchResultItem): string[] {
  const d = item.data as Record<string, unknown>;
  const parts: string[] = [];
  if (item.subtitle) parts.push(item.subtitle);

  const author = d.authorName as string | undefined;
  if (author) parts.push(author);

  const course = d.course as
    | { code?: string; name?: string }
    | string
    | undefined;
  if (typeof course === "string") {
    parts.push(course);
  } else if (course && (course.code || course.name)) {
    parts.push([course.code, course.name].filter(Boolean).join(" · "));
  } else if (typeof d.courseName === "string") {
    parts.push(d.courseName);
  }

  const department = d.department as string | undefined;
  if (department) parts.push(department);

  const location = d.location as string | undefined;
  if (location) parts.push(location);

  const semester = d.semester as string | number | undefined;
  if (semester !== undefined && semester !== null) {
    parts.push(`Semester ${semester}`);
  }

  return parts;
}

export function SearchResultRow({
  item,
  query,
  bestMatch = false,
}: SearchResultRowProps) {
  const config = SEARCH_ENTITY_CONFIG[item.type];
  const Icon = config?.icon;
  const route = config?.buildRoute(item);
  const meta = metaParts(item);
  const time = item.createdAt
    ? formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true })
    : null;

  if (!route) return null;

  return (
    <Link
      href={route}
      onClick={() => {
        void searchClientService.recordClick({
          query,
          entity: item.type,
          resultId: item.id,
          position: item.rank,
        });
      }}
      className="group block"
      aria-label={`${item.title ?? item.subtitle ?? "Untitled"} — ${config?.pluralLabel ?? item.type}`}
    >
      <div
        className={
          bestMatch
            ? "flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
            : "flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/60"
        }
      >
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-foreground/70" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate text-sm font-semibold group-hover:text-primary">
              {item.title ?? item.subtitle ?? "Untitled"}
            </h3>
            <span className="shrink-0 text-xs text-muted-foreground">
              {config?.label}
            </span>
          </div>
          {item.snippet && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {stripTags(item.snippet)}
            </p>
          )}
          {(meta.length > 0 || time) && (
            <p className="mt-1 truncate text-xs text-muted-foreground/80">
              {meta.join(" · ")}
              {meta.length > 0 && time ? " · " : ""}
              {time ?? ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
