import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import ROUTES from "@/constants/routes";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import type {
  DirectoryMemberDetail,
  EmploymentRecord,
} from "@/types";

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

function formatMonthYear(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function EmploymentItem({ record }: { record: EmploymentRecord }) {
  const start = formatMonthYear(record.startDate);
  const end = record.isCurrent ? "Present" : formatMonthYear(record.endDate);

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline dot + connector */}
      <div className="relative flex flex-col items-center">
        <span className="mt-1.5 size-2.5 rounded-full border-2 border-primary bg-primary/20" />
        <span className="absolute top-5 bottom-0 w-px bg-border" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-foreground">{record.title}</p>
          {record.isCurrent && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Present
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="size-3 shrink-0" />
          {record.employer}
          {record.industry ? ` · ${record.industry}` : ""}
        </p>
        {(start || end) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3 shrink-0" />
            {start ?? "Unknown"} {"\u2013"} {end ?? "Unknown"}
          </p>
        )}
        {record.description && (
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {record.description}
          </p>
        )}
      </div>
    </div>
  );
}

export function MemberProfile({ member }: { member: DirectoryMemberDetail }) {
  const department = member.student?.department ?? null;
  const departmentName = departmentLabel(department);
  const graduationYear = member.student?.graduationYear ?? null;
  const degreeTitle = member.student?.degreeTitle ?? null;
  const admissionYear = member.student?.admissionYear ?? null;
  const admissionSemester = member.student?.admissionSemester ?? null;
  const role = member.profile?.jobTitle ?? null;
  const employer = member.profile?.currentEmployer ?? null;
  const industry = member.profile?.industry ?? null;
  const location = member.profile?.location ?? null;
  const bio = member.profile?.bio ?? null;
  const isMentor = member.profile?.isMentor ?? false;
  const topics = member.profile?.mentorshipTopics ?? [];
  const employment = member.alumniEmployment ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <Link
        href={ROUTES.ALUMNI}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to directory
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-start gap-4 sm:px-6">
          <Avatar
            id={member.id}
            name={member.name}
            src={member.image}
            className="size-16 sm:size-20"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
              {member.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {role ? (
                <>
                  {role}
                  {employer ? (
                    <>
                      {" "}
                      at <span className="font-medium text-foreground">{employer}</span>
                    </>
                  ) : null}
                </>
              ) : (
                "NUB Alumnus"
              )}
            </p>
            {location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                {location}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <GraduationCap className="size-3" />
                Alumni
              </span>
              {isMentor && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-3" />
                  Mentor
                </span>
              )}
            </div>
          </div>
          <CardAction className="hidden sm:block">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              <Briefcase className="size-3" />
              {member.stats.connectionCount}{" "}
              {member.stats.connectionCount === 1 ? "connection" : "connections"}
            </span>
          </CardAction>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* ── Left column ──────────────────────────────────────── */}
        <div className="space-y-4">
          {/* About */}
          {bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="pb-5 sm:pb-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-4" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5 sm:pb-6">
              {employment.length > 0 ? (
                <div>
                  {employment.map((record) => (
                    <EmploymentItem key={record.id} record={record} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">
                  No employment history added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-5 sm:pb-6">
              <p className="text-sm font-medium text-foreground">
                {departmentName ?? "Northern University Bangladesh"}
              </p>
              {degreeTitle && (
                <p className="text-xs text-muted-foreground">{degreeTitle}</p>
              )}
              {graduationYear && (
                <p className="text-xs text-muted-foreground">
                  Class of {graduationYear}
                </p>
              )}
              {admissionYear && (
                <p className="text-xs text-muted-foreground">
                  Admitted {admissionSemester ? `${admissionSemester} ` : ""}
                  {admissionYear}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Career snapshot */}
          {(role || employer || industry) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Career
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-5 sm:pb-6">
                {role && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                )}
                {employer && (
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{employer}</p>
                  </div>
                )}
                {industry && (
                  <TagPill name={industry} size="xs" variant="outline" showIcon={false} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Mentorship */}
          {isMentor && topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5 sm:pb-6">
                <p className="mb-2 text-xs text-muted-foreground">
                  Open to mentoring students on:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic) => (
                    <TagPill
                      key={topic}
                      name={topic}
                      size="xs"
                      variant="brand"
                      showIcon={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
