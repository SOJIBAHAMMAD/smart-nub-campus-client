import type { Metadata } from "next";
import { serverApi } from "@/lib/server-api";
import { jobsService } from "@/services/jobs.service";
import { JobDetailClient } from "@/components/jobs/job-detail-client";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Briefcase } from "lucide-react";
import { stripHtml } from "@/lib/job-utils";
import { JobSource } from "@/constants/enums";

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
  REMOTE: "FULL_TIME",
};

export const metadata: Metadata = {
  title: "Job Details",
  description: "Job posting details on the Smart NUB Campus job board.",
};

interface IdentityMeResponse {
  user: { id: string; name: string; email: string; role: string };
}

export default async function JobDetailPage({
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

  const employmentType = EMPLOYMENT_TYPE_MAP[job.employmentType];
  const jobPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: stripHtml(job.description),
    datePosted: job.createdAt,
    ...(job.deadline ? { validThrough: job.deadline } : {}),
    ...(employmentType ? { employmentType } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    ...(job.location
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
            },
          },
        }
      : {}),
    ...(job.salaryRange
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            value: {
              "@type": "QuantitativeValue",
              value: job.salaryRange,
              unitText: "per month",
            },
          },
        }
      : {}),
    identifier: {
      "@type": "PropertyValue",
      name: "Smart NUB Campus",
      value: job.id,
    },
    ...(job.sourceUrl && job.source !== JobSource.PLATFORM
      ? { url: job.sourceUrl }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <JobDetailClient job={job} userId={userId} userRole={userRole} />
    </>
  );
}
