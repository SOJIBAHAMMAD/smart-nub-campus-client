"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import {
  Search,
  Sparkles,
  Bell,
  MessageCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/use-global-search";
import ROUTES from "@/constants/routes";

interface WelcomeStripProps {
  userName?: string;
  unreadNotifications?: number;
  unreadMessages?: number;
}

export function WelcomeStrip({
  userName,
  unreadNotifications = 0,
  unreadMessages = 0,
}: WelcomeStripProps) {
  const { open } = useGlobalSearch();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      open(searchQuery.trim() || undefined);
    },
    [open, searchQuery],
  );

  const timeOfDay =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 17
        ? "afternoon"
        : "evening";

  return (
    <section className="border-b border-border/50 bg-background">
      <div className="mx-auto max-w-screen-2xl px-6 py-6 xl:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Good {timeOfDay}
              {userName ? (
                <span className="bg-linear-to-r from-primary to-[#8b5cf6] bg-clip-text text-transparent">
                  , {userName.split(" ")[0]}
                </span>
              ) : (
                ""
              )}
              <span className="text-foreground">!</span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your Academic Command Center
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            role="search"
            className="w-full sm:w-80 lg:w-96"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder="Search resources, courses, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border-border/60 bg-card/80 pl-9 pr-4 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-primary/30 focus-visible:ring-4 focus-visible:ring-primary/5"
              />
            </div>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={ROUTES.AI}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-medium text-primary transition-all hover:border-primary/30 hover:bg-primary/[0.08]"
          >
            <Sparkles className="size-3.5" />
            <span>Ask AI about your courses...</span>
          </Link>

          <Link
            href={ROUTES.NOTIFICATIONS}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
          >
            <Bell className="size-3.5" />
            {unreadNotifications > 0 ? (
              <span>{unreadNotifications} new</span>
            ) : (
              <span>Notifications</span>
            )}
          </Link>

          <Link
            href={ROUTES.MESSAGES}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
          >
            <MessageCircle className="size-3.5" />
            {unreadMessages > 0 ? (
              <span>{unreadMessages} unread</span>
            ) : (
              <span>Messages</span>
            )}
          </Link>

          <Link
            href={ROUTES.RESOURCES}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
          >
            <BookOpen className="size-3.5" />
            <span>Browse Resources</span>
          </Link>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
          >
            <TrendingUp className="size-3.5" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
