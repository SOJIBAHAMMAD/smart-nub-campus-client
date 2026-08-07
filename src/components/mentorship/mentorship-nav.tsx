"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, Users } from "lucide-react";
import ROUTES from "@/constants/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: ROUTES.MENTORSHIP, label: "Find mentors", icon: Compass },
  {
    href: ROUTES.MENTORSHIP_REQUESTS,
    label: "My requests",
    icon: MessageSquare,
  },
  {
    href: ROUTES.MENTORSHIP_RELATIONSHIPS,
    label: "My mentorships",
    icon: Users,
  },
] as const;

/**
 * Shared section navigation for the mentorship area.
 * Real underline-style tabs (links) shown identically on every
 * mentorship page so users always know where they are and where to go.
 */
export function MentorshipNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === ROUTES.MENTORSHIP
      ? pathname === ROUTES.MENTORSHIP
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Mentorship" className="border-b border-border">
      <div className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
