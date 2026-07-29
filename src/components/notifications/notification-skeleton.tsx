"use client";

import { cn } from "@/lib/utils";

function NotificationItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-transparent px-4 py-3",
        className,
      )}
    >
      <div className="size-9 shrink-0 rounded-full bg-muted animate-pulse" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-2/5 rounded bg-muted animate-pulse" />
          <div className="h-4 w-14 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function NotificationPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 shrink-0 rounded-full bg-muted animate-pulse"
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <NotificationItemSkeleton key={`unread-${i}`} />
        ))}
      </div>

      <div className="my-4 h-px bg-border" />

      <div className="space-y-2">
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <NotificationItemSkeleton key={`read-${i}`} />
        ))}
      </div>
    </div>
  );
}

export function NotificationDropdownSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 rounded-md px-3 py-2.5"
        >
          <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-12 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
