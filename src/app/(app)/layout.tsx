import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: {
    default: "Smart NUB Campus",
    template: "%s | Smart NUB Campus",
  },
  description:
    "Smart NUB Campus — the all-in-one platform for Northern University Bangladesh students to collaborate, share resources, and build community.",
};

interface IdentityMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
  student: Record<string, unknown> | null;
  admin: Record<string, unknown> | null;
  profile: {
    id: string;
    userId: string;
    bio: string | null;
    coverImage: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    websiteUrl: string | null;
    location: string | null;
    phoneNumber: string | null;
    currentSemester: number | null;
    batchYear: number | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

/**
 * Server-side layout for all authenticated (app) routes.
 * Fetches the current user's identity from the backend and passes it
 * down to the client AppLayout shell (TopNav + content area).
 *
 * Auth and role-based routing is handled centrally by the proxy (src/proxy.ts).
 * Admin users are redirected to /admin before this layout ever runs.
 */
export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName: string | undefined;
  let userImage: string | undefined;
  let userId: string | undefined;
  let userRole: string | undefined;

  try {
    const result = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userName = result.data?.user?.name;
    userImage = result.data?.user?.image ?? undefined;
    userId = result.data?.user?.id;
    userRole = result.data?.user?.role;
  } catch {
    // Proxy handles auth redirect; this is a safety fallback.
  }

  return (
    <AppLayout
      userName={userName}
      userImage={userImage}
      userId={userId}
      userRole={userRole}
    >
      {children}
    </AppLayout>
  );
}
