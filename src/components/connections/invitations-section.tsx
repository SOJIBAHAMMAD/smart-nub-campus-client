"use client";

import { useState } from "react";
import { Inbox, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  acceptConnectionAction,
  rejectConnectionAction,
  cancelConnectionAction,
} from "@/actions/connection.actions";
import type { ConnectionWithUser } from "@/types";
import { toast } from "sonner";

interface InvitationsSectionProps {
  pending: ConnectionWithUser[];
  sent: ConnectionWithUser[];
  onChanged: () => void;
}

export function InvitationsSection({
  pending,
  sent,
  onChanged,
}: InvitationsSectionProps) {
  const total = pending.length + sent.length;
  const [expanded, setExpanded] = useState(false);

  if (total === 0) return null;

  const previewUsers = pending.slice(0, 4);
  const remainingCount = Math.max(0, pending.length - 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-5"
    >
      <Card className="overflow-hidden border-primary/20 bg-primary/3 border-l-2 border-l-primary/40">
        <CardContent className="p-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center gap-3 text-left"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Inbox className="size-4 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {pending.length > 0
                    ? `${pending.length} pending invitation${pending.length === 1 ? "" : "s"}`
                    : `${sent.length} sent request${sent.length === 1 ? "" : "s"}`}
                </span>
                {sent.length > 0 && pending.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    {sent.length} sent
                  </Badge>
                )}
              </div>

              {pending.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {previewUsers.map((c) => (
                      <Avatar
                        key={c.id}
                        id={c.otherUser.id}
                        name={c.otherUser.name}
                        src={c.otherUser.image}
                        className="size-7 ring-2 ring-background"
                      />
                    ))}
                  </div>
                  {remainingCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{remainingCount} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 text-muted-foreground">
              {expanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
                  {pending.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Inbox className="size-3" />
                        Received
                      </p>
                      <div className="space-y-2">
                        {pending.map((c) => (
                          <InvitationRow
                            key={c.id}
                            connection={c}
                            type="received"
                            onChanged={onChanged}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {sent.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Send className="size-3" />
                        Sent
                      </p>
                      <div className="space-y-2">
                        {sent.map((c) => (
                          <InvitationRow
                            key={c.id}
                            connection={c}
                            type="sent"
                            onChanged={onChanged}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InvitationRow({
  connection,
  type,
  onChanged,
}: {
  connection: ConnectionWithUser;
  type: "received" | "sent";
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const user = connection.otherUser;
  const dept = user.student?.department;
  const sem = user.profile?.currentSemester;

  const run = async (
    key: string,
    fn: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(key);
    try {
      const res = await fn();
      if (res.success) {
        toast.success(res.message);
        onChanged();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const handleAccept = () =>
    run("accept", () => acceptConnectionAction(connection.id));

  const handleReject = () =>
    run("reject", () => rejectConnectionAction(connection.id));

  const handleWithdraw = () =>
    run("withdraw", () => cancelConnectionAction(connection.id));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/80 p-3 transition-colors hover:bg-muted/30">
        <Avatar
          id={user.id}
          name={user.name}
          src={user.image}
          className="size-10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {[dept, sem ? `Sem ${sem}` : null]
              .filter(Boolean)
              .join(" \u00b7 ") || "NUB Student"}
          </p>
          {connection.note && (
            <p className="mt-1 truncate text-xs italic text-muted-foreground">
              &ldquo;{connection.note}&rdquo;
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {type === "received" ? (
            <>
              <Button size="sm" onClick={handleAccept} disabled={busy !== null}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                disabled={busy !== null}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWithdraw}
              disabled={busy !== null}
            >
              Withdraw
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
