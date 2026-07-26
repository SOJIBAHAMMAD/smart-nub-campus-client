"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserPlus, Radio } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { sendConnectionRequestAction, getActiveUsersAction } from "@/actions/connection.actions";
import { toast } from "sonner";

interface ActiveUsersProps {
  onChanged?: () => void;
}

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  department?: string | null;
  currentSemester?: number | null;
  lastActiveAt?: string | null;
}

export function ActiveUsers({ onChanged }: ActiveUsersProps) {
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getActiveUsersAction(6);
        if (res.success && res.data) {
          setUsers((res.data as ActiveUser[]) ?? []);
        }
      } catch {
        /* non-critical */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleConnect = useCallback(
    async (userId: string) => {
      setSending(userId);
      try {
        const res = await sendConnectionRequestAction(userId);
        if (res.success) {
          toast.success("Request sent!");
          onChanged?.();
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send request.");
      } finally {
        setSending(null);
      }
    },
    [onChanged],
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <CardHeader className="p-0 px-0 pt-0 sm:p-0 sm:px-0 sm:pt-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Radio className="size-4 text-emerald-500" />
              Active on Campus
            </CardTitle>
          </CardHeader>
          <div className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <CardHeader className="p-0 px-0 pt-0 sm:p-0 sm:px-0 sm:pt-0">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Radio className="size-4 text-emerald-500" />
              Active on Campus
            </CardTitle>
          </CardHeader>
          <div className="mt-4 flex flex-col items-center py-4 text-center">
            <Users className="mb-2 size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No active users right now.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <CardHeader className="p-0 px-0 pt-0 sm:p-0 sm:px-0 sm:pt-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Radio className="size-4 text-emerald-500" />
            Active on Campus
          </CardTitle>
        </CardHeader>
        <div className="mt-3 space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <div className="relative">
                <Avatar
                  id={user.id}
                  name={user.name}
                  src={user.image}
                  className="size-9"
                />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user.department ?? "NUB Student"}
                </p>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={() => handleConnect(user.id)}
                disabled={sending === user.id}
              >
                <UserPlus className="size-3" />
                Connect
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
