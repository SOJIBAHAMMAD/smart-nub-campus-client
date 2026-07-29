"use client";

import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { SettingsSidebar } from "./settings-sidebar";
import { ProfileVisibility } from "./profile-visibility";
import { NotificationSettings } from "./notification-settings";
import { PrivacySettings } from "./privacy-settings";
import { SecuritySettings } from "./security-settings";
import { AccountManagement } from "./account-management";
import { BlockedUsers } from "./blocked-users";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPrivacySettingsAction,
  getNotificationSettingsAction,
} from "@/actions/settings.actions";
import type {
  UserSettings,
  UserNotificationSettings,
  DeletionInfo,
} from "@/types";

interface SettingsClientProps {
  initialSettings?: UserSettings | null;
  initialNotificationSettings?: UserNotificationSettings | null;
  initialDeletionInfo?: DeletionInfo | null;
  section?: string;
}

/**
 * Main settings client component. Uses URL-based section routing
 * to render the active settings section with a left sidebar.
 */
export function SettingsClient({
  initialSettings,
  initialNotificationSettings,
  initialDeletionInfo,
  section = "profile",
}: SettingsClientProps) {
  const [settings, setSettings] = useState<UserSettings | null>(
    initialSettings ?? null,
  );
  const [notificationSettings, setNotificationSettings] =
    useState<UserNotificationSettings | null>(
      initialNotificationSettings ?? null,
    );
  const [deletionInfo] = useState<DeletionInfo | null>(
    initialDeletionInfo ?? null,
  );
  const [loading, setLoading] = useState(
    !initialSettings || !initialNotificationSettings,
  );

  // Fetch settings if not provided initially
  useEffect(() => {
    async function loadSettings() {
      try {
        const [privacyRes, notifRes] = await Promise.all([
          getPrivacySettingsAction(),
          getNotificationSettingsAction(),
        ]);
        if (privacyRes.success && privacyRes.data) {
          setSettings(privacyRes.data as UserSettings);
        }
        if (notifRes.success && notifRes.data) {
          setNotificationSettings(
            notifRes.data as UserNotificationSettings,
          );
        }
      } catch {
        // Settings may not exist yet
      } finally {
        setLoading(false);
      }
    }

    if (!initialSettings || !initialNotificationSettings) {
      loadSettings();
    }
  }, [initialSettings, initialNotificationSettings]);

  const renderSection = () => {
    if (loading) {
      return <SettingsSkeleton />;
    }

    switch (section) {
      case "profile":
        return settings ? (
          <ProfileVisibility settings={settings} />
        ) : (
          <SettingsSkeleton />
        );

      case "notifications":
        return notificationSettings ? (
          <NotificationSettings settings={notificationSettings} />
        ) : (
          <SettingsSkeleton />
        );

      case "privacy":
        return settings ? (
          <PrivacySettings settings={settings} />
        ) : (
          <SettingsSkeleton />
        );

      case "security":
        return <SecuritySettings />;

      case "account":
        return <AccountManagement deletionInfo={deletionInfo ?? undefined} />;

      case "blocked":
        return <BlockedUsers />;

      default:
        return settings ? (
          <ProfileVisibility settings={settings} />
        ) : (
          <SettingsSkeleton />
        );
    }
  };

  return (
    <PageLayout leftSidebar={<SettingsSidebar />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getSectionTitle(section)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getSectionDescription(section)}
          </p>
        </div>
        {renderSection()}
      </div>
    </PageLayout>
  );
}

function getSectionTitle(section: string): string {
  const titles: Record<string, string> = {
    profile: "Profile Visibility",
    notifications: "Notification Preferences",
    privacy: "Privacy Settings",
    security: "Security Settings",
    account: "Account Management",
    blocked: "Blocked Users",
  };
  return titles[section] ?? "Settings";
}

function getSectionDescription(section: string): string {
  const descriptions: Record<string, string> = {
    profile: "Control who can see each section of your profile.",
    notifications: "Choose how you want to be notified for each feature.",
    privacy: "Manage your online presence and discoverability.",
    security: "Manage your password, sessions, and login history.",
    account: "Export data, deactivate, or delete your account.",
    blocked: "Manage users you've blocked from contacting you.",
  };
  return descriptions[section] ?? "";
}

/** Loading skeleton for settings sections. */
function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
