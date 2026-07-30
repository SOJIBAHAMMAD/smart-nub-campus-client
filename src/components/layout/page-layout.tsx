"use client";

import { useState } from "react";
import { PanelLeft, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PageLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  leftSidebarTitle?: string;
  rightSidebarTitle?: string;
}

export function PageLayout({
  leftSidebar,
  rightSidebar,
  children,
  className,
  leftSidebarTitle = "Sidebar",
  rightSidebarTitle = "More",
}: PageLayoutProps) {
  const hasLeft = !!leftSidebar;
  const hasRight = !!rightSidebar;
  const [leftSheetOpen, setLeftSheetOpen] = useState(false);
  const [rightSheetOpen, setRightSheetOpen] = useState(false);

  return (
    <div className={cn("mx-auto w-full px-4 py-4 sm:px-6 lg:py-6", className)}>
      <div
        className={cn(
          "grid gap-6 lg:gap-8",
          hasLeft && hasRight && "lg:grid-cols-[260px_1fr_280px]",
          hasLeft && !hasRight && "lg:grid-cols-[260px_1fr]",
          !hasLeft && hasRight && "lg:grid-cols-[1fr_280px]",
          !hasLeft && !hasRight && "grid-cols-1",
        )}
      >
        {/* ── Left Sidebar (Desktop) ──────────────────────────── */}
        {hasLeft && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label={leftSidebarTitle}
          >
            <div className="sticky top-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="min-w-0">
          {/* Mobile sidebar toggles */}
          <div className="mb-3 flex items-center gap-2 lg:hidden">
            {hasLeft && (
              <Sheet open={leftSheetOpen} onOpenChange={setLeftSheetOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <PanelLeft className="size-4" />
                      <span className="text-xs">{leftSidebarTitle}</span>
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-[280px] sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="text-left">{leftSidebarTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {leftSidebar}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {hasRight && (
              <Sheet open={rightSheetOpen} onOpenChange={setRightSheetOpen}>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <PanelRightOpen className="size-4" />
                      <span className="text-xs">{rightSidebarTitle}</span>
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-[280px] sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="text-left">{rightSidebarTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {rightSidebar}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
          {children}
        </main>

        {/* ── Right Sidebar (Desktop) ─────────────────────────── */}
        {hasRight && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label={rightSidebarTitle}
          >
            <div className="sticky top-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
