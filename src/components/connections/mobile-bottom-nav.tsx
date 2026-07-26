"use client";

import { Users, Clock, Send, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConnectionTab } from "./my-network-sidebar";

interface MobileBottomNavProps {
  activeTab: ConnectionTab;
  onTabChange: (tab: ConnectionTab) => void;
  counts: { all: number; pending: number; sent: number; blocked: number };
}

const TABS: {
  id: ConnectionTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "all", label: "All", icon: <Users className="size-5" /> },
  { id: "pending", label: "Pending", icon: <Clock className="size-5" /> },
  { id: "sent", label: "Sent", icon: <Send className="size-5" /> },
  { id: "blocked", label: "Blocked", icon: <Ban className="size-5" /> },
];

/**
 * Fixed bottom navigation bar for mobile viewports.
 * Shows the main connection tabs with icon + label + badge count.
 */
export function MobileBottomNav({
  activeTab,
  onTabChange,
  counts,
}: MobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      role="tablist"
      aria-label="Network tabs"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {TABS.map((tab) => {
          const count =
            tab.id === "pending"
              ? counts.pending
              : tab.id === "sent"
                ? counts.sent
                : tab.id === "blocked"
                  ? counts.blocked
                  : counts.all;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <div className="relative">
                {tab.icon}
                {count > 0 && tab.id === "pending" && (
                  <span className="absolute -top-1 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground animate-in zoom-in duration-200">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className="leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
