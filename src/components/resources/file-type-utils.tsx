/**
 * Shared file type utility functions for the resources module.
 * Provides icon elements, color classes, and labels for file types.
 */

import { FileText, FileImage, Presentation, File } from "lucide-react";

/** Returns a lucide icon element for the given file type. */
export function FileIcon({ fileType, className }: { fileType: string; className?: string }) {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) return <FileText className={className} />;
  if (ext.includes("doc") || ext.includes("word")) return <FileText className={className} />;
  if (ext.includes("ppt") || ext.includes("presentation")) return <Presentation className={className} />;
  if (ext.includes("image") || ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg"))
    return <FileImage className={className} />;
  return <File className={className} />;
}

/** Returns a color class based on the file extension. */
export function getFileColor(fileType: string): string {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) return "text-red-500 bg-red-500/10";
  if (ext.includes("doc") || ext.includes("word")) return "text-blue-500 bg-blue-500/10";
  if (ext.includes("ppt") || ext.includes("presentation")) return "text-orange-500 bg-orange-500/10";
  if (ext.includes("xls") || ext.includes("sheet")) return "text-green-500 bg-green-500/10";
  if (ext.includes("image") || ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg"))
    return "text-purple-500 bg-purple-500/10";
  if (ext.includes("zip") || ext.includes("rar")) return "text-yellow-600 bg-yellow-500/10";
  return "text-muted-foreground bg-muted";
}

/** Returns the file extension label for display. */
export function getFileLabel(fileType: string): string {
  const ext = fileType.toLowerCase();
  if (ext.includes("pdf")) return "PDF";
  if (ext.includes("doc") || ext.includes("word")) return "DOC";
  if (ext.includes("ppt") || ext.includes("presentation")) return "PPT";
  if (ext.includes("xls") || ext.includes("sheet")) return "XLS";
  if (ext.includes("image") || ext.includes("png") || ext.includes("jpg")) return "IMG";
  if (ext.includes("zip") || ext.includes("rar")) return "ZIP";
  return "FILE";
}

/** Formats a byte size into a human-readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Formats a date string into relative time. */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}mo ago`;
  if (diffWeek > 0) return `${diffWeek}w ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHr > 0) return `${diffHr}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}
