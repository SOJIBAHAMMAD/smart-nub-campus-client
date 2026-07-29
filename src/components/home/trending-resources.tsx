import Link from "next/link";
import { FileText, FileImage, Presentation, File, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import type { Resource } from "@/types/resource.types";

/** Returns a lucide icon based on file type extension. */
function getFileIcon(fileType: string) {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) return FileText;
  if (ext.includes("doc") || ext.includes("word")) return FileText;
  if (ext.includes("ppt") || ext.includes("presentation")) return Presentation;
  if (ext.includes("image") || ext.includes("png") || ext.includes("jpg")) return FileImage;
  return File;
}

interface TrendingResourcesProps {
  resources: Resource[];
  error?: boolean;
}

/** Trending resources section — renders top resources by upvote count (server-fetched). */
export function TrendingResources({ resources, error }: TrendingResourcesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Trending Resources
        </h2>
        <Link
          href="/resources"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {/* ── Error state ───────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Failed to load trending resources.</span>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!error && resources.length === 0 && (
        <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No resources yet. Be the first to upload!
        </p>
      )}

      {/* ── Resource cards ────────────────────────────────────────── */}
      {!error && resources.length > 0 && (
        <div className="space-y-3">
          {resources.map((resource) => {
            const FileIcon = getFileIcon(resource.fileType);
            return (
              <Card key={resource.id} interactive>
                <Link href={`/resources/${resource.id}`} className="contents">
                  <CardContent className="flex items-start gap-3 py-4">
                    {/* File type icon */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileIcon className="size-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {resource.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {resource.course?.code} — {resource.course?.name}
                      </p>

                      {/* Tags */}
                      {resource.resourceTags && resource.resourceTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {resource.resourceTags.slice(0, 3).map((rt) => (
                            <TagPill key={rt.id} name={rt.tag?.name ?? ""} size="xs" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upvote count */}
                    <div className="shrink-0 text-center">
                      <span className="text-sm font-semibold text-foreground">
                        {resource.upvoteCount}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        upvotes
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
