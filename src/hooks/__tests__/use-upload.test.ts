import { renderHook, act } from "@testing-library/react";
import { useUpload } from "../use-upload";
import { uploadService } from "@/services/upload.service";
import type { UploadResult } from "@/lib/upload/types";

vi.mock("@/services/upload.service", () => ({
  uploadService: {
    upload: vi.fn(),
    uploadForOnboarding: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedUpload = vi.mocked(uploadService.upload);
const mockedUploadForOnboarding = vi.mocked(uploadService.uploadForOnboarding);

const uploadResult: UploadResult = {
  url: "https://example.com/a.png",
  publicId: "a.png",
  resourceType: "image",
  mimeType: "image/png",
  size: 1024,
};

const file = new File(["x"], "a.png", { type: "image/png" });

describe("useUpload", () => {
  beforeEach(() => {
    mockedUpload.mockReset();
    mockedUploadForOnboarding.mockReset();
  });

  it("uploads a file and exposes state", async () => {
    mockedUpload.mockResolvedValue(uploadResult);
    const { result } = renderHook(() =>
      useUpload({ context: "avatars", type: "image", isOnboarding: false }),
    );

    let returned: UploadResult | undefined;
    await act(async () => {
      returned = await result.current.upload(file);
    });

    expect(mockedUpload).toHaveBeenCalledWith(file, "avatars", "image");
    expect(returned).toEqual(uploadResult);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("uses uploadForOnboarding when isOnboarding is true", async () => {
    mockedUploadForOnboarding.mockResolvedValue(uploadResult);
    const { result } = renderHook(() =>
      useUpload({ context: "avatars", type: "image", isOnboarding: true }),
    );

    await act(async () => {
      await result.current.upload(file);
    });

    expect(mockedUploadForOnboarding).toHaveBeenCalledWith(
      file,
      "avatars",
      "image",
    );
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("sets an error and rethrows when the upload fails", async () => {
    mockedUpload.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() =>
      useUpload({ context: "avatars", type: "image", isOnboarding: false }),
    );

    let caught: unknown;
    await act(async () => {
      try {
        await result.current.upload(file);
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toEqual(new Error("boom"));
    expect(result.current.error).toBe("boom");
    expect(result.current.isUploading).toBe(false);
  });
});
