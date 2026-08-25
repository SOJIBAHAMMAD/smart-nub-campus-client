import {
  type FieldValues,
  type FieldPath,
  useController,
  type UseControllerProps,
} from "react-hook-form";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemProgress,
  FileUploadItemDelete,
} from "@/components/forms/file-upload";
import { type UploadContext } from "@/lib/upload/types";
import { useUpload } from "@/hooks/use-upload";
import { uploadService } from "@/services/upload.service";
import * as React from "react";
import Image from "next/image";
import { UploadCloud, XIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * Build a stable composite key from a File object.
 * This avoids relying on the File object reference as a Map key,
 * which can be unreliable across renders.
 */
function getFileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

const EXISTING_IMAGE_KEY = "__existing_image__";

interface FileUploadFieldOwnProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  containerClassName?: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  existingImageUrl?: string;
  existingPublicId?: string | null;
  onPublicIdChange?: (publicId: string | null) => void;
  isOnboarding?: boolean;
}

type FileUploadFieldProps<TFieldValues extends FieldValues> =
  FileUploadFieldOwnProps &
    Pick<UseControllerProps<TFieldValues>, "control" | "name" | "rules"> & {
      context: UploadContext;
      type?: "image" | "video" | "raw";
    };

export function FileUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  containerClassName,
  accept = "image/*",
  maxFiles = 1,
  maxSize,
  context,
  type = "image",
  existingImageUrl,
  existingPublicId,
  onPublicIdChange,
  isOnboarding,
}: FileUploadFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name: name as FieldPath<TFieldValues>,
    rules,
  });

  const [files, setFiles] = React.useState<File[]>([]);

  const { upload } = useUpload({ context, type, isOnboarding });

  // Track uploaded publicIds keyed by stable file identifier.
  // Using a Record instead of a Map<File, string> avoids issues with
  // File object identity changing across renders.
  const publicIdsRef = React.useRef<Record<string, string>>({});

  // Keep a ref to the previous files array so we can detect which file was removed.
  const prevFilesRef = React.useRef<File[]>([]);

  // Track whether the existing image has been removed
  const [existingImageRemoved, setExistingImageRemoved] = React.useState(false);

  // Determine if we're showing the existing image (not replaced by a new upload)
  const hasNewFile = files.length > 0;
  const showExistingImage =
    existingImageUrl && !existingImageRemoved && !hasNewFile;

  // Seed publicIdsRef with the existing image's publicId so removal triggers deletion
  React.useEffect(() => {
    if (existingPublicId && existingImageUrl && !existingImageRemoved) {
      publicIdsRef.current[EXISTING_IMAGE_KEY] = existingPublicId;
    }
  }, [existingPublicId, existingImageUrl, existingImageRemoved]);

  const handleUpload = async (
    uploadedFiles: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => {
    if (uploadedFiles.length === 0) return;

    try {
      const result = await upload(uploadedFiles[0]);
      // Store the publicId keyed by a stable file identifier
      for (const file of uploadedFiles) {
        publicIdsRef.current[getFileKey(file)] = result.publicId;
      }
      // Remove the existing image key since we're replacing it
      delete publicIdsRef.current[EXISTING_IMAGE_KEY];
      // Set the uploaded URL as the form field value
      field.onChange(result.url);
      // Notify parent of the new publicId
      onPublicIdChange?.(result.publicId);
      for (const file of uploadedFiles) {
        options.onSuccess(file);
      }
    } catch (err) {
      const uploadError =
        err instanceof Error ? err : new Error("Upload failed");
      console.error(`[FileUploadField] Upload error:`, err);
      options.onError(uploadedFiles[0], uploadError);
      // Clear the field on error so the user must re-upload
      field.onChange("");
      throw err;
    }
  };

  // Handle file removal and trigger Cloudinary deletion
  const handleValueChange = React.useCallback(
    (updatedFiles: File[]) => {
      // Detect which file was removed (present in prevFiles but not in updatedFiles)
      const prevFiles = prevFilesRef.current;
      for (const prevFile of prevFiles) {
        const stillPresent = updatedFiles.some(
          (f) =>
            f.name === prevFile.name &&
            f.size === prevFile.size &&
            f.lastModified === prevFile.lastModified,
        );

        if (!stillPresent) {
          // This file was removed — attempt to delete from Cloudinary
          const fileKey = getFileKey(prevFile);
          const publicId = publicIdsRef.current[fileKey];

          if (publicId) {
            uploadService
              .delete(publicId)
              .then(() => {
                // Clean up the stored publicId
                delete publicIdsRef.current[fileKey];
              })
              .catch((err) => {
                console.error(
                  `[FileUploadField] Failed to delete ${publicId} from Cloudinary:`,
                  err,
                );
                toast.error(
                  "Failed to delete uploaded image. It may remain on the server.",
                );
              });
          }
        }
      }

      // Update refs and state
      prevFilesRef.current = updatedFiles;
      setFiles(updatedFiles);

      // When the user removes all files, clear the form field value
      if (updatedFiles.length === 0) {
        field.onChange("");
        onPublicIdChange?.(null);
      }
    },
    [field, onPublicIdChange],
  );

  // Handle removal of the existing image preview
  const handleRemoveExistingImage = () => {
    const publicId = publicIdsRef.current[EXISTING_IMAGE_KEY];
    if (publicId) {
      uploadService
        .delete(publicId)
        .then(() => {
          delete publicIdsRef.current[EXISTING_IMAGE_KEY];
        })
        .catch((err) => {
          console.error(
            `[FileUploadField] Failed to delete existing image ${publicId} from Cloudinary:`,
            err,
          );
          toast.error(
            "Failed to delete uploaded image. It may remain on the server.",
          );
        });
    }
    setExistingImageRemoved(true);
    field.onChange("");
    onPublicIdChange?.(null);
  };

  const hasFile = files.length > 0;

  return (
    <Field className={containerClassName}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

      {/* Existing image preview — shown when no new file has been uploaded */}
      {showExistingImage && (
        <div className="relative overflow-hidden rounded-lg border">
          <Image
            src={existingImageUrl}
            alt="Uploaded ID card"
            width={600}
            height={192}
            unoptimized
            className="h-48 w-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveExistingImage}
            className="absolute right-2 top-2 rounded-full bg-background/80 p-1 opacity-70 hover:opacity-100"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      <FileUpload
        accept={accept}
        maxFiles={maxFiles}
        maxSize={maxSize}
        onUpload={handleUpload}
        onValueChange={handleValueChange}
      >
        {/* Hide dropzone once a file has been selected / uploaded or when showing existing image */}
        {!hasFile && !showExistingImage && (
          <FileUploadDropzone className="cursor-pointer">
            <div className="space-y-2 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-foreground">
                Drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                {accept} • Up to {maxFiles} file
                {maxFiles > 1 ? "s" : ""}
                {maxSize
                  ? ` • Max ${(maxSize / 1024 / 1024).toFixed(0)}MB each`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground/80">
                Tip: Use clear, high-quality files for better results.
              </p>
            </div>
          </FileUploadDropzone>
        )}

        <FileUploadList>
          {files.map((file) => (
            <FileUploadItem key={file.name} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemProgress />
              <FileUploadItemDelete className="ml-auto rounded p-1 opacity-70 hover:opacity-100">
                <XIcon className="size-4" />
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && (
        <span className="text-xs text-destructive">{error.message}</span>
      )}
    </Field>
  );
}
