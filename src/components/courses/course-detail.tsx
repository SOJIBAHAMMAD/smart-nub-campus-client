import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResourceCard } from "@/components/resources/resource-card";
import { DiscussionCard } from "@/components/discussions/discussion-card";
import { QuestionCard } from "@/components/qa/question-card";
import { cn } from "@/lib/utils";
import type { CourseDetail } from "@/types/course.types";
import type { Resource } from "@/types/resource.types";
import type { Discussion } from "@/types/discussion.types";
import type { Question } from "@/types/qa.types";

interface CourseDetailContentProps {
  course: CourseDetail;
  resources: Resource[];
  discussions: Discussion[];
  questions: Question[];
}

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tabular-nums leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  href,
}: {
  icon: typeof BookOpen;
  title: string;
  count: number;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <Badge variant="secondary" className="shrink-0">
          {count}
        </Badge>
      </div>
      {count > 0 && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all {count}
          <ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function SectionEmpty({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground/70" />
        </div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
        >
          <Plus className="size-3.5" />
          {actionLabel}
        </Link>
      </CardContent>
    </Card>
  );
}

export function CourseDetailContent({
  course,
  resources,
  discussions,
  questions,
}: CourseDetailContentProps) {
  const departmentLabel =
    DEPARTMENT_LABELS[course.department as keyof typeof DEPARTMENT_LABELS] ??
    course.department;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href={ROUTES.SEARCH}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Search
      </Link>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/85 to-accent p-6 text-primary-foreground shadow-sm sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transparent bg-black/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
              {course.code}
            </Badge>
            {course.semester != null && (
              <Badge className="border-transparent bg-white/15 text-white backdrop-blur-sm">
                <CalendarDays className="size-3" aria-hidden="true" />
                Semester {course.semester}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {course.name}
          </h1>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-primary-foreground/80">
            <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
            <span>{departmentLabel}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {course._count.resources > 0 && (
              <Link
                href={`/resources?courseId=${course.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "bg-white/95 hover:bg-white",
                )}
              >
                <BookOpen className="size-4" aria-hidden="true" />
                Browse resources
              </Link>
            )}
            <Link
              href={`/qa/ask?courseId=${course.id}`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "bg-white/15 text-white hover:bg-white/25",
              )}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={BookOpen}
          value={course._count.resources.toLocaleString()}
          label="Resources"
        />
        <StatTile
          icon={MessageSquare}
          value={course._count.discussions.toLocaleString()}
          label="Discussions"
        />
        <StatTile
          icon={HelpCircle}
          value={course._count.questions.toLocaleString()}
          label="Questions"
        />
        <StatTile
          icon={Building2}
          value={course.semester ?? "—"}
          label="Semester"
        />
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      {course.description && (
        <Card className="mt-6">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">
              About this course
            </h2>
            <Separator className="my-3" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Resources ─────────────────────────────────────────────── */}
      <section className="mt-8 space-y-3">
        <SectionHeader
          icon={BookOpen}
          title="Resources"
          count={course._count.resources}
          href={`/resources?courseId=${course.id}`}
        />
        {resources.length === 0 ? (
          <SectionEmpty
            icon={BookOpen}
            title="No resources yet"
            description="Be the first to share notes, slides or past papers for this course."
            actionHref="/resources/upload"
            actionLabel="Upload a resource"
          />
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} variant="list" />
            ))}
          </div>
        )}
      </section>

      {/* ── Discussions ───────────────────────────────────────────── */}
      <section className="mt-8 space-y-3">
        <SectionHeader
          icon={MessageSquare}
          title="Discussions"
          count={course._count.discussions}
          href={`/discussions?courseId=${course.id}`}
        />
        {discussions.length === 0 ? (
          <SectionEmpty
            icon={MessageSquare}
            title="No discussions yet"
            description="Start a conversation about this course — clarify doubts, share tips and collaborate."
            actionHref="/discussions/create"
            actionLabel="Start a discussion"
          />
        ) : (
          <div className="space-y-1">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Questions ─────────────────────────────────────────────── */}
      <section className="mt-8 space-y-3">
        <SectionHeader
          icon={HelpCircle}
          title="Questions"
          count={course._count.questions}
          href={`/qa?courseId=${course.id}`}
        />
        {questions.length === 0 ? (
          <SectionEmpty
            icon={HelpCircle}
            title="No questions yet"
            description="Stuck on a concept? Ask the community and get answers from fellow students."
            actionHref="/qa/ask"
            actionLabel="Ask a question"
          />
        ) : (
          <div className="space-y-1">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onVote={() => {}}
                onBookmark={() => {}}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Contribute ────────────────────────────────────────────── */}
      <section className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:p-6">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-foreground">
            Contribute to this course
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Help your classmates by sharing materials and answering questions.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/resources/upload"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Upload
          </Link>
          <Link
            href="/discussions/create"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Discuss
          </Link>
          <Link
            href="/qa/ask"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <HelpCircle className="size-4" aria-hidden="true" />
            Ask
          </Link>
        </div>
      </section>
    </div>
  );
}
