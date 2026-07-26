/**
 * Client-side API module for binary uploads
 * Does NOT use Next.js server-only APIs - runs in browser
 */

import { env } from "@/env";

const API_URL = env.NEXT_PUBLIC_API_URL;

interface ApiResponsePromise<T> {
  data: T | undefined;
  error?: string;
}

async function apiFetch<T = unknown>(
  endpoint: string,
  config: RequestInit = {},
): Promise<ApiResponsePromise<T>> {
  const url = new URL(`${API_URL}${endpoint}`).toString();

  // For FormData, let browser set Content-Type with boundary
  const isFormData = config.body instanceof FormData;

  config.headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...config.headers,
  };

  config.credentials = "include"; // Send cookies for auth

  const response = await fetch(url, config);

  let data: unknown;
  const text = await response.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Invalid JSON response from server: ${response.status} ${response.statusText}`,
    );
  }

  if (!response.ok) {
    const error = data as { message?: string; error?: string };
    const errorMsg = error?.message || error?.error || "Upload failed";
    throw new Error(errorMsg);
  }

  return { data: data as T };
}

export const apiClient = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  del: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, {
      method: "DELETE",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  postForm: <T>(endpoint: string, formData: FormData) =>
    apiFetch<T>(endpoint, { method: "POST", body: formData }),
};

export default apiClient;
