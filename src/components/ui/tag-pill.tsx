import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTagIcon } from "@/lib/tag-icons";

interface TagPillProps {
  name: string;
  href?: string;
  size?: "xs" | "sm" | "md";
  variant?: "default" | "outline" | "brand";
  showIcon?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  active?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-5 gap-1 px-1.5 text-[10px]",
  sm: "h-6 gap-1.5 px-2 text-xs",
  md: "h-7 gap-1.5 px-2.5 text-sm",
} as const;

const variantClasses = {
  default:
    "bg-secondary/80 text-secondary-foreground hover:bg-secondary",
  outline:
    "border border-border/60 text-foreground hover:bg-muted bg-transparent",
  brand:
    "bg-primary/10 text-primary hover:bg-primary/15",
} as const;

const activeClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
  brand: "bg-primary text-primary-foreground hover:bg-primary/90",
} as const;

const iconSizes = {
  xs: "size-2.5",
  sm: "size-3",
  md: "size-3.5",
} as const;

export function TagPill({
  name,
  href,
  size = "sm",
  variant = "default",
  showIcon = true,
  removable = false,
  onRemove,
  active = false,
  className,
}: TagPillProps) {
  const icon = getTagIcon(name);
  const effectiveClasses = active ? activeClasses[variant] : variantClasses[variant];

  const content = (
    <>
      {showIcon && icon.type === "devicon" && (
        <i className={cn(icon.className, iconSizes[size])} aria-hidden="true" />
      )}
      {showIcon && icon.type === "lucide" && (
        <icon.icon className={cn(iconSizes[size])} aria-hidden="true" />
      )}
      <span className="truncate">{name}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-foreground/10"
          aria-label={`Remove ${name}`}
        >
          <X className={cn("size-2.5", size === "xs" && "size-2")} />
        </button>
      )}
    </>
  );

  const classes = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors",
    sizeClasses[size],
    effectiveClasses,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <span className={classes}>
      {content}
    </span>
  );
}
