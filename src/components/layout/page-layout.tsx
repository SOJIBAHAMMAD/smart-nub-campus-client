import { cn } from "@/lib/utils";

interface PageLayoutProps {
  /** Page-specific left sidebar content (filters, categories, actions). */
  leftSidebar?: React.ReactNode;
  /** Page-specific right sidebar content (trending, stats, suggestions). */
  rightSidebar?: React.ReactNode;
  /** Main page content. */
  children: React.ReactNode;
  /** Additional className for the outer container. */
  className?: string;
}

/**
 * Reusable layout wrapper that provides an optional two-column sidebar layout
 * around the main content area. Each page provides its own sidebar content.
 *
 * @example
 * ```tsx
 * // Full-width page (no sidebars)
 * <PageLayout>
 *   <HomePage />
 * </PageLayout>
 *
 * // Page with sidebars
 * <PageLayout
 *   leftSidebar={<ResourceFilters />}
 *   rightSidebar={<TrendingResources />}
 * >
 *   <ResourceList />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  leftSidebar,
  rightSidebar,
  children,
  className,
}: PageLayoutProps) {
  const hasLeft = !!leftSidebar;
  const hasRight = !!rightSidebar;

  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6", className)}>
      <div
        className={cn(
          "grid gap-6",
          hasLeft && hasRight && "lg:grid-cols-[240px_1fr_240px]",
          hasLeft && !hasRight && "lg:grid-cols-[240px_1fr]",
          !hasLeft && hasRight && "lg:grid-cols-[1fr_240px]",
          !hasLeft && !hasRight && "grid-cols-1",
        )}
      >
        {/* ── Left sidebar ──────────────────────────────────────────── */}
        {hasLeft && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label="Page sidebar"
          >
            <div className="sticky top-2">{leftSidebar}</div>
          </aside>
        )}

        {/* ── Main content ──────────────────────────────────────────── */}
        <main className="min-w-0">{children}</main>

        {/* ── Right sidebar ─────────────────────────────────────────── */}
        {hasRight && (
          <aside
            className="hidden lg:block"
            role="complementary"
            aria-label="Page information"
          >
            <div className="sticky top-2">{rightSidebar}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
