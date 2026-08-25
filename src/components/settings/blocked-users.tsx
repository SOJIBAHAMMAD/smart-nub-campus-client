"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserX } from "lucide-react";
import { getBlockedUsersAction, unblockUserAction } from "@/actions/connection.actions";
import type { ConnectionOtherUser } from "@/types";

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" as const },
  }),
};

export function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<ConnectionOtherUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [confirmUnblock, setConfirmUnblock] = useState<ConnectionOtherUser | null>(null);

  useEffect(() => {
    async function loadBlockedUsers() {
      try {
        const result = await getBlockedUsersAction();
        if (result.success && result.data) {
          setBlockedUsers(result.data as ConnectionOtherUser[]);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    try {
      const result = await unblockUserAction(userId);
      if (result.success) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success("User unblocked.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to unblock user.");
    } finally {
      setUnblockingId(null);
      setConfirmUnblock(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocked Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blocked Users</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage users you&apos;ve blocked. They can&apos;t see your profile or
              contact you.
            </p>
          </CardHeader>
          <CardContent>
            {blockedUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserX className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t blocked anyone.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        id={user.id}
                        name={user.name ?? "User"}
                        src={user.image}
                        className="size-9 shrink-0 text-xs"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.student?.department && (
                          <Badge variant="secondary" className="text-xs mt-0.5">
                            {user.student.department}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmUnblock(user)}
                      disabled={unblockingId === user.id}
                      className="self-start sm:self-auto"
                    >
                      {unblockingId === user.id ? "Unblocking..." : "Unblock"}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={confirmUnblock !== null}
        onOpenChange={(open) => !open && setConfirmUnblock(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock User?</DialogTitle>
            <DialogDescription>
              {confirmUnblock?.name} will be able to see your profile and
              contact you again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUnblock(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmUnblock) handleUnblock(confirmUnblock.id);
              }}
            >
              Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
