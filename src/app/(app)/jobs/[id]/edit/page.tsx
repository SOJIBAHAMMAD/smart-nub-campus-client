import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import { jobsService } from "@/services/jobs.service";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { UnsavedGuardProvider } from "@/components/ui/unsaved-guard";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Briefcase, Lock } from "lucide-react";
import { UserRole } from "@/constants/enums";

export const metadata: Metadata = {
  title: "Edit Job | Smart NUB Campus",
  description: "Edit your job posting on the Smart NUB Campus job board.",
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let userId: string | undefined;
  let userRole: string | undefined;
  try {
    const me = await serverApi.get<IdentityMeResponse>("/identity/me", {
      cache: "no-store",
    });
    userId = me.data?.user?.id;
    userRole = me.data?.user?.role;
  } catch {
    // Proxy handles auth redirect.
  }

  let job;
  try {
    job = await jobsService.getJobById(id);
  } catch {
    job = null;
  }

  if (!job) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Job not found</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>
          This job post may have been removed or is no longer available.
        </EmptyDescription>
      </Empty>
    );
  }

  const canEdit = job.postedById === userId || userRole === UserRole.ADMIN;

  if (!canEdit) {
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Lock className="size-6" />
          </EmptyMedia>
          <EmptyTitle>You can&apos;t edit this job</EmptyTitle>
        </EmptyHeader>
        <EmptyDescription>
          Only the alumni who posted this job and administrators can edit it.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <UnsavedGuardProvider>
      <JobPostForm job={job} />
    </UnsavedGuardProvider>
  );
}
