import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/actions/profile.actions";
import { serverApi } from "@/lib/server-api";
import { ProfileClient } from "@/components/profile/profile-client";
import { UserProfileSkeleton } from "@/components/skeletons/user-profile-skeleton";
import type { ProfileUser } from "@/types/profile.types";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

interface IdentityMeResponse {
  user: { id: string; role?: string };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const result = await getPublicProfile(id);
    if (result.success && result.data) {
      const user = result.data as ProfileUser;
      return { title: `${user.name} — Profile` };
    }
  } catch {
    // Ignore
  }
  return { title: "Profile" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const [result, meResult] = await Promise.all([
    getPublicProfile(id),
    serverApi.get<IdentityMeResponse>("/identity/me", { cache: "no-store" }).catch(() => null),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const currentUserId = meResult?.data?.user?.id;
  const currentUserRole = meResult?.data?.user?.role;

  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <ProfileClient
        profileData={result.data as ProfileUser}
        currentUserId={currentUserId}
        userRole={currentUserRole}
      />
    </Suspense>
  );
}
