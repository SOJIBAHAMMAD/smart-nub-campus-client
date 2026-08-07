import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { UnsavedGuardProvider } from "@/components/ui/unsaved-guard";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Lock } from "lucide-react";
import { UserRole } from "@/constants/enums";

export const metadata: Metadata = {
  title: "Post a Job",
  description: "Share a job or internship opportunity with the NUB community.",
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function NewJobPage() {
  let userRole: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userRole = me.data?.user?.role;
  } catch {
    // Proxy handles auth redirect.
  }

  const canPost = userRole === UserRole.ALUMNI || userRole === UserRole.ADMIN;

  if (!canPost) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Lock className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Only alumni can post jobs</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>
          Job postings are shared by NUB alumni and administrators. As a
          student you can still browse and apply to open positions.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <UnsavedGuardProvider>
      <JobPostForm />
    </UnsavedGuardProvider>
  );
}
