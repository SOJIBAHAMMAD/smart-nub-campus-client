"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";
import {
  User,
  Bell,
  Shield,
  Lock,
  SettingsIcon,
  Ban,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    label: "Profile",
    href: `${ROUTES.SETTINGS}/profile`,
    icon: User,
  },
  {
    label: "Notifications",
    href: `${ROUTES.SETTINGS}/notifications`,
    icon: Bell,
  },
  {
    label: "Privacy",
    href: `${ROUTES.SETTINGS}/privacy`,
    icon: Shield,
  },
  {
    label: "Security",
    href: `${ROUTES.SETTINGS}/security`,
    icon: Lock,
  },
  {
    label: "Account",
    href: `${ROUTES.SETTINGS}/account`,
    icon: SettingsIcon,
  },
  {
    label: "Blocked Users",
    href: `${ROUTES.SETTINGS}/blocked`,
    icon: Ban,
  },
] as const;

/**
 * Left sidebar navigation for the Settings page.
 * Highlights the currently active section based on the URL.
 */
export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings navigation" className="space-y-1">
      <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Settings
      </h2>
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = pathname.startsWith(section.href);
        const Icon = section.icon;

        return (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
