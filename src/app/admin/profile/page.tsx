"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import { ProfileHeaderCard } from "@/components/admin/profile/profile-header-card";
import { ProfileStatsRow } from "@/components/admin/profile/profile-stats-row";
import { ProfileAboutCard } from "@/components/admin/profile/profile-about-card";
import { ProfileEditDialog } from "@/components/admin/profile/profile-edit-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminProfileMe } from "@/components/admin/profile/types";

/**
 * Admin profile page (`/admin/profile`).
 * Fetches the signed-in admin's identity via `GET /identity/me` and renders
 * a hero header, account stats and an editable about card.
 */
export default function AdminProfilePage() {
  const [data, setData] = useState<AdminProfileMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<AdminProfileMe>>("/identity/me");
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.message || "Failed to load your profile.");
      }
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const pageHeader = (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      <p className="text-sm text-muted-foreground">
        Manage your account information and public profile
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {pageHeader}
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        {pageHeader}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                {"Couldn't load your profile"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchProfile}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {pageHeader}

      <ProfileHeaderCard
        user={data.user}
        admin={data.admin}
        onEdit={() => setEditOpen(true)}
      />

      <ProfileStatsRow user={data.user} />

      <ProfileAboutCard profile={data.profile} onEdit={() => setEditOpen(true)} />

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={data.profile}
        onSaved={fetchProfile}
      />
    </div>
  );
}
