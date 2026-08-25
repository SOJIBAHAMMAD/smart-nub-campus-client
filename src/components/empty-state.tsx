import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  /** Icon component to render. */
  icon: React.ComponentType<{ className?: string }>;
  /** Heading text. */
  title: string;
  /** Descriptive text below the heading. */
  description?: string;
  /** Optional action button. */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Additional className for the container. */
  className?: string;
}

/**
 * Reusable empty state component with centered icon, title, description,
 * and optional CTA button. Rendered in the main content area of PageLayout.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
      role="status"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className={buttonVariants()}>
              {action.label}
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
