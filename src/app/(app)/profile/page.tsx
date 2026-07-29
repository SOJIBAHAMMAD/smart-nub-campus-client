import { Suspense } from "react";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import { getPublicProfile } from "@/actions/profile.actions";
import { ProfileClient } from "@/components/profile/profile-client";
import { UserProfileSkeleton } from "@/components/skeletons/user-profile-skeleton";
import type { ProfileUser } from "@/types/profile.types";

interface IdentityMeResponse {
  user: { id: string };
}

export const metadata = {
  title: "My Profile",
};

export default async function MyProfilePage() {
  let currentUserId: string | undefined;

  try {
    const meResult = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    currentUserId = meResult.data?.user?.id;
  } catch {
    redirect("/auth/login");
  }

  if (!currentUserId) {
    redirect("/auth/login");
  }

  const result = await getPublicProfile(currentUserId);

  if (!result.success || !result.data) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <ProfileClient
        profileData={result.data as ProfileUser}
        currentUserId={currentUserId}
      />
    </Suspense>
  );
}
