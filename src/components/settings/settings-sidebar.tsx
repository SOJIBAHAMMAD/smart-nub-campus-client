"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ROUTES from "@/constants/routes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Bell,
  Shield,
  Lock,
  SettingsIcon,
  Ban,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  { label: "Profile", href: `${ROUTES.SETTINGS}/profile`, icon: User },
  { label: "Notifications", href: `${ROUTES.SETTINGS}/notifications`, icon: Bell },
  { label: "Privacy", href: `${ROUTES.SETTINGS}/privacy`, icon: Shield },
  { label: "Security", href: `${ROUTES.SETTINGS}/security`, icon: Lock },
  { label: "Account", href: `${ROUTES.SETTINGS}/account`, icon: SettingsIcon },
  { label: "Blocked", href: `${ROUTES.SETTINGS}/blocked`, icon: Ban },
] as const;

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={400}>
      <nav aria-label="Settings navigation">
        <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 max-lg:sr-only">
          Settings
        </h2>
        <div className="flex flex-col gap-1">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive = pathname.startsWith(section.href);
            const Icon = section.icon;

            return (
              <Tooltip key={section.href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={section.href}
                      className={cn(
                        "group relative flex items-center justify-center lg:justify-start gap-3 rounded-lg px-2 py-2.5 lg:px-3 text-sm font-medium transition-all duration-150",
                        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary transition-all duration-150",
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                          "max-lg:hidden",
                        )}
                      />

                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden lg:inline truncate">
                        {section.label}
                      </span>
                    </Link>
                  }
                />
                <TooltipContent side="right" sideOffset={8} className="lg:hidden">
                  {section.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}
