import Link from "next/link";
import {
  BadgeCheck,
  Handshake,
  Hourglass,
  Sparkles,
  UserRound,
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

  const metaParts = [
    departmentName,
    batchYear ? `Class of ${batchYear}` : null,
    location,
  ].filter(Boolean);

  return (
    <Card
      size="sm"
      className="group flex h-full flex-col transition-all duration-200 hover:shadow-md"
    >
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
              className="size-14 ring-1 ring-border"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link
                href={ROUTES.ALUMNI_MEMBER(mentor.id)}
                className="min-w-0 break-words text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
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
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-1 text-[10px] font-medium text-foreground">
                <Sparkles className="size-2.5" />
                Top match
              </span>
            </CardAction>
          )}
        </div>

        {metaParts.length > 0 && (
          <p className="break-words text-[11px] leading-relaxed text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {highMatch && mentor.bestMatchTopic && (
          <p className="rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-[11px] leading-relaxed text-primary">
            <span className="font-semibold">Strong match:</span> &ldquo;
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

        <div className="mt-auto space-y-2.5 border-t border-border/60 pt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              available
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                available ? "bg-emerald-500" : "bg-muted-foreground/50",
              )}
            />
            {available
              ? `${mentor.stats.slotsAvailable} slot${mentor.stats.slotsAvailable === 1 ? "" : "s"} open`
              : "Fully booked"}
          </span>

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
                "w-full gap-1.5",
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
