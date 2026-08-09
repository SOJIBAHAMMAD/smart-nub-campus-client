import { format, formatDistanceToNow } from "date-fns";
import {
  UserPlus,
  Upload,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ROUTES from "@/constants/routes";

// ── Types ────────────────────────────────────────────────────────────────────

export type ActivityAction =
  | "USER_SIGNED_UP"
  | "RESOURCE_UPLOADED"
  | "VERIFICATION_SUBMITTED"
  | "DISCUSSION_CREATED"
  | "QUESTION_ASKED";

export interface ActivityEntry {
  id: string;
  userName: string;
  action: ActivityAction;
  details: string;
  timestamp: string;
}

interface RecentActivityProps {
  /** List of recent activity entries. */
  activities: ActivityEntry[];
  /** Destination for the "View all" link. */
  viewAllHref?: string;
  /** Additional CSS classes applied to the card container. */
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ActivityMeta {
  icon: React.ComponentType<{ className?: string }>;
  /** Semantic chip classes — tinted, dark-mode aware. */
  chip: string;
  /** Humanized action label, e.g. "user signed up". */
  label: string;
}

/** Map activity action to icon, chip color, and readable verb. */
function getActivityMeta(action: ActivityAction): ActivityMeta {
  switch (action) {
    case "USER_SIGNED_UP":
      return {
        icon: UserPlus,
        chip: "bg-sky-500/10 text-sky-600 ring-sky-500/10 dark:text-sky-400",
        label: "signed up",
      };
    case "RESOURCE_UPLOADED":
      return {
        icon: Upload,
        chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/10 dark:text-emerald-400",
        label: "uploaded a resource",
      };
    case "VERIFICATION_SUBMITTED":
      return {
        icon: ShieldCheck,
        chip: "bg-amber-500/10 text-amber-600 ring-amber-500/10 dark:text-amber-400",
        label: "submitted a verification",
      };
    case "DISCUSSION_CREATED":
      return {
        icon: MessageSquare,
        chip: "bg-violet-500/10 text-violet-600 ring-violet-500/10 dark:text-violet-400",
        label: "created a discussion",
      };
    case "QUESTION_ASKED":
      return {
        icon: HelpCircle,
        chip: "bg-indigo-500/10 text-indigo-600 ring-indigo-500/10 dark:text-indigo-400",
        label: "asked a question",
      };
    default:
      return {
        icon: UserPlus,
        chip: "bg-muted text-muted-foreground ring-border/60",
        label: "took an action",
      };
  }
}

/** Render the card header shared by the populated and empty states. */
function ActivityCardHeader({ viewAllHref }: { viewAllHref: string }) {
  return (
    <CardHeader className="flex-row items-start justify-between gap-3">
      <div className="space-y-1">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Last 10 platform actions</CardDescription>
      </div>
      <CardAction>
        <Link
          href={viewAllHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          View all
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </CardAction>
    </CardHeader>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Timeline-style feed showing the last 10 platform actions.
 * Used in the admin dashboard overview.
 */
export function RecentActivity({
  activities,
  viewAllHref = ROUTES.ACTIVITIES,
  className,
}: RecentActivityProps) {
  return (
    <Card className={cn("w-full", className)}>
      <ActivityCardHeader viewAllHref={viewAllHref} />

      <CardContent className="pt-1">
        {activities.length === 0 ? (
          <Empty className="py-10">
            <EmptyMedia variant="icon">
              <Activity className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No recent activity</EmptyTitle>
              <EmptyDescription>
                Platform actions will show up here as students sign up, upload
                resources, and contribute.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ol aria-label="Recent platform activity" className="relative">
            {activities.map((entry, index) => {
              const meta = getActivityMeta(entry.action);
              const Icon = meta.icon;
              const isLast = index === activities.length - 1;
              const absoluteTime = format(
                new Date(entry.timestamp),
                "MMM d, yyyy, h:mm a",
              );

              return (
                <li
                  key={entry.id}
                  className={cn(
                    "relative flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50",
                  )}
                >
                  {/* Timeline spine connecting nodes */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-[-8px] left-[18px] top-10 w-px bg-border"
                    />
                  )}

                  {/* Icon / avatar chip */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-card ring-1 ring-inset",
                      meta.chip,
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium">{entry.userName}</p>
                      <time
                        dateTime={entry.timestamp}
                        title={absoluteTime}
                        className="shrink-0 text-xs text-muted-foreground"
                      >
                        {formatDistanceToNow(new Date(entry.timestamp), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    <p className="mt-0.5 truncate text-sm capitalize text-foreground">
                      {meta.label}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {entry.details}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
