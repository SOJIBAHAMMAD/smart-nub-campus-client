import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricProps {
  icon: LucideIcon;
  value: number | string;
  label?: string;
  className?: string;
}

export function Metric({ icon: Icon, value, label, className }: MetricProps) {
  return (
    <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <Icon className="size-3.5 shrink-0" />
      <span className="text-xs font-medium tabular-nums text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      {label && (
        <span className="text-[11px] max-sm:hidden">{label}</span>
      )}
    </div>
  );
}
