import Link from "next/link";
import {
  FileText,
  FileImage,
  Presentation,
  File,
  AlertTriangle,
  Eye,
  Download,
  ArrowUp,
  Clock,
} from "lucide-react";
import { TagPill } from "@/components/ui/tag-pill";
import { Masonry } from "@/components/ui/masonry";
import ROUTES from "@/constants/routes";
import type { Resource } from "@/types/resource.types";

function getFileIcon(fileType: string) {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) return FileText;
  if (ext.includes("doc") || ext.includes("word")) return FileText;
  if (ext.includes("ppt") || ext.includes("presentation")) return Presentation;
  if (ext.includes("image") || ext.includes("png") || ext.includes("jpg"))
    return FileImage;
  return File;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TrendingResourcesProps {
  resources: Resource[];
  error?: boolean;
}

export function TrendingResources({
  resources,
  error,
}: TrendingResourcesProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load trending resources.</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Trending Resources
          </h2>
          <p className="text-xs text-muted-foreground">
            Popular study materials this week
          </p>
        </div>
        <Link
          href={ROUTES.RESOURCES}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all &rarr;
        </Link>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-12 text-center">
          <FileText className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No resources uploaded yet.
          </p>
        </div>
      ) : (
        <Masonry columns={{ base: 1, sm: 2 }} gap={12}>
          {resources.map((resource) => {
            const FileIcon = getFileIcon(resource.fileType);
            return (
              <Link
                key={resource.id}
                href={ROUTES.RESOURCE(resource.id)}
                className="group block"
              >
                <div className="rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <FileIcon className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {resource.course?.code}
                      </p>
                    </div>
                  </div>

                  {resource.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>
                  )}

                  {resource.resourceTags &&
                    resource.resourceTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {resource.resourceTags.slice(0, 2).map((rt) => (
                          <TagPill
                            key={rt.id}
                            name={rt.tag?.name ?? ""}
                            size="xs"
                            variant="outline"
                          />
                        ))}
                      </div>
                    )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-t border-border/30 pt-3">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="size-3" />
                      {resource.upvoteCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="size-3" />
                      {resource.downloadCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {resource.viewCount}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(resource.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </Masonry>
      )}
    </div>
  );
}
