"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { VerificationStatusBadge } from "@/components/admin/verification/verification-status-badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatus } from "@/constants/enums";
import type { AdminVerificationDetail } from "@/types/admin.types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface VerificationReviewModalProps {
  /** The verification request to review. */
  verification: AdminVerificationDetail | null;
  /** Whether the modal is open. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Callback when approve is clicked. */
  onApprove: (id: string) => Promise<void>;
  /** Callback when reject is clicked. */
  onReject: (id: string, reason: string) => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Section heading used inside the modal body. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
      {children}
    </h3>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Modal for reviewing a single verification request.
 * Shows the applicant's identity, their submitted ID card, an admin note when
 * present, and Approve/Reject actions (rejection requires a reason). ESC closes
 * the dialog via the underlying Dialog primitive.
 */
export function VerificationReviewModal({
  verification,
  open,
  onClose,
  onApprove,
  onReject,
}: VerificationReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!verification) return null;

  const isPending = verification.status === VerificationStatus.PENDING;

  /** Handle approve action. */
  const handleApprove = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onApprove(verification.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle reject action. */
  const handleReject = async () => {
    const reason = rejectReason.trim();
    if (!reason || isLoading) return;
    setIsLoading(true);
    try {
      await onReject(verification.id, reason);
      setRejectReason("");
      setShowRejectForm(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto scrollbar-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <span className="truncate">Verification Review</span>
            <VerificationStatusBadge status={verification.status} />
          </DialogTitle>
          <DialogDescription>
            Review the applicant&apos;s identity details and ID card before
            making a decision.
          </DialogDescription>
        </DialogHeader>

        {/* ── Applicant identity card ─────────────────────────────────── */}
        <section
          aria-label="Applicant details"
          className="rounded-xl border bg-muted/30 p-4 sm:p-5"
        >
          <div className="flex items-center gap-4">
            <Avatar
              id={verification.id}
              name={verification.name}
              className="size-12 text-base"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">
                {verification.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {verification.email}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Student ID
              </dt>
              <dd className="mt-0.5 font-mono text-sm">
                {verification.studentId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Date of Birth
              </dt>
              <dd className="mt-0.5 text-sm">
                {format(new Date(verification.dateOfBirth), "MMM d, yyyy")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Submitted
              </dt>
              <dd className="mt-0.5 text-sm">
                {format(
                  new Date(verification.createdAt),
                  "MMM d, yyyy 'at' h:mm a",
                )}
              </dd>
            </div>
            {verification.reviewedAt && (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Reviewed
                </dt>
                <dd className="mt-0.5 text-sm">
                  {format(
                    new Date(verification.reviewedAt),
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* ── Documents ───────────────────────────────────────────────── */}
        {verification.idCardImage && (
          <section aria-label="Submitted documents">
            <div className="mb-2 flex items-center justify-between">
              <SectionHeading>Documents</SectionHeading>
              <span className="text-xs text-muted-foreground">1 submitted</span>
            </div>

            <div className="rounded-lg border p-3">
              <div className="relative overflow-hidden rounded-md border">
                <a
                  href={verification.idCardImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block"
                >
                  <Image
                    src={verification.idCardImage}
                    alt={`ID card for ${verification.name}`}
                    width={600}
                    height={400}
                    unoptimized
                    className="max-h-64 w-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <ExternalLink className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </a>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">Student ID Card</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Image
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  nativeButton={false}
                  render={
                    <a
                      href={verification.idCardImage}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink className="mr-1 size-3.5" />
                  Open full size
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ── Admin note ──────────────────────────────────────────────── */}
        {verification.note && (
          <div
            aria-label="Admin note"
            className="rounded-lg border bg-muted/30 p-4"
          >
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Admin note
            </p>
            <p className="text-sm">{verification.note}</p>
          </div>
        )}

        {/* ── Reject form ─────────────────────────────────────────────── */}
        {showRejectForm && isPending && (
          <div className="space-y-2" aria-label="Rejection reason">
            <label
              htmlFor="verification-reject-reason"
              className="flex items-center gap-1 text-sm font-medium text-destructive"
            >
              <XCircle className="size-3.5" />
              Rejection reason (required)
            </label>
            <Textarea
              id="verification-reject-reason"
              placeholder="Explain why this request is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-right text-xs text-muted-foreground">
              {rejectReason.length}/500
            </p>
          </div>
        )}

        {/* ── Decision footer ─────────────────────────────────────────── */}
        {isPending ? (
          <DialogFooter className="gap-2 sm:gap-3">
            {showRejectForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  aria-label="Confirm rejection"
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-1 size-4" />
                  )}
                  Confirm Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isLoading}
                >
                  <XCircle className="mr-1 size-4" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1 size-4" />
                  )}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        ) : (
          <DialogFooter>
            <p className="flex w-full items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              This request was already{" "}
              {verification.status === VerificationStatus.APPROVED
                ? "approved"
                : "rejected"}
              {verification.reviewedAt &&
                ` on ${format(
                  new Date(verification.reviewedAt),
                  "MMM d, yyyy",
                )}`}
              .
            </p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
