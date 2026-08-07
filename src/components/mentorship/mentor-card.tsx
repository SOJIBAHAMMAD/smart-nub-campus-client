import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Handshake,
  Hourglass,
  MapPin,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { TagPill } from "@/components/ui/tag-pill";
import { Button, buttonVariants } from "@/components/ui/button";
import { Metric } from "@/components/ui/metric";
import ROUTES from "@/constants/routes";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Mentor } from "@/types";

function departmentLabel(department: string | null | undefined): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

export function MentorCard({
  mentor,
  onRequest,
  canRequest = true,
}: {
  mentor: Mentor;
  onRequest: (mentor: Mentor) => void;
  canRequest?: boolean;
}) {
  const department = mentor.student?.department ?? null;
  const departmentName = departmentLabel(department);
  const role = mentor.profile?.jobTitle ?? null;
  const employer = mentor.profile?.currentEmployer ?? null;
  const industry = mentor.profile?.industry ?? null;
  const location = mentor.profile?.location ?? null;
  const topics = mentor.profile?.mentorshipTopics ?? [];
  const batchYear = mentor.profile?.batchYear ?? mentor.student?.graduationYear ?? null;
  const headline = mentor.profile?.mentorHeadline ?? null;
  const available = mentor.stats.slotsAvailable > 0;
  const highMatch = mentor.matchScore > 0;

  const relationship = mentor.relationshipState ?? "none";
  const isSelf = relationship === "self";
  const isActive = relationship === "active";
  const isPending = relationship === "pending";
  const showRequest = canRequest && !isSelf;

  return (
    <Card
      size="sm"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-primary/30",
      )}
    >
      {/* Top accent bar — signals a recommended match */}
      {highMatch && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-fuchsia-400 to-primary"
        />
      )}

      <CardHeader className="gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-start gap-3">
          <Link
            href={ROUTES.ALUMNI_MEMBER(mentor.id)}
            className="relative shrink-0 transition-opacity group-hover:opacity-90"
          >
            <Avatar
              id={mentor.id}
              name={mentor.name}
              src={mentor.image}
              className="size-14 ring-2 ring-primary/20"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-amber-400" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link
                href={ROUTES.ALUMNI_MEMBER(mentor.id)}
                className="min-w-0 truncate text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
              >
                {mentor.name}
              </Link>
              <BadgeCheck className="size-4 shrink-0 text-primary" />
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {headline ??
                (role
                  ? `${role}${employer ? ` at ${employer}` : ""}`
                  : "NUB alumnus open to mentoring")}
            </p>
          </div>

          {highMatch && (
            <CardAction className="pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
                <Sparkles className="size-2.5" />
                Top match
              </span>
            </CardAction>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-muted-foreground">
          {role && employer && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Briefcase className="size-3 shrink-0" />
              <span className="truncate">
                {role} · {employer}
              </span>
            </span>
          )}
          {departmentName && (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="size-3 shrink-0" />
              {departmentName}
            </span>
          )}
          {batchYear && (
            <span className="text-[10px] text-muted-foreground/80">
              Class of {batchYear}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2.5 px-4 pb-4 sm:px-5 sm:pb-5">
        {location && (
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {highMatch && mentor.bestMatchTopic && (
          <p className="rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-primary">
            <span className="font-semibold">Strong match:</span> &ldquo;{" "}
            {mentor.bestMatchTopic}&rdquo;
          </p>
        )}

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topics.slice(0, 3).map((topic) => (
              <TagPill
                key={topic}
                name={topic}
                size="xs"
                variant="outline"
                showIcon={false}
              />
            ))}
            {topics.length > 3 && (
              <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground">
                +{topics.length - 3}
              </span>
            )}
          </div>
        )}

        {industry && (
          <TagPill
            name={industry}
            size="xs"
            variant="brand"
            showIcon={false}
            className="w-fit"
          />
        )}

        <div className="mt-auto space-y-2.5 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Metric
                icon={Handshake}
                value={mentor.stats.connectionCount}
                label="connections"
              />
              <Metric icon={Users} value={mentor.stats.committedSlots} label="mentees" />
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                available
                  ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  available ? "bg-emerald-500" : "bg-muted-foreground/60",
                )}
              />
              {available
                ? `${mentor.stats.slotsAvailable} slot${mentor.stats.slotsAvailable === 1 ? "" : "s"} open`
                : "Fully booked"}
            </span>
          </div>

          {isSelf ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              disabled
            >
              <UserRound className="size-3.5" />
              This is you
            </Button>
          ) : isActive ? (
            <Link
              href={ROUTES.MENTORSHIP_RELATIONSHIPS}
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full gap-1.5 bg-emerald-600 hover:bg-emerald-600/80",
              )}
            >
              <Handshake className="size-3.5" />
              Active mentorship
            </Link>
          ) : isPending ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              disabled
            >
              <Hourglass className="size-3.5" />
              Request pending
            </Button>
          ) : showRequest ? (
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={() => onRequest(mentor)}
              disabled={!available}
              title={
                !available
                  ? "This mentor is currently at full capacity."
                  : undefined
              }
            >
              {available ? (
                <>
                  <Handshake className="size-3.5" />
                  Request mentorship
                </>
              ) : (
                "Fully booked"
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5"
              render={
                <Link href={ROUTES.ALUMNI_MEMBER(mentor.id)} />
              }
              nativeButton={false}
            >
              <UserRound className="size-3.5" />
              View profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
