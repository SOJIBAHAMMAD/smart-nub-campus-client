import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleX, Search } from "lucide-react";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "FILLED", label: "Filled" },
  { value: "CLOSED", label: "Closed" },
];

const VERIFY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All verification" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

interface JobsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  verifiedFilter: string;
  onVerifiedChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function JobsFilterBar({
  search,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusChange,
  verifiedFilter,
  onVerifiedChange,
  hasActiveFilters,
  onClearFilters,
}: JobsFilterBarProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      <form
        role="search"
        onSubmit={onSearchSubmit}
        className="relative w-full sm:w-72"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search title, company..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search job posts"
        />
      </form>

      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusChange(v ?? "all")}
      >
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filter by status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={verifiedFilter}
        onValueChange={(v) => onVerifiedChange(v ?? "all")}
      >
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filter by verification status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VERIFY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="w-fit text-muted-foreground"
        >
          <CircleX className="size-3.5" aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
