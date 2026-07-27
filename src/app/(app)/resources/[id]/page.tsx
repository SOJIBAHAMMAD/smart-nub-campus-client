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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      <div className="flex items-start gap-4">
        <div className="size-14 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
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
        >
          Browse Resources
        </Button>
      </div>
    );
  }

  return <ResourceDetail resource={resource} />;
}
