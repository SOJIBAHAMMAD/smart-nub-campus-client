import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

const mocks = vi.hoisted(() => ({
  serverApi: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn(),
  },
}));

vi.mock("@/lib/server-api", () => ({
  default: mocks.serverApi,
  serverApi: mocks.serverApi,
}));

import { jobsService } from "@/services/jobs.service";
import { TAGS } from "@/lib/cache-tags";
import type { Job } from "@/types";

const JOB: Job = {
  id: "job-1",
  title: "Junior Engineer",
  company: "Acme",
  description: "A great role",
  employmentType: "FULL_TIME",
  location: "Remote",
  salaryRange: null,
  applicationUrl: null,
  deadline: null,
  department: "Engineering",
  status: "OPEN",
  isVerified: true,
  source: "PLATFORM",
  sourceUrl: null,
  postedById: "user-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  postedBy: {
    id: "user-1",
    name: "Alum",
    image: null,
    role: "ALUMNI",
    profile: null,
  },
  _count: { applications: 2 },
};

function apiData<T>(data: T) {
  return { success: true, message: "", data };
}

describe("jobsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listJobs", () => {
    it("calls GET /jobs with no query string by default", async () => {
      const response = { data: [JOB], meta: { total: 1 } };
      (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

      const result = await jobsService.listJobs();

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/jobs", {
        tags: [TAGS.JOBS],
      });
      expect(result).toEqual(response);
    });

    it("serializes filters and omits the default page", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      await jobsService.listJobs({
        q: "engineer",
        company: "Acme",
        location: "Remote",
        employmentType: "FULL_TIME",
        department: "Engineering",
        status: "OPEN",
        limit: 10,
      });

      expect(mocks.serverApi.get).toHaveBeenCalledWith(
        "/jobs?q=engineer&company=Acme&location=Remote&employmentType=FULL_TIME&department=Engineering&status=OPEN&limit=10",
        { tags: [TAGS.JOBS] },
      );
    });

    it("includes page only when greater than 1", async () => {
      (mocks.serverApi.get as Mock).mockResolvedValue(
        apiData({ data: [], meta: { total: 0 } }),
      );

      await jobsService.listJobs({ page: 2, limit: 20 });

      expect(mocks.serverApi.get).toHaveBeenCalledWith("/jobs?page=2&limit=20", {
        tags: [TAGS.JOBS],
      });

      await jobsService.listJobs({ page: 1 });

      expect(mocks.serverApi.get).toHaveBeenLastCalledWith("/jobs", {
        tags: [TAGS.JOBS],
      });
    });

    it("propagates API errors", async () => {
      (mocks.serverApi.get as Mock).mockRejectedValue(
        new Error("Failed to load jobs"),
      );

      await expect(jobsService.listJobs()).rejects.toThrow("Failed to load jobs");
    });
  });

  it("getJobById calls GET /jobs/:id with the detail tag", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue(
      apiData({ ...JOB, myApplicationStatus: null }),
    );

    const result = await jobsService.getJobById("job-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/jobs/job-1", {
      tags: [TAGS.JOB_DETAIL],
    });
    expect(result).toEqual({ ...JOB, myApplicationStatus: null });
  });

  it("createJob POSTs to /jobs and invalidates list + activity tags", async () => {
    const payload = {
      title: "Junior Engineer",
      company: "Acme",
      employmentType: "FULL_TIME" as const,
      location: "Remote",
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(JOB));

    const result = await jobsService.createJob(payload);

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/jobs", payload, {
      invalidatesTags: [TAGS.JOBS, TAGS.ACTIVITIES],
    });
    expect(result).toEqual(JOB);
  });

  it("importJob POSTs to /jobs/import", async () => {
    const draft = {
      title: "Parsed title",
      company: "Parsed co",
      description: "",
      employmentType: null,
      location: "",
      salaryRange: "",
      deadline: null,
      department: null,
      applicationUrl: "",
      source: null,
      sourceUrl: null,
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(draft));

    const result = await jobsService.importJob({ input: "https://jobs.example.com/1" });

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/jobs/import", {
      input: "https://jobs.example.com/1",
    });
    expect(result).toEqual(draft);
  });

  it("updateJob PATCHes to /jobs/:id", async () => {
    (mocks.serverApi.patch as Mock).mockResolvedValue(apiData(JOB));

    const result = await jobsService.updateJob("job-1", { title: "Senior Engineer" });

    expect(mocks.serverApi.patch).toHaveBeenCalledWith("/jobs/job-1", {
      title: "Senior Engineer",
    }, { invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL, TAGS.ACTIVITIES] });
    expect(result).toEqual(JOB);
  });

  it("deleteJob calls DELETE /jobs/:id", async () => {
    (mocks.serverApi.del as Mock).mockResolvedValue({ success: true, message: "" });

    await jobsService.deleteJob("job-1");

    expect(mocks.serverApi.del).toHaveBeenCalledWith("/jobs/job-1", {
      invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL],
    });
  });

  it("applyToJob POSTs the application payload", async () => {
    const application = {
      id: "app-1",
      jobPostId: "job-1",
      applicantId: "user-1",
      coverLetter: "Hi",
      resumeUrl: null,
      status: "PENDING",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      applicant: {
        id: "user-1",
        name: "Student",
        image: null,
        email: "s@nub.ac.bd",
        student: null,
        profile: null,
      },
    };
    (mocks.serverApi.post as Mock).mockResolvedValue(apiData(application));

    const result = await jobsService.applyToJob("job-1", {
      coverLetter: "Hi",
    });

    expect(mocks.serverApi.post).toHaveBeenCalledWith("/jobs/job-1/apply", {
      coverLetter: "Hi",
    }, { invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL] });
    expect(result).toEqual(application);
  });

  it("listApplications calls GET /jobs/:id/applications", async () => {
    const response = {
      job: { id: "job-1", title: "Junior Engineer" },
      data: [],
    };
    (mocks.serverApi.get as Mock).mockResolvedValue(apiData(response));

    const result = await jobsService.listApplications("job-1");

    expect(mocks.serverApi.get).toHaveBeenCalledWith("/jobs/job-1/applications");
    expect(result).toEqual(response);
  });

  it("updateApplicationStatus PATCHes the status to the nested route", async () => {
    const application = {
      id: "app-1",
      jobPostId: "job-1",
      applicantId: "user-1",
      coverLetter: null,
      resumeUrl: null,
      status: "ACCEPTED",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
      applicant: {
        id: "user-1",
        name: "Student",
        image: null,
        email: "s@nub.ac.bd",
        student: null,
        profile: null,
      },
    };
    (mocks.serverApi.patch as Mock).mockResolvedValue(apiData(application));

    const result = await jobsService.updateApplicationStatus(
      "job-1",
      "app-1",
      "ACCEPTED",
    );

    expect(mocks.serverApi.patch).toHaveBeenCalledWith(
      "/jobs/job-1/applications/app-1",
      { status: "ACCEPTED" },
      { invalidatesTags: [TAGS.JOBS, TAGS.JOB_DETAIL] },
    );
    expect(result).toEqual(application);
  });
});
