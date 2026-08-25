"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Callback to toggle open state. */
  onOpenChange: (open: boolean) => void;
  /** Dialog title. */
  title: string;
  /** Dialog description/message. */
  description: string;
  /** Label for the confirm button. Default: "Confirm". */
  confirmLabel?: string;
  /** Variant for the confirm button. Default: "destructive". */
  confirmVariant?: "default" | "destructive";
  /** Callback when confirm is clicked. Can be async — button shows loading spinner while pending. */
  onConfirm: () => void | Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Confirmation dialog for destructive or important actions.
 * Wraps the base Dialog component with confirm/cancel buttons and loading state.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
  onConfirm,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="size-4 mr-1 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
