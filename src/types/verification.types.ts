import {
  OnboardingStepValue,
  VerificationRequestType,
  VerificationStatus,
} from "@/constants/enums";

export interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  studentId: string;
  status: VerificationStatus;
  note: string | null;
  createdAt: string;
}

export interface VerificationRequestData {
  id: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  studentId: string;
  status: VerificationStatus;
  note: string | null;
  requestType: VerificationRequestType;
  graduationYear: number | null;
  degreeTitle: string | null;
  idCardImage?: string;
  idCardImagePublicId?: string | null;
}

export interface CreateVerificationRequestResponse {
  currentStep: OnboardingStepValue;
  verificationStatus: VerificationStatus | null;
  note: string | null;
  verificationRequest: {
    id: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    studentId: string;
    status: VerificationStatus;
    note: string | null;
    requestType: VerificationRequestType;
    graduationYear: number | null;
    degreeTitle: string | null;
    idCardImage?: string;
    idCardImagePublicId?: string | null;
  } | null;
}

/**
 * Payload for creating a verification request
 */
export interface CreateVerificationRequestPayload {
  name: string;
  email: string;
  dateOfBirth: string;
  studentId: string;
  idCardImage: string;
  idCardImagePublicId?: string | null;
  requestType: VerificationRequestType;
  graduationYear?: number;
  degreeTitle?: string;
}

export interface VerificationDetail {
  onboardingStep: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    verificationRequestId: string;
    step: OnboardingStepValue;
    completedAt: Date | null;
  } | null;
  id: string;
  email: string;
  studentId: string;
  name: string;
  dateOfBirth: Date;
  idCardImage: string;
  status: VerificationStatus;
  note: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListVerificationParams {
  page: number;
  limit: number;
  status?: VerificationStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ListVerificationResponse {
  data: VerificationDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type VerificationDetailResponse = VerificationDetail;
