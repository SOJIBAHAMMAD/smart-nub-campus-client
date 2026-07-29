import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton matching settings form layout.
 * Shows tab navigation + form fields.
 */
export function SettingsFormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      {/* Tab navigation */}
      <div className="flex gap-1 border-b pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
