"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Palette, ShieldCheck, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsSection {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "account",
    label: "Account",
    description: "Your admin identity and account details",
    icon: UserCircle,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Choose how the admin panel looks on this device",
    icon: Palette,
  },
  {
    id: "security",
    label: "Security",
    description: "Update your password and review active sessions",
    icon: ShieldCheck,
  },
  {
    id: "danger",
    label: "Danger Zone",
    description: "End your session from this device",
    icon: AlertTriangle,
  },
];

const SCROLL_THRESHOLD = 128;

function getScrollContainer(): HTMLElement {
  const main = document.querySelector("main");
  return (main as HTMLElement | null) ?? document.documentElement;
}

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const updateActive = () => {
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= SCROLL_THRESHOLD) {
          current = el.id;
        }
      }
      setActive(current);
    };

    const container = getScrollContainer();
    updateActive();
    container.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive, { passive: true });

    return () => {
      container.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [ids]);

  return active;
}

function handleSectionClick(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function SettingsSectionNav({ active }: { active: string }) {
  return (
    <>
      <nav
        aria-label="Settings sections"
        className="sticky top-16 hidden w-full flex-col gap-1 self-start lg:flex"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <div className="flex flex-col gap-1">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = active === section.id;
            const Icon = section.icon;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => handleSectionClick(event, section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                  )}
                />
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{section.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Settings sections"
        className="sticky top-16 z-30 -mx-4 border-b border-border/60 bg-background/95 px-4 py-2 backdrop-blur-md supports-backdrop-filter:bg-background/60 sm:-mx-6 sm:px-6 lg:hidden"
      >
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = active === section.id;
            const Icon = section.icon;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => handleSectionClick(event, section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {section.label}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
