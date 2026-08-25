import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/settings-client";
import { Suspense } from "react";
import {
  getPrivacySettingsAction,
  getNotificationSettingsAction,
} from "@/actions/settings.actions";
import type {
  UserSettings,
  UserNotificationSettings,
} from "@/types";

export const metadata: Metadata = {
  title: "Settings | Smart NUB Campus",
  description:
    "Manage your account settings including privacy, notifications, security, and account preferences.",
  openGraph: {
    title: "Settings | Smart NUB Campus",
    description: "Manage your account settings at Smart NUB Campus.",
    type: "website",
  },
};

/**
 * Settings page — Server Component with server-side data fetching.
 * Uses optional catch-all route to handle /settings, /settings/profile, etc.
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: sectionParam } = await params;
  const section = sectionParam?.[0] ?? "profile";

  const validSections = [
    "profile",
    "notifications",
    "privacy",
    "security",
    "account",
    "blocked",
  ];
  const activeSection = validSections.includes(section) ? section : "profile";

  const [privacyRes, notifRes] = await Promise.all([
    getPrivacySettingsAction(),
    getNotificationSettingsAction(),
  ]);

  const initialSettings = privacyRes.success
    ? (privacyRes.data as UserSettings | null)
    : null;
  const initialNotificationSettings = notifRes.success
    ? (notifRes.data as UserNotificationSettings | null)
    : null;

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>
      }
    >
      <SettingsClient
        initialSettings={initialSettings}
        initialNotificationSettings={initialNotificationSettings}
        section={activeSection}
      />
    </Suspense>
  );
}
