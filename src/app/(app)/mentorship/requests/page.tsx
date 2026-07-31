import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import { MentorshipRequestsClient } from "@/components/mentorship/mentorship-requests-client";

export const metadata: Metadata = {
  title: "My Mentorship Requests",
  description: "Track your mentorship requests on Smart NUB Campus.",
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function MentorshipRequestsPage() {
  let userRole: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userRole = me.data?.user?.role;
  } catch {
    // Proxy handles auth redirect.
  }

  return <MentorshipRequestsClient userRole={userRole} />;
}
