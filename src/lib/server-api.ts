/**
 * Shared Server API module for Next.js with automatic cache invalidation
 *
 * This module provides a centralized fetch wrapper for making API requests to the backend. It automatically handles caching, revalidation, and cache invalidation based on the request type (GET for fetching data, POST/PUT/PATCH/DELETE for mutations). The module is designed to work seamlessly with Next.js's caching and revalidation mechanisms, ensuring that the client always receives fresh data after mutations.
 *
 * Features:
 * Centralized fetch wrapper with automatic Next.js cache invalidation
 * Supports GET requests with caching, revalidation, and tags
 * Supports POST, PUT, PATCH, DELETE requests with automatic cache invalidation for specified tags
 * Type-safe API responses and error handling
 * Error handling with automatic cache invalidation
 * Usage:
 * import { serverApi } from "./server-api";
 * const data = await serverApi.get("/endpoint", { cache: "force-cache", revalidate: 60, tags: ["tag1"] });
 * const result = await serverApi.post("/endpoint", data, { invalidatesTags: ["tag1", "tag2"] });
 * Documentation:
 * See docs/SERVER-API.md in the client package
 * @module serverApi
 * @exports serverApi
 * @see {@link docs/SERVER-API.md|Server API Documentation}
 */

import { env } from "@/env";
import { ApiError, ApiResponse } from "@/types";
import { cookies } from "next/headers";
import { updateTag, revalidateTag } from "next/cache";

const API_URL =
  env.API_URL || env.NEXT_PUBLIC_API_URL;

type ApiResponsePromise<T> = Promise<ApiResponse<T>>;

interface CacheOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

interface MutationOptions {
  invalidatesTags?: string[]; // Tags to clear upon a successful mutation
}

// Helper to safely clear tags depending on execution context
function triggerInvalidation(tags: string[]) {
  for (const tag of tags) {
    try {
      // 1. updateTag works inside Server Actions for immediate UI updates
      updateTag(tag);
    } catch {
      try {
        // 2. Fallback to revalidateTag if running inside Route Handlers / APIs
        revalidateTag(tag, "max");
      } catch (err) {
        console.error(`Failed to invalidate cache tag: ${tag}`, err);
      }
    }
  }
}

async function apiFetch<T = unknown>(
  endpoint: string,
  config: RequestInit = {},
  options: CacheOptions & MutationOptions = {},
): ApiResponsePromise<T> {
  const cookieStore = await cookies();
  const url = new URL(`${API_URL}${endpoint}`).toString();

  // Gather existing cookies to send TO Express
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = config.body instanceof FormData;

  config.headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Cookie: cookieString,
    ...config.headers,
  };

  config.credentials = "include"; // Ensure cookies are sent with requests

  const isGet = config.method === "GET" || config.method === undefined;

  // Handle caching and revalidation for GET requests
  if (isGet) {
    if (options.cache) config.cache = options.cache;
    if (options.revalidate !== undefined)
      config.next = { ...config.next, revalidate: options.revalidate };
    if (options.tags) config.next = { ...config.next, tags: options.tags };

    // Default to no-store if no caching is set up
    if (!options.cache && options.revalidate === undefined && !options.tags) {
      config.cache = "no-store";
    }
  } else {
    // Mutations (POST, PUT, PATCH, DELETE) should not be cached
    // Mutations should not be revalidated and should not have tags, so we enforce no-store caching to prevent stale data issues and ensure that the client always fetches fresh data after a mutation.
    config.cache = "no-store";
  }

  const response = await fetch(url, config);

  // Extract cookies returned FROM Express and set them in Next.js browser
  // This may throw in Server Components where cookies() is read-only;
  // silently skip — cookie forwarding still works in Server Actions / Route Handlers.
  const setCookieHeaders = response.headers.getSetCookie(); // Native fetch array method
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    try {
      for (const cookieStr of setCookieHeaders) {
        // Basic parser to split name=value from attributes
        const parts = cookieStr.split(";");
        const [nameValue] = parts;
        const [name, value] = nameValue.split("=");

        if (name) {
          const cookieName = name.trim();
          const cookieValue = value?.trim() ?? "";

          if (cookieValue) {
            // Set the cookie with the new value
            cookieStore.set(cookieName, cookieValue, {
              path: "/",
              httpOnly: true,
              secure: env.NODE_ENV === "production",
              sameSite: "lax",
            });
          } else {
            // Empty value means the cookie should be cleared
            cookieStore.delete(cookieName);
          }
        }
      }
    } catch {
      // Read-only cookie store (Server Component context) — skip cookie sync
    }
  }

  let data: unknown;
  const text = await response.text(); // Read the response as text first to handle cases where the response is not valid JSON
  try {
    data = text ? JSON.parse(text) : null; // Parse the response as JSON if it's not empty
  } catch {
    throw new Error(
      `Invalid JSON response from server: ${response.status} ${response.statusText}`,
    );
  }

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error?.message || error?.error || "Unknown API error");
  }

  // Trigger automatic invalidation if mutation succeeded and tags exist
  if (!isGet && options.invalidatesTags && options.invalidatesTags.length > 0) {
    // Trigger invalidation for each tag and clear the cache to ensure that the next request fetches fresh data. This is crucial for maintaining data consistency across the application, especially after performing mutations that change the underlying data.
    triggerInvalidation(options.invalidatesTags);
  }

  return data as ApiResponse<T>;
}

/**
 * Server API with typed methods and automatic invalidation options
 */
export const serverApi = {
  get: <T>(endpoint: string, options?: CacheOptions) =>
    apiFetch<T>(endpoint, { method: "GET" }, options),

  post: <T>(endpoint: string, body: unknown, options?: MutationOptions) =>
    apiFetch<T>(
      endpoint,
      { method: "POST", body: JSON.stringify(body) },
      options,
    ),

  postForm: <T>(endpoint: string, body: FormData, options?: MutationOptions) =>
    apiFetch<T>(endpoint, { method: "POST", body }, options),

  patch: <T>(endpoint: string, body: unknown, options?: MutationOptions) =>
    apiFetch<T>(
      endpoint,
      { method: "PATCH", body: JSON.stringify(body) },
      options,
    ),

  put: <T>(endpoint: string, body: unknown, options?: MutationOptions) =>
    apiFetch<T>(
      endpoint,
      { method: "PUT", body: JSON.stringify(body) },
      options,
    ),

  del: <T>(endpoint: string, options?: MutationOptions) =>
    apiFetch<T>(endpoint, { method: "DELETE" }, options),
};

export default serverApi;
