/**
 * Jobs module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/job.prisma
 */

import type {
  JobType,
  JobPostStatus,
  ApplicationStatus,
  JobSource,
} from "@/constants/enums";
import type { PaginationMeta } from "./resource.types";

// ── Enums ────────────────────────────────────────────────────────────────────

export type EmploymentType = JobType;

// ── Application form (platform-sourced jobs) ─────────────────────────────────

/** Built-in profile fields a poster can collect on a job application. */
export type JobApplicationFieldKey =
  | "name"
  | "email"
  | "github"
  | "linkedin"
  | "portfolio"
  | "website"
  | "phone"
  | "location"
  | "studentId"
  | "department"
  | "semester";

export interface JobApplicationFormField {
  key: JobApplicationFieldKey;
  required: boolean;
}

export interface JobApplicationFormQuestion {
  id: string;
  label: string;
  type: "SHORT_TEXT" | "PARAGRAPH";
  required: boolean;
}

/** Poster-defined configuration for the job application form. */
export interface JobApplicationFormConfig {
  fields: JobApplicationFormField[];
  questions: JobApplicationFormQuestion[];
}

/** Snapshot of an applicant's answers keyed by field key / question id. */
export type JobApplicationResponses = Record<string, string>;

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
  source: JobSource;
  sourceUrl: string | null;
  applicationForm?: JobApplicationFormConfig | null;
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
  responses?: JobApplicationResponses | null;
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
  job: {
    id: string;
    title: string;
    applicationForm?: JobApplicationFormConfig | null;
  };
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
  source?: JobSource;
  sourceUrl?: string;
  applicationForm?: JobApplicationFormConfig;
}

export interface UpdateJobPayload
  extends Omit<Partial<CreateJobPayload>, "applicationForm"> {
  status?: JobPostStatus;
  applicationForm?: JobApplicationFormConfig | null;
}

export interface ImportJobPayload {
  input: string;
}

export interface ParsedJobDraft {
  title: string;
  company: string;
  description: string;
  employmentType: JobType | null;
  location: string;
  salaryRange: string;
  deadline: string | null;
  department: string | null;
  applicationUrl: string;
  source: JobSource | null;
  sourceUrl: string | null;
}

export interface ApplyJobPayload {
  coverLetter?: string;
  resumeUrl?: string;
  responses?: JobApplicationResponses;
}
