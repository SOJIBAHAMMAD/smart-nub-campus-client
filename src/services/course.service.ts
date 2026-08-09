import serverApi from "@/lib/server-api";
import type { CourseDetail } from "@/types/course.types";

export const courseService = {
  async getCourseById(id: string): Promise<CourseDetail> {
    const response = await serverApi.get<CourseDetail>(`/courses/${id}`);
    return response.data!;
  },
};
