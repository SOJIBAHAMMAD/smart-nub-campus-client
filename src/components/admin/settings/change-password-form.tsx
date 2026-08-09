"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordAction } from "@/actions/settings.actions";
import { PasswordStrength } from "@/components/settings/password-strength";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    setPending(true);
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        toast.success("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Update the password used to sign in to your admin account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full max-w-md space-y-4"
        >
          <PasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            show={showCurrent}
            onToggleShow={() => setShowCurrent((visible) => !visible)}
          />

          <div className="space-y-2">
            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              show={showNew}
              onToggleShow={() => setShowNew((visible) => !visible)}
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div className="space-y-2">
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              show={showConfirm}
              onToggleShow={() => setShowConfirm((visible) => !visible)}
              invalid={confirmPassword.length > 0 && !passwordsMatch}
              hint={
                confirmPassword.length > 0 && !passwordsMatch ? (
                  <p className="text-xs text-destructive">
                    Passwords do not match.
                  </p>
                ) : undefined
              }
            />
          </div>

          <Button type="submit" disabled={pending || !canSubmit} className="w-full sm:w-auto">
            {pending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  show,
  onToggleShow,
  invalid,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  show: boolean;
  onToggleShow: () => void;
  invalid?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint}
    </div>
  );
}
