"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "plagiarism", label: "Plagiarism" },
  { value: "off_topic", label: "Off-topic" },
  { value: "other", label: "Other" },
] as const;

interface ReportDialogProps {
  replyId: string;
  onReport: (replyId: string, reason: string, details?: string) => Promise<void>;
}

export function ReportDialog({ replyId, onReport }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await onReport(replyId, reason, details || undefined);
      setOpen(false);
      setReason("");
      setDetails("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            <Flag className="size-3" />
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Reply</DialogTitle>
          <DialogDescription>
            Select a reason for reporting this reply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="radio"
                name="report-reason"
                value={r.value}
                checked={reason === r.value}
                onChange={(e) => setReason(e.target.value)}
                className="size-4 accent-primary"
              />
              {r.label}
            </label>
          ))}

          <textarea
            placeholder="Additional details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border bg-transparent p-2 text-xs outline-none ring-1 ring-foreground/10 focus:ring-primary"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Flag className="size-4" />
            )}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
