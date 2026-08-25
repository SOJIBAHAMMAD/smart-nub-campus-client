"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
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
  getDeletionStatusAction,
} from "@/actions/settings.actions";
import type {
  UserSettings,
  UserNotificationSettings,
  DeletionInfo,
} from "@/types";

interface SettingsClientProps {
  initialSettings?: UserSettings | null;
  initialNotificationSettings?: UserNotificationSettings | null;
  section?: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function SettingsClient({
  initialSettings,
  initialNotificationSettings,
  section = "profile",
}: SettingsClientProps) {
  const [settings, setSettings] = useState<UserSettings | null>(
    initialSettings ?? null,
  );
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(
    initialNotificationSettings ?? null,
  );
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null);

  useEffect(() => {
    if (!initialSettings) {
      getPrivacySettingsAction().then((res) => {
        if (res.success && res.data) {
          setSettings(res.data as UserSettings);
        }
      });
    }
  }, [initialSettings]);

  useEffect(() => {
    if (!initialNotificationSettings) {
      getNotificationSettingsAction().then((res) => {
        if (res.success && res.data) {
          setNotificationSettings(res.data as UserNotificationSettings);
        }
      });
    }
  }, [initialNotificationSettings]);

  useEffect(() => {
    getDeletionStatusAction().then((res) => {
      if (res.success && res.data) {
        setDeletionInfo(res.data as DeletionInfo);
      }
    });
  }, []);

  const renderSection = useCallback(() => {
    const sectionContent = (() => {
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
    })();

    return (
      <motion.div
        key={section}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        {sectionContent}
      </motion.div>
    );
  }, [section, settings, notificationSettings, deletionInfo]);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <aside className="sticky top-0 z-10 flex-shrink-0 self-start border-r border-border/50 bg-background px-2 py-5 lg:w-[260px] lg:px-4">
        <SettingsSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:py-6 lg:pl-8">
        <div className="mx-auto w-full max-w-3xl space-y-6">
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
      </main>
    </div>
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
