"use client";

import { ArrowUpDown, Search, XCircle } from "lucide-react";
import type {
  AdminDiscussionSort,
  AdminDiscussionStatus,
} from "@/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, STATUS_OPTIONS } from "./discussion-utils";

interface DiscussionsFilterBarProps {
  search: string;
  statusFilter: AdminDiscussionStatus;
  sort: AdminDiscussionSort;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdminDiscussionStatus) => void;
  onSortChange: (value: AdminDiscussionSort) => void;
  onClear: () => void;
}

/**
 * Responsive filter bar. Controls stack vertically on mobile and align into a
 * single row on desktop; the clear action appears only while filters are active.
 */
export function DiscussionsFilterBar({
  search,
  statusFilter,
  sort,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClear,
}: DiscussionsFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="relative w-full lg:max-w-sm lg:flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by title, author, or content..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search discussions"
          className="w-full pl-8"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => onStatusChange(val as AdminDiscussionStatus)}
        >
          <SelectTrigger
            aria-label="Filter by status"
            className="w-full sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(val) => onSortChange(val as AdminDiscussionSort)}
        >
          <SelectTrigger aria-label="Sort discussions" className="w-full sm:w-44">
            <ArrowUpDown className="size-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="shrink-0 text-muted-foreground"
          >
            <XCircle className="size-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
