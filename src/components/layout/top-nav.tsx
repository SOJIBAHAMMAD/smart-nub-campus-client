"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Home,
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  UsersRound,
  MessageCircle,
  Sparkles,
  Trophy,
  ChevronDown,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import ROUTES from "@/constants/routes";
import { AcademicCapIcon } from "../ui/icons/academic-cap";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const desktopPrimaryItems: NavItem[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Resources", href: ROUTES.RESOURCES, icon: BookOpen },
  { label: "Teams", href: ROUTES.TEAMS, icon: Users },
  { label: "My Network", href: ROUTES.MY_NETWORK, icon: UsersRound },
  { label: "Messages", href: ROUTES.MESSAGES, icon: MessageCircle },
];

const desktopMoreItems: NavItem[] = [
  { label: "Discussions", href: ROUTES.DISCUSSIONS, icon: MessageSquare },
  { label: "Q&A", href: ROUTES.QA, icon: HelpCircle },
  { label: "Leaderboard", href: ROUTES.LEADERBOARD, icon: Trophy },
  { label: "AI Assistant", href: ROUTES.AI, icon: Sparkles },
];

const bottomNavItems: NavItem[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Resources", href: ROUTES.RESOURCES, icon: BookOpen },
  { label: "Teams", href: ROUTES.TEAMS, icon: Users },
  { label: "Messages", href: ROUTES.MESSAGES, icon: MessageCircle },
];

const bottomSheetItems: NavItem[] = [
  { label: "My Network", href: ROUTES.MY_NETWORK, icon: UsersRound },
  { label: "Discussions", href: ROUTES.DISCUSSIONS, icon: MessageSquare },
  { label: "Q&A", href: ROUTES.QA, icon: HelpCircle },
  { label: "Leaderboard", href: ROUTES.LEADERBOARD, icon: Trophy },
  { label: "AI Assistant", href: ROUTES.AI, icon: Sparkles },
];

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

interface TopNavProps {
  userName?: string;
  userImage?: string;
  userId?: string;
}

export function TopNav({ userName, userImage, userId }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSheetOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    router.push(ROUTES.LOGIN);
  }, [router]);

  const isDark = theme === "dark";
  const hasActiveDesktopMore = desktopMoreItems.some((item) =>
    isActive(item.href, pathname),
  );
  const hasActiveSheet = bottomSheetItems.some((item) =>
    isActive(item.href, pathname),
  );
  const showUserDropdown = userName || userImage;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-all duration-200",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <div className="mx-auto flex h-full items-center gap-4 px-4 sm:px-6">
          <Link
            href={ROUTES.HOME}
            className="flex shrink-0 items-center gap-2"
            aria-label="Smart NUB Campus — Go to home page"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <AcademicCapIcon
                className="text-brand transition-all duration-200"
                size={scrolled ? 28 : 32}
              />
              <div className="-space-y-0.5 sm:-space-y-1">
                <h1
                  className={cn(
                    "font-bold text-foreground transition-all duration-200",
                    scrolled ? "text-sm" : "text-base sm:text-xl",
                  )}
                >
                  Smart NUB
                </h1>
                <p
                  className={cn(
                    "text-brand font-bold transition-all duration-200",
                    scrolled ? "text-[10px]" : "text-xs sm:text-sm",
                  )}
                >
                  Campus
                </p>
              </div>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            role="navigation"
            aria-label="Main navigation"
          >
            {desktopPrimaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                  hasActiveDesktopMore
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted data-popup-open:text-foreground data-popup-open:bg-muted",
                )}
              >
                <span>More</span>
                <ChevronDown className="size-3.5 transition-transform data-popup-open:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {desktopMoreItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, pathname);

                  return (
                    <DropdownMenuItem key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          active && "text-primary font-medium",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                role="search"
              >
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-36 pl-8 text-sm lg:w-48 xl:w-56"
                />
              </form>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 sm:hidden"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            >
              <Search className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={
                mounted
                  ? isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                  : "Toggle theme"
              }
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

            <NotificationBell />

            {showUserDropdown && (
              <div className="max-md:hidden">
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
            )}

            {showUserDropdown && (
              <div className="hidden max-md:block">
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
            )}
          </div>
        </div>

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t sm:hidden"
            >
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                    role="search"
                  >
                    <Input
                      ref={mobileSearchRef}
                      type="search"
                      placeholder="Search resources, people, teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full pl-9 pr-9 text-sm"
                    />
                  </form>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60 md:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-xs font-medium transition-colors min-h-[48px]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:text-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="leading-none">{item.label}</span>
                {active && (
                  <span className="absolute inset-x-4 -top-px h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          <button
            ref={sheetTriggerRef}
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-1.5 text-xs font-medium transition-colors min-h-[48px]",
              hasActiveSheet
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground active:text-foreground",
            )}
          >
            <div className="relative size-5 flex items-center justify-center">
              <span className="text-lg leading-none font-bold">⋯</span>
            </div>
            <span className="leading-none">More</span>
            {hasActiveSheet && (
              <span className="absolute inset-x-4 -top-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      <div className="md:hidden h-16" aria-hidden="true" />

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t bg-background pb-[env(safe-area-inset-bottom,0px)] md:hidden"
            >
              <div className="flex items-center justify-between px-5 pt-3 pb-2">
                <span className="text-sm font-semibold text-foreground">
                  More
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 -mr-1"
                  onClick={() => {
                    setSheetOpen(false);
                    sheetTriggerRef.current?.focus();
                  }}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="px-3 pb-4">
                {bottomSheetItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, pathname);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[48px]",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t px-3 py-3">
                <div className="flex items-center gap-3 min-h-[44px] px-3">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={userName ?? "User"}
                      width={36}
                      height={36}
                      unoptimized
                      className="size-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {userName?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {userName ?? "User"}
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={ROUTES.MY_PROFILE}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Profile
                      </Link>
                      <Link
                        href={ROUTES.SETTINGS}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive shrink-0"
                    onClick={handleSignOut}
                    aria-label="Log out"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
