"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  UserCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ROUTES from "@/constants/routes";

// ── Navigation model ─────────────────────────────────────────────────────────

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

/** Grouped admin navigation — the shell derives the top-bar section title from it. */
export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    id: "management",
    label: "Management",
    items: [
      { label: "Verification Requests", href: "/admin/verifications", icon: ShieldCheck },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Alumni", href: "/admin/alumni", icon: UserCheck },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { label: "Resources", href: "/admin/resources", icon: BookOpen },
      { label: "Discussions", href: "/admin/discussions", icon: MessageSquare },
      { label: "Courses & Categories", href: "/admin/courses", icon: GraduationCap },
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Job Posts", href: "/admin/jobs", icon: Briefcase },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "My Profile", href: "/admin/profile", icon: UserCircle },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

/** Flat list of nav items, kept for the shell title lookup and existing consumers. */
export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);

/**
 * Resolve the active admin nav item for a pathname.
 * Exact match for the dashboard root, prefix match for everything else; when two
 * items match a route the more specific (longest href) wins, and unknown admin
 * sub-routes fall back to the Dashboard item so there is always exactly one
 * active link (`aria-current="page"`).
 */
export function getActiveAdminItem(pathname: string): {
  group: AdminNavGroup;
  item: AdminNavItem;
} | null {
  if (!pathname.startsWith("/admin")) return null;

  const matches: Array<{ group: AdminNavGroup; item: AdminNavItem }> = [];

  for (const group of adminNavGroups) {
    for (const item of group.items) {
      const isMatch =
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
      if (isMatch) matches.push({ group, item });
    }
  }

  if (matches.length > 0) {
    return matches.sort((a, b) => b.item.href.length - a.item.href.length)[0];
  }

  const overview = adminNavGroups.find((group) => group.id === "overview");
  const dashboard = overview?.items.find((item) => item.href === "/admin");
  return dashboard && overview ? { group: overview, item: dashboard } : null;
}

// ── Shared styles ────────────────────────────────────────────────────────────

const navLinkBase =
  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors";

const navLinkCollapsed = "justify-center px-0";

const navLinkActive = "bg-sidebar-accent text-sidebar-accent-foreground";

const navLinkIdle =
  "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground";

const iconActive = "text-sidebar-primary";

const iconIdle = "text-sidebar-foreground/70 group-hover:text-sidebar-foreground";

// ── Nav item link (desktop rail + mobile drawer) ─────────────────────────────

function SidebarNavItemLink({
  item,
  active,
  collapsed,
  showBadge,
  pendingCount,
  onClose,
}: {
  item: AdminNavItem;
  active: boolean;
  collapsed: boolean;
  showBadge: boolean;
  pendingCount: number;
  onClose?: () => void;
}) {
  const Icon = item.icon;

  const content = (
    <>
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary"
        />
      )}
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          active ? iconActive : iconIdle,
        )}
      >
        <Icon className="size-5" />
        {showBadge && collapsed && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-500 ring-2 ring-sidebar"
          />
        )}
      </span>
      <span className={cn(collapsed ? "sr-only" : "min-w-0 flex-1 truncate text-left")}>
        {item.label}
      </span>
      {showBadge && !collapsed && (
        <>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
          <span className="sr-only">{pendingCount} pending</span>
        </>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(navLinkBase, navLinkCollapsed, active ? navLinkActive : navLinkIdle)}
            />
          }
        >
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(navLinkBase, active ? navLinkActive : navLinkIdle)}
    >
      {content}
    </Link>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  /** Current user's display name. */
  userName?: string;
  /** Current user's avatar URL. */
  userImage?: string;
  /** Number of pending verification requests. */
  pendingCount?: number;
  /** Callback when the sidebar close button is clicked (mobile drawer). */
  onClose?: () => void;
  /** Desktop-only: icon rail mode with labels hidden behind tooltips. */
  collapsed?: boolean;
  /** Desktop-only: toggle between expanded and icon-rail mode. */
  onToggleCollapse?: () => void;
}

/**
 * Admin vertical sidebar navigation. Renders full width (expanded) inside the
 * mobile drawer and as a fixed rail on desktop with a collapsible icon mode.
 * Styled entirely with the `sidebar-*` semantic tokens so it adapts to theme.
 */
export function AdminSidebar({
  userName = "Admin",
  userImage,
  pendingCount = 0,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const active = getActiveAdminItem(pathname);

  return (
    <TooltipProvider>
      <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
        {/* ── Brand header ─────────────────────────────────────────── */}
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          {collapsed ? (
            <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
              <GraduationCap className="size-5" />
            </div>
          ) : (
            <>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
                <GraduationCap className="size-5" />
              </div>
              <div className="ml-2.5 min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                  Smart NUB Campus
                </p>
                <p className="mt-1 inline-flex items-center rounded-full bg-sidebar-primary/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-sidebar-primary">
                  Admin
                </p>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation menu"
                  className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Navigation ───────────────────────────────────────────── */}
        <nav
          aria-label="Admin navigation"
          className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin"
        >
          {adminNavGroups.map((group) => (
            <div key={group.id}>
              <p
                className={cn(
                  "mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50",
                  collapsed && "sr-only",
                )}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarNavItemLink
                    key={item.href}
                    item={item}
                    active={active?.item.href === item.href}
                    collapsed={collapsed}
                    showBadge={item.href === "/admin/verifications" && pendingCount > 0}
                    pendingCount={pendingCount}
                    onClose={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer: user card + collapse toggle ──────────────────── */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          {collapsed ? (
            <div className="flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href="/admin/profile"
                      aria-label={`${userName}, My Profile`}
                      className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sidebar-accent"
                    />
                  }
                >
                  <Avatar id="admin" name={userName} src={userImage} className="size-9" />
                </TooltipTrigger>
                <TooltipContent side="right">{userName}</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40">
              <div className="flex items-center gap-3 p-2.5">
                <Avatar id="admin" name={userName} src={userImage} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">Administrator</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0.5 border-t border-sidebar-border p-1.5">
                <Link
                  href="/admin/profile"
                  className="truncate rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  My Profile
                </Link>
                <Link
                  href="/admin/settings"
                  className="truncate rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  Settings
                </Link>
              </div>
              <Link
                href={ROUTES.HOME}
                className="flex items-center gap-1.5 border-t border-sidebar-border p-2.5 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <ArrowLeft className="size-3.5 shrink-0" />
                Back to app
              </Link>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "hidden w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex",
                collapsed && "justify-center px-0",
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
