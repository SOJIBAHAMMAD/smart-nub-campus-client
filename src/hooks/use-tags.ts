"use client";

import { useState, useEffect, useCallback } from "react";
import { listTags, createTag } from "@/actions/tag.actions";
import { useDebounce } from "@/hooks/use-debounce";

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  totalCount: number;
  createdAt: string;
}

export interface TagBasic {
  id: string;
  name: string;
  slug: string;
}

interface UseTagsOptions {
  /** Debounce delay in ms for search. Default 200. */
  debounceMs?: number;
}

interface UseTagsReturn {
  tags: TagItem[];
  filteredTags: TagItem[];
  search: string;
  setSearch: (value: string) => void;
  createTag: (name: string) => Promise<TagBasic>;
  isLoading: boolean;
  isCreating: boolean;
}

export function useTags(options: UseTagsOptions = {}): UseTagsReturn {
  const { debounceMs = 200 } = options;

  const [tags, setTags] = useState<TagItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebounce(search, debounceMs);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    listTags()
      .then((result) => {
        if (!cancelled && result.success && Array.isArray(result.data)) {
          setTags(result.data as TagItem[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTags = tags.filter((tag) => {
    if (!debouncedSearch.trim()) return true;
    return tag.name.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const createTagAction = useCallback(
    async (name: string): Promise<TagBasic> => {
      setIsCreating(true);
      try {
        const result = await createTag(name);
        if (result.success && result.data) {
          const created = result.data as TagBasic;
          setTags((prev) => {
            if (prev.some((t) => t.id === created.id)) return prev;
            return [
              ...prev,
              { ...created, totalCount: 0, createdAt: new Date().toISOString() },
            ].sort((a, b) => a.name.localeCompare(b.name));
          });
          return created;
        }
        throw new Error(result.message || "Failed to create tag");
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
    createTag: createTagAction,
    isLoading,
    isCreating,
  };
}
