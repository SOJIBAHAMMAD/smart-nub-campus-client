import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, FileQuestion } from "lucide-react";
import { QuestionEditForm } from "@/components/qa/question-edit-form";
import { qaService } from "@/services/qa.service";
import { resourceService } from "@/services/resource.service";
import { serverApi } from "@/lib/server-api";
import { Button } from "@/components/ui/button";
import type { Question, QuestionCategory } from "@/types/qa.types";
import type { Tag } from "@/types/resource.types";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface IdentityMeResponse {
  user: { id: string };
}

export default async function QuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let currentUserId: string | null = null;
  try {
    const result = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    currentUserId = result.data?.user?.id ?? null;
  } catch {
    // Not authenticated
  }

  if (!currentUserId) {
    redirect("/qa");
  }

  let question: Question | null = null;
  let categories: (QuestionCategory & { _count: { questions: number } })[] = [];
  let tags: Tag[] = [];
  let courses: { id: string; code: string; name: string }[] = [];
  let fetchError: string | null = null;

  try {
    const [questionResult, categoriesResult, tagsResult, coursesResult] =
      await Promise.all([
        qaService.getQuestionById(id),
        qaService.listCategories(),
        qaService.listTags(),
        resourceService.listCourses(),
      ]);

    question = questionResult ?? null;
    categories = (categoriesResult ?? []) as (QuestionCategory & {
      _count: { questions: number };
    })[];
    tags = (tagsResult ?? []) as Tag[];
    courses = (coursesResult ?? []) as {
      id: string;
      code: string;
      name: string;
    }[];
  } catch {
    fetchError = "Failed to load question.";
  }

  if (!question || fetchError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
          <FileQuestion className="size-8 text-muted-foreground/60" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-foreground">
          Question not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fetchError ??
            "The question you&apos;re trying to edit doesn&apos;t exist."}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          render={<Link href="/qa" />}
          nativeButton={false}
        >
          Back to Q&A
        </Button>
      </div>
    );
  }

  if (question.authorId !== currentUserId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted">
          <AlertCircle className="size-8 text-muted-foreground/60" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-foreground">
          Not your question
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can only edit your own questions.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          render={<Link href={`/qa/${id}`} />}
          nativeButton={false}
        >
          Back to Question
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/qa" />}>Q&A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={`/qa/${question.id}`}>{question.title}</Link>}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-bold text-foreground">Edit Question</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the title, content, or tags of your question.
        </p>
      </div>

      <QuestionEditForm
        question={question}
        categories={categories}
        tags={tags}
        courses={courses}
      />
    </div>
  );
}
