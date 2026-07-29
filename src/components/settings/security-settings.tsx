"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  changePasswordAction,
  getActiveSessionsAction,
  terminateSessionAction,
  terminateOtherSessionsAction,
  getLoginHistoryAction,
} from "@/actions/settings.actions";
import { PasswordStrength } from "./password-strength";
import { SessionList } from "./session-list";
import { LoginHistoryTable } from "./login-history-table";
import type {
  ActiveSession,
  PaginatedLoginHistory,
} from "@/types";

/**
 * Security settings: change password, active sessions, login history.
 */
export function SecuritySettings() {
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Login history
  const [loginHistory, setLoginHistory] = useState<PaginatedLoginHistory | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const result = await getActiveSessionsAction();
        if (result.success && result.data) {
          const sessionList = result.data as ActiveSession[];
          setSessions(sessionList);
          // Current session is the most recently updated one
          if (sessionList.length > 0) {
            setCurrentSessionId(sessionList[0].id);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setSessionsLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Load login history
  useEffect(() => {
    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const result = await getLoginHistoryAction(historyPage);
        if (result.success && result.data) {
          setLoginHistory(result.data as PaginatedLoginHistory);
        }
      } catch {
        // Silently fail
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, [historyPage]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (result.success) {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const result = await terminateSessionAction(sessionId);
      if (result.success) {
        toast.success("Session terminated.");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to terminate session.");
    }
  };

  const handleTerminateOthers = async () => {
    try {
      const result = await terminateOtherSessionsAction();
      if (result.success) {
        toast.success("Other sessions terminated.");
        setSessions((prev) =>
          prev.filter((s) => s.id === currentSessionId),
        );
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to terminate sessions.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ensure your account stays secure with a strong password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrength password={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your active login sessions across devices.
          </p>
        </CardHeader>
        <CardContent>
          <SessionList
            sessions={sessions}
            currentSessionId={currentSessionId}
            onTerminate={handleTerminateSession}
            onTerminateOthers={handleTerminateOthers}
            loading={sessionsLoading}
          />
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Login History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review recent login attempts on your account.
          </p>
        </CardHeader>
        <CardContent>
          <LoginHistoryTable
            history={loginHistory}
            onPageChange={setHistoryPage}
            loading={historyLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
