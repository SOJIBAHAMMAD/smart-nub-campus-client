"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { ResourceDetail } from "@/components/resources/resource-detail";
import { getResource } from "@/actions/resource.actions";
import type { Resource } from "@/types/resource.types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

/** Loading skeleton for the resource detail page. */
function ResourceDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:space-y-8">
      {/* Breadcrumb */}
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />

      {/* Resource Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted sm:size-14" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-0.5">
          <div className="size-7 animate-pulse rounded bg-muted" />
          <div className="min-w-7 h-5 animate-pulse rounded bg-muted" />
          <div className="size-7 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>

      {/* Info Card */}
      <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/5 sm:p-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* File Preview */}
      <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/5 sm:p-5">
        <div className="mb-3 h-4 w-10 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3 ring-1 ring-foreground/5 sm:gap-4 sm:p-4">
          <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted sm:size-12" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Related Resources */}
      <div className="space-y-3">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border p-3 ring-1 ring-foreground/5"
            >
              <div className="size-8 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Resource detail page — full-width layout (no PageLayout sidebars).
 * Loads resource by ID from URL params and renders ResourceDetail component.
 */
export default function ResourceDetailPage() {
  const params = useParams();
  const resourceId = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchResource() {
      try {
        const result = await getResource(resourceId);
        if (!cancelled) {
          if (result.success && result.data) {
            const data = result.data as { data?: Resource };
            setResource(data.data ?? (result.data as Resource));
          } else {
            setError(result.message || "Resource not found.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load resource.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchResource();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  if (loading) {
    return <ResourceDetailSkeleton />;
  }

  if (error || !resource) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
          <FileQuestion className="size-8 text-muted-foreground/60" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-foreground">
          Resource not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The resource you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </p>
        <div className="mt-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/resources" />}>
                  <BreadcrumbPage>Resources</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Not found</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          variant="outline"
          className="mt-6"
          render={<Link href="/resources" />}
          nativeButton={false}
        >
          Browse Resources
        </Button>
      </div>
    );
  }

  return <ResourceDetail resource={resource} />;
}
