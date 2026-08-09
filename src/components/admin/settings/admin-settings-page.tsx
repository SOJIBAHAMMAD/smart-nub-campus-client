"use client";

import { motion } from "motion/react";
import { AccountSettingsCard } from "./account-settings-card";
import { ActiveSessionsCard } from "./active-sessions-card";
import { AppearanceSettingsCard } from "./appearance-settings-card";
import { ChangePasswordForm } from "./change-password-form";
import { DangerZoneCard } from "./danger-zone-card";
import {
  SETTINGS_SECTIONS,
  SettingsSectionNav,
  useActiveSection,
} from "./settings-section-nav";

const SECTION_IDS = SETTINGS_SECTIONS.map((section) => section.id);

export function AdminSettingsPage() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="min-h-full p-4 pb-10 sm:p-6">
      <header className="max-w-4xl">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your admin account, appearance, security, and sessions.
        </p>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <SettingsSectionNav active={active} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4 min-w-0 space-y-6 lg:mt-0"
        >
          <SettingsSection id="account" label="Account">
            <AccountSettingsCard />
          </SettingsSection>

          <SettingsSection id="appearance" label="Appearance">
            <AppearanceSettingsCard />
          </SettingsSection>

          <SettingsSection id="security" label="Security">
            <ChangePasswordForm />
            <ActiveSessionsCard />
          </SettingsSection>

          <SettingsSection id="danger" label="Danger Zone">
            <DangerZoneCard />
          </SettingsSection>
        </motion.div>
      </div>
    </div>
  );
}

function SettingsSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-section-heading`}
      className="scroll-mt-28 lg:scroll-mt-24"
    >
      <h2 id={`${id}-section-heading`} className="sr-only">
        {label}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
