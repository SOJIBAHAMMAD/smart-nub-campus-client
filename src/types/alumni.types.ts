import type {
  AcademicStatus,
  AdmissionSemester,
  Department,
} from "@/constants/enums";
import type { PaginationMeta } from "./resource.types";

export interface GraduationInfo {
  studentId: string;
  department: Department;
  admissionYear: number;
  admissionSemester: AdmissionSemester;
  academicStatus: AcademicStatus;
  graduationYear: number | null;
  graduationSemester: AdmissionSemester | null;
  graduationDate: string | null;
  degreeTitle: string | null;
  cgpa: string | null;
  graduatedAt: string | null;
  transitionConfirmedAt: string | null;
  graduatedBy: { id: string; name: string } | null;
}

export interface TransitionStatusResponse {
  eligible: boolean;
  graduation: GraduationInfo | null;
}

export interface TransitionResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  student: {
    academicStatus: AcademicStatus;
    graduationYear: number | null;
    graduationSemester: AdmissionSemester | null;
    graduationDate: string | null;
    degreeTitle: string | null;
    transitionConfirmedAt: string | null;
  } | null;
}

// ── Alumni Directory (P2) ──────────────────────────────────────────────────

/** Single employment record (career profile). Mirrors server EmploymentRecord. */
export interface EmploymentRecord {
  id: string;
  employer: string;
  title: string;
  industry: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

/** Card shown in the alumni directory grid. */
export interface DirectoryMember {
  id: string;
  name: string;
  image: string | null;
  student: {
    studentId: string;
    department: string;
    graduationYear: number | null;
    graduationSemester: AdmissionSemester | null;
    degreeTitle: string | null;
  } | null;
  profile: {
    location: string | null;
    currentEmployer: string | null;
    jobTitle: string | null;
    industry: string | null;
    isMentor: boolean;
    mentorshipTopics: string[];
    batchYear: number | null;
  } | null;
}

/** Full member detail for /alumni/[id]. */
export interface DirectoryMemberDetail {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  student: {
    studentId: string;
    department: string;
    admissionYear: number | null;
    admissionSemester: AdmissionSemester | null;
    graduationYear: number | null;
    graduationSemester: AdmissionSemester | null;
    graduationDate: string | null;
    degreeTitle: string | null;
  } | null;
  profile: {
    bio: string | null;
    coverImage: string | null;
    location: string | null;
    currentEmployer: string | null;
    jobTitle: string | null;
    industry: string | null;
    showInAlumniDirectory: boolean;
    isMentor: boolean;
    mentorshipTopics: string[];
    batchYear: number | null;
  } | null;
  alumniEmployment: EmploymentRecord[];
  stats: { connectionCount: number };
}

/** Facet bucket returned by the stats endpoint. */
export interface DirectoryFacet<T> {
  value: T;
  count: number;
}

export interface DirectoryStats {
  total: number;
  byDepartment: DirectoryFacet<string>[];
  byGraduationYear: DirectoryFacet<number>[];
  byIndustry: DirectoryFacet<string>[];
}

export interface DirectoryListParams {
  department?: string;
  graduationYear?: number;
  industry?: string;
  location?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface DirectoryListResponse {
  data: DirectoryMember[];
  meta: PaginationMeta;
}
