"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
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

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.25, ease: "easeOut" as const },
  }),
};

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [loginHistory, setLoginHistory] = useState<PaginatedLoginHistory | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const result = await getActiveSessionsAction();
        if (result.success && result.data) {
          const sessionList = result.data as ActiveSession[];
          setSessions(sessionList);
          if (sessionList.length > 0) {
            const current = sessionList.find((s) => s.isCurrent);
            setCurrentSessionId(current?.id ?? sessionList[0].id);
          }
        }
      } catch {
      } finally {
        setSessionsLoading(false);
      }
    }
    loadSessions();
  }, []);

  useEffect(() => {
    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const result = await getLoginHistoryAction(historyPage);
        if (result.success && result.data) {
          setLoginHistory(result.data as PaginatedLoginHistory);
        }
      } catch {
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
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ensure your account stays secure with a strong password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 w-full max-w-md">
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
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
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
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
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
      </motion.div>
    </div>
  );
}
