"use client";

import { useState, useEffect, useCallback } from "react";
import { tagService, type TagItem, type TagBasic } from "@/services/tag.service";
import { useDebounce } from "@/hooks/use-debounce";

interface UseTagsOptions {
  /** Debounce delay in ms for search. Default 200. */
  debounceMs?: number;
}

interface UseTagsReturn {
  /** All available tags from the server. */
  tags: TagItem[];
  /** Tags filtered by current search query. */
  filteredTags: TagItem[];
  /** Current search input value. */
  search: string;
  /** Update search input. */
  setSearch: (value: string) => void;
  /** Create a new tag. Returns the created tag. */
  createTag: (name: string) => Promise<TagBasic>;
  /** Whether tags are still loading. */
  isLoading: boolean;
  /** Whether a tag is being created. */
  isCreating: boolean;
}

export function useTags(options: UseTagsOptions = {}): UseTagsReturn {
  const { debounceMs = 200 } = options;

  const [tags, setTags] = useState<TagItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebounce(search, debounceMs);

  // Fetch all tags on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    tagService
      .listTags()
      .then((data) => {
        if (!cancelled) setTags(data);
      })
      .catch(() => {
        // Empty state handled by checking tags.length
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side filtering (tags are already fetched in full)
  const filteredTags = tags.filter((tag) => {
    if (!debouncedSearch.trim()) return true;
    return tag.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const createTag = useCallback(
    async (name: string): Promise<TagBasic> => {
      setIsCreating(true);
      try {
        const created = await tagService.createTag(name);
        // Add to local list optimistically
        setTags((prev) => {
          if (prev.some((t) => t.id === created.id)) return prev;
          return [
            ...prev,
            { ...created, totalCount: 0, createdAt: new Date().toISOString() },
          ].sort((a, b) => a.name.localeCompare(b.name));
        });
        return created;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  return {
    tags,
    filteredTags,
    search,
    setSearch,
    createTag,
    isLoading,
    isCreating,
  };
}
