"use client";

import {
  useGlobalSearchContext,
  type GlobalSearchContextValue,
} from "@/providers/global-search-provider";

/**
 * Access the global search overlay state (open/close/query/recents).
 * Must be used within a <GlobalSearchProvider>.
 */
export function useGlobalSearch(): GlobalSearchContextValue {
  return useGlobalSearchContext();
}
