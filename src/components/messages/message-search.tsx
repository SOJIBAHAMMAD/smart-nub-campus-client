"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MessageSearchProps {
  onSearch: (query: string) => void;
  resultCount: number;
  loading?: boolean;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  currentIndex?: number;
  className?: string;
}

export function MessageSearch({
  onSearch,
  resultCount,
  loading,
  onNavigateNext,
  onNavigatePrev,
  currentIndex: _currentIndex,
  className,
}: MessageSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        onSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onSearch]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
    onSearch("");
  };

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search in conversation"
        className={className}
      >
        <Search className="size-4" />
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search messages..."
          className="h-8 w-48 pl-7 pr-2 text-xs lg:w-56"
        />
      </div>

      {query && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            `${resultCount} result${resultCount !== 1 ? "s" : ""}`
          )}
        </span>
      )}

      {resultCount > 0 && (
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigatePrev}
            className="size-6"
            aria-label="Previous result"
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateNext}
            className="size-6"
            aria-label="Next result"
          >
            <ArrowDown className="size-3" />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="size-6"
        aria-label="Close search"
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}
