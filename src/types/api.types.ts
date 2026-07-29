/**
 * Standard API response wrapper matching backend sendResponse format
 */
export interface ApiErrorSource {
  path: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errorSources?: ApiErrorSource[];
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}
