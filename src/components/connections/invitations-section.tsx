"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  MailOpen,
  Mail,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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

  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-6"
    >
      <Card>
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            <CardTitle>Invitations</CardTitle>
            <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5">
              {total}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <Tabs defaultValue="received">
            <TabsList variant="line" className="mb-4 w-full">
              <TabsTrigger value="received" className="flex-1">
                <span className="flex items-center gap-1.5">
                  <Inbox className="size-3.5" />
                  Received
                </span>
                {pending.length > 0 && (
                  <Badge variant="default" className="ml-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                    {pending.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex-1">
                <span className="flex items-center gap-1.5">
                  <Send className="size-3.5" />
                  Sent
                </span>
                {sent.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
                    {sent.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              <AnimatePresence mode="popLayout">
                {pending.length === 0 ? (
                  <EmptyInvitation
                    icon={<MailOpen className="size-6" />}
                    title="No pending invitations"
                    desc="You're all caught up!"
                  />
                ) : (
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
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="sent">
              <AnimatePresence mode="popLayout">
                {sent.length === 0 ? (
                  <EmptyInvitation
                    icon={<Mail className="size-6" />}
                    title="No sent invitations"
                    desc="Send connection requests to get started."
                  />
                ) : (
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
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
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
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 transition-colors hover:bg-muted/40">
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
            {[dept, sem ? `Sem ${sem}` : null].filter(Boolean).join(" · ") ||
              "NUB Student"}
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
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={busy !== null}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                disabled={busy !== null}
              >
                Reject
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

function EmptyInvitation({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-2 text-muted-foreground">{icon}</div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
