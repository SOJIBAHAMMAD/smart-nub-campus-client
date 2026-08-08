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

import { courseService } from "@/services/course.service";
import type { CourseDetail } from "@/types/course.types";

const COURSE = { id: "course-1" } as CourseDetail;

describe("courseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCourseById calls GET /courses/:id and returns the course", async () => {
    (mocks.serverApi.get as Mock).mockResolvedValue({
      success: true,
      message: "",
      data: COURSE,
    });

    const result = await courseService.getCourseById("course-1");

    expect(mocks.serverApi.get).toHaveBeenCalledTimes(1);
    expect(mocks.serverApi.get).toHaveBeenCalledWith("/courses/course-1");
    expect(result).toEqual(COURSE);
  });

  it("getCourseById propagates API errors", async () => {
    (mocks.serverApi.get as Mock).mockRejectedValue(
      new Error("Course not found"),
    );

    await expect(courseService.getCourseById("missing")).rejects.toThrow(
      "Course not found",
    );
  });
});
