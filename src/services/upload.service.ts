import { type UploadResult } from "@/lib/upload/types";
import { ApiResponse } from "@/types";
import { apiClient } from "@/lib/api-client";

const uploadService = {
  async upload(
    file: File,
    context: string,
    type?: "image" | "video" | "raw",
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    if (type) {
      formData.append("type", type);
    }

    // The server responds with { success, data: UploadResult }.
    // apiClient wraps the entire JSON body as response.data, so the actual
    // UploadResult lives at response.data.data — unwrap it here.
    const response = await apiClient.postForm<ApiResponse<UploadResult>>(
      "/upload",
      formData,
    );

    const result = response.data?.data;

    if (!result?.url) {
      throw new Error("Upload failed - no URL returned from server");
    }

    return result;
  },

  async uploadForOnboarding(
    file: File,
    context: string,
    type?: "image" | "video" | "raw",
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context);
    if (type) {
      formData.append("type", type);
    }

    const response = await apiClient.postForm<ApiResponse<UploadResult>>(
      "/upload/onboarding",
      formData,
    );

    const result = response.data?.data;

    if (!result?.url) {
      throw new Error("Upload failed - no URL returned from server");
    }

    return result;
  },

  async delete(publicId: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>("/upload/delete", {
      publicId,
    });

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Failed to delete file from server",
      );
    }
  },
};

export { uploadService };
