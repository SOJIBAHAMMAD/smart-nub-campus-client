import Link from "next/link";
import {
  FileText,
  HelpCircle,
  Users,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import ROUTES from "@/constants/routes";

interface ActivityItem {
  id: string;
  type: "resource" | "question" | "team" | "discussion" | "connection";
  action: string;
  target: string;
  targetId: string;
  user: { name: string };
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  error?: boolean;
}

function getIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "resource": return FileText;
    case "question": return HelpCircle;
    case "team": return Users;
    case "discussion": return MessageSquare;
    case "connection": return UserPlus;
  }
}

function getIconBg(type: ActivityItem["type"]) {
  switch (type) {
    case "resource": return "bg-violet-500/10 text-violet-500";
    case "question": return "bg-rose-500/10 text-rose-500";
    case "team": return "bg-blue-500/10 text-blue-500";
    case "discussion": return "bg-amber-500/10 text-amber-500";
    case "connection": return "bg-emerald-500/10 text-emerald-500";
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function getTargetRoute(type: ActivityItem["type"], targetId: string): string {
  switch (type) {
    case "resource": return ROUTES.RESOURCE(targetId);
    case "question": return ROUTES.QUESTION(targetId);
    case "team": return ROUTES.TEAM(targetId);
    case "discussion": return ROUTES.DISCUSSION(targetId);
    case "connection": return ROUTES.USER_PROFILE(targetId);
  }
}

export function RecentActivity({ activities, error }: RecentActivityProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Failed to load recent activity.</span>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">What&apos;s happening on campus</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/50 p-10 text-center">
          <MessageSquare className="mx-auto size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            No recent activity yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Start by uploading a resource or joining a discussion!
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((item) => {
            const Icon = getIcon(item.type);
            return (
              <Link
                key={item.id}
                href={getTargetRoute(item.type, item.targetId)}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${getIconBg(item.type)}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-medium">{item.user.name}</span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-primary transition-colors group-hover:text-primary/80">
                      {item.target}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo(item.timestamp)}
                  </p>
                </div>
              </Link>
            );
          })}
          <Link
            href={ROUTES.DISCUSSIONS}
            className="mt-2 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            View all activity <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </section>
  );
}
