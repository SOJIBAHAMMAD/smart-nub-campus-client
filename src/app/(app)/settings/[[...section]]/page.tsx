import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/settings-client";
import { Suspense } from "react";

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
 * Settings page — Server Component.
 * Uses optional catch-all route to handle /settings, /settings/profile, etc.
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: sectionParam } = await params;
  const section = sectionParam?.[0] ?? "profile";

  // Validate section name
  const validSections = [
    "profile",
    "notifications",
    "privacy",
    "security",
    "account",
    "blocked",
  ];
  const activeSection = validSections.includes(section) ? section : "profile";

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>
      }
    >
      <SettingsClient section={activeSection} />
    </Suspense>
  );
}
