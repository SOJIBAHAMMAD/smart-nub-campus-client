/* TODO(AI-PAGE): Known issues to revisit — Phase 18 AI Assistant page. See commit/notes: 1) New-chat URL uses /ai?chat=<id> via createNewSession; confirm this matches desired route (some wanted /ai/<uuid> path segment). 2) Chat history title updates from server on first message — verify it shows promptly. 3) Verify send retry-on-not-found and clean URL across refresh/back-forward. 4) Re-check right sidebar (AI Tools removed per request). */
"use client";


import { MessageSquare, Trash2 } from "lucide-react";
import type { AIChatSession } from "@/types/ai.types";
import { cn } from "@/lib/utils";

interface ChatHistoryItemProps {
  session: AIChatSession;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * A single conversation entry in the chat history list.
 * Shows the title, relative timestamp, and a delete action.
 */
export function ChatHistoryItem({
  session,
  isActive,
  disabled,
  onSelect,
  onDelete,
}: ChatHistoryItemProps) {
  const title = session.title || "New Chat";
  const created = new Date(session.createdAt);
  const label = created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-50",
      )}
    >
      <button
        onClick={onSelect}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <MessageSquare className="size-4 shrink-0" />
        <span className="truncate">{title}</span>
      </button>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {label}
      </span>
      <button
        onClick={onDelete}
        disabled={disabled}
        aria-label="Delete conversation"
        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
