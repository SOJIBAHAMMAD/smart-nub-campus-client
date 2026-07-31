import Link from "next/link";
import { Briefcase, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import type { Mentor } from "@/types";

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

export function MentorCard({
  mentor,
  onRequest,
}: {
  mentor: Mentor;
  onRequest: (mentor: Mentor) => void;
}) {
  const department = mentor.student?.department ?? null;
  const departmentName = departmentLabel(department);
  const role = mentor.profile?.jobTitle ?? null;
  const employer = mentor.profile?.currentEmployer ?? null;
  const industry = mentor.profile?.industry ?? null;
  const location = mentor.profile?.location ?? null;
  const topics = mentor.profile?.mentorshipTopics ?? [];
  const batchYear = mentor.profile?.batchYear ?? mentor.student?.graduationYear ?? null;

  return (
    <Card
      size="sm"
      className="relative flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Link
          href={ROUTES.ALUMNI_MEMBER(mentor.id)}
          className="flex flex-1 items-start gap-3"
        >
          <div className="relative shrink-0">
            <Avatar
              id={mentor.id}
              name={mentor.name}
              src={mentor.image}
              className="size-11"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-amber-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {mentor.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {role ? (
                <>
                  {role}
                  {employer ? ` · ${employer}` : ""}
                </>
              ) : (
                "NUB Alumnus"
              )}
            </p>
          </div>
        </Link>

        <CardAction className="pt-0.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <Sparkles className="size-2.5" />
            Mentor
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="truncate text-xs text-muted-foreground">
          {[
            departmentName ?? "NUB",
            batchYear ? `Class of ${batchYear}` : null,
          ]
            .filter(Boolean)
            .join(" \u00b7 ") || "Northern University Bangladesh"}
        </p>

        {location && (
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {industry && (
          <TagPill
            name={industry}
            size="xs"
            variant="outline"
            showIcon={false}
            className="w-fit"
          />
        )}

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, 4).map((topic) => (
              <TagPill
                key={topic}
                name={topic}
                size="xs"
                variant="brand"
                showIcon={false}
              />
            ))}
            {topics.length > 4 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                +{topics.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Briefcase className="size-3" />
            {mentor.stats.connectionCount}{" "}
            {mentor.stats.connectionCount === 1 ? "connection" : "connections"}
          </span>
          <Button size="xs" onClick={() => onRequest(mentor)}>
            Request mentorship
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
