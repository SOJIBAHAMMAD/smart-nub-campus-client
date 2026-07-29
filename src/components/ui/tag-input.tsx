"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTags } from "@/hooks/use-tags";
import { TagPill } from "@/components/ui/tag-pill";
import { getTagIcon } from "@/lib/tag-icons";

export interface TagInputTag {
  id: string;
  name: string;
  slug: string;
}

interface TagInputProps {
  /** Currently selected tags. */
  value: TagInputTag[];
  /** Called when selection changes. */
  onChange: (tags: TagInputTag[]) => void;
  /** Max number of tags allowed. Default 5. */
  maxTags?: number;
  /** Min number of tags required. Default 0. */
  minTags?: number;
  /** Whether the field is required. */
  required?: boolean;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Label shown above the input. */
  label?: string;
  /** Error message to display. */
  error?: string;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Additional CSS classes on the outer wrapper. */
  className?: string;
}

export function TagInput({
  value,
  onChange,
  maxTags = 5,
  minTags = 0,
  required = false,
  placeholder = "Search or create tags...",
  label,
  error,
  disabled = false,
  className,
}: TagInputProps) {
  const { filteredTags, search, setSearch, createTag, isLoading, isCreating } =
    useTags();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [localError, setLocalError] = useState(error ?? "");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external error
  useEffect(() => {
    setLocalError(error ?? "");
  }, [error]);

  // Tags not yet selected
  const suggestions = filteredTags.filter(
    (tag) => !value.some((v) => v.id === tag.id),
  );

  // Check if typed text could create a new tag
  const trimmedSearch = search.trim();
  const exactMatch = suggestions.some(
    (t) => t.name.toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const canCreate =
    trimmedSearch.length > 0 &&
    !exactMatch &&
    value.length < maxTags &&
    !isLoading;

  // Total items in dropdown (suggestions + optional "create" row)
  const itemCount = suggestions.length + (canCreate ? 1 : 0);

  // ── Handlers ────────────────────────────────────────────────────────────

  const addTag = useCallback(
    (tag: TagInputTag) => {
      if (value.length >= maxTags) return;
      if (value.some((v) => v.id === tag.id)) return;
      onChange([...value, tag]);
      setSearch("");
      setHighlightedIndex(-1);
      setLocalError("");
    },
    [value, onChange, maxTags, setSearch],
  );

  const removeTag = useCallback(
    (tagId: string) => {
      const next = value.filter((t) => t.id !== tagId);
      onChange(next);
      if (next.length < minTags) {
        setLocalError(`At least ${minTags} tag${minTags > 1 ? "s" : ""} required.`);
      } else {
        setLocalError("");
      }
    },
    [value, onChange, minTags],
  );

  const handleCreateNew = useCallback(async () => {
    if (!trimmedSearch) return;
    if (value.length >= maxTags) return;

    try {
      const created = await createTag(trimmedSearch);
      addTag(created);
    } catch {
      setLocalError("Failed to create tag. Please try again.");
    }
  }, [trimmedSearch, value, maxTags, createTag, addTag]);

  const selectByIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < suggestions.length) {
        addTag(suggestions[index]);
      } else if (index === suggestions.length && canCreate) {
        handleCreateNew();
      }
    },
    [suggestions, canCreate, addTag, handleCreateNew],
  );

  // ── Keyboard navigation ─────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < itemCount - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : itemCount - 1,
        );
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectByIndex(highlightedIndex);
        } else if (canCreate) {
          handleCreateNew();
        }
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case "Backspace":
        if (search === "" && value.length > 0) {
          removeTag(value[value.length - 1].id);
        }
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayError = localError || error;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <TagPill
              key={tag.id}
              name={tag.name}
              variant="brand"
              removable
              onRemove={() => removeTag(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Input + dropdown */}
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors",
            "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            displayError
              ? "border-destructive/50"
              : "border-border/60",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          {isCreating ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : null}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setHighlightedIndex(-1);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              value.length >= maxTags
                ? `Maximum ${maxTags} tags`
                : value.length === 0 && required
                  ? `${placeholder} (required)`
                  : placeholder
            }
            disabled={disabled || value.length >= maxTags}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {value.length}/{maxTags}
          </span>
        </div>

        {/* Dropdown */}
        {isOpen && (suggestions.length > 0 || canCreate) && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-card p-1 shadow-lg"
          >
            {suggestions.map((tag, index) => {
              const icon = getTagIcon(tag.name);
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addTag(tag);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      highlightedIndex === index
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {icon.type === "devicon" ? (
                      <i
                        className={cn(icon.className, "size-3.5 shrink-0")}
                        aria-hidden="true"
                      />
                    ) : (
                      <icon.icon
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1 truncate">{tag.name}</span>
                    {tag.totalCount > 0 && (
                      <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                        {tag.totalCount} uses
                      </span>
                    )}
                  </button>
                </li>
              );
            })}

            {canCreate && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreateNew();
                  }}
                  onMouseEnter={() => setHighlightedIndex(suggestions.length)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    highlightedIndex === suggestions.length
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">
                    Create &ldquo;{trimmedSearch}&rdquo;
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    new
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}
    </div>
  );
}
