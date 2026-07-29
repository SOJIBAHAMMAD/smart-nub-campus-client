"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Download,
  Archive,
  AlertTriangle,
  Trash2,
  Clock,
} from "lucide-react";
import {
  requestExportAction,
  getExportStatusAction,
  downloadExportAction,
  requestArchiveAction,
  deactivateAccountAction,
  requestDeletionAction,
  cancelDeletionAction,
} from "@/actions/settings.actions";
import type { ExportType, DeletionInfo } from "@/types";

interface AccountManagementProps {
  deletionInfo?: DeletionInfo;
}

/**
 * Account management: export data, archive, deactivate, delete account.
 */
export function AccountManagement({ deletionInfo }: AccountManagementProps) {
  // Export
  const [exportType, setExportType] = useState<ExportType>("JSON");
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Archive
  const [archivePassword, setArchivePassword] = useState("");
  const [archiving, setArchiving] = useState(false);

  // Deactivate
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Delete
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirmInput, setShowDeleteConfirmInput] = useState(false);
  const [_deleting, setDeleting] = useState(false);
  const [deletionScheduled, setDeletionScheduled] = useState(
    deletionInfo?.scheduledDeletionAt ?? null,
  );

  // ── Export Handlers ───────────────────────────────────────────────

  const handleRequestExport = async () => {
    setExporting(true);
    try {
      const result = await requestExportAction(exportType);
      if (result.success && result.data) {
        const { jobId, status } = result.data as { jobId: string; status: string };
        setExportJobId(jobId);
        setExportStatus(status);
        toast.success("Export request submitted.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to request export.");
    } finally {
      setExporting(false);
    }
  };

  const handleCheckExportStatus = async () => {
    if (!exportJobId) return;
    try {
      const result = await getExportStatusAction(exportJobId);
      if (result.success && result.data) {
        const job = result.data as { status: string };
        setExportStatus(job.status);
        if (job.status === "COMPLETED") {
          toast.success("Export is ready for download!");
        }
      }
    } catch {
      toast.error("Failed to check export status.");
    }
  };

  const handleDownloadExport = async () => {
    if (!exportJobId) return;
    try {
      const result = await downloadExportAction(exportJobId);
      if (result.success && result.data) {
        const { downloadUrl } = result.data as { downloadUrl: string };
        if (downloadUrl) {
          window.open(downloadUrl, "_blank");
        }
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to download export.");
    }
  };

  // ── Archive Handler ───────────────────────────────────────────────

  const handleRequestArchive = async () => {
    if (!archivePassword) return;
    setArchiving(true);
    try {
      const result = await requestArchiveAction(archivePassword);
      if (result.success) {
        toast.success("Archive request submitted.");
        setArchivePassword("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to request archive.");
    } finally {
      setArchiving(false);
    }
  };

  // ── Deactivate Handler ────────────────────────────────────────────

  const handleDeactivate = async () => {
    if (!deactivatePassword) return;
    setDeactivating(true);
    try {
      const result = await deactivateAccountAction(deactivatePassword);
      if (result.success) {
        toast.success("Account deactivated. You have been logged out.");
        setShowDeactivateDialog(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to deactivate account.");
    } finally {
      setDeactivating(false);
    }
  };

  // ── Delete Handlers ───────────────────────────────────────────────

  const handleRequestDeletion = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    try {
      const result = await requestDeletionAction(deletePassword, deleteReason || undefined);
      if (result.success && result.data) {
        const { scheduledDeletionAt } = result.data as { scheduledDeletionAt: string };
        setDeletionScheduled(scheduledDeletionAt);
        setShowDeleteDialog(false);
        toast.success("Account deletion scheduled.");
        setDeletePassword("");
        setDeleteReason("");
        setShowDeleteConfirmInput(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to request deletion.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      const result = await cancelDeletionAction();
      if (result.success) {
        setDeletionScheduled(null);
        toast.success("Deletion cancelled.");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to cancel deletion.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Download a copy of all your data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!exportJobId ? (
            <div className="flex items-center gap-3">
              <Select
                value={exportType}
                onValueChange={(v) => setExportType(v as ExportType)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JSON">JSON</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleRequestExport} disabled={exporting}>
                {exporting ? "Requesting..." : "Request Export"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant={exportStatus === "COMPLETED" ? "default" : "secondary"}>
                {exportStatus === "COMPLETED" ? "Ready" : exportStatus === "PROCESSING" ? "Processing..." : exportStatus}
              </Badge>
              {exportStatus === "COMPLETED" ? (
                <Button size="sm" onClick={handleDownloadExport}>
                  Download
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleCheckExportStatus}>
                  Check Status
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Archive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Download Archive
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Get a complete archive of your account including all data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 max-w-md">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="archive-password">Password</Label>
              <Input
                id="archive-password"
                type="password"
                value={archivePassword}
                onChange={(e) => setArchivePassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            <Button
              onClick={handleRequestArchive}
              disabled={archiving || !archivePassword}
            >
              {archiving ? "Requesting..." : "Request Archive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deactivate Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Deactivate Account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your profile will be hidden and you won&apos;t be able to log in.
            You can reactivate anytime.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => setShowDeactivateDialog(true)}
          >
            Deactivate Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Your account will be scheduled for
            permanent deletion in 30 days.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {deletionScheduled ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
              <Clock className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Deletion scheduled</p>
                <p className="text-xs text-muted-foreground">
                  Your account will be permanently deleted on{" "}
                  {new Date(deletionScheduled).toLocaleDateString()}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelDeletion}
              >
                Cancel Deletion
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Request Account Deletion
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Account?</DialogTitle>
            <DialogDescription>
              Your profile will be hidden and you won&apos;t be able to log in.
              You can reactivate your account anytime by logging in again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="deactivate-pwd">Enter your password to confirm</Label>
            <Input
              id="deactivate-pwd"
              type="password"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeactivateDialog(false);
                setDeactivatePassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivating || !deactivatePassword}
            >
              {deactivating ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and all associated data
              will be permanently deleted after a 30-day grace period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="delete-pwd">Enter your password</Label>
              <Input
                id="delete-pwd"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delete-reason">Reason (optional)</Label>
              <Textarea
                id="delete-reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Help us improve by sharing why you're leaving..."
                rows={3}
              />
            </div>
            {!showDeleteConfirmInput ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirmInput(true)}
                disabled={!deletePassword}
              >
                I understand the consequences
              </Button>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="delete-confirm">
                  Type <span className="font-bold">DELETE</span> to confirm
                </Label>
                <Input
                  id="delete-confirm"
                  placeholder='Type "DELETE"'
                  onChange={(e) => {
                    if (e.target.value === "DELETE") {
                      handleRequestDeletion();
                    }
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword("");
                setDeleteReason("");
                setShowDeleteConfirmInput(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
