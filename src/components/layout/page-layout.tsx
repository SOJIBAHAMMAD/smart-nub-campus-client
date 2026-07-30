import { cn } from "@/lib/utils";

interface PageLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  leftSidebar,
  rightSidebar,
  children,
  className,
}: PageLayoutProps) {
  const hasLeft = !!leftSidebar;
  const hasRight = !!rightSidebar;

  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:py-8", className)}>
      <div
        className={cn(
          "grid gap-6 lg:gap-8",
          hasLeft && hasRight && "lg:grid-cols-[240px_1fr_280px]",
          hasLeft && !hasRight && "lg:grid-cols-[240px_1fr]",
          !hasLeft && hasRight && "lg:grid-cols-[1fr_280px]",
          !hasLeft && !hasRight && "grid-cols-1",
        )}
      >
        {hasLeft && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label="Page sidebar"
          >
            <div className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {leftSidebar}
            </div>
          </aside>
        )}

        <main className="min-w-0">{children}</main>

        {hasRight && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label="Page information"
          >
            <div className="sticky top-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
