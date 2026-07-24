import { FileText, ImageIcon } from "lucide-react";
import type { Message } from "@/types/message.types";
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";
import { formatFileSize } from "./time";

interface SharedFilesProps {
  files: Message[];
  className?: string;
}

export function SharedFiles({ files, className }: SharedFilesProps) {
  if (files.length === 0) {
    return (
      <p className={cn("px-1 text-xs text-muted-foreground", className)}>
        No files shared yet.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {files.map((file) => {
        const isImage = file.type === "IMAGE";
        return (
          <Attachment key={file.id} size="sm" orientation="horizontal">
            <AttachmentMedia variant={isImage ? "image" : "icon"}>
              {isImage && file.fileUrl ? (
                <img src={file.fileUrl} alt={file.fileName ?? "Image"} className="object-cover" />
              ) : isImage ? (
                <ImageIcon className="size-4" />
              ) : (
                <FileText className="size-4" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.fileName ?? (isImage ? "Image" : "File")}</AttachmentTitle>
              <AttachmentDescription>
                {formatFileSize(file.fileSize)}
              </AttachmentDescription>
            </AttachmentContent>
            <a
              href={file.fileUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              download={!isImage && (file.fileName ?? true)}
              className="absolute inset-0 z-10"
              aria-label={`Open ${file.fileName ?? "file"}`}
            />
          </Attachment>
        );
      })}
    </div>
  );
}
