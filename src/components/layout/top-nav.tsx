"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Moon,
  Sun,
  LogOut,
  Settings,
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  UsersRound,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import ROUTES from "@/constants/routes";
import { AcademicCapIcon } from "../ui/icons/academic-cap";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications/notification-bell";

// ── Navigation items ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Resources", href: ROUTES.RESOURCES, icon: BookOpen },
  { label: "Teams", href: ROUTES.TEAMS, icon: Users },
  { label: "My Network", href: ROUTES.MY_NETWORK, icon: UsersRound },
  { label: "Messages", href: ROUTES.MESSAGES, icon: MessageCircle },
  { label: "Discussions", href: ROUTES.DISCUSSIONS, icon: MessageSquare },
  { label: "Q&A", href: ROUTES.QA, icon: HelpCircle },
  { label: "AI Assistant", href: ROUTES.AI, icon: Sparkles },
];

// ── Component ────────────────────────────────────────────────────────────────

interface TopNavProps {
  /** Current user's display name. */
  userName?: string;
  /** Current user's avatar URL. */
  userImage?: string;
  /** Current user's ID for profile link. */
  userId?: string;
}

export function TopNav({ userName, userImage, userId }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Guard against SSR/client theme mismatch — next-themes only knows the
  // resolved theme on the client, so defer theme-dependent UI until mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  }, [router]);

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* ── Logo / Brand ─────────────────────────────────────────────── */}
        <Link
          href={ROUTES.HOME}
          className="flex shrink-0 items-center gap-2"
          aria-label="Smart NUB Campus — Go to home page"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AcademicCapIcon className="text-brand" size={32} />
            <div className="-space-y-0.5 sm:-space-y-1">
              <h1 className="font-bold text-base sm:text-xl text-foreground">
                Smart NUB
              </h1>
              <p className="text-brand text-xs sm:text-sm font-bold">Campus</p>
            </div>
          </div>
        </Link>

        {/* ── Desktop navigation links ─────────────────────────────────── */}
        <nav
          className="hidden items-center gap-1 md:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right side: Search + Actions ─────────────────────────────── */}
        <div className="ml-auto flex items-center gap-2">
          {/* ── Search (desktop) ────────────────────────────────────────── */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-sm lg:w-64"
            />
          </div>

          {/* ── Theme toggle ────────────────────────────────────────────── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className="size-8"
          >
            {!mounted ? (
              <Moon className="size-4" />
            ) : isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {/* ── Notifications ───────────────────────────────────────────── */}
          <NotificationBell />

          {/* ── User avatar / dropdown (desktop) ────────────────────────── */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors outline-none">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName ?? "User"}
                    width={28}
                    height={28}
                    unoptimized
                    className="size-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {userName ?? "User"}
                      </span>
                      {userId && (
                        <Link
                          href={ROUTES.MY_PROFILE}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          View profile
                        </Link>
                      )}
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Link
                    href={ROUTES.SETTINGS}
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

          {/* ── Mobile hamburger ────────────────────────────────────────── */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="border-t bg-background md:hidden">
          {/* ── Mobile search ──────────────────────────────────────────── */}
          <div className="px-4 pt-3 sm:hidden">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>

          {/* ── Mobile nav links ───────────────────────────────────────── */}
          <nav
            className="space-y-1 px-2 py-2"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Mobile user section ────────────────────────────────────── */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName ?? "User"}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {userName?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{userName ?? "User"}</p>
                  <div className="flex gap-2">
                    <Link
                      href={ROUTES.MY_PROFILE}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href={ROUTES.SETTINGS}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
