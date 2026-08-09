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
import ROUTES from "@/constants/routes";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DirectoryMember } from "@/types";

const DEPARTMENT_ACCENTS: Record<string, string> = {
  CSE: "from-violet-500/10 to-violet-500/3",
  ECSE: "from-fuchsia-500/10 to-fuchsia-500/3",
  EEE: "from-amber-500/10 to-amber-500/3",
  EEEE: "from-amber-500/10 to-amber-500/3",
  BBA: "from-sky-500/10 to-sky-500/3",
  MBA: "from-sky-500/10 to-sky-500/3",
  ENGLISH: "from-emerald-500/10 to-emerald-500/3",
  MAE: "from-orange-500/10 to-orange-500/3",
  BANGLA: "from-teal-500/10 to-teal-500/3",
  MAB: "from-sky-500/10 to-sky-500/3",
  LLB: "from-indigo-500/10 to-indigo-500/3",
  MPH: "from-rose-500/10 to-rose-500/3",
  BPH: "from-rose-500/10 to-rose-500/3",
  ME: "from-orange-500/10 to-orange-500/3",
  CIVIL: "from-stone-500/10 to-stone-500/3",
  BTX: "from-cyan-500/10 to-cyan-500/3",
  EBTX: "from-cyan-500/10 to-cyan-500/3",
};

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

export function AlumniCard({ member }: { member: DirectoryMember }) {
  const department = member.student?.department ?? null;
  const departmentName = departmentLabel(department);
  const graduationYear = member.student?.graduationYear ?? null;
  const degreeTitle = member.student?.degreeTitle ?? null;
  const role = member.profile?.jobTitle ?? null;
  const employer = member.profile?.currentEmployer ?? null;
  const location = member.profile?.location ?? null;
  const industry = member.profile?.industry ?? null;
  const isMentor = member.profile?.isMentor ?? false;
  const topics = member.profile?.mentorshipTopics ?? [];
  const accent = department ? (DEPARTMENT_ACCENTS[department] ?? "from-primary/10 to-primary/3") : "from-primary/10 to-primary/3";

  return (
    <Card
      size="sm"
      interactive
      className="relative flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {accent && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
            accent,
          )}
        />
      )}

      <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Link
          href={ROUTES.ALUMNI_MEMBER(member.id)}
          className="flex flex-1 items-start gap-3"
        >
          <div className="relative shrink-0">
            <Avatar
              id={member.id}
              name={member.name}
              src={member.image}
              className="size-11"
            />
            {isMentor && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-amber-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover/card:text-primary">
              {member.name}
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
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Alumni
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="truncate text-xs text-muted-foreground">
          {[
            departmentName ?? "NUB",
            graduationYear ? `Class of ${graduationYear}` : null,
            degreeTitle ?? null,
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

        {(industry || isMentor || topics.length > 0) && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            {industry && (
              <TagPill
                name={industry}
                size="xs"
                variant="outline"
                showIcon={false}
              />
            )}
            {isMentor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="size-2.5" />
                Mentor
              </span>
            )}
            {topics.length > 0 && !isMentor && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                <Briefcase className="size-2.5" />
                {topics.length} topic{topics.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
