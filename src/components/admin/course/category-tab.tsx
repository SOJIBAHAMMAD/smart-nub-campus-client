"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { CategoryCreateDialog } from "./category-create-dialog";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACCENT_PALETTE = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
] as const;

/** Deterministic accent per category name so cards stay visually distinct. */
function getAccent(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: Record<string, number>;
}

interface CategoryTabProps<T extends CategoryItem> {
  /** Increments when the header "Add Category" button is pressed. */
  createSignal: number;
  onCountChange: (count: number) => void;
  fetcher: () => Promise<{ data: T[] }>;
  creator: (data: { name: string; icon?: string; description?: string }) => Promise<T>;
  deleter: (id: string) => Promise<void>;
  countKey: string;
  countLabel: string;
  itemLabel: string;
  icon: LucideIcon;
  showDescription?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function CategoryTab<T extends CategoryItem>({
  createSignal,
  onCountChange,
  fetcher,
  creator,
  deleter,
  countKey,
  countLabel,
  itemLabel,
  icon: Icon,
  showDescription = false,
}: CategoryTabProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      setItems(result.data);
      onCountChange(result.data.length);
    } catch {
      toast.error(`Failed to load ${countLabel}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, countLabel, onCountChange]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (createSignal > 0) setShowCreate(true);
  }, [createSignal]);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      await creator({
        name: values.name,
        icon: undefined,
        description: values.description,
      });
      toast.success(`${itemLabel} created successfully`);
      setShowCreate(false);
      void fetchItems();
    } catch {
      toast.error(`Failed to create ${itemLabel.toLowerCase()}`);
      throw new Error(`Failed to create ${itemLabel.toLowerCase()}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleter(deleteTarget.id);
      toast.success(`${itemLabel} deleted successfully`);
      setDeleteTarget(null);
      void fetchItems();
    } catch {
      toast.error(`Failed to delete ${itemLabel.toLowerCase()}`);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty className="border border-dashed bg-card/60">
          <EmptyMedia variant="icon">
            <Icon className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No {countLabel} yet</EmptyTitle>
            <EmptyDescription>
              Create your first {itemLabel.toLowerCase()} to organize content on the campus platform.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus data-icon="inline-start" />
              Add your first {itemLabel.toLowerCase()}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const count = item._count[countKey] ?? 0;
            return (
              <div
                key={item.id}
                className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    getAccent(item.name)
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.slug}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5 text-muted-foreground/70" />
                    <span className="tabular-nums">{count}</span>
                    <span>{countLabel}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CategoryCreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={handleCreate}
        itemLabel={itemLabel}
        showDescription={showDescription}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete ${itemLabel}`}
        description={`Are you sure you want to delete this ${itemLabel.toLowerCase()}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
