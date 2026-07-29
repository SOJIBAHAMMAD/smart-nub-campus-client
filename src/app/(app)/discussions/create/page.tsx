import Link from "next/link";
import { discussionService } from "@/services/discussion.service";
import { resourceService } from "@/services/resource.service";
import { DiscussionCreateForm } from "@/components/discussions/discussion-create-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Tag } from "@/types/resource.types";
import type { DiscussionCategory } from "@/types/discussion.types";

/**
 * Create Discussion page.
 * Full-width layout (no PageLayout). Fetches categories, tags, and courses
 * for the create form.
 */
export default async function CreateDiscussionPage() {
  let categories: (DiscussionCategory & { _count: { discussions: number } })[] = [];
  let tags: Tag[] = [];
  let courses: { id: string; code: string; name: string }[] = [];

  try {
    const [categoriesResult, tagsResult, coursesResult] = await Promise.all([
      discussionService.listCategories(),
      discussionService.listTags(),
      resourceService.listCourses(),
    ]);

    categories = (categoriesResult as unknown as (DiscussionCategory & { _count: { discussions: number } })[]) ?? [];
    tags = (tagsResult as unknown as Tag[]) ?? [];
    courses = (coursesResult as unknown as { id: string; code: string; name: string }[]) ?? [];
  } catch {
    // Form renders empty selects gracefully
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/discussions" />}>
              Discussions
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Discussion</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DiscussionCreateForm categories={categories} tags={tags} courses={courses} />
    </div>
  );
}
