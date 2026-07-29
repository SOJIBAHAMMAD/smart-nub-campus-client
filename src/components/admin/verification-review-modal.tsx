"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { AdminVerificationDetail } from "@/types/admin.types";
import { VerificationStatus } from "@/constants/enums";

// ── Component ────────────────────────────────────────────────────────────────

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

/**
 * Modal for reviewing a single verification request.
 * Shows student info, ID card preview, and approve/reject actions.
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
    if (!rejectReason.trim()) return;
    setIsLoading(true);
    try {
      await onReject(verification.id, rejectReason.trim());
      setRejectReason("");
      setShowRejectForm(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  /** Get status badge variant. */
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return <Badge variant="outline" className="border-amber-300 text-amber-700">Pending</Badge>;
      case VerificationStatus.APPROVED:
        return <Badge variant="outline" className="border-green-300 text-green-700">Approved</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="outline" className="border-red-300 text-red-700">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Verification Review
            {getStatusBadge(verification.status)}
          </DialogTitle>
          <DialogDescription>
            Review student verification request details and documents.
          </DialogDescription>
        </DialogHeader>

        {/* ── Student Info ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm font-semibold">{verification.name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{verification.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Student ID</p>
            <p className="text-sm font-mono">{verification.studentId}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
            <p className="text-sm">
              {format(new Date(verification.dateOfBirth), "MMM d, yyyy")}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Submitted</p>
            <p className="text-sm">
              {format(new Date(verification.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {verification.reviewedAt && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
              <p className="text-sm">
                {format(new Date(verification.reviewedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}
        </div>

        {/* ── ID Card Preview ──────────────────────────────────────────── */}
        {verification.idCardImage && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">ID Card</p>
            <div className="relative overflow-hidden rounded-lg border">
              <a
                href={verification.idCardImage}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block"
              >
                <Image
                  src={verification.idCardImage}
                  alt="Student ID Card"
                  width={600}
                  height={400}
                  unoptimized
                  className="w-full object-contain max-h-[300px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <ExternalLink className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            </div>
          </div>
        )}

        {/* ── Admin Note (if exists) ───────────────────────────────────── */}
        {verification.note && (
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Admin Note
            </p>
            <p className="text-sm">{verification.note}</p>
          </div>
        )}

        {/* ── Reject Form ──────────────────────────────────────────────── */}
        {showRejectForm && isPending && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">
              Rejection reason (required)
            </p>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {isPending && (
          <DialogFooter className="gap-2 sm:gap-0">
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
                >
                  <XCircle className="size-4 mr-1" />
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
                  <XCircle className="size-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
