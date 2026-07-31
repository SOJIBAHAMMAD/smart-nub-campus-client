import serverApi from "@/lib/server-api";
import { TAGS } from "@/lib/cache-tags";
import type {
  Job,
  JobDetail,
  JobListResponse,
  JobApplicationsResponse,
  ListJobsParams,
  CreateJobPayload,
  UpdateJobPayload,
  ApplyJobPayload,
  JobApplication,
  ImportJobPayload,
  ParsedJobDraft,
} from "@/types";

export const jobsService = {
  /**
   * List job posts with filters + pagination.
   * Matches backend GET /jobs.
   */
  async listJobs(query: ListJobsParams = {}): Promise<JobListResponse> {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.company) params.set("company", query.company);
    if (query.location) params.set("location", query.location);
    if (query.employmentType) params.set("employmentType", query.employmentType);
    if (query.department) params.set("department", query.department);
    if (query.status) params.set("status", query.status);
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const queryString = params.toString();
    const response = await serverApi.get<JobListResponse>(
      `/jobs${queryString ? `?${queryString}` : ""}`,
      { tags: [TAGS.JOBS] },
    );
    return response.data!;
  },

  /**
   * Get a single job post (with my application status).
   * Matches backend GET /jobs/:id.
   */
  async getJobById(id: string): Promise<JobDetail> {
    const response = await serverApi.get<JobDetail>(`/jobs/${id}`, {
      tags: [TAGS.JOB_DETAIL],
    });
    return response.data!;
  },

  /**
   * Create a job post (ALUMNI/ADMIN only).
   * Matches backend POST /jobs.
   */
  async createJob(data: CreateJobPayload): Promise<Job> {
    const response = await serverApi.post<Job>("/jobs", data, {
      invalidatesTags: [TAGS.JOBS],
    });
    return response.data!;
  },

  /**
   * Parse a pasted link or raw job description into a prefilled draft.
   * Does NOT persist anything. Matches backend POST /jobs/import.
   */
  async importJob(data: ImportJobPayload): Promise<ParsedJobDraft> {
    const response = await serverApi.post<ParsedJobDraft>("/jobs/import", data);
    return response.data!;
  },

  /**
   * Update a job post (owner or admin).
   * Matches backend PATCH /jobs/:id.
   */
  async updateJob(id: string, data: UpdateJobPayload): Promise<Job> {
    const response = await serverApi.patch<Job>(`/jobs/${id}`, data, {
      invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL],
    });
    return response.data!;
  },

  /**
   * Delete a job post (owner or admin).
   * Matches backend DELETE /jobs/:id.
   */
  async deleteJob(id: string): Promise<void> {
    await serverApi.del(`/jobs/${id}`, {
      invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL],
    });
  },

  /**
   * Apply to a job post.
   * Matches backend POST /jobs/:id/apply.
   */
  async applyToJob(id: string, data: ApplyJobPayload = {}): Promise<JobApplication> {
    const response = await serverApi.post<JobApplication>(
      `/jobs/${id}/apply`,
      data,
      { invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL] },
    );
    return response.data!;
  },

  /**
   * List applications for a job (owner or admin).
   * Matches backend GET /jobs/:id/applications.
   */
  async listApplications(id: string): Promise<JobApplicationsResponse> {
    const response = await serverApi.get<JobApplicationsResponse>(
      `/jobs/${id}/applications`,
    );
    return response.data!;
  },

  /**
   * Update an application status (owner or admin).
   * Matches backend PATCH /jobs/:id/applications/:appId.
   */
  async updateApplicationStatus(
    id: string,
    applicationId: string,
    status: string,
  ): Promise<JobApplication> {
    const response = await serverApi.patch<JobApplication>(
      `/jobs/${id}/applications/${applicationId}`,
      { status },
      { invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL] },
    );
    return response.data!;
  },
};
