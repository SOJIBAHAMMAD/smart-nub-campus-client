"use client";

import Link from "next/link";
import { Plus, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";

interface ModuleLayoutProps {
  title: string;
  subtitle: string;
  newHref?: string;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ModuleLayout({
  title,
  subtitle,
  newHref,
  leftSidebar,
  rightSidebar,
  children,
  className,
}: ModuleLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <PageLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <div className={cn("space-y-4", className)}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </PageLayout>

      {/* Scroll-to-top FAB */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 lg:bottom-6"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </button>
      )}

      {/* Mobile bottom bar */}
      {newHref && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-3 lg:hidden">
          <Button
            render={<Link href={newHref} />}
            nativeButton={false}
            className="w-full"
            size="sm"
          >
            <Plus className="size-4" />
            New {title}
          </Button>
        </div>
      )}
    </>
  );
}
