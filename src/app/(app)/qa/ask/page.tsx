import { Suspense } from "react";
import { qaService } from "@/services/qa.service";
import { resourceService } from "@/services/resource.service";
import { QuestionCreateForm } from "@/components/qa/question-create-form";
import type { Tag } from "@/types/resource.types";
import type { QuestionCategory } from "@/types/qa.types";

/**
 * Ask Question page.
 * Full-width layout (no PageLayout). Fetches categories, tags, and courses
 * for the create form.
 */
export default async function AskQuestionPage() {
  let categories: (QuestionCategory & { _count: { questions: number } })[] = [];
  let tags: Tag[] = [];
  let courses: { id: string; code: string; name: string }[] = [];

  try {
    const [categoriesResult, tagsResult, coursesResult] = await Promise.all([
      qaService.listCategories(),
      qaService.listTags(),
      resourceService.listCourses(),
    ]);

    categories =
      (categoriesResult as unknown as (QuestionCategory & {
        _count: { questions: number };
      })[]) ?? [];
    tags = (tagsResult as unknown as Tag[]) ?? [];
    courses =
      (coursesResult as unknown as {
        id: string;
        code: string;
        name: string;
      }[]) ?? [];
  } catch {
    // Form renders empty selects gracefully
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Suspense fallback={null}>
        <QuestionCreateForm
          categories={categories}
          tags={tags}
          courses={courses}
        />
      </Suspense>
    </div>
  );
}
