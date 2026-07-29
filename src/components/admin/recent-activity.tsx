import { formatDistanceToNow } from "date-fns";
import { UserPlus, Upload, ShieldCheck, MessageSquare, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

export type ActivityAction =
  | "USER_SIGNED_UP"
  | "RESOURCE_UPLOADED"
  | "VERIFICATION_SUBMITTED"
  | "DISCUSSION_CREATED"
  | "QUESTION_ASKED";

interface ActivityEntry {
  id: string;
  userName: string;
  action: ActivityAction;
  details: string;
  timestamp: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Map activity action to icon + color. */
function getActivityMeta(action: ActivityAction) {
  switch (action) {
    case "USER_SIGNED_UP":
      return { icon: UserPlus, color: "text-blue-600 bg-blue-50" };
    case "RESOURCE_UPLOADED":
      return { icon: Upload, color: "text-green-600 bg-green-50" };
    case "VERIFICATION_SUBMITTED":
      return { icon: ShieldCheck, color: "text-amber-600 bg-amber-50" };
    case "DISCUSSION_CREATED":
      return { icon: MessageSquare, color: "text-purple-600 bg-purple-50" };
    case "QUESTION_ASKED":
      return { icon: HelpCircle, color: "text-indigo-600 bg-indigo-50" };
    default:
      return { icon: UserPlus, color: "text-gray-600 bg-gray-50" };
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface RecentActivityProps {
  /** List of recent activity entries. */
  activities: ActivityEntry[];
}

/**
 * Table showing the last 10 platform actions.
 * Used in the admin dashboard overview.
 */
export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent activity to display.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 pb-0">
        <h3 className="text-base font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          Last 10 platform actions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Details</th>
              <th className="px-6 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((entry) => {
              const meta = getActivityMeta(entry.action);
              const Icon = meta.icon;

              return (
                <tr
                  key={entry.id}
                  className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium">
                      {entry.userName}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full",
                          meta.color,
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <span className="text-sm capitalize">
                        {entry.action.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                      {entry.details}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
