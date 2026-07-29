"use client";

import { Button } from "@/components/ui/button";
import { X, Ban, ShieldCheck, Play } from "lucide-react";

// ── Component ────────────────────────────────────────────────────────────────

interface BulkActionsProps {
  /** Number of currently selected items. */
  selectedCount: number;
  /** Callback to clear the selection. */
  onClearSelection: () => void;
  /** Available bulk actions. */
  actions: BulkAction[];
}

interface BulkAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive" | "outline";
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Floating toolbar that appears when items are selected in a table.
 * Shows selection count and available bulk action buttons.
 */
export function BulkActions({
  selectedCount,
  onClearSelection,
  actions,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3 shadow-lg dark:bg-gray-800">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant ?? "default"}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="h-8"
              >
                <Icon className="size-3.5 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClearSelection}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Re-export action icon presets ─────────────────────────────────────────────

export const BULK_ACTION_ICONS = { Ban, ShieldCheck, Play } as const;
