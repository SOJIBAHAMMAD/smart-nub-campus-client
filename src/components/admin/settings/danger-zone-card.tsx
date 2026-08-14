"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ROUTES from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { clearSessionCookie } from "@/lib/session-mirror";
import { toast } from "sonner";

export function DangerZoneCard() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await clearSessionCookie();
      toast.success("You have been signed out.");
      router.push(ROUTES.LOGIN);
    } catch {
      setConfirmOpen(false);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <Card className="border-destructive/30 dark:border-destructive/40">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </span>
          <div>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              End your admin session on this device.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Signing out clears your session on this device and returns you to the
          login page. Other active sessions will remain signed in.
        </p>
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Sign out of the admin panel?"
          description="Your session on this device will end. You can sign back in at any time."
          confirmLabel="Sign out"
          onConfirm={handleSignOut}
        />
      </CardContent>
    </Card>
  );
}
