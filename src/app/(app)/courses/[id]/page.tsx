import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { courseService } from "@/services/course.service";
import { resourceService } from "@/services/resource.service";
import { discussionService } from "@/services/discussion.service";
import { qaService } from "@/services/qa.service";
import { CourseDetailContent } from "@/components/courses/course-detail";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { CourseDetail } from "@/types/course.types";
import type { Resource } from "@/types/resource.types";
import type { Discussion } from "@/types/discussion.types";
import type { Question } from "@/types/qa.types";

export const metadata: Metadata = {
  title: "Course Details",
  description:
    "Course hub for resources, discussions and questions on Smart NUB Campus.",
};

const PREVIEW_LIMIT = 5;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let course: CourseDetail | null = null;
  let resources: Resource[] = [];
  let discussions: Discussion[] = [];
  let questions: Question[] = [];

  try {
    const [courseResult, resourcesResult, discussionsResult, questionsResult] =
      await Promise.allSettled([
        courseService.getCourseById(id),
        resourceService.listResources({ courseId: id, limit: PREVIEW_LIMIT }),
        discussionService.listDiscussions({
          courseId: id,
          limit: PREVIEW_LIMIT,
          sort: "latest",
        }),
        qaService.listQuestions({
          courseId: id,
          limit: PREVIEW_LIMIT,
          sort: "latest",
        }),
      ]);

    if (courseResult.status === "fulfilled") {
      course = courseResult.value;
    }
    if (resourcesResult.status === "fulfilled") {
      resources = resourcesResult.value.data ?? [];
    }
    if (discussionsResult.status === "fulfilled") {
      discussions = discussionsResult.value.data ?? [];
    }
    if (questionsResult.status === "fulfilled") {
      questions = questionsResult.value.data ?? [];
    }
  } catch {
    // Fall through to the not-found state below.
  }

  if (!course) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GraduationCap className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Course not found</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>
          This course may have been removed or is no longer available.
        </EmptyDescription>
      </Empty>
    );
  }

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    courseCode: course.code,
    ...(course.description ? { description: course.description } : {}),
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Northern University Bangladesh",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <CourseDetailContent
        course={course}
        resources={resources}
        discussions={discussions}
        questions={questions}
      />
    </>
  );
}
