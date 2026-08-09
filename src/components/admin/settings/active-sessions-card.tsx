"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Monitor, RefreshCw, Smartphone } from "lucide-react";
import {
  getActiveSessionsAction,
  terminateOtherSessionsAction,
  terminateSessionAction,
} from "@/actions/settings.actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ActiveSession } from "@/types";

function parseUserAgent(
  ua: string | null,
): { browser: string; device: "Desktop" | "Mobile" | "Tablet" } {
  if (!ua) return { browser: "Unknown browser", device: "Desktop" };

  let browser = "Unknown browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
  else if (ua.includes("iPad") || ua.includes("Tablet")) device = "Tablet";

  return { browser, device };
}

export function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [confirmOthersOpen, setConfirmOthersOpen] = useState(false);
  const [terminatingOthers, setTerminatingOthers] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getActiveSessionsAction();
      if (result.success && result.data) {
        const list = result.data as ActiveSession[];
        setSessions(list);
        setCurrentSessionId(list.find((session) => session.isCurrent)?.id);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (sessionId: string) => {
    try {
      const result = await terminateSessionAction(sessionId);
      if (result.success) {
        toast.success("Session signed out.");
        setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to sign out that session.");
    } finally {
      setConfirmTarget(null);
    }
  };

  const handleTerminateOthers = async () => {
    setTerminatingOthers(true);
    try {
      const result = await terminateOtherSessionsAction();
      if (result.success) {
        toast.success("All other sessions were signed out.");
        setSessions((prev) =>
          currentSessionId
            ? prev.filter((session) => session.id === currentSessionId)
            : prev,
        );
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to sign out other sessions.");
    } finally {
      setTerminatingOthers(false);
      setConfirmOthersOpen(false);
    }
  };

  const otherSessionsCount = sessions.filter(
    (session) => session.id !== currentSessionId,
  ).length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Devices signed in to your admin account. Sign out any you do not
            recognize.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SessionsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              We could not load your active sessions.
            </p>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <Empty className="py-8">
            <EmptyMedia variant="icon">
              <Monitor />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No other active sessions</EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              You are only signed in on this device, and your session is
              secure.
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const { browser, device } = parseUserAgent(session.userAgent);
              const isCurrent = session.id === currentSessionId;
              const DeviceIcon = device === "Mobile" ? Smartphone : Monitor;

              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <DeviceIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {browser} on {device}
                        </p>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            This device
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {session.ipAddress ?? "Unknown IP"} · Active{" "}
                        {formatDistanceToNow(new Date(session.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-end text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-auto"
                      onClick={() => setConfirmTarget(session.id)}
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && otherSessionsCount > 0 && (
          <div className="mt-5 flex justify-end border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOthersOpen(true)}
              disabled={terminatingOthers}
            >
              {terminatingOthers
                ? "Signing out..."
                : `Sign out all other sessions (${otherSessionsCount})`}
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Sign out this session?"
        description="This device will be signed out of the admin panel immediately."
        confirmLabel="Sign out"
        onConfirm={() => {
          if (confirmTarget) handleRevoke(confirmTarget);
        }}
      />

      <ConfirmDialog
        open={confirmOthersOpen}
        onOpenChange={setConfirmOthersOpen}
        title="Sign out all other sessions?"
        description={`This will sign out ${otherSessionsCount} other active session${otherSessionsCount === 1 ? "" : "s"}. You will stay signed in on this device.`}
        confirmLabel="Sign out others"
        onConfirm={handleTerminateOthers}
      />
    </Card>
  );
}

function SessionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-9 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}
