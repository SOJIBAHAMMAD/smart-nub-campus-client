import Link from "next/link";
import { resourceService } from "@/services/resource.service";
import { ResourceUploadForm } from "@/components/resources/resource-upload-form";
import type { ResourceCourse, ResourceCategory } from "@/types/resource.types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href="/resources" />}
                className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
              >
                Resources
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Upload Resource</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 mt-4">
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
