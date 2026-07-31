"use server";

import { jobsService } from "@/services/jobs.service";
import type { ApiResponse } from "@/types";
import type {
  ListJobsParams,
  CreateJobPayload,
  ApplyJobPayload,
} from "@/types";

export async function listJobsAction(
  params: ListJobsParams = {},
): Promise<ApiResponse> {
  try {
    const data = await jobsService.listJobs(params);
    return { success: true, message: "Jobs fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch jobs.";
    return { success: false, message };
  }
}

export async function getJobByIdAction(id: string): Promise<ApiResponse> {
  try {
    const data = await jobsService.getJobById(id);
    return { success: true, message: "Job fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch job.";
    return { success: false, message };
  }
}

export async function createJobAction(
  data: CreateJobPayload,
): Promise<ApiResponse> {
  try {
    const created = await jobsService.createJob(data);
    return {
      success: true,
      message: "Job posted successfully.",
      data: created,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post job.";
    return { success: false, message };
  }
}

export async function applyToJobAction(
  id: string,
  data: ApplyJobPayload = {},
): Promise<ApiResponse> {
  try {
    const application = await jobsService.applyToJob(id, data);
    return {
      success: true,
      message: "Application submitted successfully.",
      data: application,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit application.";
    return { success: false, message };
  }
}

export async function listJobApplicationsAction(
  id: string,
): Promise<ApiResponse> {
  try {
    const data = await jobsService.listApplications(id);
    return { success: true, message: "Applications fetched.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch applications.";
    return { success: false, message };
  }
}

export async function updateJobApplicationStatusAction(
  id: string,
  applicationId: string,
  status: string,
): Promise<ApiResponse> {
  try {
    const data = await jobsService.updateApplicationStatus(
      id,
      applicationId,
      status,
    );
    return { success: true, message: "Application updated.", data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update application.";
    return { success: false, message };
  }
}
