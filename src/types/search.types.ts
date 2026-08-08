/**
 * Global search types mirroring the backend `/api/v1/search` response.
 * See server `src/app/module/search/search.interface.ts`.
 */

export type SearchEntity =
  | "people"
  | "resources"
  | "discussions"
  | "questions"
  | "teams"
  | "events"
  | "courses"
  | "jobs"
  | "mentorship";

export type SearchEntityFilter = "all" | SearchEntity;

export interface SearchResultItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  snippet: string | null;
  url: string | null;
  rank: number;
  type: SearchEntity;
  createdAt: string | null;
  /** Entity-specific payload used by cards/routing (author, thumb, counts, ...). */
  data: Record<string, unknown>;
}

export interface SearchGroup {
  items: SearchResultItem[];
  total: number;
}

export interface SearchMeta {
  total: number;
  bestMatch: SearchResultItem | null;
}

export interface SearchResponse {
  query: string;
  data: Record<SearchEntity, SearchGroup>;
  meta: SearchMeta;
}

export interface SearchParams {
  q: string;
  entity?: SearchEntityFilter;
  page?: number;
  limit?: number;
  department?: string;
  categoryId?: string;
  courseId?: string;
}

export interface SearchClickInput {
  query: string;
  entity: SearchEntity;
  resultId?: string;
  position?: number;
}

export interface SearchRecent {
  query: string;
  entity: SearchEntityFilter;
  label: string;
  url: string;
  timestamp: number;
}
