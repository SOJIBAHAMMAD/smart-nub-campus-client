type UploadResult = {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  originalFilename?: string;
};

type UploadContext =
  | "verification"
  | "resources"
  | "avatars"
  | "clubs"
  | "events"
  | "posts"
  | "uploads";

interface UseUploadOptions {
  context: UploadContext;
  type?: "image" | "video" | "raw";
  isOnboarding?: boolean;
}

interface UseUploadResult {
  upload: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  error: string | null;
}

export {
  type UploadResult,
  type UploadContext,
  type UseUploadOptions,
  type UseUploadResult,
};
