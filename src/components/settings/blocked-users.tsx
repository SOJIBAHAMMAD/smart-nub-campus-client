"use client";

import { useState, useEffect } from "react";
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

/**
 * Blocked users management with unblock functionality.
 */
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
        // Silently fail
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
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      id={user.id}
                      name={user.name ?? "User"}
                      src={user.image}
                      className="size-9 text-xs"
                    />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
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
                  >
                    {unblockingId === user.id ? "Unblocking..." : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Unblock Dialog */}
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
