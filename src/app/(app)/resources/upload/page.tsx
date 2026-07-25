import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resourceService } from "@/services/resource.service";
import { ResourceUploadForm } from "@/components/resources/resource-upload-form";
import type { ResourceCourse, ResourceCategory } from "@/types/resource.types";

/**
 * Resource upload page — Server Component.
 * Fetches courses and categories on the server for form dropdowns.
 */
export default async function ResourceUploadPage() {
  let courses: ResourceCourse[] = [];
  let categories: ResourceCategory[] = [];

  try {
    const [coursesResult, categoriesResult] = await Promise.all([
      resourceService.listCourses(),
      resourceService.listCategories(),
    ]);
    courses = (coursesResult as unknown as ResourceCourse[]) ?? [];
    categories = (categoriesResult as unknown as ResourceCategory[]) ?? [];
  } catch {
    // Form will have empty dropdowns — user can still fill other fields
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6">
        <Link
          href="/resources"
          className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Resources
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Upload Resource
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share study materials with the NUB community.
          </p>
        </div>

        <ResourceUploadForm courses={courses} categories={categories} />
      </div>
    </div>
  );
}
