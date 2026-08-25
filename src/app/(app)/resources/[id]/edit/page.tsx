import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { resourceService } from "@/services/resource.service";
import { ResourceEditForm } from "@/components/resources/resource-edit-form";
import type {
  Resource,
  ResourceCourse,
  ResourceCategory,
} from "@/types/resource.types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let resource: Resource | null = null;
  let courses: ResourceCourse[] = [];
  let categories: ResourceCategory[] = [];

  try {
    const [resResult, coursesResult, categoriesResult] = await Promise.all([
      resourceService.getResourceById(id),
      resourceService.listCourses(),
      resourceService.listCategories(),
    ]);

    resource = (resResult as unknown as Resource) ?? null;
    courses = (coursesResult as unknown as ResourceCourse[]) ?? [];
    categories = (categoriesResult as unknown as ResourceCategory[]) ?? [];
  } catch {
    // resource will be null → error state below
  }

  if (!resource) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
            <FileQuestion className="size-8 text-muted-foreground/60" />
          </div>
          <h1 className="mt-5 text-lg font-semibold text-foreground">
            Resource not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The resource you&apos;re trying to edit doesn&apos;t exist or you
            don&apos;t have permission.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            render={<Link href="/resources" />}
            nativeButton={false}
          >
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/resources" />}>
                Resources
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link href={`/resources/${resource.id}`}>
                    {resource.title}
                  </Link>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-foreground">Edit Resource</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the title, description, category, or tags.
          </p>
        </div>

        <ResourceEditForm
          resource={resource}
          courses={courses}
          categories={categories}
        />
      </div>
    </div>
  );
}
