"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Settings,
  ArrowLeft,
  X,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

// ── Navigation items ─────────────────────────────────────────────────────────

interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const sidebarNavItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Verification Requests", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Resources", href: "/admin/resources", icon: BookOpen },
  { label: "Discussions", href: "/admin/discussions", icon: MessageSquare },
  { label: "Courses & Categories", href: "/admin/courses", icon: GraduationCap },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ── Component ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  /** Current user's display name. */
  userName?: string;
  /** Current user's avatar URL. */
  userImage?: string;
  /** Number of pending verification requests. */
  pendingCount?: number;
  /** Callback when the sidebar close button is clicked (mobile). */
  onClose?: () => void;
}

/**
 * Admin vertical sidebar navigation.
 * Uses a darker theme to distinguish from the student TopNav layout.
 * This is the ONLY page with a dashboard-style sidebar pattern.
 */
export function AdminSidebar({
  userName = "Admin",
  userImage,
  pendingCount = 0,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  /** Check if a nav item is active based on current pathname. */
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* ── Logo / Brand ─────────────────────────────────────────────── */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
            A
          </div>
          <div>
            <h1 className="text-sm font-semibold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Smart NUB Campus</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showBadge =
            item.href === "/admin/verifications" && pendingCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ───────────────────────────────────────────── */}
      <div className="border-t border-gray-700 p-4 space-y-3">
        {/* Back to App link */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to App
        </Link>

        {/* Admin user info */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">
              {userName.charAt(0)?.toUpperCase() ?? "A"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
