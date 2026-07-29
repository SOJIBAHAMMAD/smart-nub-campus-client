"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateNotificationSettingsAction } from "@/actions/settings.actions";
import type { UserNotificationSettings } from "@/types";

interface NotificationSettingsProps {
  settings: UserNotificationSettings;
}

const NOTIFICATION_CHANNELS = [
  {
    key: "resources" as const,
    label: "Resources",
    description: "New uploads in subscribed courses",
  },
  {
    key: "discussions" as const,
    label: "Discussions",
    description: "Replies and mentions",
  },
  {
    key: "qa" as const,
    label: "Q&A",
    description: "Answers, mentions, accepted answers",
  },
  {
    key: "messaging" as const,
    label: "Messaging",
    description: "New messages",
  },
  {
    key: "network" as const,
    label: "Network",
    description: "Connection requests and accepts",
  },
  {
    key: "teams" as const,
    label: "Teams",
    description: "Invitations and updates",
  },
  {
    key: "admin" as const,
    label: "Admin",
    description: "System announcements",
  },
] as const;

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = async (
    field: keyof UserNotificationSettings,
  ) => {
    const newValue = !localSettings[field];
    setLocalSettings((prev) => ({ ...prev, [field]: newValue }));

    try {
      const result = await updateNotificationSettingsAction({
        [field]: newValue,
      });
      if (result.success) {
        toast.success("Notification setting updated.");
      } else {
        toast.error(result.message);
        setLocalSettings((prev) => ({ ...prev, [field]: !newValue }));
      }
    } catch {
      toast.error("Failed to update notification setting.");
      setLocalSettings((prev) => ({ ...prev, [field]: !newValue }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notification Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified for each feature.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px] gap-2 pb-2 border-b text-xs font-medium text-muted-foreground">
            <span>Feature</span>
            <span className="text-center">In-App</span>
            <span className="text-center">Email</span>
          </div>

          {NOTIFICATION_CHANNELS.map(({ key, label, description }) => {
            const inAppKey = `${key}InApp` as keyof UserNotificationSettings;
            const emailKey = `${key}Email` as keyof UserNotificationSettings;

            return (
              <div
                key={key}
                className="grid grid-cols-[1fr_80px_80px] gap-2 py-3 border-b last:border-0 items-center"
              >
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex justify-center">
                  <Switch
                    size="sm"
                    checked={localSettings[inAppKey] as boolean}
                    onCheckedChange={() => handleToggle(inAppKey)}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    size="sm"
                    checked={localSettings[emailKey] as boolean}
                    onCheckedChange={() => handleToggle(emailKey)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
