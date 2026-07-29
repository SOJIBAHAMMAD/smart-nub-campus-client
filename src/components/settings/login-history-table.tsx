"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedLoginHistory } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface LoginHistoryTableProps {
  history: PaginatedLoginHistory | null;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

/** Parse user agent to get browser/device summary. */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown browser";
}

/**
 * Paginated login history table.
 */
export function LoginHistoryTable({
  history,
  onPageChange,
  loading,
}: LoginHistoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!history || history.data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No login history available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Date/Time</th>
              <th className="pb-2 font-medium">IP Address</th>
              <th className="pb-2 font-medium">Browser</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.data.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="py-2.5">
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="py-2.5 font-mono text-xs">
                  {entry.ipAddress ?? "Unknown"}
                </td>
                <td className="py-2.5">{parseUserAgent(entry.userAgent)}</td>
                <td className="py-2.5">
                  <Badge
                    variant={entry.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {entry.success ? "Success" : "Failed"}
                  </Badge>
                  {entry.failureReason && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.failureReason}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {history.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {history.meta.page} of {history.meta.totalPages} ({history.meta.total} entries)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={history.meta.page <= 1}
              onClick={() => onPageChange(history.meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={history.meta.page >= history.meta.totalPages}
              onClick={() => onPageChange(history.meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
