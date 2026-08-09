"use client";

import type { FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const GRAD_YEARS = Array.from({ length: 25 }, (_, i) => 2025 - i);

interface AlumniFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  mentor: string;
  onMentorChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  className?: string;
}

/**
 * Filter bar for the admin alumni directory: keyword search, department,
 * graduation year and mentor-status selects plus a "clear filters" action.
 * Stacks vertically on small screens and expands into a row on md+.
 */
export function AlumniFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  department,
  onDepartmentChange,
  year,
  onYearChange,
  mentor,
  onMentorChange,
  hasActiveFilters,
  onClearFilters,
  className,
}: AlumniFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center",
        className,
      )}
    >
      <form
        onSubmit={onSearchSubmit}
        role="search"
        className="relative w-full md:w-72"
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search name, email, employer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search alumni by name, email or employer"
          className="pl-9"
        />
      </form>

      <Select
        value={department}
        onValueChange={(value) => onDepartmentChange(value ?? "all")}
      >
        <SelectTrigger className="w-full md:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {Object.entries(DEPARTMENT_LABELS).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={(value) => onYearChange(value ?? "all")}>
        <SelectTrigger className="w-full md:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All years</SelectItem>
          {GRAD_YEARS.map((gradYear) => (
            <SelectItem key={gradYear} value={String(gradYear)}>
              {gradYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={mentor} onValueChange={(value) => onMentorChange(value ?? "all")}>
        <SelectTrigger className="w-full md:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All alumni</SelectItem>
          <SelectItem value="mentors">Mentors only</SelectItem>
          <SelectItem value="non-mentors">Non-mentors</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="size-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
