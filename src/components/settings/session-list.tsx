"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Monitor, Smartphone, Trash2 } from "lucide-react";
import type { ActiveSession } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface SessionListProps {
  sessions: ActiveSession[];
  currentSessionId?: string;
  onTerminate: (sessionId: string) => void;
  onTerminateOthers: () => void;
  loading?: boolean;
}

/** Parse user agent to extract device/browser info. */
function parseUserAgent(ua: string | null): { browser: string; device: string } {
  if (!ua) return { browser: "Unknown browser", device: "Unknown device" };

  let browser = "Unknown browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let device = "Desktop";
  if (ua.includes("Mobile") || ua.includes("Android")) device = "Mobile";
  else if (ua.includes("iPad") || ua.includes("Tablet")) device = "Tablet";

  return { browser, device };
}

/**
 * List of active sessions with terminate functionality.
 */
export function SessionList({
  sessions,
  currentSessionId,
  onTerminate,
  onTerminateOthers,
  loading,
}: SessionListProps) {
  const [confirmTerminateOthers, setConfirmTerminateOthers] = useState(false);
  const [confirmTerminate, setConfirmTerminate] = useState<string | null>(null);

  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sessions.map((session) => {
          const { browser, device } = parseUserAgent(session.userAgent);
          const isCurrent = session.id === currentSessionId;

          return (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {device === "Mobile" ? (
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {browser} on {device}
                    </span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        This device
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.ipAddress ?? "Unknown IP"} &middot; Active{" "}
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
                  onClick={() => setConfirmTerminate(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {otherSessions.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setConfirmTerminateOthers(true)}
        >
          Logout Other Devices ({otherSessions.length})
        </Button>
      )}

      {/* Confirm terminate others dialog */}
      <Dialog
        open={confirmTerminateOthers}
        onOpenChange={setConfirmTerminateOthers}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout Other Devices?</DialogTitle>
            <DialogDescription>
              This will terminate {otherSessions.length} other active session(s).
              You will remain logged in on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmTerminateOthers(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onTerminateOthers();
                setConfirmTerminateOthers(false);
              }}
            >
              Logout All Others
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm terminate single session dialog */}
      <Dialog
        open={confirmTerminate !== null}
        onOpenChange={(open) => !open && setConfirmTerminate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session?</DialogTitle>
            <DialogDescription>
              This session will be immediately logged out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmTerminate(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmTerminate) onTerminate(confirmTerminate);
                setConfirmTerminate(null);
              }}
            >
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
