/**
 * Jobs module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/job.prisma
 */

import type { JobType, JobPostStatus, ApplicationStatus } from "@/constants/enums";
import type { PaginationMeta } from "./resource.types";

// ── Enums ────────────────────────────────────────────────────────────────────

export type EmploymentType = JobType;

// ── Core models ──────────────────────────────────────────────────────────────

export interface JobPoster {
  id: string;
  name: string;
  image: string | null;
  role: string;
  profile: {
    jobTitle: string | null;
    currentEmployer: string | null;
    location: string | null;
  } | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  employmentType: JobType;
  location: string | null;
  salaryRange: string | null;
  applicationUrl: string | null;
  deadline: string | null;
  department: string | null;
  status: JobPostStatus;
  isVerified: boolean;
  postedById: string;
  createdAt: string;
  updatedAt: string;
  postedBy: JobPoster;
  _count: { applications: number };
  appliedByMe?: boolean;
}

export interface JobDetail extends Job {
  myApplicationStatus: ApplicationStatus | null;
}

export interface JobApplicant {
  id: string;
  name: string;
  image: string | null;
  email: string;
  student: {
    department: string | null;
    graduationYear: number | null;
  } | null;
  profile: {
    jobTitle: string | null;
    currentEmployer: string | null;
    location: string | null;
  } | null;
}

export interface JobApplication {
  id: string;
  jobPostId: string;
  applicantId: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  applicant: JobApplicant;
}

// ── API query / list types ───────────────────────────────────────────────────

export interface ListJobsParams {
  page?: number;
  limit?: number;
  q?: string;
  company?: string;
  location?: string;
  employmentType?: JobType;
  department?: string;
  status?: JobPostStatus;
}

export interface JobListResponse {
  data: Job[];
  meta: PaginationMeta;
}

export interface JobApplicationsResponse {
  job: { id: string; title: string };
  data: JobApplication[];
}

// ── Mutation inputs ──────────────────────────────────────────────────────────

export interface CreateJobPayload {
  title: string;
  company: string;
  description?: string;
  employmentType: JobType;
  location?: string;
  salaryRange?: string;
  applicationUrl?: string;
  deadline?: string | null;
  department?: string;
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  status?: JobPostStatus;
}

export interface ApplyJobPayload {
  coverLetter?: string;
  resumeUrl?: string;
}
