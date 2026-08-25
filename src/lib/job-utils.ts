import { JobType } from "@/constants/enums";
import { DEPARTMENT_LABELS } from "@/lib/constants";

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  [JobType.FULL_TIME]: "Full-time",
  [JobType.PART_TIME]: "Part-time",
  [JobType.CONTRACT]: "Contract",
  [JobType.INTERNSHIP]: "Internship",
  [JobType.REMOTE]: "Remote",
};

export function departmentLabel(
  department: string | null | undefined,
): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS[department as keyof typeof DEPARTMENT_LABELS] ?? department;
}

export function employmentLabel(type: string | null | undefined): string {
  if (!type) return "";
  return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}

/** Collapse an HTML string into plain, readable text (for card previews). */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const RICH_HTML_RE =
  /<\s*(p|div|ul|ol|li|h[1-6]|pre|blockquote|br|hr|table|strong|b|em|i|u|s|a|code|mark)\b/i;

/** Whether a stored description is rich text (HTML) or plain text. */
export function isRichHtml(value: string | null | undefined): boolean {
  if (!value) return false;
  return RICH_HTML_RE.test(value);
}

/** Escape plain text so it can be safely embedded inside HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert plain text (with newlines) into simple paragraph HTML. */
export function textToHtml(value: string): string {
  if (isRichHtml(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export interface DeadlineInfo {
  expired: boolean;
  urgent: boolean;
  label: string;
}

export function getDeadlineInfo(
  deadline: string | null | undefined,
): DeadlineInfo | null {
  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return null;

  const diffDays = Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { expired: true, urgent: false, label: "Deadline passed" };
  }
  if (diffDays === 0) {
    return { expired: false, urgent: true, label: "Closes today" };
  }
  if (diffDays === 1) {
    return { expired: false, urgent: true, label: "1 day left" };
  }
  if (diffDays <= 3) {
    return { expired: false, urgent: true, label: `${diffDays} days left` };
  }
  return { expired: false, urgent: false, label: `${diffDays} days left` };
}

export function formatDate(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Human-friendly relative time for "Posted X ago" labels. */
export function timeAgo(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;

  return formatDate(iso);
}
