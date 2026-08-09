"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminSidebar,
  getActiveAdminItem,
} from "@/components/admin/admin-sidebar";
export { adminNavGroups } from "@/components/admin/admin-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearchProvider } from "@/providers/global-search-provider";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { authClient } from "@/lib/auth-client";
import ROUTES from "@/constants/routes";

const SIDEBAR_COLLAPSE_KEY = "snc-admin-sidebar-collapsed";

interface IdentityMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
  student: Record<string, unknown> | null;
  admin: Record<string, unknown> | null;
}

/**
 * Client-side admin layout shell.
 * Handles fetching user identity and rendering the top bar, sidebar and content.
 * Sidebar is a fixed, collapsible rail on desktop (expanded w-64 / collapsed w-16,
 * persisted in localStorage) and a slide-over drawer on mobile.
 * The top bar provides global search (⌘K), notifications, theme toggle and the
 * user menu, matching the student app shell.
 */
export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Admin");
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Restore the persisted desktop rail state after hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {
      // Storage may be unavailable (private mode); ignore.
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
      } catch {
        // Storage may be unavailable (private mode); ignore.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const response = await apiClient.get<{
          success: boolean;
          message: string;
          data: IdentityMeResponse;
        }>("/identity/me");

        if (response.data?.data) {
          setUserName(response.data.data.user.name);
          setUserImage(response.data.data.user.image ?? undefined);
        }
      } catch {
        // Proxy already guarantees only authenticated admins reach this layout.
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserInfo();
  }, []);

  /** Current admin section label + group, shown in the top bar on desktop. */
  const activeNav = useMemo(() => getActiveAdminItem(pathname), [pathname]);
  const currentSection = activeNav?.item.label ?? "Admin";
  const currentGroup = activeNav?.group.label;

  /** Show loading state while fetching user info for the sidebar. */
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Sidebar skeleton */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:block",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <Skeleton
              className={cn(
                "size-9 shrink-0 rounded-lg",
                collapsed && "mx-auto",
              )}
            />
            {!collapsed && (
              <div className="ml-2.5 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
            )}
          </div>
          <div className="space-y-3 px-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                {!collapsed && <Skeleton className="h-2.5 w-16" />}
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 transition-[padding] duration-200",
            collapsed ? "lg:pl-16" : "lg:pl-64",
          )}
        >
          {/* Top bar skeleton */}
          <div
            className={cn(
              "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-end gap-2 border-b bg-background px-4 sm:px-6 transition-[left] duration-200",
              collapsed ? "lg:left-16" : "lg:left-64",
            )}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-8 rounded-full" />
            ))}
          </div>

          {/* Main content skeleton */}
          <main className="h-screen p-6 pt-16">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <GlobalSearchProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar — fixed collapsible rail on desktop */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-200 ease-in-out lg:block",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <AdminSidebar
            userName={userName}
            userImage={userImage}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
          />
        </div>

        {/* Sidebar — slide-over drawer on mobile */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-72 max-w-[85vw] p-0"
          >
            <AdminSidebar
              userName={userName}
              userImage={userImage}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "min-h-screen transition-[padding] duration-200 ease-in-out",
            collapsed ? "lg:pl-16" : "lg:pl-64",
          )}
        >
          <AdminTopBar
            userName={userName}
            userImage={userImage}
            title={currentSection}
            subtitle={currentGroup}
            collapsed={collapsed}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* Main content */}
          <main className="h-screen pt-16">{children}</main>
        </div>
      </div>
      <GlobalSearchDialog />
    </GlobalSearchProvider>
  );
}

interface AdminTopBarProps {
  userName: string;
  userImage?: string;
  /** Current section label, shown on desktop. */
  title: string;
  /** Current nav group label, shown as a breadcrumb below the title. */
  subtitle?: string;
  /** Whether the desktop rail is collapsed (offsets the fixed bar). */
  collapsed: boolean;
  onMenuClick: () => void;
}

/**
 * Admin top bar: global search trigger (⌘K), notifications, theme toggle and
 * the user menu. Matches the student TopNav shell behavior.
 */
function AdminTopBar({
  userName,
  userImage,
  title,
  subtitle,
  collapsed,
  onMenuClick,
}: AdminTopBarProps) {
  const { open: openSearch } = useGlobalSearch();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/60 sm:px-6 transition-[left] duration-200 ease-in-out",
        collapsed ? "lg:left-16" : "lg:left-64",
      )}
    >
      {/* Mobile: menu + brand */}
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <GraduationCap className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Desktop: current section title + breadcrumb */}
      <div className="hidden min-w-0 lg:block">
        <h1 className="truncate text-sm font-semibold text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs leading-tight text-muted-foreground">
            Admin / {subtitle}
          </p>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Search trigger */}
        <button
          type="button"
          onClick={() => openSearch()}
          aria-label="Open global search"
          className="relative hidden h-8 w-48 cursor-text items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex xl:w-64"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate text-left">Search...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-sans text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:hidden"
          onClick={() => openSearch()}
          aria-label="Open search"
        >
          <Search className="size-4" />
        </Button>

        <ThemeToggleButton className="size-8" />

        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Account menu for ${userName}`}
            className="flex size-8 items-center justify-center rounded-full transition-colors outline-none hover:bg-muted"
          >
            <Avatar
              id="admin"
              name={userName}
              src={userImage}
              className="size-7"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">
                    {userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Administrator
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 cursor-pointer"
              >
                <UserCircle className="size-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
