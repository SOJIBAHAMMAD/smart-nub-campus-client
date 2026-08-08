/**
 * Course module types mirroring the server `/courses/:id` response.
 * Keep in sync with server `src/app/module/course/course.interface.ts`.
 */

import type { Department } from "@/lib/constants";

export interface Course {
  id: string;
  code: string;
  name: string;
  department: Department;
  semester: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetail extends Course {
  _count: {
    resources: number;
    discussions: number;
    questions: number;
  };
}
