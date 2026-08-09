"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { BadgeCheck, CalendarDays, Mail, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface IdentityUser {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: string | null;
  image: string | null;
  emailVerified: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface IdentityMeResponse {
  user: IdentityUser;
  student: Record<string, unknown> | null;
  admin: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
}

function formatMemberSince(dateStr: string): string {
  try {
    return format(new Date(dateStr), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function AccountSettingsCard() {
  const [identity, setIdentity] = useState<IdentityMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: IdentityMeResponse;
      }>("/identity/me");

      if (response.data?.data) {
        setIdentity(response.data.data);
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

  const user = identity?.user;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your admin identity and account details</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <AccountSkeleton />
        ) : error || !user ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              We could not load your account information.
            </p>
            <Button variant="outline" size="sm" onClick={load}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar
                id={user.id}
                name={user.name}
                src={user.image}
                className="size-16 shrink-0 text-xl"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold leading-tight">{user.name}</p>
                  <Badge className="bg-brand/10 text-brand">Admin</Badge>
                  {user.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="text-green-600 dark:text-green-400"
                    >
                      Email verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Email unverified</Badge>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={ShieldCheck} label="Role" value="Administrator" />
              <InfoRow
                icon={BadgeCheck}
                label="Email verification"
                value={user.emailVerified ? "Verified" : "Unverified"}
              />
              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={formatMemberSince(user.createdAt)}
              />
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
